import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import {
  MilestoneError,
  canViewStartupMilestones,
  createMilestoneSubmission,
  getMilestoneDetail,
  getSubmissionHistoryForMilestoneAndStartup,
} from '@/lib/milestones';
import { notifyMilestoneResponseSubmitted } from '@/lib/services/notification-events';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function ensureEntrepreneurStartupAccess(milestoneId: string, startupId: string, authHeader?: string | null) {
  const user = await isAuthenticated(authHeader || undefined);

  if (!user) {
    throw new MilestoneError('Unauthorized', 401);
  }

  if (user.role !== UserRole.ENTREPRENEUR) {
    throw new MilestoneError('Only entrepreneurs can access this endpoint', 403);
  }

  const milestone = await getMilestoneDetail(milestoneId);
  if (!milestone) {
    throw new MilestoneError('Milestone not found', 404);
  }

  const access = await canViewStartupMilestones(startupId, user);
  if (!access.canView) {
    throw new MilestoneError('Forbidden', 403);
  }

  if (access.cohort?.id !== milestone.cohortId) {
    throw new MilestoneError('This startup is not in the milestone cohort', 403);
  }

  return {
    user,
    milestone,
    startupName: access.startup?.name ?? '',
  };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    if (!startupId) {
      return NextResponse.json({ error: 'Missing startupId' }, { status: 400 });
    }

    const access = await ensureEntrepreneurStartupAccess(
      params.id,
      startupId,
      request.headers.get('authorization')
    );

    const submissions = await getSubmissionHistoryForMilestoneAndStartup(params.id, startupId);

    return NextResponse.json({
      submissions,
      canSubmit: submissions.length === 0 || submissions[0].status === 'REOPENED',
      milestone: {
        id: access.milestone.id,
        title: access.milestone.title,
      },
    });
  } catch (error) {
    if (error instanceof MilestoneError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Get milestone submissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestone submissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const startupId = formData.get('startupId') as string | null;

    if (!startupId) {
      return NextResponse.json({ error: 'Missing startupId' }, { status: 400 });
    }

    const { user, startupName } = await ensureEntrepreneurStartupAccess(
      params.id,
      startupId,
      request.headers.get('authorization')
    );

    const message = (formData.get('message') as string | null)?.trim() || '';
    const files = formData.getAll('files').filter((file): file is File => file instanceof File && file.size > 0);

    if (!message && files.length === 0) {
      return NextResponse.json({ error: 'A message or at least one file is required' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'milestone-submissions');
    await mkdir(uploadDir, { recursive: true });

    const attachments = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds maximum allowed size (10MB)` }, { status: 400 });
      }

      const uniqueFileName = `${randomUUID()}-${file.name}`;
      const filePath = join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      await writeFile(filePath, fileBuffer);

      attachments.push({
        fileName: file.name,
        fileUrl: `/uploads/milestone-submissions/${uniqueFileName}`,
        fileType: file.type,
        fileSize: file.size,
      });
    }

    const submission = await createMilestoneSubmission({
      milestoneId: params.id,
      startupId,
      submittedBy: user.userId,
      message,
      attachments,
    });

    // Notify the Program Manager about the new submission
    console.log(`[Milestone Submissions] Attempting to notify PM about submission...`);
    try {
      const milestone = await getMilestoneDetail(params.id);
      console.log(`[Milestone Submissions] Got milestone: ${milestone?.title}, cohortId: ${milestone?.cohortId}`);
      
      if (milestone) {
        // Get cohort with manager info
        const cohort = await prisma.cohort.findUnique({
          where: { id: milestone.cohortId },
          include: {
            manager: { select: { id: true } },
          },
        });

        console.log(`[Milestone Submissions] Got cohort: ${cohort?.name}, manager: ${cohort?.manager?.id}`);

        if (cohort?.manager) {
          console.log(`[Milestone Submissions] Sending notification to PM: ${cohort.manager.id}`);
          // Get the full user data for the submitter's name
          const submitter = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { name: true, email: true },
          });
          const submittedByName = submitter?.name || submitter?.email || user.email;

          await notifyMilestoneResponseSubmitted({
            milestoneId: params.id,
            milestoneTitle: milestone.title,
            startupId,
            startupName,
            submittedBy: user.userId,
            submittedByName,
            programManagerId: cohort.manager.id,
          });
          console.log(`[Milestone Submissions] Notification sent successfully`);
        } else {
          console.log(`[Milestone Submissions] No manager found for cohort, skipping notification`);
        }
      } else {
        console.log(`[Milestone Submissions] Milestone not found, skipping notification`);
      }
    } catch (notifyError: any) {
      console.error('[Milestone Submissions API] Failed to send notification:', notifyError.message);
      console.error('[Milestone Submissions API] Stack:', notifyError.stack);
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    if (error instanceof MilestoneError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Create milestone submission error:', error);
    return NextResponse.json({ error: 'Failed to submit milestone response' }, { status: 500 });
  }
}
