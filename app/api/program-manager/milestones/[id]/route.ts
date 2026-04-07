import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listMilestones, updateMilestoneRecord } from '@/lib/milestones';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const milestone = (await listMilestones({ id: params.id }))[0];

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
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

    const body = await request.json();
    const milestone = await updateMilestoneRecord(params.id, body);

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

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
      select: { id: true },
    });

    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
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
