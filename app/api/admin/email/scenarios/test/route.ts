import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { EmailService } from '@/lib/services/email-service';

export async function POST(request: NextRequest) {
  const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
  if (!permissionCheck.authorized) {
    return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
  }

  const { scenarioType } = await request.json();
  if (!scenarioType) {
    return NextResponse.json({ error: 'scenarioType is required' }, { status: 400 });
  }

  if (!permissionCheck.userId) {
    return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
  }

  // Get admin's own email as the test recipient
  const admin = await prisma.user.findUnique({
    where: { id: permissionCheck.userId },
    select: { email: true, name: true },
  });
  if (!admin) {
    return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
  }

  // Fetch the scenario settings with its linked template
  const scenario = await (prisma as any).emailScenarioSettings.findUnique({
    where: { scenarioType },
    include: { template: { select: { name: true, subject: true, htmlBody: true } } },
  });

  if (!scenario?.template) {
    return NextResponse.json({ error: 'لا يوجد قالب مرتبط بهذا السيناريو' }, { status: 400 });
  }

  // Generic dummy variables covering all template use cases
  const testVariables = {
    user: { name: admin.name || 'مستخدم تجريبي', email: admin.email },
    startupName: 'شركة ناشئة تجريبية',
    cohortName: 'دفعة تجريبية 2024',
    programName: 'برنامج تجريبي',
    status: 'مقبول',
    tempPassword: 'TestPass123!',
    reason: 'سبب تجريبي',
    milestoneName: 'معلم تجريبي',
    eventName: 'فعالية تجريبية',
    meetingDate: new Date().toLocaleDateString('ar-SA'),
    documentName: 'مستند تجريبي',
    announcement: 'هذا إعلان تجريبي للنظام',
  };

  try {
    await EmailService.sendToUser({
      userId: permissionCheck.userId,
      templateName: scenario.template.name,
      variables: testVariables,
      scenarioType,
    });
    return NextResponse.json({ success: true, message: 'تم إرسال بريد الاختبار بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل إرسال البريد' }, { status: 500 });
  }
}
