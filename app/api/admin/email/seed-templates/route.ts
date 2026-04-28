import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const TEAM_TEMPLATES = [
  {
    name: 'team_invitation_sent',
    description: 'Email sent to invitee when they are invited to join a startup team',
    subject: 'دعوة للانضمام إلى {{startup.name}}',
    subjectEn: 'Invitation to join {{startup.name}}',
    category: 'system',
    scenarioType: 'team_invitation_sent',
    variables: JSON.stringify(['inviter.name', 'invitee.email', 'startup.name', 'invitation.acceptLink', 'invitation.rejectLink', 'invitation.role']),
    htmlBody: `
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
  <h2 style="color: #1a202c;">دعوة للانضمام إلى فريق {{startup.name}}</h2>
  <p>مرحباً،</p>
  <p>لقد قام <strong>{{inviter.name}}</strong> بدعوتك للانضمام إلى فريق <strong>{{startup.name}}</strong> بصفة <strong>{{invitation.role}}</strong>.</p>
  <div style="margin: 24px 0; text-align: center;">
    <a href="{{invitation.acceptLink}}" style="background: #38a169; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-left: 12px; font-weight: bold;">قبول الدعوة</a>
    <a href="{{invitation.rejectLink}}" style="background: #e53e3e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">رفض الدعوة</a>
  </div>
  <p style="color: #718096; font-size: 14px;">إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد.</p>
</div>
`,
    htmlBodyEn: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
  <h2 style="color: #1a202c;">Invitation to join {{startup.name}}</h2>
  <p>Hello,</p>
  <p><strong>{{inviter.name}}</strong> has invited you to join the <strong>{{startup.name}}</strong> team as <strong>{{invitation.role}}</strong>.</p>
  <div style="margin: 24px 0; text-align: center;">
    <a href="{{invitation.acceptLink}}" style="background: #38a169; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-right: 12px; font-weight: bold;">Accept Invitation</a>
    <a href="{{invitation.rejectLink}}" style="background: #e53e3e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reject Invitation</a>
  </div>
  <p style="color: #718096; font-size: 14px;">If you were not expecting this invitation, you can safely ignore this email.</p>
</div>
`,
  },
  {
    name: 'team_member_account_created',
    description: 'Email sent to new team member with their login credentials',
    subject: 'تم إنشاء حسابك في منصة HAAM - {{startup.name}}',
    subjectEn: 'Your HAAM Platform account has been created - {{startup.name}}',
    category: 'system',
    scenarioType: 'team_member_account_created',
    variables: JSON.stringify(['member.name', 'member.email', 'startup.name', 'credentials.email', 'credentials.password']),
    htmlBody: `
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
  <h2 style="color: #1a202c;">مرحباً {{member.name}}،</h2>
  <p>تم إنشاء حساب لك في منصة HAAM للانضمام إلى فريق <strong>{{startup.name}}</strong>.</p>
  <div style="background: #edf2f7; padding: 16px; border-radius: 6px; margin: 16px 0;">
    <p style="margin: 0 0 8px;"><strong>بيانات الدخول:</strong></p>
    <p style="margin: 4px 0;">البريد الإلكتروني: <code>{{credentials.email}}</code></p>
    <p style="margin: 4px 0;">كلمة المرور: <code>{{credentials.password}}</code></p>
  </div>
  <p style="color: #e53e3e; font-weight: bold;">⚠️ حسابك بانتظار موافقة المشرف. ستتلقى إشعاراً عند الموافقة.</p>
  <p>يُرجى تغيير كلمة المرور فور تسجيل الدخول لأول مرة.</p>
</div>
`,
    htmlBodyEn: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
  <h2 style="color: #1a202c;">Hello {{member.name}},</h2>
  <p>An account has been created for you on HAAM Platform to join the <strong>{{startup.name}}</strong> team.</p>
  <div style="background: #edf2f7; padding: 16px; border-radius: 6px; margin: 16px 0;">
    <p style="margin: 0 0 8px;"><strong>Login Credentials:</strong></p>
    <p style="margin: 4px 0;">Email: <code>{{credentials.email}}</code></p>
    <p style="margin: 4px 0;">Password: <code>{{credentials.password}}</code></p>
  </div>
  <p style="color: #e53e3e; font-weight: bold;">⚠️ Your account is pending admin approval. You will be notified once approved.</p>
  <p>Please change your password immediately after your first login.</p>
</div>
`,
  },
  {
    name: 'team_invitation_accepted',
    description: 'Email sent to founder when an invitee accepts the team invitation',
    subject: 'قبل {{invitee.email}} دعوتك للانضمام إلى {{startup.name}}',
    subjectEn: '{{invitee.email}} accepted your invitation to join {{startup.name}}',
    category: 'system',
    scenarioType: 'team_invitation_accepted',
    variables: JSON.stringify(['invitee.email', 'startup.name']),
    htmlBody: `
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
  <h2 style="color: #38a169;">🎉 تم قبول الدعوة</h2>
  <p>قبل <strong>{{invitee.email}}</strong> دعوتك للانضمام إلى فريق <strong>{{startup.name}}</strong>.</p>
  <p>يمكنك الآن التواصل مع عضو الفريق الجديد من خلال لوحة التحكم.</p>
</div>
`,
    htmlBodyEn: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
  <h2 style="color: #38a169;">🎉 Invitation Accepted</h2>
  <p><strong>{{invitee.email}}</strong> has accepted your invitation to join the <strong>{{startup.name}}</strong> team.</p>
  <p>You can now connect with the new team member through your dashboard.</p>
</div>
`,
  },
  {
    name: 'team_invitation_rejected',
    description: 'Email sent to founder when an invitee rejects the team invitation',
    subject: 'رفض {{invitee.email}} دعوتك للانضمام إلى {{startup.name}}',
    subjectEn: '{{invitee.email}} declined your invitation to join {{startup.name}}',
    category: 'system',
    scenarioType: 'team_invitation_rejected',
    variables: JSON.stringify(['invitee.email', 'startup.name']),
    htmlBody: `
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
  <h2 style="color: #e53e3e;">رفض الدعوة</h2>
  <p>رفض <strong>{{invitee.email}}</strong> دعوتك للانضمام إلى فريق <strong>{{startup.name}}</strong>.</p>
  <p>يمكنك إرسال دعوة لشخص آخر من خلال صفحة الفريق.</p>
</div>
`,
    htmlBodyEn: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
  <h2 style="color: #e53e3e;">Invitation Declined</h2>
  <p><strong>{{invitee.email}}</strong> has declined your invitation to join the <strong>{{startup.name}}</strong> team.</p>
  <p>You can invite someone else from the team page.</p>
</div>
`,
  },
];

