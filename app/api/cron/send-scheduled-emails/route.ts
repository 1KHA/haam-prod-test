import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email-service';

export const dynamic = 'force-dynamic';
/**
 * GET /api/cron/send-scheduled-emails
 * Processes due scheduled email campaigns.
 * Should be called by a cron job (e.g. Vercel Cron, external scheduler) every minute.
 * Protected by CRON_SECRET env variable.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized execution
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Find all campaigns due to send
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dueCampaigns = await (prisma as any).scheduledEmail.findMany({
    where: {
      status: 'scheduled',
      scheduledFor: { lte: now },
    },
  });

  if (dueCampaigns.length === 0) {
    return NextResponse.json({ success: true, processed: 0 });
  }

  let totalProcessed = 0;

  for (const campaign of dueCampaigns) {
    // Mark as sending to prevent duplicate execution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).scheduledEmail.update({
      where: { id: campaign.id },
      data: { status: 'sending' },
    });

    try {
      // Resolve recipients
      let recipientEmails: string[] = [];

      if (campaign.recipientList) {
        // Explicit list of emails
        const parsed = JSON.parse(campaign.recipientList);
        recipientEmails = Array.isArray(parsed) ? parsed : [];
      } else {
        // Filter-based recipients
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (campaign.recipientFilter) {
          const filter = JSON.parse(campaign.recipientFilter);
          if (filter.role) where.role = filter.role;
          if (filter.status) where.approvalStatus = filter.status;
        }
        const users = await prisma.user.findMany({
          where,
          select: { email: true },
        });
        recipientEmails = users.map((u) => u.email);
      }

      let sentCount = 0;
      let failedCount = 0;
      const errorLog: string[] = [];

      for (const email of recipientEmails) {
        try {
          await EmailService.sendEmail({
            to: email,
            subject: campaign.subject,
            htmlBody: campaign.htmlBody,
            scenarioType: 'campaign',
          });
          sentCount++;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          failedCount++;
          errorLog.push(`${email}: ${err.message}`);
        }

        // Small delay between sends to avoid overwhelming SMTP
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).scheduledEmail.update({
        where: { id: campaign.id },
        data: {
          status: 'completed',
          sentCount,
          failedCount,
          errorLog: errorLog.length > 0 ? JSON.stringify(errorLog) : null,
        },
      });

      totalProcessed++;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(`[Cron] Failed to process campaign ${campaign.id}:`, err.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).scheduledEmail.update({
        where: { id: campaign.id },
        data: {
          status: 'scheduled', // Reset so it can be retried
          errorLog: JSON.stringify([err.message]),
        },
      });
    }
  }

  return NextResponse.json({ success: true, processed: totalProcessed });
}
