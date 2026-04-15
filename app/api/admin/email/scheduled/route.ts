import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

/**
 * GET /api/admin/email/scheduled
 * Get all scheduled emails
 */
export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const emails = await (prisma as any).scheduledEmail.findMany({
      where,
      orderBy: { scheduledFor: 'asc' },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ success: true, emails });
  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheduled emails' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email/scheduled
 * Create a new scheduled email
 */
export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { name, subject, htmlBody, scheduledFor, recipientFilter } = body;

    if (!name || !subject || !htmlBody || !scheduledFor) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Count total recipients based on filter
    let totalCount = 0;
    if (recipientFilter) {
      const where: any = {};
      if (recipientFilter.role) where.role = recipientFilter.role;
      if (recipientFilter.status) where.status = recipientFilter.status;
      totalCount = await prisma.user.count({ where });
    } else {
      totalCount = await prisma.user.count();
    }

    const scheduledEmail = await (prisma as any).scheduledEmail.create({
      data: {
        name,
        subject,
        htmlBody,
        scheduledFor: new Date(scheduledFor),
        status: 'scheduled',
        recipientFilter: recipientFilter ? JSON.stringify(recipientFilter) : null,
        totalCount,
        sentCount: 0,
        failedCount: 0,
        createdById: permissionCheck.userId,
      },
    });

    return NextResponse.json({ success: true, email: scheduledEmail });
  } catch (error) {
    console.error('Error creating scheduled email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create scheduled email' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/email/scheduled
 * Update a scheduled email status
 */
export async function PUT(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, name, subject, htmlBody, scheduledFor, recipientFilter } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Email ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (htmlBody) updateData.htmlBody = htmlBody;
    if (scheduledFor) updateData.scheduledFor = new Date(scheduledFor);
    if (recipientFilter) updateData.recipientFilter = recipientFilter;

    const email = await (prisma as any).scheduledEmail.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error('Error updating scheduled email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update scheduled email' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/email/scheduled
 * Delete a scheduled email
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
        { success: false, error: 'Email ID is required' },
        { status: 400 }
      );
    }

    await (prisma as any).scheduledEmail.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete scheduled email' },
      { status: 500 }
    );
  }
}
