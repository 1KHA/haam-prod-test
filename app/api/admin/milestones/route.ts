import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions';
import {
  buildMilestoneStats,
  createMilestoneRecord,
  listMilestoneCohorts,
  listMilestones,
} from '@/lib/milestones';

export const dynamic = 'force-dynamic';

function matchesSearch(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'startups', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const cohortId = searchParams.get('cohortId') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search')?.trim() || '';

    let milestones = await listMilestones(
      cohortId
        ? {
            cohortId,
          }
        : {}
    );
    const cohorts = await listMilestoneCohorts();

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
    console.error('Admin milestones GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'startups', action: 'add' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { cohortId, title, description, dueDate, priority, category } = body;

    if (!cohortId || !title || !description || !dueDate || !priority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const milestone = await createMilestoneRecord({
      cohortId,
      title,
      description,
      dueDate,
      priority,
      category,
      createdBy: permissionCheck.userId!,
      progress: 0,
      status: 'upcoming',
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('Admin milestones POST error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}
