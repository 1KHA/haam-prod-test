import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { calculateStartupProgress, listStartupMilestones } from '@/lib/milestones';

export async function GET(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    const { startupId } = params;
    
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

    // Only program managers can access this endpoint
    if (user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json(
        { error: 'Only program managers can access this data' },
        { status: 403 }
      );
    }

    // Get the startup with its cohort information
    const startup = await prisma.startup.findUnique({
      where: {
        id: startupId
      },
      include: {
        creator: true,
        cohortMemberships: {
          include: {
            cohort: {
              include: {
                program: true
              }
            }
          }
        }
      }
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    // Get team members (mock data since there's no direct relation)
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        creatorId: startup.creatorId
      }
    });

    const milestones = await listStartupMilestones(startupId);

    // Get mentors (mock data)
    const mentors = [
      {
        id: "1",
        name: "د. محمد أحمد",
        expertise: "تطوير الأعمال",
        avatar: null,
        nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "2",
        name: "م. سارة خالد",
        expertise: "تقنية المعلومات",
        avatar: null,
        nextSession: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Get funding information (mock data)
    const funding = {
      total: `${Math.floor(Math.random() * 500) + 100},000 ريال`,
      rounds: [
        {
          id: "1",
          type: "تمويل أولي",
          amount: "50,000 ريال",
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          source: "صندوق التنمية"
        },
        {
          id: "2",
          type: "جولة استثمارية",
          amount: "200,000 ريال",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          source: "مستثمر ملاك"
        }
      ]
    };

    const progress = calculateStartupProgress(milestones);
    
    // Get cohort information
    const cohort = startup.cohortMemberships.length > 0 
      ? {
          id: startup.cohortMemberships[0].cohortId,
          name: startup.cohortMemberships[0].cohort.name,
          program: startup.cohortMemberships[0].cohort.program.name,
          startDate: startup.cohortMemberships[0].cohort.startDate,
          endDate: startup.cohortMemberships[0].cohort.endDate,
          status: startup.cohortMemberships[0].cohort.status
        }
      : null;
    
    // Format the response
    const formattedStartup = {
      id: startup.id,
      name: startup.name,
      industry: startup.industry,
      stage: startup.stage,
      description: startup.description,
      problem: startup.problem,
      solution: startup.solution,
      targetMarket: startup.targetMarket,
      businessModel: startup.businessModel,
      competitiveAdvantage: startup.competitiveAdvantage,
      teamSize: startup.teamSize,
      fundingNeeds: startup.fundingNeeds,
      pitchDeckUrl: startup.pitchDeckUrl,
      status: startup.status === "APPROVED" ? "active" : "at-risk",
      progress: progress,
      cohort: cohort,
      funding: funding,
      createdAt: startup.createdAt,
      updatedAt: startup.updatedAt,
      founder: {
        id: startup.creator.id,
        name: startup.creator.name,
        email: startup.creator.email
      },
      team: teamMembers.map(member => ({
        id: member.id,
        name: member.name,
        position: member.position,
        email: member.email,
        phone: member.phone,
        avatar: member.avatar,
        department: member.department
      })),
      milestones: milestones,
      mentors: mentors
    };
    
    return NextResponse.json(formattedStartup);
    
  } catch (error) {
    console.error('Get startup error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching startup details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    const { startupId } = params;
    const data = await request.json();
    
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

    // Only program managers can update startups
    if (user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json(
        { error: 'Only program managers can update startups' },
        { status: 403 }
      );
    }

    // Check if startup exists
    const existingStartup = await prisma.startup.findUnique({
      where: {
        id: startupId
      }
    });

    if (!existingStartup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    // Update the startup
    const updatedStartup = await prisma.startup.update({
      where: {
        id: startupId
      },
      data: {
        name: data.name,
        industry: data.industry,
        stage: data.stage,
        description: data.description,
        problem: data.problem,
        solution: data.solution,
        targetMarket: data.targetMarket,
        businessModel: data.businessModel,
        competitiveAdvantage: data.competitiveAdvantage,
        teamSize: data.teamSize,
        fundingNeeds: data.fundingNeeds,
        pitchDeckUrl: data.pitchDeckUrl,
        status: data.status === "active" ? "APPROVED" : "PENDING"
      }
    });

    // If cohort is provided, update cohort membership
    if (data.cohortId) {
      // Check if cohort exists
      const cohort = await prisma.cohort.findUnique({
        where: {
          id: data.cohortId
        }
      });

      if (!cohort) {
        return NextResponse.json(
          { error: 'Cohort not found' },
          { status: 404 }
        );
      }

      // Check if startup is already in this cohort
      const existingMembership = await prisma.cohortMember.findFirst({
        where: {
          startupId: startupId,
          cohortId: data.cohortId
        }
      });

      if (!existingMembership) {
        // Remove from any existing cohorts
        await prisma.cohortMember.deleteMany({
          where: {
            startupId: startupId
          }
        });

        // Add to new cohort
        await prisma.cohortMember.create({
          data: {
            startupId: startupId,
            cohortId: data.cohortId,
            status: "ACTIVE"
          }
        });
      }
    }

    return NextResponse.json({
      message: 'Startup updated successfully',
      startup: updatedStartup
    });
    
  } catch (error) {
    console.error('Update startup error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating startup' },
      { status: 500 }
    );
  }
}
