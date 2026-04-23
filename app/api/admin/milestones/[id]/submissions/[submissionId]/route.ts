import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { MilestoneError, updateSubmissionRecord } from '@/lib/milestones';

export const dynamic = 'force-dynamic';
async function ensureAdminAccess(
  request: NextRequest,
  milestoneId: string,
  submissionId: string
) {
  const permissionCheck = await checkPermission(request, { category: 'startups', action: 'edit' });
  if (!permissionCheck.authorized) {
    throw new MilestoneError(permissionCheck.error || 'Forbidden', 403);
  }

  const submission = await prisma.milestoneSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      milestoneId: true,
    },
  });

  if (!submission || submission.milestoneId !== milestoneId) {
    throw new MilestoneError('Submission not found', 404);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; submissionId: string } }
) {
  try {
    await ensureAdminAccess(request, params.id, params.submissionId);

    const body = await request.json();
    const submission = await updateSubmissionRecord(params.submissionId, {
      message: typeof body.message === 'string' ? body.message : null,
    });

    return NextResponse.json({ submission });
  } catch (error) {
    if (error instanceof MilestoneError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Admin submission PUT error:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}
