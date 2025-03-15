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

    // Only accelerators can view their startups
    if (user.role !== UserRole.ACCELERATOR) {
      return NextResponse.json(
        { error: 'Only accelerators can view startups' },
        { status: 403 }
      );
    }

    // Get startups created by the user
    const startups = await prisma.startup.findMany({
      where: {
        creatorId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Return startups
    return NextResponse.json({
      startups: startups.map((startup: any) => ({
        id: startup.id,
        name: startup.name,
        industry: startup.industry,
        stage: startup.stage,
        description: startup.description,
        status: startup.status,
        createdAt: startup.createdAt,
      })),
    });
    
  } catch (error) {
    console.error('Get startups error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching startups' },
      { status: 500 }
    );
  }
}
