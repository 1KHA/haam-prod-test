import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageCohortMilestones, getMilestoneDetail, updateMilestoneRecord } from '@/lib/milestones';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const milestone = await getMilestoneDetail(params.id);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const permission = await canManageCohortMilestones(milestone.cohortId, user);
    if (!permission.canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('Program manager milestone GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestone' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      select: { id: true, cohortId: true },
    });

    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const currentPermission = await canManageCohortMilestones(existingMilestone.cohortId, user);
    if (!currentPermission.canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (body.cohortId && body.cohortId !== existingMilestone.cohortId) {
      const targetPermission = await canManageCohortMilestones(body.cohortId, user);
      if (!targetPermission.canManage) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const milestone = await updateMilestoneRecord(params.id, body);
    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('Program manager milestone PUT error:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: params.id },
      select: { id: true, cohortId: true },
    });

    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const permission = await canManageCohortMilestones(existingMilestone.cohortId, user);
    if (!permission.canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.milestone.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Program manager milestone DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 });
  }
}
