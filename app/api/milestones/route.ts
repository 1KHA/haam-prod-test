import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// GET /api/milestones?startupId=...
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');

    if (!startupId) {
      return NextResponse.json({ error: 'Missing startupId' }, { status: 400 });
    }

    // Check if user is a member of the company
    const isMember = await prisma.companyMember.findFirst({
      where: {
        startupId,
        userId: user.userId,
        status: 'ACTIVE',
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // List all milestones for the company
    const milestones = await prisma.milestone.findMany({
      where: { startupId },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Get milestones error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching milestones' }, { status: 500 });
  }
}

// POST /api/milestones
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startupId, title, description, dueDate, priority, category } = body;

    if (!startupId || !title || !description || !dueDate || !priority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only team leader can create milestones
    const member = await prisma.companyMember.findFirst({
      where: {
        startupId,
        userId: user.userId,
        status: 'ACTIVE',
      },
    });

    if (!member || member.role !== 'Leader') {
      return NextResponse.json({ error: 'Only the team leader can create milestones' }, { status: 403 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        status: 'upcoming',
        progress: 0,
        priority,
        category,
        startupId,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('Create milestone error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the milestone' }, { status: 500 });
  }
}
