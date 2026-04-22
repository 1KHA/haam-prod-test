import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { notifyApplicationStatusChanged, notifyCohortMemberAdded } from '@/lib/services/notification-events';
import { EmailService } from '@/lib/services/email-service';

// PUT /api/program-manager/applications/[id]
// Update application (CohortMember) status for a startup
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = params.id;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, cohortId, reviewers, notes } = await req.json();

    const payload = await isAuthenticated(req.headers.get('authorization') || undefined);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "PROGRAM_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if the startup exists
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        creator: { select: { id: true } },
        members: { select: { userId: true } },
        cohortMemberships: {
          where: cohortId ? { cohortId } : {},
          include: {
            cohort: {
              include: {
                program: { select: { id: true, name: true } },
                manager: { select: { id: true } },
              }
            }
          }
        }
      }
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    if (startup.cohortMemberships.length > 0) {
      // Update existing membership
      await prisma.cohortMember.update({
        where: { id: startup.cohortMemberships[0].id },
        data: { status }
      });
    } else if (cohortId) {
      // Create new membership if cohortId is provided
      await prisma.cohortMember.create({
        data: { cohortId, startupId, status }
      });
    }

    // Send notifications to entrepreneur on accept/reject
    try {
      const membership = startup.cohortMemberships[0];
      if (membership && ['ACTIVE', 'REJECTED'].includes(status)) {
        const entrepreneurIds = [
          startup.creator?.id,
          ...startup.members.map((m: { userId: string }) => m.userId),
        ].filter((id): id is string => !!id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (entrepreneurIds.length === 0 && (startup as any).creatorId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          entrepreneurIds.push((startup as any).creatorId);
        }
        const statusMap: Record<string, 'ACCEPTED' | 'REJECTED' | 'PENDING'> = {
          ACTIVE: 'ACCEPTED', REJECTED: 'REJECTED', PENDING: 'PENDING',
        };
        if (entrepreneurIds.length > 0) {
          await notifyApplicationStatusChanged({
            applicationId: membership.id,
            startupId,
            startupName: startup.name,
            cohortId: membership.cohortId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cohortName: (membership as any).cohort.name,
            oldStatus: membership.status,
            newStatus: statusMap[status] || 'PENDING',
            entrepreneurIds,
          });
          if (status === 'ACTIVE') {
            await notifyCohortMemberAdded({
              cohortId: membership.cohortId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cohortName: (membership as any).cohort.name,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              programId: (membership as any).cohort.program.id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              programName: (membership as any).cohort.program.name,
              startupId,
              startupName: startup.name,
              entrepreneurIds,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              programManagerId: (membership as any).cohort.manager?.id || payload.userId,
            });
          }
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (notifyError: any) {
      console.error('[Applications PUT] Failed to send notification:', notifyError.message);
    }

    // Fire application_status_changed email scenario if enabled
    if (['ACTIVE', 'REJECTED'].includes(status)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scenario = await (prisma as any).emailScenarioSettings.findUnique({
          where: { scenarioType: 'application_status_changed' },
          include: { template: { select: { name: true } } },
        });
        if (scenario?.isEnabled && scenario.template?.name) {
          const membership = startup.cohortMemberships[0];
          const recipientUsers = await prisma.user.findMany({
            where: {
              id: {
                in: [
                  startup.creator?.id,
                  ...startup.members.map((m: { userId: string }) => m.userId),
                ].filter((id): id is string => !!id),
              },
            },
            select: { id: true, email: true, name: true },
          });
          for (const recipient of recipientUsers) {
            await EmailService.sendToUser({
              userId: recipient.id,
              templateName: scenario.template.name,
              variables: {
                user: { name: recipient.name, email: recipient.email },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cohortName: (membership as any)?.cohort?.name || '',
                startupName: startup.name,
                status: status === 'ACTIVE' ? 'مقبول' : 'مرفوض',
              },
              scenarioType: 'application_status_changed',
            });
          }
        }
      } catch (emailError) {
        console.error('[Applications PUT] Failed to send application_status_changed email:', emailError);
      }
    }

    const updatedStartup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        creator: { select: { id: true, name: true, email: true, profile: true } },
        cohortMemberships: { include: { cohort: { include: { program: true } } } }
      }
    });

    return NextResponse.json(updatedStartup);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
