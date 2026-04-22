import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { notifyProgramUpdated, notifyProgramCancelled } from '@/lib/services/notification-events';

// GET /api/admin/programs/[id] - Get a specific program by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user has permission to view programs
    const permissionCheck = await checkPermission(request, {
      category: 'programs',
      action: 'view'
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Get the program
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        cohorts: {
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                members: true,
                mentors: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    });
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Transform the program to include additional information
    const transformedProgram = {
      id: program.id,
      name: program.name,
      description: program.description,
      startDate: program.startDate,
      endDate: program.endDate,
      location: program.location,
      type: program.type,
      status: program.status,
      capacity: program.capacity,
      applicationDeadline: program.applicationDeadline,
      requirements: program.requirements,
      benefits: program.benefits,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      creator: {
        id: program.creator.id,
        name: program.creator.name,
        email: program.creator.email
      },
      cohorts: program.cohorts.map(cohort => ({
        id: cohort.id,
        name: cohort.name,
        description: cohort.description,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
        status: cohort.status,
        capacity: cohort.capacity,
        manager: {
          id: cohort.manager.id,
          name: cohort.manager.name,
          email: cohort.manager.email
        },
        stats: {
          membersCount: cohort._count.members,
          mentorsCount: cohort._count.mentors
        }
      })),
      stats: {
        cohortsCount: program.cohorts.length,
        activeCohortsCount: program.cohorts.filter(c => c.status === 'ACTIVE').length,
        totalStartups: program.cohorts.reduce((acc, cohort) => acc + cohort._count.members, 0),
        totalMentors: program.cohorts.reduce((acc, cohort) => acc + cohort._count.mentors, 0)
      }
    };
    
    return NextResponse.json(transformedProgram);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/programs/[id] - Update a specific program
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user has permission to edit programs
    const permissionCheck = await checkPermission(request, {
      category: 'programs',
      action: 'edit'
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id },
      include: {
        cohorts: {
          select: { id: true }
        }
      }
    });
    
    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      location, 
      type, 
      status, 
      capacity, 
      applicationDeadline, 
      requirements, 
      benefits
    } = body;
    
    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (applicationDeadline !== undefined) {
      updateData.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
    }
    if (requirements !== undefined) updateData.requirements = requirements;
    if (benefits !== undefined) updateData.benefits = benefits;
    
    // Track updated fields for notification
    const updatedFields = Object.keys(updateData);

    // Update the program
    const updatedProgram = await prisma.program.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send notifications for program update (TASK-13)
    if (updatedFields.length > 0) {
      try {
        if (status === 'CANCELLED' && existingProgram.status !== 'CANCELLED') {
          // Program was cancelled (TASK-14)
          await notifyProgramCancelled({
            programId: id,
            programName: updatedProgram.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cancelledByName: (permissionCheck as any).userName || 'Admin',
            reason: body.cancellationReason,
            cohortIds: existingProgram.cohorts.map(c => c.id)
          });
        } else {
          // Regular program update (TASK-13)
          await notifyProgramUpdated({
            programId: id,
            programName: updatedProgram.name,
            updatedFields,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updaterName: (permissionCheck as any).userName || 'Admin',
            cohortIds: existingProgram.cohorts.map(c => c.id)
          });
        }
      } catch (notifyError) {
        console.error('[Admin Programs PUT] Notification error:', notifyError);
      }
    }
    
    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/programs/[id] - Delete a specific program
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user has permission to delete programs
    const permissionCheck = await checkPermission(request, {
      category: 'programs',
      action: 'delete'
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!existingProgram) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Delete the program
    await prisma.program.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
