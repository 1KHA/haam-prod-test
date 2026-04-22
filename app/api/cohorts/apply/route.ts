import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { notifyApplicationSubmitted } from '@/lib/services/notification-events';
import { EmailService } from '@/lib/services/email-service';

// POST /api/cohorts/apply - Apply to a cohort with a startup
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and has appropriate role
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || (user.role !== UserRole.ENTREPRENEUR)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only entrepreneurs can apply to cohorts.' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { cohortId, startupId, teamMembers } = body;
    
    // Validate required fields
    if (!cohortId || !startupId) {
      return NextResponse.json(
        { error: 'Missing required fields: cohortId and startupId are required' },
        { status: 400 }
      );
    }
    
    // Check if cohort exists and is active
    const cohort = await prisma.cohort.findUnique({
      where: { 
        id: cohortId,
        status: 'ACTIVE'
      }
    });
    
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found or not active' },
        { status: 404 }
      );
    }
    
    // Check if startup exists and belongs to the user
    const startup = await prisma.startup.findUnique({
      where: { 
        id: startupId,
        creatorId: user.userId
      }
    });
    
    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found or does not belong to you' },
        { status: 404 }
      );
    }
    
    // Check if startup is already a member of the cohort
    const existingMembership = await prisma.cohortMember.findUnique({
      where: {
        cohortId_startupId: {
          cohortId,
          startupId
        }
      }
    });
    
    if (existingMembership) {
      return NextResponse.json(
        { error: 'Startup is already a member of this cohort' },
        { status: 400 }
      );
    }
    
    // Create cohort membership
    const cohortMember = await prisma.cohortMember.create({
      data: {
        cohortId,
        startupId,
        status: 'PENDING', // Set status to PENDING for review
        joinDate: new Date()
      }
    });

    // Notify Program Managers about new application
    console.log(`[Cohort Apply] Looking for Program Managers to notify about application...`);
    try {
      const programManagers = await prisma.user.findMany({
        where: { role: 'PROGRAM_MANAGER' },
        select: { id: true },
      });

      console.log(`[Cohort Apply] Found ${programManagers.length} Program Managers`);

      if (programManagers.length > 0) {
        // Get the full user data for the applicant's name
        const applicant = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { name: true, email: true },
        });
        const applicantName = applicant?.name || applicant?.email || user.email;

        console.log(`[Cohort Apply] Sending application notification to PMs...`);
        await notifyApplicationSubmitted({
          applicationId: cohortMember.id,
          startupId,
          startupName: startup.name,
          cohortId,
          cohortName: cohort.name,
          applicantId: user.userId,
          applicantName,
          programManagerIds: programManagers.map(pm => pm.id),
        });
        console.log(`[Cohort Apply] Application notification sent successfully`);
        await EmailService.fireScenario('application_submitted', programManagers.map(pm => pm.id), {
          startup: { name: startup.name },
          cohort: { name: cohort.name },
          applicant: { name: applicantName },
        });
      } else {
        console.log(`[Cohort Apply] No Program Managers found, skipping notification`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (notifyError: any) {
      console.error('[Cohort Apply] Failed to send notifications:', notifyError.message);
      console.error('[Cohort Apply] Stack:', notifyError.stack);
      // Don't fail the request if notification fails
    }
    
    // Update team members if provided
    if (teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
      // Create or update team members
      const teamMemberPromises = teamMembers.map(member => {
        return prisma.teamMember.create({
          data: {
            name: member.name,
            position: member.position,
            email: member.email,
            phone: member.phone || '',
            avatar: member.avatar || null,
            department: member.department || 'General',
            creatorId: user.userId
          }
        });
      });
      
      await Promise.all(teamMemberPromises);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully applied to cohort',
      cohortMember
    }, { status: 201 });
  } catch (error) {
    console.error('Error applying to cohort:', error);
    return NextResponse.json(
      { error: 'Failed to apply to cohort' },
      { status: 500 }
    );
  }
}
