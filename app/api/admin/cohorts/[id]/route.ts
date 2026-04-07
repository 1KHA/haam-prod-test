import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// GET /api/admin/cohorts/[id] - Get a specific cohort by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const cohort = await prisma.cohort.findUnique({
      where: { id },
      include: {
        program: { select: { id: true, name: true, type: true } },
        manager: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            startup: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        mentors: {
          include: {
            mentor: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { members: true, mentors: true }
        }
      }
    });

    if (!cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: cohort.id,
      name: cohort.name,
      description: cohort.description,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      status: cohort.status,
      capacity: cohort.capacity,
      program: cohort.program,
      manager: cohort.manager,
      members: cohort.members.map(m => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        startup: m.startup
      })),
      mentors: cohort.mentors.map(m => ({
        id: m.id,
        assignedAt: m.assignedAt,
        mentor: m.mentor
      })),
      stats: {
        membersCount: cohort._count.members,
        mentorsCount: cohort._count.mentors
      },
      createdAt: cohort.createdAt,
      updatedAt: cohort.updatedAt
    });
  } catch (error) {
    console.error('Error fetching cohort:', error);
    return NextResponse.json({ error: 'Failed to fetch cohort' }, { status: 500 });
  }
}

// PUT /api/admin/cohorts/[id] - Update a specific cohort
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const existingCohort = await prisma.cohort.findUnique({ where: { id } });
    if (!existingCohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, startDate, endDate, status, capacity, managerId } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (managerId !== undefined) updateData.managerId = managerId;

    const cohort = await prisma.cohort.update({
      where: { id },
      data: updateData,
      include: {
        program: { select: { id: true, name: true, type: true } },
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, mentors: true } }
      }
    });

    return NextResponse.json(cohort);
  } catch (error) {
    console.error('Error updating cohort:', error);
    return NextResponse.json({ error: 'Failed to update cohort' }, { status: 500 });
  }
}

// DELETE /api/admin/cohorts/[id] - Delete a specific cohort
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'delete' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const existingCohort = await prisma.cohort.findUnique({ where: { id } });
    if (!existingCohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    await prisma.cohort.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Cohort deleted successfully' });
  } catch (error) {
    console.error('Error deleting cohort:', error);
    return NextResponse.json({ error: 'Failed to delete cohort' }, { status: 500 });
  }
}
