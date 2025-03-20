import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// GET /api/program-manager/cohorts/[id]/mentors - Get all mentors of a cohort
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
    
    // Check if cohort exists and is managed by this user
    const cohort = await prisma.cohort.findUnique({
      where: { id },
      select: { id: true, managerId: true }
    });
    
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }
    
    if (cohort.managerId !== user.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to view this cohort' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    
    // Build the where clause for filtering
    const where: any = {
      cohortId: id
    };
    
    if (role) {
      where.role = role;
    }
    
    // Get cohort mentors
    const mentors = await prisma.cohortMentor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
            mentorProfile: true
          }
        }
      }
    });
    
    // Transform the mentors to include additional information
    const transformedMentors = mentors.map(mentor => ({
      id: mentor.id,
      role: mentor.role,
      user: {
        id: mentor.user.id,
        name: mentor.user.name,
        email: mentor.user.email,
        specialization: mentor.user.specialization,
        expertise: mentor.user.mentorProfile?.expertise,
        experience: mentor.user.mentorProfile?.experience,
        availability: mentor.user.mentorProfile?.availability
      },
      createdAt: mentor.createdAt,
      updatedAt: mentor.updatedAt
    }));
    
    return NextResponse.json({
      mentors: transformedMentors,
      count: transformedMentors.length
    });
  } catch (error) {
    console.error('Error fetching cohort mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort mentors' },
      { status: 500 }
    );
  }
}

// POST /api/program-manager/cohorts/[id]/mentors - Add a mentor to a cohort
export async function POST(
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
    const cohort = await prisma.cohort.findUnique({
      where: { id },
      select: { id: true, managerId: true }
    });
    
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }
    
    if (cohort.managerId !== user.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to modify this cohort' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { userId, role } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user exists and is a mentor
    const mentorUser = await prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.MENTOR
      }
    });
    
    if (!mentorUser) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }
    
    // Check if the mentor is already assigned to this cohort
    const existingMentor = await prisma.cohortMentor.findFirst({
      where: {
        cohortId: id,
        userId
      }
    });
    
    if (existingMentor) {
      return NextResponse.json(
        { error: 'Mentor is already assigned to this cohort' },
        { status: 400 }
      );
    }
    
    // Add the mentor to the cohort
    const mentor = await prisma.cohortMentor.create({
      data: {
        cohortId: id,
        userId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true
          }
        }
      }
    });
    
    return NextResponse.json(mentor, { status: 201 });
  } catch (error) {
    console.error('Error adding mentor to cohort:', error);
    return NextResponse.json(
      { error: 'Failed to add mentor to cohort' },
      { status: 500 }
    );
  }
}

// DELETE /api/program-manager/cohorts/[id]/mentors/[mentorId] - Remove a mentor from a cohort
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
    const cohort = await prisma.cohort.findUnique({
      where: { id },
      select: { id: true, managerId: true }
    });
    
    if (!cohort) {
      return NextResponse.json(
        { error: 'Cohort not found' },
        { status: 404 }
      );
    }
    
    if (cohort.managerId !== user.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to modify this cohort' },
        { status: 403 }
      );
    }
    
    // Get the mentorId from the request body
    const body = await request.json();
    const { mentorId } = body;
    
    if (!mentorId) {
      return NextResponse.json(
        { error: 'Missing mentor ID' },
        { status: 400 }
      );
    }
    
    // Check if the mentor exists in this cohort
    const existingMentor = await prisma.cohortMentor.findFirst({
      where: {
        id: mentorId,
        cohortId: id
      }
    });
    
    if (!existingMentor) {
      return NextResponse.json(
        { error: 'Mentor not found in this cohort' },
        { status: 404 }
      );
    }
    
    // Remove the mentor from the cohort
    await prisma.cohortMentor.delete({
      where: { id: mentorId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Mentor removed from cohort successfully'
    });
  } catch (error) {
    console.error('Error removing mentor from cohort:', error);
    return NextResponse.json(
      { error: 'Failed to remove mentor from cohort' },
      { status: 500 }
    );
  }
}
