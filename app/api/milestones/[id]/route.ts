import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import { canManageCohortMilestones, canViewStartupMilestones, getMilestoneDetail, listStartupMilestones } from '@/lib/milestones';

export const dynamic = 'force-dynamic';
// GET /api/milestones/[id]?startupId=...
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const milestoneDetail = await getMilestoneDetail(params.id);
    if (!milestoneDetail) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.PROGRAM_MANAGER) {
      const permission = await canManageCohortMilestones(milestoneDetail.cohortId, user);
      if (!permission.canManage && user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({
        milestone: milestoneDetail,
        permissions: {
          canRespond: false,
          canManage: true,
        },
      });
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

    const startupMilestones = await listStartupMilestones(startupId);
    const milestone = startupMilestones.find((item) => item.id === params.id);

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found for this startup' }, { status: 404 });
    }

    return NextResponse.json({
      milestone,
      permissions: {
        canRespond: user.role === UserRole.ENTREPRENEUR,
        canManage: false,
      },
    });
  } catch (error) {
    console.error('Get milestone error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the milestone' }, { status: 500 });
  }
}

// PUT /api/milestones/[id]
export async function PUT() {
  return NextResponse.json({ error: 'Entrepreneurs cannot edit milestones' }, { status: 403 });
}

// DELETE /api/milestones/[id]
export async function DELETE() {
  return NextResponse.json({ error: 'Entrepreneurs cannot delete milestones' }, { status: 403 });
}
