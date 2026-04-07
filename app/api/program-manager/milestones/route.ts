import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import {
  buildMilestoneStats,
  createMilestoneRecord,
  listMilestoneStartupOptions,
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

    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId') || undefined;
    const cohortId = searchParams.get('cohortId') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search')?.trim() || '';

    let milestones = await listMilestones(startupId ? { startupId } : {});
    const startups = await listMilestoneStartupOptions();

    if (cohortId) {
      milestones = milestones.filter((milestone) => milestone.cohortId === cohortId);
    }

    if (status) {
      milestones = milestones.filter((milestone) => milestone.status === status);
    }

    if (search) {
      milestones = milestones.filter((milestone) =>
        [
          milestone.title,
          milestone.description,
          milestone.startupName,
          milestone.cohortName || '',
        ].some((value) => matchesSearch(value, search))
      );
    }

    return NextResponse.json({
      milestones,
      stats: buildMilestoneStats(milestones),
      startups,
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
    const { startupId, title, description, dueDate, priority, category } = body;

    if (!startupId || !title || !description || !dueDate || !priority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const milestone = await createMilestoneRecord({
      startupId,
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
