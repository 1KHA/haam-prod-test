import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// GET - Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const template = await (prisma as any).emailTemplate.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      template: { ...template, variables: Array.isArray(template.variables) ? template.variables : [] }
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
    } = body;

    const existing = await (prisma as any).emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Extract variables
    const extractVariables = (content: string): string[] => {
      const regex = /{{([^}]+)}}/g;
      const matches = content.match(regex) || [];
      return Array.from(new Set(matches.map((m: string) => m.slice(2, -2).trim())));
    };

    const arVars = htmlBody ? extractVariables(htmlBody) : [];
    const enVars = htmlBodyEn ? extractVariables(htmlBodyEn) : [];
    const allVars = Array.from(new Set(arVars.concat(enVars)));

    const template = await (prisma as any).emailTemplate.update({
      where: { id: params.id },
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

    return NextResponse.json({ 
      success: true, 
      template: { ...template, variables: Array.isArray(template.variables) ? template.variables : [] }
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'delete' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const existing = await (prisma as any).emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    await (prisma as any).emailTemplate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
