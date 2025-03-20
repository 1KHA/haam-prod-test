import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// GET /api/program-manager/cohorts - Get all cohorts for the program manager
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;
    const programId = searchParams.get('programId') || undefined;
    
    const skip = (page - 1) * limit;
    
    // Build the where clause for filtering
    const where: any = {
      managerId: user.userId // Only show cohorts managed by this program manager
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (programId) {
      where.programId = programId;
    }
    
    // Get cohorts with pagination
    const cohorts = await prisma.cohort.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            members: true,
            mentors: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { startDate: 'desc' }
    });
    
    // Get total count for pagination
    const total = await prisma.cohort.count({ where });
    
    // Transform the cohorts to include additional information
    const transformedCohorts = cohorts.map(cohort => {
      return {
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
          type: cohort.program.type
        },
        stats: {
          membersCount: cohort._count.members,
          mentorsCount: cohort._count.mentors
        },
        createdAt: cohort.createdAt,
        updatedAt: cohort.updatedAt
      };
    });
    
    // Get statistics
    const statistics = await getCohortStatistics(user.userId);
    
    return NextResponse.json({
      cohorts: transformedCohorts,
      statistics,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching cohorts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohorts' },
      { status: 500 }
    );
  }
}

// POST /api/program-manager/cohorts - Create a new cohort
export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json();
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      status, 
      capacity, 
      programId
    } = body;
    
    // Validate required fields
    if (!name || !startDate || !endDate || !programId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId }
    });
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Create the cohort
    const cohort = await prisma.cohort.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'UPCOMING',
        capacity,
        programId,
        managerId: user.userId
      },
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
    
    return NextResponse.json(cohort, { status: 201 });
  } catch (error) {
    console.error('Error creating cohort:', error);
    return NextResponse.json(
      { error: 'Failed to create cohort' },
      { status: 500 }
    );
  }
}

// Helper function to get cohort statistics for a program manager
async function getCohortStatistics(managerId: string) {
  // Get total cohorts
  const totalCohorts = await prisma.cohort.count({
    where: { managerId }
  });
  
  // Get cohorts by status
  const upcomingCohorts = await prisma.cohort.count({
    where: { 
      managerId,
      status: 'UPCOMING'
    }
  });
  
  const activeCohorts = await prisma.cohort.count({
    where: { 
      managerId,
      status: 'ACTIVE'
    }
  });
  
  const completedCohorts = await prisma.cohort.count({
    where: { 
      managerId,
      status: 'COMPLETED'
    }
  });
  
  // Get total startups in cohorts
  const cohortIds = await prisma.cohort.findMany({
    where: { managerId },
    select: { id: true }
  });
  
  const totalStartups = await prisma.cohortMember.count({
    where: {
      cohortId: {
        in: cohortIds.map(c => c.id)
      }
    }
  });
  
  // Get total mentors in cohorts
  const totalMentors = await prisma.cohortMentor.count({
    where: {
      cohortId: {
        in: cohortIds.map(c => c.id)
      }
    }
  });
  
  // Get programs with cohorts
  const programs = await prisma.program.findMany({
    where: {
      cohorts: {
        some: {
          managerId
        }
      }
    },
    select: {
      id: true,
      name: true,
      type: true,
      _count: {
        select: {
          cohorts: true
        }
      }
    }
  });
  
  return {
    total: totalCohorts,
    upcoming: upcomingCohorts,
    active: activeCohorts,
    completed: completedCohorts,
    startups: totalStartups,
    mentors: totalMentors,
    programs: programs.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      cohortsCount: p._count.cohorts
    }))
  };
}
