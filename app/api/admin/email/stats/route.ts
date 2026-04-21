import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

/**
 * GET /api/admin/email/stats
 * Get email statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get various stats
    const [
      totalEmails,
      sentEmails,
      failedEmails,
      pendingEmails,
      openedEmails,
      clickedEmails,
      todaySent,
      todayFailed,
    ] = await Promise.all([
      (prisma as any).emailLog.count(),
      (prisma as any).emailLog.count({ where: { status: 'sent' } }),
      (prisma as any).emailLog.count({ where: { status: 'failed' } }),
      (prisma as any).emailLog.count({ where: { status: 'pending' } }),
      (prisma as any).emailLog.count({ where: { openedAt: { not: null } } }),
      (prisma as any).emailLog.count({ where: { clickedAt: { not: null } } }),
      (prisma as any).emailLog.count({
        where: {
          status: 'sent',
          sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      (prisma as any).emailLog.count({
        where: {
          status: 'failed',
          sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    // Get daily stats — fetch sent and failed logs separately, group by date in JS
    const [sentLogs, failedLogs] = await Promise.all([
      (prisma as any).emailLog.findMany({
        where: { status: 'sent', sentAt: { gte: since } },
        select: { sentAt: true },
      }),
      (prisma as any).emailLog.findMany({
        where: { status: 'failed', sentAt: { gte: since } },
        select: { sentAt: true },
      }),
    ]);

    // Initialize dateMap with all dates in range
    const dateMap = new Map<string, { date: string; sent: number; failed: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { date: dateStr, sent: 0, failed: 0 });
    }

    // Tally sent logs
    for (const log of sentLogs) {
      if (log.sentAt) {
        const dateStr = new Date(log.sentAt).toISOString().split('T')[0];
        const entry = dateMap.get(dateStr);
        if (entry) entry.sent++;
      }
    }

    // Tally failed logs
    for (const log of failedLogs) {
      if (log.sentAt) {
        const dateStr = new Date(log.sentAt).toISOString().split('T')[0];
        const entry = dateMap.get(dateStr);
        if (entry) entry.failed++;
      }
    }

    const formattedDailyStats = Array.from(dateMap.values()).reverse();

    // Get template usage
    const templateUsage = await (prisma as any).emailLog.groupBy({
      by: ['templateId'],
      _count: { templateId: true },
      orderBy: { _count: { templateId: 'desc' } },
      take: 5,
    });

    // Get template names
    const templateIds = templateUsage.map((t: any) => t.templateId).filter(Boolean);
    const templates = templateIds.length > 0
      ? await (prisma as any).emailTemplate.findMany({
          where: { id: { in: templateIds } },
          select: { id: true, name: true },
        })
      : [];

    const templateMap = new Map(templates.map((t: any) => [t.id, t.name]));

    const formattedTemplateUsage = templateUsage.map((t: any) => ({
      templateId: t.templateId || 'none',
      templateName: t.templateId ? templateMap.get(t.templateId) || 'Unknown' : 'No Template',
      count: t._count.templateId,
    }));

    // Get top recipients
    const topRecipients = await (prisma as any).emailLog.groupBy({
      by: ['recipientEmail'],
      _count: { recipientEmail: true },
      orderBy: { _count: { recipientEmail: 'desc' } },
      take: 5,
    });

    const formattedTopRecipients = topRecipients.map((r: any) => ({
      email: r.recipientEmail,
      count: r._count.recipientEmail,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalEmails,
        sentEmails,
        failedEmails,
        pendingEmails,
        openedEmails,
        clickedEmails,
        todaySent,
        todayFailed,
        dailyStats: formattedDailyStats,
        templateUsage: formattedTemplateUsage,
        topRecipients: formattedTopRecipients,
      },
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email stats' },
      { status: 500 }
    );
  }
}
