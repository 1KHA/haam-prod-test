import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, hashPassword } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';
import { notifyFounderTeamMemberCreated, notifyNewUserRegistered } from '@/lib/services/notification-events';

export const dynamic = 'force-dynamic';
// POST /api/company/[id]/create-member
// Creates a new user account and associates them with the startup
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = params.id;
    const authHeader = request.headers.get('authorization');

    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the requester owns this startup
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { creatorId: true, name: true }
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    if (startup.creatorId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role = 'Member' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
    }

    // Check if email already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: 'ENTREPRENEUR' as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        approvalStatus: 'PENDING_APPROVAL' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    // Create basic profile
    await prisma.profile.create({
      data: { userId: newUser.id }
    });

    // Create entrepreneur profile
    await prisma.entrepreneurProfile.create({
      data: { userId: newUser.id, organizationName: name }
    });

    // Associate with the startup
    await prisma.companyMember.create({
      data: {
        startupId,
        userId: newUser.id,
        role,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: 'ACTIVE' as any,
        joinedAt: new Date()
      }
    });

    // Notify the founder that the member account was created and is pending approval
    try {
      await notifyFounderTeamMemberCreated({
        memberId: newUser.id,
        memberName: name,
        memberEmail: email,
        startupId,
        startupName: startup.name,
        founderId: user.userId,
      });
    } catch (notifyError) {
      console.error('[CreateMember] notifyFounderTeamMemberCreated failed:', notifyError);
    }

    // Send credentials email to the new member
    try {
      await EmailService.sendEmail({
        to: email,
        subject: `تم إنشاء حسابك في منصة HAAM`,
        subjectEn: `Your account has been created on HAAM Platform`,
        htmlBody: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>مرحباً ${name}،</h2>
            <p>تم إنشاء حساب لك في منصة HAAM للانضمام إلى فريق <strong>${startup.name}</strong>.</p>
            <p>بيانات الدخول الخاصة بك:</p>
            <ul>
              <li><strong>البريد الإلكتروني:</strong> ${email}</li>
              <li><strong>كلمة المرور:</strong> ${password}</li>
            </ul>
            <p style="color: #e53e3e;"><strong>تنبيه:</strong> حسابك بانتظار موافقة المشرف قبل تمكينك من تسجيل الدخول. ستتلقى إشعاراً عند الموافقة.</p>
            <p>يُرجى تغيير كلمة المرور فور تسجيل الدخول لأول مرة.</p>
            <hr/>
            <h3>Hello ${name},</h3>
            <p>An account has been created for you on HAAM Platform to join the <strong>${startup.name}</strong> team.</p>
            <p>Your login credentials:</p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Password:</strong> ${password}</li>
            </ul>
            <p style="color: #e53e3e;"><strong>Note:</strong> Your account is pending admin approval before you can log in. You will be notified once approved.</p>
            <p>Please change your password immediately after your first login.</p>
          </div>
        `,
        scenarioType: 'team_member_account_created',
      });
    } catch (emailError) {
      console.error('[CreateMember] Credentials email failed:', emailError);
    }

    // Fire scenario-based email (uses admin-configured template if available)
    try {
      await EmailService.fireScenario('team_member_account_created', [newUser.id], {
        member: { name, email },
        startup: { name: startup.name, id: startupId },
        credentials: { email, password },
      });
    } catch (scenarioError) {
      console.error('[CreateMember] fireScenario failed:', scenarioError);
    }

    // Notify admins about the new pending user
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      if (admins.length > 0) {
        await notifyNewUserRegistered({
          userId: newUser.id,
          userName: name,
          userEmail: email,
          userRole: 'ENTREPRENEUR',
          adminIds: admins.map(a => a.id),
        });
      }
    } catch (adminNotifyError) {
      console.error('[CreateMember] Admin notification failed:', adminNotifyError);
    }

    return NextResponse.json({ userId: newUser.id, name: newUser.name, email: newUser.email }, { status: 201 });
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
