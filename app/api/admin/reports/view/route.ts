import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
// GET /api/admin/reports/view - View a report and increment view count
export async function GET(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'reports', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Get userId for logging
    const userId = permissionCheck.userId;

    // Parse query params
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('id');
    const skipViewIncrement = searchParams.get('skipViewIncrement') === 'true';
    
    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Fetch report by ID
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shares: {
          take: 5,  // Get the 5 most recent shares
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sharedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            sharedWith: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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

    // Increment view count if not skipped
    if (!skipViewIncrement) {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          viewCount: { increment: 1 },
        },
      });
    }

    // Calculate share count
    const shareCount = await prisma.reportShare.count({
      where: { reportId },
    });

    // Get total shares for this user
    const userShareCount = userId 
      ? await prisma.reportShare.count({
          where: {
            reportId,
            sharedWithId: userId,
          },
        })
      : 0;

    // Format the response
    const formattedReport = {
      ...report,
      shareCount: shareCount || report.shareCount || 0,
      // Add indicator if the report was shared with the current user
      sharedWithCurrentUser: userShareCount > 0,
      // Format dates in ISO format for consistent frontend handling
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      publishDate: report.publishDate ? report.publishDate.toISOString() : null,
    };

    return NextResponse.json({
      report: formattedReport,
      success: true,
    });
  } catch (error) {
    console.error('Error viewing report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
