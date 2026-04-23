import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import Handlebars from 'handlebars';

export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { variables, language = 'ar' } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const template = await (prisma as any).emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Render template
    const subject = Handlebars.compile(language === 'ar' ? template.subject : template.subjectEn)(variables || {});
    const htmlBody = Handlebars.compile(language === 'ar' ? template.htmlBody : template.htmlBodyEn)(variables || {});

    return NextResponse.json({
      success: true,
      preview: {
        subject,
        htmlBody,
      },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
