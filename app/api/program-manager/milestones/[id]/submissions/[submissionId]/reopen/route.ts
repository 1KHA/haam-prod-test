import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {

export const dynamic = 'force-dynamic';  MilestoneError,
  canManageCohortMilestones,
  reopenSubmissionRecord,
} from '@/lib/milestones';

async function ensureManagerAccess(
  milestoneId: string,
  submissionId: string,
  authHeader?: string | null
) {
  const user = await isAuthenticated(authHeader || undefined);

  if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
    throw new MilestoneError('Unauthorized', 401);
  }

  const submission = await prisma.milestoneSubmission.findUnique({
    where: { id: submissionId },
    include: {
      milestone: {
        select: {
          id: true,
          cohortId: true,
        },
      },
    },
  });

  if (!submission || submission.milestoneId !== milestoneId) {
    throw new MilestoneError('Submission not found', 404);
  }

  const permission = await canManageCohortMilestones(submission.milestone.cohortId, user);
  if (!permission.canManage) {
    throw new MilestoneError('Forbidden', 403);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; submissionId: string } }
) {
  try {
    await ensureManagerAccess(
      params.id,
      params.submissionId,
      request.headers.get('authorization')
    );

    const submission = await reopenSubmissionRecord(params.submissionId);
    return NextResponse.json({ submission });
  } catch (error) {
    if (error instanceof MilestoneError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Program manager submission reopen error:', error);
    return NextResponse.json({ error: 'Failed to reopen submission' }, { status: 500 });
  }
}
