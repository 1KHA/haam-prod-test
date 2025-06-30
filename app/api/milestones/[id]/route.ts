import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

// GET /api/milestones/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const milestone = await prisma.milestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Check if user is a member of the company
    const isMember = await prisma.companyMember.findFirst({
      where: {
        startupId: milestone.startupId,
        userId: user.userId,
        status: 'ACTIVE',
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ milestone });
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

    const { id } = params;
    const body = await request.json();

    const milestone = await prisma.milestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Only team leader can update milestones
    const member = await prisma.companyMember.findFirst({
      where: {
        startupId: milestone.startupId,
        userId: user.userId,
        status: 'ACTIVE',
      },
    });

    if (!member || member.role !== 'Leader') {
      return NextResponse.json({ error: 'Only the team leader can update milestones' }, { status: 403 });
    }

    const { title, description, dueDate, status, progress, priority, category } = body;

    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status }),
        ...(typeof progress === 'number' && { progress }),
        ...(priority && { priority }),
        ...(category && { category }),
      },
    });

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

    const { id } = params;

    const milestone = await prisma.milestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Only team leader can delete milestones
    const member = await prisma.companyMember.findFirst({
      where: {
        startupId: milestone.startupId,
        userId: user.userId,
        status: 'ACTIVE',
      },
    });

    if (!member || member.role !== 'Leader') {
      return NextResponse.json({ error: 'Only the team leader can delete milestones' }, { status: 403 });
    }

    await prisma.milestone.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Delete milestone error:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the milestone' }, { status: 500 });
  }
}
