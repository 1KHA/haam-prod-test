import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { notifyApplicationStatusChanged, notifyCohortMemberAdded } from '@/lib/services/notification-events';

// GET /api/program-manager/cohorts/[id]/applications - Get all applications for a cohort
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is a program manager
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json(
        { error: 'Unauthorized. Only program managers can access cohort applications.' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Check if cohort exists and is managed by the user
    const cohort = await prisma.cohort.findUnique({
      where: { 
        id,
        managerId: user.userId
      }
    });
    
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found or you do not have permission to manage it' },
        { status: 404 }
      );
    }
    
    // Get all applications for the cohort
    const applications = await prisma.cohortMember.findMany({
      where: { 
        cohortId: id
      },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true,
            description: true,
            problem: true,
            solution: true,
            targetMarket: true,
            businessModel: true,
            competitiveAdvantage: true,
            teamSize: true,
            fundingNeeds: true,
            pitchDeckUrl: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transform the applications
    const transformedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      joinDate: app.joinDate,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      startup: app.startup
    }));
    
    // Get statistics
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      active: applications.filter(app => app.status === 'ACTIVE').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      dropped: applications.filter(app => app.status === 'DROPPED').length
    };
    
    return NextResponse.json({
      applications: transformedApplications,
      stats
    });
  } catch (error) {
    console.error('Error fetching cohort applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort applications' },
      { status: 500 }
    );
  }
}

// PUT /api/program-manager/cohorts/[id]/applications - Update application status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is a program manager
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json(
        { error: 'Unauthorized. Only program managers can update application status.' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Check if cohort exists and is managed by the user
    const cohort = await prisma.cohort.findUnique({
      where: { 
        id,
        managerId: user.userId
      }
    });
    
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found or you do not have permission to manage it' },
        { status: 404 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { applicationId, status, feedback } = body;
    
    // Validate required fields
    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status
    if (!['PENDING', 'ACTIVE', 'REJECTED', 'DROPPED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Status must be one of: PENDING, ACTIVE, REJECTED, DROPPED' },
        { status: 400 }
      );
    }
    
    // Check if application exists
    const application = await prisma.cohortMember.findFirst({
      where: { 
        id: applicationId,
        cohortId: id
      }
    });
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Get application details before update for notification
    console.log(`[Applications API] Fetching application details for notification...`);
    const oldApplication = await prisma.cohortMember.findFirst({
      where: { id: applicationId },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            creator: { select: { id: true } },
            members: { select: { userId: true } },
          },
        },
        cohort: { select: { name: true } },
      },
    });
    console.log(`[Applications API] Found application: ${oldApplication ? 'yes' : 'no'}`);
    console.log(`[Applications API] Startup name: ${oldApplication?.startup?.name}`);

    // Update application status
    const updatedApplication = await prisma.cohortMember.update({
      where: { id: applicationId },
      data: { 
        status,
        // Add feedback field to CohortMember model if needed
        // feedback
      }
    });

    // Notify the entrepreneur about the status change
    console.log(`[Applications API] Notifying entrepreneur about status change to ${status}...`);
    try {
      if (oldApplication) {
        const entrepreneurIds = [
          oldApplication.startup.creator?.id,
          ...oldApplication.startup.members.map(m => m.userId),
        ].filter((id): id is string => !!id);

        if (entrepreneurIds.length === 0 && oldApplication.startup.creatorId) {
          entrepreneurIds.push(oldApplication.startup.creatorId);
          console.log(`[Applications API] Used startup.creatorId as fallback entrepreneur ID`);
        }

        console.log(`[Applications API] Found ${entrepreneurIds.length} entrepreneurs to notify`);
        console.log(`[Applications API] Entrepreneur IDs: ${JSON.stringify(entrepreneurIds)}`);

        // Map cohort member status to application status
        const statusMap: Record<string, 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'> = {
          'PENDING': 'PENDING',
          'ACTIVE': 'ACCEPTED',
          'REJECTED': 'REJECTED',
          'DROPPED': 'REJECTED',
        };

        const mappedStatus = statusMap[status] || 'PENDING';
        console.log(`[Applications API] Mapped status: ${status} -> ${mappedStatus}`);

        if (entrepreneurIds.length > 0) {
          await notifyApplicationStatusChanged({
            applicationId,
            startupId: oldApplication.startupId,
            startupName: oldApplication.startup.name,
            cohortId: id,
            cohortName: oldApplication.cohort.name,
            oldStatus: oldApplication.status,
            newStatus: mappedStatus,
            feedback,
            entrepreneurIds,
          });
          console.log(`[Applications API] Status change notification sent successfully`);
        } else {
          console.log(`[Applications API] No entrepreneurs found to notify`);
        }
        
        // TASK-05: Send cohort welcome notification when application is accepted (ACTIVE)
        if (status === 'ACTIVE' && entrepreneurIds.length > 0) {
          console.log(`[Applications API] Sending cohort welcome notification (TASK-05)...`);
          try {
            // Get cohort details with program info
            const cohortWithProgram = await prisma.cohort.findUnique({
              where: { id },
              include: {
                program: { select: { id: true, name: true } },
                manager: { select: { id: true } }
              }
            });
            
            if (cohortWithProgram) {
              await notifyCohortMemberAdded({
                cohortId: id,
                cohortName: cohortWithProgram.name,
                programId: cohortWithProgram.program.id,
                programName: cohortWithProgram.program.name,
                startupId: oldApplication.startupId,
                startupName: oldApplication.startup.name,
                entrepreneurIds,
                programManagerId: cohortWithProgram.manager?.id || user.userId,
              });
              console.log(`[Applications API] Cohort welcome notification sent (TASK-05)`);
            }
          } catch (welcomeError: any) {
            console.error('[Applications API] Failed to send cohort welcome notification:', welcomeError.message);
          }
        }
      } else {
        console.log(`[Applications API] No old application data found`);
      }
    } catch (notifyError: any) {
      console.error('[Applications API] Failed to send status change notification:', notifyError.message);
      console.error('[Applications API] Stack:', notifyError.stack);
    }
    
    return NextResponse.json({
      success: true,
      message: `Application status updated to ${status}`,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}
