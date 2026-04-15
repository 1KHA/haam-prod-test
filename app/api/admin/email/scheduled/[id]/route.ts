import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// GET - Get single scheduled email
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

    const campaign = await (prisma as any).scheduledEmail.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error fetching scheduled email:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled email' },
      { status: 500 }
    );
  }
}

// PUT - Update scheduled email
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
    const { name, subject, htmlBody, scheduledFor, status, recipientFilter } = body;

    const existing = await (prisma as any).scheduledEmail.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (htmlBody !== undefined) updateData.htmlBody = htmlBody;
    if (scheduledFor !== undefined) updateData.scheduledFor = new Date(scheduledFor);
    if (status !== undefined) updateData.status = status;
    if (recipientFilter !== undefined) updateData.recipientFilter = recipientFilter;

    const campaign = await (prisma as any).scheduledEmail.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error updating scheduled email:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled email' },
      { status: 500 }
    );
  }
}

// DELETE - Delete scheduled email
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

    const existing = await (prisma as any).scheduledEmail.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    await (prisma as any).scheduledEmail.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled email:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled email' },
      { status: 500 }
    );
  }
}
