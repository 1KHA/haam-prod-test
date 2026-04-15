import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { EmailService } from '@/lib/services/email-service';

/**
 * POST /api/admin/email/send
 * Send emails using a template to specific users
 */
export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { userIds, role, templateId, variables, language = 'ar' } = body;

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Get the template
    const template = await (prisma as any).emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Build recipient query
    let recipientQuery: any = {};
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

    // Send emails
    const results = await Promise.allSettled(
      recipients.map(async (user) => {
        const userVars = {
          user: {
            name: user.name,
            email: user.email,
          },
          ...variables,
        };

        return EmailService.sendTemplatedEmail({
          to: user.email,
          templateName: template.name,
          variables: userVars,
          userId: user.id,
        });
      })
    );

    // Count results
    const successful = results.filter(
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
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
