import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { EmailService } from '@/lib/services/email-service';

export const dynamic = 'force-dynamic';
/**
 * POST /api/admin/email/smtp/test
 * Test SMTP connection and send a test email
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
    const { configId } = body;

    if (!configId) {
      return NextResponse.json(
        { success: false, error: 'Config ID is required' },
        { status: 400 }
      );
    }

    // Get SMTP config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = await (prisma as any).smtpConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'SMTP configuration not found' },
        { status: 404 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: permissionCheck.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Send test email to the configured fromEmail (real address), not the admin account email
    const testResult = await EmailService.testSpecificConfig(config, config.fromEmail || config.username);

    if (!testResult.success) {
      return NextResponse.json(
        { success: false, error: testResult.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP connection test successful. Test email sent.',
    });
  } catch (error) {
    console.error('Error testing SMTP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to test SMTP connection' 
      },
      { status: 500 }
    );
  }
}