/**
 * POST /api/admin/email/seed-templates
 * Upserts the 4 team email templates and enables their scenario settings.
 * Safe to call multiple times (idempotent).
 */
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const results: { template: string; action: string }[] = [];

    for (const tpl of TEAM_TEMPLATES) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = await (prisma as any).emailTemplate.findUnique({
        where: { name: tpl.name },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let template: any;
      if (existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        template = await (prisma as any).emailTemplate.update({
          where: { name: tpl.name },
          data: {
            description: tpl.description,
            subject: tpl.subject,
            subjectEn: tpl.subjectEn,
            htmlBody: tpl.htmlBody,
            htmlBodyEn: tpl.htmlBodyEn,
            category: tpl.category,
            scenarioType: tpl.scenarioType,
            variables: tpl.variables,
            isActive: true,
          },
        });
        results.push({ template: tpl.name, action: 'updated' });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        template = await (prisma as any).emailTemplate.create({
          data: {
            name: tpl.name,
            description: tpl.description,
            subject: tpl.subject,
            subjectEn: tpl.subjectEn,
            htmlBody: tpl.htmlBody,
            htmlBodyEn: tpl.htmlBodyEn,
            category: tpl.category,
            scenarioType: tpl.scenarioType,
            variables: tpl.variables,
            isActive: true,
          },
        });
        results.push({ template: tpl.name, action: 'created' });
      }

      // Upsert the scenario settings and enable it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingScenario = await (prisma as any).emailScenarioSettings.findUnique({
        where: { scenarioType: tpl.scenarioType },
      });

      if (existingScenario) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).emailScenarioSettings.update({
          where: { scenarioType: tpl.scenarioType },
          data: { isEnabled: true, templateId: template.id },
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).emailScenarioSettings.create({
          data: {
            scenarioType: tpl.scenarioType,
            isEnabled: true,
            templateId: template.id,
            sendToRoles: JSON.stringify(['all']),
            delayMinutes: 0,
            digestMode: 'immediate',
            requireApproval: false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.length} team email templates`,
      results,
    });
  } catch (error) {
    console.error('[seed-templates] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed templates' }, { status: 500 });
  }
}

/**
 * GET /api/admin/email/seed-templates
 * Returns the list of team scenario templates and their current DB status.
 */
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const names = TEAM_TEMPLATES.map(t => t.name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).emailTemplate.findMany({
      where: { name: { in: names } },
      select: { name: true, isActive: true, scenarioType: true, updatedAt: true },
    });

    const existingMap = new Map(existing.map((e: { name: string }) => [e.name, e]));

    const status = TEAM_TEMPLATES.map(t => ({
      name: t.name,
      scenarioType: t.scenarioType,
      exists: existingMap.has(t.name),
      ...(existingMap.get(t.name) || {}),
    }));

    return NextResponse.json({ success: true, templates: status });
  } catch (error) {
    console.error('[seed-templates] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch template status' }, { status: 500 });
  }
}
