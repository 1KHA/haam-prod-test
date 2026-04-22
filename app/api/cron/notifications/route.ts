/**
 * Cron Job for Scheduled Notifications
 * 
 * Run every hour to check for:
 * - Milestones due in 7 days or 24 hours
 * - Overdue milestones
 * - Events starting in 24 hours or 1 hour
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/notifications",
 *       "schedule": "0 * * * *"
 *     }
 *   ]
 * }
 * 
 * Or call manually with Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyMilestoneDueSoon, notifyEventReminder } from '@/lib/services/notification-events';
import { EmailService } from '@/lib/services/email-service';

// Run every hour
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      milestoneReminders: 0,
      overdueMilestones: 0,
      eventReminders: 0,
      weeklyDigestSent: 0,
      errors: [] as string[],
    };

    // 1. Check for milestones due in 7 days or 24 hours
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingMilestones = await prisma.milestone.findMany({
      where: {
        status: { not: 'completed' },
        dueDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        cohort: {
          include: {
            members: {
              where: { status: 'ACTIVE' },
              include: {
                startup: {
                  include: {
                    creator: { select: { id: true } },
                    members: { select: { userId: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const milestone of upcomingMilestones) {
      try {
        const daysUntil = Math.ceil(
          (new Date(milestone.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send at 7 days or 1 day
        if (daysUntil !== 7 && daysUntil !== 1) continue;

        // Check if notification already sent in the last 24 hours
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentNotification = await (prisma as any).notification.findFirst({
          where: {
            type: 'milestone_reminder',
            metadata: {
              contains: `"milestoneId":"${milestone.id}","daysUntil":${daysUntil}`,
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            },
          },
        });

        if (recentNotification) continue;

        // Get all entrepreneurs in the cohort
        const recipientIds = new Set<string>();
        for (const member of milestone.cohort.members) {
          if (member.startup.creator) recipientIds.add(member.startup.creator.id);
          for (const teamMember of member.startup.members) {
            recipientIds.add(teamMember.userId);
          }
        }

        if (recipientIds.size > 0) {
          await notifyMilestoneDueSoon({
            milestoneId: milestone.id,
            title: milestone.title,
            startupId: milestone.cohort.members[0]?.startupId || '',
            daysUntil,
            recipientIds: Array.from(recipientIds),
          });
          await EmailService.fireScenario('milestone_due', Array.from(recipientIds), {
            milestone: { title: milestone.title, dueDate: milestone.dueDate },
            daysUntil,
          });
          results.milestoneReminders++;
        }
      } catch (error) {
        const errorMsg = `Error processing milestone ${milestone.id}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // 2. Check for overdue milestones
    const overdueMilestones = await prisma.milestone.findMany({
      where: {
        status: { not: 'completed' },
        dueDate: {
          lt: now,
        },
      },
      include: {
        cohort: {
          include: {
            members: {
              where: { status: 'ACTIVE' },
              include: {
                startup: {
                  include: {
                    creator: { select: { id: true } },
                    members: { select: { userId: true } },
                  },
                },
              },
            },
            manager: { select: { id: true } },
          },
        },
      },
    });

    for (const milestone of overdueMilestones) {
      try {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(milestone.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send once per day for overdue milestones
        // Check if we already sent a notification today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentNotification = await (prisma as any).notification.findFirst({
          where: {
            type: 'milestone_reminder',
            metadata: {
              contains: `"milestoneId":"${milestone.id}","isOverdue":true`,
            },
            createdAt: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        });

        if (recentNotification) continue;

        // Get all entrepreneurs in the cohort
        const recipientIds = new Set<string>();
        for (const member of milestone.cohort.members) {
          if (member.startup.creator) recipientIds.add(member.startup.creator.id);
          for (const teamMember of member.startup.members) {
            recipientIds.add(teamMember.userId);
          }
        }
        // Also notify the PM
        if (milestone.cohort.manager) {
          recipientIds.add(milestone.cohort.manager.id);
        }

        if (recipientIds.size > 0) {
          await notifyMilestoneDueSoon({
            milestoneId: milestone.id,
            title: milestone.title,
            startupId: milestone.cohort.members[0]?.startupId || '',
            daysUntil: -daysOverdue, // Negative to indicate overdue
            recipientIds: Array.from(recipientIds),
          });
          await EmailService.fireScenario('milestone_due', Array.from(recipientIds), {
            milestone: { title: milestone.title, dueDate: milestone.dueDate },
            daysOverdue,
            overdue: true,
          });
          results.overdueMilestones++;
        }
      } catch (error) {
        const errorMsg = `Error processing overdue milestone ${milestone.id}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // 3. Check for upcoming events (24 hours and 1 hour)
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const oneHourMs = 60 * 60 * 1000;

    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: 'published',
        startDate: {
          gte: now,
          lte: new Date(now.getTime() + twentyFourHoursMs + oneHourMs),
        },
      },
      include: {
        registrations: {
          include: {
            user: { select: { id: true } },
          },
        },
      },
    });

    for (const event of upcomingEvents) {
      try {
        const timeUntil = new Date(event.startDate).getTime() - now.getTime();
        const hoursUntil = Math.floor(timeUntil / oneHourMs);

        // Only send at 24 hours or 1 hour
        if (hoursUntil !== 24 && hoursUntil !== 1) continue;

        // Check if notification already sent for this time window
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentNotification = await (prisma as any).notification.findFirst({
          where: {
            type: 'event_reminder',
            metadata: {
              contains: `"eventId":"${event.id}","hoursBefore":${hoursUntil}`,
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            },
          },
        });

        if (recentNotification) continue;

        // Get registered users
        const recipientIds = event.registrations
          .filter(r => r.status === 'confirmed' || r.status === 'pending')
          .map(r => r.user.id);

        if (recipientIds.length > 0) {
          await notifyEventReminder({
            eventId: event.id,
            eventName: event.title,
            eventDate: event.startDate,
            hoursBefore: hoursUntil,
            recipientIds,
          });
          await EmailService.fireScenario('event_reminder', recipientIds, {
            event: { name: event.title, date: event.startDate },
            hoursBefore: hoursUntil,
          });
          results.eventReminders++;
        }
      } catch (error) {
        const errorMsg = `Error processing event ${event.id}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // 4. Weekly digest — runs only on Mondays (getDay() === 1)
    try {
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 1) {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [newUsers, newStartups, completedMilestones, upcomingEventsCount] = await Promise.all([
          prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
          prisma.startup.count({ where: { createdAt: { gte: oneWeekAgo } } }),
          prisma.milestone.count({ where: { status: 'completed', updatedAt: { gte: oneWeekAgo } } }),
          prisma.event.count({ where: { startDate: { gte: now }, status: 'published' } }),
        ]);

        const digestRecipients = await prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'PROGRAM_MANAGER'] }, approvalStatus: 'ACTIVE' },
          select: { id: true },
        });

        if (digestRecipients.length > 0) {
          await EmailService.fireScenario('weekly_digest', digestRecipients.map(r => r.id), {
            week: {
              start: oneWeekAgo.toISOString().split('T')[0],
              end: now.toISOString().split('T')[0],
            },
            stats: { newUsers, newStartups, completedMilestones, upcomingEventsCount },
          });
          results.weeklyDigestSent = digestRecipients.length;
        }
      }
    } catch (error) {
      const errorMsg = `Error sending weekly digest: ${error}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
