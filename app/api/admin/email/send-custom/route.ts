import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { EmailService } from '@/lib/services/email-service';

/**
 * POST /api/admin/email/send-custom
 * Send custom HTML email to users
 */
export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { userIds, role, subject, htmlBody, textBody, language = 'ar' } = body;

    // Validate required fields
    if (!subject || !htmlBody) {
      return NextResponse.json(
        { success: false, error: 'Subject and HTML body are required' },
        { status: 400 }
      );
    }

    // Build recipient query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recipientQuery: any = {};
    if (userIds && userIds.length > 0) {
      recipientQuery.id = { in: userIds };
    } else if (role) {
      recipientQuery.role = role;
    }

    // Get recipients
    const recipients = await prisma.user.findMany({
      where: recipientQuery,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients found' },
        { status: 400 }
      );
    }

    // Check SMTP configuration
    const smtpConfig = await EmailService.getSmtpConfig();
    if (!smtpConfig) {
      return NextResponse.json(
        { success: false, error: 'No active SMTP configuration found' },
        { status: 400 }
      );
    }

    // Send emails
    const results = await Promise.allSettled(
      recipients.map(async (user) => {
        // Replace variables in content
        const personalizedHtml = htmlBody
          .replace(/{{user\.name}}/g, user.name || '')
          .replace(/{{user\.email}}/g, user.email)
          .replace(/{{date}}/g, new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US'));

        const personalizedText = (textBody || '')
          .replace(/{{user\.name}}/g, user.name || '')
          .replace(/{{user\.email}}/g, user.email)
          .replace(/{{date}}/g, new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US'));

        // Determine text direction
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        const alignedHtml = `<div dir="${dir}">${personalizedHtml}</div>`;

        return EmailService.sendCustom({
          to: user.email,
          subject,
          htmlBody: alignedHtml,
          textBody: personalizedText || undefined,
        });
      })
    );

    // Count results
    const successful = results.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r) => r.status === 'fulfilled' && (r.value as any).success
    ).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      sentCount: successful,
      failedCount: failed,
      totalCount: recipients.length,
    });
  } catch (error) {
    console.error('Error sending custom email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
