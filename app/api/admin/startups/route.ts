import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// GET /api/admin/startups - Get all startups with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
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
    const industry = searchParams.get('industry') || undefined;
    const stage = searchParams.get('stage') || undefined;
    
    const skip = (page - 1) * limit;
    
    // Build the where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (industry) {
      where.industry = industry;
    }
    
    if (stage) {
      where.stage = stage;
    }
    
    // Get startups with pagination
    const startups = await prisma.startup.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            acceleratorProfile: {
              select: {
                organizationName: true,
                industry: true,
                focusAreas: true
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count for pagination
    const total = await prisma.startup.count({ where });
    
    // Transform the startups to include additional information
    const transformedStartups = startups.map(startup => {
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
        status: startup.status,
        createdAt: startup.createdAt,
        updatedAt: startup.updatedAt,
        creator: {
          id: startup.creator.id,
          name: startup.creator.name,
          email: startup.creator.email,
          accelerator: startup.creator.acceleratorProfile ? {
            name: startup.creator.acceleratorProfile.organizationName,
            industry: startup.creator.acceleratorProfile.industry,
            focusAreas: startup.creator.acceleratorProfile.focusAreas
          } : null
        }
      };
    });
    
    // Get statistics
    const statistics = await getStartupStatistics();
    
    return NextResponse.json({
      startups: transformedStartups,
      statistics,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching startups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startups' },
      { status: 500 }
    );
  }
}

// POST /api/admin/startups - Create a new startup
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    
    // Check if creator exists and is an accelerator
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
    
    if (creator.role !== UserRole.ACCELERATOR) {
      return NextResponse.json(
        { error: 'Creator must be an accelerator' },
        { status: 400 }
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
        teamSize: teamSize || 1,
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

// PUT /api/admin/startups - Bulk update startups
export async function PUT(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { startupIds, action, data } = body;
    
    if (!startupIds || !Array.isArray(startupIds) || startupIds.length === 0) {
      return NextResponse.json(
        { error: 'No startups specified' },
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
          startupIds.map(id => 
            prisma.startup.update({
              where: { id },
              data: { status: data.status },
              select: { id: true }
            })
          )
        );
        break;
        
      case 'updateStage':
        if (!data.stage) {
          return NextResponse.json(
            { error: 'No stage specified' },
            { status: 400 }
          );
        }
        
        result = await prisma.$transaction(
          startupIds.map(id => 
            prisma.startup.update({
              where: { id },
              data: { stage: data.stage },
              select: { id: true }
            })
          )
        );
        break;
        
      case 'delete':
        result = await prisma.$transaction(
          startupIds.map(id => 
            prisma.startup.delete({
              where: { id },
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
    console.error('Error updating startups:', error);
    return NextResponse.json(
      { error: 'Failed to update startups' },
      { status: 500 }
    );
  }
}

// Helper function to get startup statistics
async function getStartupStatistics() {
  // Get total startups
  const totalStartups = await prisma.startup.count();
  
  // Get startups by status
  const activeStartups = await prisma.startup.count({
    where: { status: 'APPROVED' }
  });
  
  const pendingStartups = await prisma.startup.count({
    where: { status: 'PENDING' }
  });
  
  const rejectedStartups = await prisma.startup.count({
    where: { status: 'REJECTED' }
  });
  
  // Get startups by industry
  const industries = await prisma.startup.groupBy({
    by: ['industry'],
    _count: {
      industry: true
    }
  });
  
  // Get startups by stage
  const stages = await prisma.startup.groupBy({
    by: ['stage'],
    _count: {
      stage: true
    }
  });
  
  // Calculate total funding needs
  const startups = await prisma.startup.findMany({
    select: {
      fundingNeeds: true
    }
  });
  
  let totalFunding = 0;
  let startupCount = 0;
  
  startups.forEach(startup => {
    if (startup.fundingNeeds) {
      // Extract numeric value from funding needs (e.g., "5,000,000 ريال" -> 5000000)
      const match = startup.fundingNeeds.match(/[\d,]+/);
      if (match) {
        const numericValue = parseInt(match[0].replace(/,/g, ''));
        if (!isNaN(numericValue)) {
          totalFunding += numericValue;
          startupCount++;
        }
      }
    }
  });
  
  const averageFunding = startupCount > 0 ? totalFunding / startupCount : 0;
  
  return {
    total: totalStartups,
    active: activeStartups,
    pending: pendingStartups,
    rejected: rejectedStartups,
    industries: industries.map(i => ({
      name: i.industry,
      count: i._count.industry
    })),
    stages: stages.map(s => ({
      name: s.stage,
      count: s._count.stage
    })),
    funding: {
      total: totalFunding,
      average: averageFunding
    }
  };
}
