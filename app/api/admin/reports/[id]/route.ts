import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// GET /api/admin/reports/[id] - Get a single report by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'reports', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Fetch report by ID
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error(`Error fetching report ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/reports/[id] - Update a report
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'reports', action: 'edit' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Verify report exists
    const existingReport = await prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Update report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        format: body.format,
        status: body.status,
        publishDate: body.publishDate ? new Date(body.publishDate) : existingReport.publishDate,
        scheduledTime: body.scheduledTime,
        fileUrl: body.fileUrl,
        filePath: body.filePath,
        fileSize: body.fileSize,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error(`Error updating report ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reports/[id] - Delete a report
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'reports', action: 'delete' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Verify report exists
    const existingReport = await prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Delete report
    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting report ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
