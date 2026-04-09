import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// Define the funding item interface
export interface FundingItem {
  id: string
  title: string
  amount: string
  startupId: string
  startupName: string
  status: string
  date: Date | string
  fundingType: string
  investorName: string
  description: string
  createdAt: Date | string
  updatedAt: Date | string
  createdBy?: string | null
}

// GET /api/admin/financing/funding - Get all funding entries
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'financing',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startupId = searchParams.get('startupId');
    const search = searchParams.get('search');
    
    // Build filter conditions for Prisma query
    let whereCondition: any = {};
    
    if (status && status !== 'all') {
      whereCondition.status = status;
    }
    
    if (startupId) {
      whereCondition.startupId = startupId;
    }
    
    if (search) {
      whereCondition.OR = [
        { title: { contains: search } },
        { startupName: { contains: search } },
        { investorName: { contains: search } },
        { fundingType: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    // Get funding data from the database
    const fundingData = await prisma.funding.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate funding summary
    const totalFunding = fundingData.reduce((sum: number, item: any) => sum + parseInt(item.amount), 0);
    const completedDeals = fundingData.filter((item: any) => item.status === 'مكتمل').length;
    const pendingDeals = fundingData.filter((item: any) => item.status === 'قيد المراجعة').length;
    const rejectedDeals = fundingData.filter((item: any) => item.status === 'مرفوض').length;
    const avgFundingAmount = totalFunding / (fundingData.length || 1);
    
    const summary = {
      totalFunding,
      completedDeals,
      pendingDeals,
      successRate: Math.round((completedDeals / (completedDeals + pendingDeals + rejectedDeals)) * 100) || 0,
      avgFundingAmount
    };
    
    // Format the data for display
    const formattedData = fundingData.map((item: any) => ({
      ...item,
      date: item.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      amount: `${parseInt(item.amount).toLocaleString()} ريال`,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));

    return NextResponse.json({ 
      data: formattedData,
      summary
    });
  } catch (error) {
    console.error('Error fetching funding data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/financing/funding - Create a new funding entry
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'financing',
      action: 'create'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'startupId', 'startupName', 'amount', 'fundingType', 'investorName', 'date', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create new funding entry in the database
    const newFunding = await prisma.funding.create({
      data: {
        title: body.title,
        amount: body.amount,
        startupId: body.startupId,
        startupName: body.startupName,
        status: body.status,
        date: new Date(body.date),
        fundingType: body.fundingType,
        investorName: body.investorName,
        description: body.description || '',
        createdBy: user.userId // Link to the creating user
      }
    });
    
    // Format the response
    const formattedFunding = {
      ...newFunding,
      date: newFunding.date.toISOString().split('T')[0],
      createdAt: newFunding.createdAt.toISOString(),
      updatedAt: newFunding.updatedAt.toISOString()
    };
    
    return NextResponse.json({ 
      message: 'تم إنشاء التمويل بنجاح',
      data: formattedFunding 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating funding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
