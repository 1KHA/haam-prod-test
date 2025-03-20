import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// GET /api/program-manager/cohorts/[id]/members - Get all members of a cohort
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
    const status = searchParams.get('status') || undefined;
    
    // Build the where clause for filtering
    const where: any = {
      cohortId: id
    };
    
    if (status) {
      where.status = status;
    }
    
    // Get cohort members
    const members = await prisma.cohortMember.findMany({
      where,
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true,
            description: true,
            teamSize: true,
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
      orderBy: { joinDate: 'desc' }
    });
    
    // Transform the members to include additional information
    const transformedMembers = members.map(member => ({
      id: member.id,
      status: member.status,
      joinDate: member.joinDate,
      startup: {
        id: member.startup.id,
        name: member.startup.name,
        industry: member.startup.industry,
        stage: member.startup.stage,
        description: member.startup.description,
        teamSize: member.startup.teamSize,
        creator: {
          id: member.startup.creator.id,
          name: member.startup.creator.name,
          email: member.startup.creator.email
        }
      }
    }));
    
    return NextResponse.json({
      members: transformedMembers,
      count: transformedMembers.length
    });
  } catch (error) {
    console.error('Error fetching cohort members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort members' },
      { status: 500 }
    );
  }
}

// POST /api/program-manager/cohorts/[id]/members - Add a startup to a cohort
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
      select: { id: true, managerId: true, capacity: true }
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
    const { startupId, status } = body;
    
    // Validate required fields
    if (!startupId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if startup exists
    const startup = await prisma.startup.findUnique({
      where: { id: startupId }
    });
    
    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }
    
    // Check if the startup is already a member of this cohort
    const existingMember = await prisma.cohortMember.findFirst({
      where: {
        cohortId: id,
        startupId
      }
    });
    
    if (existingMember) {
      return NextResponse.json(
        { error: 'Startup is already a member of this cohort' },
        { status: 400 }
      );
    }
    
    // Check if the cohort has reached its capacity
    if (cohort.capacity) {
      const currentMembersCount = await prisma.cohortMember.count({
        where: { cohortId: id }
      });
      
      if (currentMembersCount >= cohort.capacity) {
        return NextResponse.json(
          { error: 'Cohort has reached its capacity' },
          { status: 400 }
        );
      }
    }
    
    // Add the startup to the cohort
    const member = await prisma.cohortMember.create({
      data: {
        cohortId: id,
        startupId,
        status: status || 'ACTIVE'
      },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true
          }
        }
      }
    });
    
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding startup to cohort:', error);
    return NextResponse.json(
      { error: 'Failed to add startup to cohort' },
      { status: 500 }
    );
  }
}

// PUT /api/program-manager/cohorts/[id]/members - Update multiple cohort members
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
    const { memberIds, action, data } = body;
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'No members specified' },
        { status: 400 }
      );
    }
    
    if (!action) {
      return NextResponse.json(
        { error: 'No action specified' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'updateStatus':
        if (!data.status) {
          return NextResponse.json(
            { error: 'No status specified' },
            { status: 400 }
          );
        }
        
        result = await prisma.$transaction(
          memberIds.map(memberId => 
            prisma.cohortMember.update({
              where: { id: memberId },
              data: { status: data.status },
              select: { id: true }
            })
          )
        );
        break;
        
      case 'remove':
        result = await prisma.$transaction(
          memberIds.map(memberId => 
            prisma.cohortMember.delete({
              where: { id: memberId },
              select: { id: true }
            })
          )
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      count: result.length,
      action
    });
  } catch (error) {
    console.error('Error updating cohort members:', error);
    return NextResponse.json(
      { error: 'Failed to update cohort members' },
      { status: 500 }
    );
  }
}
