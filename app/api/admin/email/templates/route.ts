import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { EmailService } from '@/lib/services/email-service';

/**
 * Extract variables from template content
 */
function extractVariables(content: string): string[] {
  const regex = /{{([^}]+)}}/g;
  const matches = content.match(regex) || [];
  return Array.from(new Set(matches.map((m) => m.slice(2, -2).trim())));
}

/**
 * GET /api/admin/email/templates
 * Get all email templates
 */
export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const scenarioType = searchParams.get('scenarioType');
    const category = searchParams.get('category');

    const where: any = {};
    if (scenarioType) where.scenarioType = scenarioType;
    if (category) where.category = category;

    const templates = await (prisma as any).emailTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    // Ensure variables is always an array
    const sanitizedTemplates = templates.map((t: any) => ({
      ...t,
      variables: Array.isArray(t.variables) ? t.variables : [],
    }));

    return NextResponse.json({ success: true, templates: sanitizedTemplates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email/templates
 * Create a new email template
 */
export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      subject,
      subjectEn,
      htmlBody,
      htmlBodyEn,
      scenarioType,
      category,
    } = body;

    const missing = [];
    if (!name) missing.push('name');
    if (!subject) missing.push('subject');
    if (!htmlBody) missing.push('htmlBody');
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Extract variables from templates
    const arVars = extractVariables(htmlBody);
    const enVars = htmlBodyEn ? extractVariables(htmlBodyEn) : [];
    const allVars = Array.from(new Set(arVars.concat(enVars)));

    const template = await (prisma as any).emailTemplate.create({
      data: {
        name,
        description,
        subject,
        subjectEn: subjectEn || subject,
        htmlBody,
        htmlBodyEn: htmlBodyEn || htmlBody,
        scenarioType: scenarioType || 'general',
        category: category || 'general',
        variables: JSON.stringify(allVars),
        isActive: true,
        createdById: permissionCheck.userId,
      },
    });

    EmailService.clearCache();
    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/email/templates
 * Update an email template
 */
export async function PUT(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      subject,
      subjectEn,
      htmlBody,
      htmlBodyEn,
      scenarioType,
      category,
      isActive,
    } = body;

    // Extract variables from templates
    const arVars = htmlBody ? extractVariables(htmlBody) : [];
    const enVars = htmlBodyEn ? extractVariables(htmlBodyEn) : [];
    const allVars = Array.from(new Set(arVars.concat(enVars)));

    const template = await (prisma as any).emailTemplate.update({
      where: { id },
      data: {
        name,
        description,
        subject,
        subjectEn,
        htmlBody,
        htmlBodyEn,
        scenarioType,
        category,
        variables: JSON.stringify(allVars),
        isActive,
      },
    });

    EmailService.clearCache();
    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/email/templates
 * Delete an email template
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'delete' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await (prisma as any).emailTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
