import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// POST /api/cohorts/apply - Apply to a cohort with a startup
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and has appropriate role
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || (user.role !== UserRole.STARTUP && user.role !== UserRole.ACCELERATOR)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only startups or accelerators can apply to cohorts.' },
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
