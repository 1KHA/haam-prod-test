import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  buildMilestoneStats,
  canManageStartupMilestones,
  canViewStartupMilestones,
  listMilestones,
} from '@/lib/milestones';

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

    const access = await canViewStartupMilestones(startupId, user);
    if (!access.canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const milestones = await listMilestones({ startupId });

    return NextResponse.json({
      milestones,
      stats: buildMilestoneStats(milestones),
      permissions: {
        canRespond: user.role === UserRole.ENTREPRENEUR,
        canManage: access.canManage && user.role !== UserRole.ENTREPRENEUR,
      },
    });
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

    if (user.role === UserRole.ENTREPRENEUR) {
      return NextResponse.json({ error: 'Entrepreneurs cannot create milestones' }, { status: 403 });
    }

    const body = await request.json();
    const { startupId, title, description, dueDate, priority, category } = body;

    if (!startupId || !title || !description || !dueDate || !priority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const access = await canManageStartupMilestones(startupId, user);
    if (!access.canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        startupId,
        title,
        description,
        dueDate: new Date(dueDate),
        priority,
        category,
        progress: 0,
        status: 'upcoming',
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('Create milestone error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the milestone' }, { status: 500 });
  }
}
