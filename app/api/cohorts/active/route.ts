import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

// GET /api/cohorts/active - Get all active cohorts
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user's startup (if any) to check existing applications
    const userStartup = await prisma.startup.findFirst({
      where: { creatorId: user.id },
      select: { id: true }
    });

    // Get active cohorts
    const activeCohorts = await prisma.cohort.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            requirements: true,
            benefits: true
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
    });
    
    // Get cohort IDs where user's startup already applied
    const appliedCohortIds = new Set<string>();
    if (userStartup) {
      const memberships = await prisma.cohortMember.findMany({
        where: { startupId: userStartup.id },
        select: { cohortId: true }
      });
      memberships.forEach(m => appliedCohortIds.add(m.cohortId));
    }

    // Transform the cohorts
    const transformedCohorts = activeCohorts.map(cohort => ({
      id: cohort.id,
      name: cohort.name,
      description: cohort.description,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      capacity: cohort.capacity,
      program: {
        id: cohort.program.id,
        name: cohort.program.name,
        type: cohort.program.type,
        description: cohort.program.description,
        requirements: cohort.program.requirements,
        benefits: cohort.program.benefits
      },
      stats: {
        membersCount: cohort._count.members,
        mentorsCount: cohort._count.mentors
      },
      alreadyApplied: appliedCohortIds.has(cohort.id)
    }));
    
    return NextResponse.json({
      cohorts: transformedCohorts
    });
  } catch (error) {
    console.error('Error fetching active cohorts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active cohorts' },
      { status: 500 }
    );
  }
}
