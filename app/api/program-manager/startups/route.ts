import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

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

    // Only program managers can access this endpoint
    if (user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json(
        { error: 'Only program managers can access this data' },
        { status: 403 }
      );
    }

    // Get all startups with their cohort information
    const startups = await prisma.startup.findMany({
      include: {
        creator: true,
        cohortMemberships: {
          include: {
            cohort: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Get all cohorts for filtering
    const cohorts = await prisma.cohort.findMany({
      select: {
        id: true,
        name: true,
        status: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate statistics
    const totalStartups = startups.length;
    const activeStartups = startups.filter(s => s.status === "APPROVED").length;
    const atRiskStartups = startups.filter(s => s.status === "PENDING").length;
    
    // Count startups by industry
    const industries: Record<string, number> = {};
    startups.forEach(startup => {
      if (!industries[startup.industry]) {
        industries[startup.industry] = 0;
      }
      industries[startup.industry]++;
    });

    // Get upcoming milestones (mock data since there's no milestone model)
    const milestones = [
      {
        id: "1",
        title: "عرض النموذج الأولي",
        startupName: "شركة باي تك",
        dueIn: "خلال 3 أيام",
        status: "urgent"
      },
      {
        id: "2",
        title: "اختبار المستخدمين",
        startupName: "شركة ميديكال إيه آي",
        dueIn: "خلال 5 أيام",
        status: "upcoming"
      },
      {
        id: "3",
        title: "عرض خطة التسويق",
        startupName: "شركة تك سوليوشنز",
        dueIn: "خلال أسبوع",
        status: "normal"
      },
      {
        id: "4",
        title: "تقديم تقرير التقدم",
        startupName: "شركة هيلث تك",
        dueIn: "خلال 10 أيام",
        status: "normal"
      }
    ];
    
    // Format the response
    const formattedStartups = startups.map(startup => {
      // Calculate progress (mock data since there's no progress field)
      const progress = Math.floor(Math.random() * 60) + 30;
      
      // Get cohort information
      const cohort = startup.cohortMemberships.length > 0 
        ? startup.cohortMemberships[0].cohort.name 
        : "غير محدد";
      
      const cohortId = startup.cohortMemberships.length > 0 
        ? startup.cohortMemberships[0].cohortId 
        : null;
      
      return {
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
        cohortId: cohortId,
        funding: `${Math.floor(Math.random() * 500) + 100},000 ريال`, // Mock funding data
        createdAt: startup.createdAt,
        updatedAt: startup.updatedAt,
        founder: {
          id: startup.creator.id,
          name: startup.creator.name,
          email: startup.creator.email
        }
      };
    });
    
    // Calculate average progress
    const avgProgress = formattedStartups.length > 0
      ? Math.round(formattedStartups.reduce((sum, s) => sum + s.progress, 0) / formattedStartups.length)
      : 0;
    
    // Calculate total funding (mock data)
    const totalFunding = formattedStartups.length * 250000;
    
    return NextResponse.json({
      startups: formattedStartups,
      cohorts: cohorts,
      milestones: milestones,
      stats: {
        total: totalStartups,
        active: activeStartups,
        atRisk: atRiskStartups,
        avgProgress: avgProgress,
        totalFunding: totalFunding,
        industries: industries
      }
    });
    
  } catch (error) {
    console.error('Get startups error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching startups' },
      { status: 500 }
    );
  }
}

// POST /api/program-manager/startups - Create a new startup
export async function POST(request: NextRequest) {
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

    // Only program managers can create startups
    if (user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json(
        { error: 'Only program managers can create startups' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { 
      name, 
      industry, 
      stage, 
      description, 
      problem, 
      solution, 
      targetMarket, 
      businessModel, 
      competitiveAdvantage, 
      teamSize, 
      fundingNeeds, 
      pitchDeckUrl, 
      status,
      creatorId 
    } = body;
    
    // Validate required fields
    if (!name || !industry || !stage || !description || !problem || !solution || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if creator exists
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true, role: true }
    });
    
    if (!creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }
    
    // Create the startup
    const startup = await prisma.startup.create({
      data: {
        name,
        industry,
        stage,
        description,
        problem,
        solution,
        targetMarket,
        businessModel,
        competitiveAdvantage,
        teamSize: typeof teamSize === 'string' ? parseInt(teamSize) || 1 : teamSize || 1,
        fundingNeeds,
        pitchDeckUrl,
        status: status || 'PENDING',
        creatorId
      },
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
    
    return NextResponse.json(startup, { status: 201 });
  } catch (error) {
    console.error('Error creating startup:', error);
    return NextResponse.json(
      { error: 'Failed to create startup' },
      { status: 500 }
    );
  }
}
