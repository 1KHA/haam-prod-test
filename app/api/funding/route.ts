import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

// GET /api/funding - Get funding opportunities and startup funding records for entrepreneurs
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // opportunities, records, or all
    
    // Get funding opportunities
    let opportunities = [];
    if (type === 'all' || type === 'opportunities') {
      opportunities = await prisma.fundingOpportunity.findMany({
        orderBy: { 
          createdAt: 'desc'
        }
      });
    }
    
    // Get user's startups to check for funding records
    let fundingRecords = [];
    if (type === 'all' || type === 'records') {
      const userStartups = await prisma.startup.findMany({
        where: {
          OR: [
            { creatorId: user.userId }, // User is the creator
            {
              members: {
                some: { userId: user.userId } // User is a member
              }
            }
          ]
        }
      });
      
      // Get funding records for these startups
      if (userStartups.length > 0) {
        fundingRecords = await prisma.funding.findMany({
          where: {
            startupId: { in: userStartups.map((s: { id: string }) => s.id) }
          },
          orderBy: {
            date: 'desc'
          }
        });
      }
    }
    
    return NextResponse.json({
      opportunities,
      fundingRecords
    });
    
  } catch (error) {
    console.error('Error fetching funding data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/funding - Create a new funding request for a startup
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { title, amount, startupId, startupName, status, date, fundingType, investorName, description } = body;
    
    // Validate request data
    if (!title || !amount || !startupId || !startupName || !status || !date || !fundingType || !investorName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user has access to the startup
    const startup = await prisma.startup.findFirst({
      where: {
        id: startupId,
        OR: [
          { creatorId: user.userId }, // User is the creator
          {
            members: {
              some: { userId: user.userId } // User is a member
            }
          }
        ]
      }
    });
    
    if (!startup) {
      return NextResponse.json(
        { error: 'Unauthorized access to startup' },
        { status: 403 }
      );
    }
    
    // Create funding record
    const funding = await prisma.funding.create({
      data: {
        title,
        amount,
        startupId,
        startupName,
        status,
        date: new Date(date),
        fundingType,
        investorName,
        description: description || '',
        createdBy: user.userId
      }
    });
    
    return NextResponse.json(funding, { status: 201 });
    
  } catch (error) {
    console.error('Error creating funding record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
