import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// GET /api/program-manager/cohorts/[id] - Get a specific cohort by ID
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Get the cohort
    const cohort = await prisma.cohort.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true
          }
        },
        members: {
          include: {
            startup: {
              select: {
                id: true,
                name: true,
                industry: true,
                stage: true,
                teamSize: true
              }
            }
          }
        },
        mentors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                mentorProfile: true
              }
            }
          }
        }
      }
    });
    
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the manager of this cohort
    if (cohort.managerId !== user.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to view this cohort' },
        { status: 403 }
      );
    }
    
    // Transform the cohort to include additional information
    const transformedCohort = {
      id: cohort.id,
      name: cohort.name,
      description: cohort.description,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      status: cohort.status,
      capacity: cohort.capacity,
      program: {
        id: cohort.program.id,
        name: cohort.program.name,
        type: cohort.program.type,
        description: cohort.program.description
      },
      startups: cohort.members.map(member => ({
        id: member.startup.id,
        name: member.startup.name,
        industry: member.startup.industry,
        stage: member.startup.stage,
        teamSize: member.startup.teamSize,
        status: member.status,
        joinDate: member.joinDate
      })),
      mentors: cohort.mentors.map(mentor => ({
        id: mentor.user.id,
        name: mentor.user.name,
        email: mentor.user.email,
        role: mentor.role,
        expertise: mentor.user.mentorProfile?.expertise,
        experience: mentor.user.mentorProfile?.experience
      })),
      createdAt: cohort.createdAt,
      updatedAt: cohort.updatedAt
    };
    
    return NextResponse.json(transformedCohort);
  } catch (error) {
    console.error('Error fetching cohort:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort' },
      { status: 500 }
    );
  }
}

// PUT /api/program-manager/cohorts/[id] - Update a specific cohort
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Check if cohort exists and is managed by this user
    const existingCohort = await prisma.cohort.findUnique({
      where: { id },
      select: { id: true, managerId: true }
    });
    
    if (!existingCohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }
    
    if (existingCohort.managerId !== user.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to update this cohort' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      status, 
      capacity
    } = body;
    
    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status;
    if (capacity !== undefined) updateData.capacity = capacity;
    
    // Update the cohort
    const updatedCohort = await prisma.cohort.update({
      where: { id },
      data: updateData,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedCohort);
  } catch (error) {
    console.error('Error updating cohort:', error);
    return NextResponse.json(
      { error: 'Failed to update cohort' },
      { status: 500 }
    );
  }
}

// DELETE /api/program-manager/cohorts/[id] - Delete a specific cohort
export async function DELETE(
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Check if cohort exists and is managed by this user
    const existingCohort = await prisma.cohort.findUnique({
      where: { id },
      select: { id: true, managerId: true }
    });
    
    if (!existingCohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }
    
    if (existingCohort.managerId !== user.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this cohort' },
        { status: 403 }
      );
    }
    
    // Delete the cohort
    await prisma.cohort.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cohort deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cohort:', error);
    return NextResponse.json(
      { error: 'Failed to delete cohort' },
      { status: 500 }
    );
  }
}
