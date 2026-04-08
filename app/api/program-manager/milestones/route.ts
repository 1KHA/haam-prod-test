import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import {
  buildMilestoneStats,
  canManageCohortMilestones,
  createMilestoneRecord,
  listMilestoneCohorts,
  listMilestones,
} from '@/lib/milestones';

function matchesSearch(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cohorts = await listMilestoneCohorts(user.userId);
    const allowedCohortIds = cohorts.map((cohort) => cohort.id);

    const { searchParams } = new URL(request.url);
    const cohortId = searchParams.get('cohortId') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search')?.trim() || '';

    let milestones = await listMilestones(
      allowedCohortIds.length > 0
        ? {
            cohortId: {
              in: cohortId ? [cohortId] : allowedCohortIds,
            },
          }
        : {
            cohortId: '__no_cohort__',
          }
    );

    if (status) {
      milestones = milestones.filter((milestone) => milestone.status === status);
    }

    if (search) {
      milestones = milestones.filter((milestone) =>
        [
          milestone.title,
          milestone.description,
          milestone.cohortName,
          milestone.programName || '',
        ].some((value) => matchesSearch(value, search))
      );
    }

    return NextResponse.json({
      milestones,
      stats: buildMilestoneStats(milestones),
      cohorts,
    });
  } catch (error) {
    console.error('Program manager milestones GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cohortId, title, description, dueDate, priority, category } = body;

    if (!cohortId || !title || !description || !dueDate || !priority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const permission = await canManageCohortMilestones(cohortId, user);
    if (!permission.canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const milestone = await createMilestoneRecord({
      cohortId,
      title,
      description,
      dueDate,
      priority,
      category,
      createdBy: user.userId,
      progress: 0,
      status: 'upcoming',
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('Program manager milestones POST error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}
