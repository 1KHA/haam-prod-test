/**
 * POST /api/program-manager/milestones/[id]/review
 * 
 * Review a milestone submission (approve, reject, or request revision)
 * Notifies the entrepreneur about the review result
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { notifyMilestoneResponseReviewed } from '@/lib/services/notification-events';
import { EmailService } from '@/lib/services/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is a program manager
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json(
        { error: 'Unauthorized. Only program managers can review milestones.' },
        { status: 401 }
      );
    }

    const { id: milestoneId } = params;
    
    // Get request body
    const body = await request.json();
    const { submissionId, status, feedback } = body;
    
    // Validate required fields
    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionId and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status
    if (!['approved', 'rejected', 'needs_revision'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Status must be one of: approved, rejected, needs_revision' },
        { status: 400 }
      );
    }
    
    // Get the submission with milestone and startup details
    const submission = await prisma.milestoneSubmission.findFirst({
      where: { 
        id: submissionId,
      },
      include: {
        milestone: {
          include: {
            cohort: {
              select: {
                id: true,
                managerId: true,
              },
            },
          },
        },
        startup: {
          include: {
            creator: { select: { id: true, name: true } },
            members: { select: { userId: true } },
            cohortMemberships: {
              where: { status: 'ACTIVE' },
              select: { cohortId: true },
            },
          },
        },
        submitter: { select: { id: true, name: true } },
      },
    });
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    // Verify the PM manages the cohort for this milestone
    if (submission.milestone.cohort.managerId !== user.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to review this submission' },
        { status: 403 }
      );
    }
    
    console.log(`[Milestone Review] Processing review with status: ${status}`);
    
    // Map review status to submission status
    // The MilestoneSubmission model only accepts: SUBMITTED, REOPENED, SUPERSEDED
    const statusMap: Record<string, string> = {
      'approved': 'SUPERSEDED',     // Approved means this submission is complete/succeeded
      'rejected': 'REOPENED',       // Rejected means the startup needs to resubmit
      'needs_revision': 'REOPENED', // Needs revision also means resubmit
    };
    
    const submissionStatus = statusMap[status] || 'SUBMITTED';
    console.log(`[Milestone Review] Mapped to submission status: ${submissionStatus}`);
    
    // Update the submission status
    const updatedSubmission = await prisma.milestoneSubmission.update({
      where: { id: submissionId },
      data: {
        status: submissionStatus,
      },
    });
    console.log(`[Milestone Review] Updated submission status`);
    
    // Update milestone progress if approved
    if (status === 'approved') {
      console.log(`[Milestone Review] Approving milestone ${milestoneId}`);
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: 'completed',
          progress: 100,
        },
      });
    }
    
    // Notify the entrepreneur about the review
    console.log(`[Milestone Review] Preparing to notify entrepreneurs...`);
    try {
      const entrepreneurIds = [
        submission.startup.creator?.id,
        ...submission.startup.members.map(m => m.userId),
      ].filter((id): id is string => !!id);

      if (entrepreneurIds.length === 0 && submission.startup.creatorId) {
        entrepreneurIds.push(submission.startup.creatorId);
        console.log(`[Milestone Review] Used startup.creatorId as fallback entrepreneur ID`);
      }

      console.log(`[Milestone Review] Found ${entrepreneurIds.length} entrepreneurs to notify`);
      console.log(`[Milestone Review] Entrepreneur IDs: ${JSON.stringify(entrepreneurIds)}`);

      // Get the full user data for the reviewer's name
      const reviewer = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { name: true },
      });
      const reviewedByName = reviewer?.name || 'Program Manager';
      console.log(`[Milestone Review] Reviewer name: ${reviewedByName}`);

      if (entrepreneurIds.length > 0) {
        console.log(`[Milestone Review] Calling notifyMilestoneResponseReviewed...`);
        await notifyMilestoneResponseReviewed({
          milestoneId,
          milestoneTitle: submission.milestone.title,
          startupId: submission.startupId,
          startupName: submission.startup.name,
          status: status as 'approved' | 'rejected' | 'needs_revision',
          feedback,
          reviewedByName,
          entrepreneurIds,
        });
        console.log(`[Milestone Review] Notification sent successfully`);
        const scenarioType = status === 'approved' ? 'milestone_completed' : 'milestone_due';
        await EmailService.fireScenario(scenarioType, entrepreneurIds, {
          milestone: { title: submission.milestone.title },
          startup: { name: submission.startup.name },
          status,
          feedback,
          reviewedBy: reviewedByName,
        });
        if (status === 'approved') {
          await EmailService.fireScenario('document_approved', entrepreneurIds, {
            milestone: { title: submission.milestone.title },
            startup: { name: submission.startup.name },
            feedback,
            reviewedBy: reviewedByName,
          });
        }
      } else {
        console.log(`[Milestone Review] No entrepreneurs found to notify`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (notifyError: any) {
      console.error('[Milestone Review API] Failed to send notification:', notifyError.message);
      console.error('[Milestone Review API] Stack:', notifyError.stack);
    }
    
    return NextResponse.json({
      success: true,
      message: `Submission ${status} successfully`,
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error('Error reviewing milestone submission:', error);
    return NextResponse.json(
      { error: 'Failed to review milestone submission' },
      { status: 500 }
    );
  }
}
