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

    // Only entrepreneurs can view their own companies
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can view their own companies' },
        { status: 403 }
      );
    }

    // Get companies created by the entrepreneur
    const companies = await prisma.startup.findMany({
      where: {
        creatorId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Return companies
    return NextResponse.json({
      companies: companies.map((company: any) => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        stage: company.stage,
        description: company.description,
        status: company.status,
        createdAt: company.createdAt,
      })),
    });
    
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching companies' },
      { status: 500 }
    );
  }
}
