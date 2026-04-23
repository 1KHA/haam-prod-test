import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import { buildMilestoneStats, canViewStartupMilestones, listStartupMilestones } from '@/lib/milestones';

export const dynamic = 'force-dynamic';
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

    const milestones = await listStartupMilestones(startupId);

    return NextResponse.json({
      milestones,
      stats: buildMilestoneStats(milestones),
      startup: {
        id: access.startup?.id ?? startupId,
        name: access.startup?.name ?? null,
        cohortId: access.cohort?.id ?? null,
        cohortName: access.cohort?.name ?? null,
      },
      permissions: {
        canRespond: user.role === UserRole.ENTREPRENEUR,
        canManage: false,
      },
    });
  } catch (error) {
    console.error('Get milestones error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching milestones' }, { status: 500 });
  }
}

// POST /api/milestones
export async function POST() {
  return NextResponse.json({ error: 'Entrepreneurs cannot create milestones' }, { status: 403 });
}
