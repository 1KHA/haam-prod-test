import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import {
  buildMilestoneStats,
  canManageCohortMilestones,
  createMilestoneRecord,
  listMilestoneCohorts,
  listMilestones,
} from '@/lib/milestones';
import { notifyMilestoneCreated } from '@/lib/services/notification-events';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email-service';

export const dynamic = 'force-dynamic';
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

    // Notify all entrepreneurs in the cohort about the new milestone
    console.log(`[PM Milestones API] Notifying entrepreneurs about new milestone...`);
    try {
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: {
          members: {
            include: {
              startup: {
                include: {
                  members: { select: { userId: true } },
                  creator: { select: { id: true } },
                },
              },
            },
          },
        },
      });

      console.log(`[PM Milestones API] Cohort: ${cohort?.name}, Members: ${cohort?.members?.length || 0}`);

      if (cohort) {
        const recipientIds = new Set<string>();
        
        for (const member of cohort.members) {
          console.log(`[PM Milestones API] Processing startup: ${member.startup?.name}, Creator: ${member.startup?.creator?.id}`);
          // Add startup creator (with fallback to creatorId if relation is null)
          if (member.startup?.creator) {
            recipientIds.add(member.startup.creator.id);
          } else if (member.startup?.creatorId) {
            recipientIds.add(member.startup.creatorId);
            console.log(`[PM Milestones API] Used startup.creatorId as fallback for ${member.startup.name}`);
          }
          // Add all team members
          for (const teamMember of member.startup?.members || []) {
            recipientIds.add(teamMember.userId);
          }
        }

        console.log(`[PM Milestones API] Total recipients: ${recipientIds.size}`);
        console.log(`[PM Milestones API] Recipient IDs: ${JSON.stringify(Array.from(recipientIds))}`);

        if (recipientIds.size > 0) {
          await notifyMilestoneCreated({
            milestoneId: milestone.id,
            title: milestone.title,
            description: milestone.description,
            dueDate: new Date(dueDate),
            priority,
            startupId: cohort.members[0]?.startupId || '',
            startupName: cohort.members[0]?.startup?.name || '',
            recipientIds: Array.from(recipientIds),
          });
          console.log(`[PM Milestones API] Milestone creation notification sent successfully`);
          await EmailService.fireScenario('milestone_created', Array.from(recipientIds), {
            milestone: { title: milestone.title, dueDate, priority },
            cohort: { name: cohort.name },
          });
        } else {
          console.log(`[PM Milestones API] No recipients found in cohort`);
        }
      } else {
        console.log(`[PM Milestones API] Cohort not found`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (notifyError: any) {
      console.error('[PM Milestones API] Failed to send milestone notification:', notifyError.message);
      console.error('[PM Milestones API] Stack:', notifyError.stack);
    }

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('Program manager milestones POST error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}
