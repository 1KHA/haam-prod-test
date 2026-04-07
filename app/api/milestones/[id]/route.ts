import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  canManageStartupMilestones,
  canViewStartupMilestones,
  listMilestones,
  updateMilestoneRecord,
} from '@/lib/milestones';

async function getMilestoneWithAccess(id: string, authHeader?: string | null) {
  const user = await isAuthenticated(authHeader || undefined);

  if (!user) {
    return { user: null, milestone: null, access: null };
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    select: {
      id: true,
      startupId: true,
    },
  });

  if (!milestone) {
    return { user, milestone: null, access: null };
  }

  const access = await canViewStartupMilestones(milestone.startupId, user);
  return { user, milestone, access };
}

// GET /api/milestones/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, milestone, access } = await getMilestoneWithAccess(
      params.id,
      request.headers.get('authorization')
    );

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (!access?.canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const serializedMilestone = (await listMilestones({ id: params.id }))[0];

    return NextResponse.json({
      milestone: serializedMilestone,
      permissions: {
        canRespond: user.role === UserRole.ENTREPRENEUR,
        canManage: access.canManage && user.role !== UserRole.ENTREPRENEUR,
      },
    });
  } catch (error) {
    console.error('Get milestone error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the milestone' }, { status: 500 });
  }
}

// PUT /api/milestones/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === UserRole.ENTREPRENEUR) {
      return NextResponse.json({ error: 'Entrepreneurs cannot edit milestones' }, { status: 403 });
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      select: { id: true, startupId: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const access = await canManageStartupMilestones(milestone.startupId, user);
    if (!access.canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedMilestone = await updateMilestoneRecord(params.id, body);

    return NextResponse.json({ milestone: updatedMilestone });
  } catch (error) {
    console.error('Update milestone error:', error);
    return NextResponse.json({ error: 'An error occurred while updating the milestone' }, { status: 500 });
  }
}

// DELETE /api/milestones/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === UserRole.ENTREPRENEUR) {
      return NextResponse.json({ error: 'Entrepreneurs cannot delete milestones' }, { status: 403 });
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      select: { id: true, startupId: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const access = await canManageStartupMilestones(milestone.startupId, user);
    if (!access.canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.milestone.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Delete milestone error:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the milestone' }, { status: 500 });
  }
}
