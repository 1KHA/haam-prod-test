import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// POST /api/admin/reports/share - Share a report with users
export async function POST(req: NextRequest) {
  try {
    // Parse request for potential token
    const token = req.headers.get('x-token-param');
    let permissionCheck;
    
    if (token) {
      // If token is provided, use it for authorization
      req.headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Check permission
    permissionCheck = await checkPermission(req, { category: 'reports', action: 'edit' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Get userId for logging
    const userId = permissionCheck.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    const { reportId, userIds, message } = body;
    
    if (!reportId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. reportId and userIds array are required' },
        { status: 400 }
      );
    }
    
    // Verify report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        createdBy: {
          select: {
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

    // Verify users exist
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: 'One or more users not found' },
        { status: 404 }
      );
    }

    // Create share records for each user
    const shares = await Promise.all(
      users.map((user: { id: string, name: string, email: string }) => 
        prisma.reportShare.create({
          data: {
            reportId: reportId,
            sharedById: userId,
            sharedWithId: user.id,
            message: message || '',
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
            report: {
              select: {
                title: true,
                format: true,
                fileUrl: true,
              }
            }
          },
        })
      )
    );
    
    // Create notification for each user
    await Promise.all(
      users.map((user: { id: string, name: string, email: string }) =>
        prisma.notification.create({
          data: {
            createdById: userId,
            type: 'REPORT_SHARED',
            title: 'تقرير جديد مشارك معك',
            message: `تمت مشاركة التقرير "${report.title}" معك`,
          },
        })
      )
    );
    
    // Update share count on report
    await prisma.report.update({
      where: { id: reportId },
      data: {
        shareCount: { increment: users.length },
      },
    });

    return NextResponse.json({
      success: true,
      shares: shares,
      message: `Report shared with ${users.length} users successfully.`,
    });
  } catch (error) {
    console.error('Error sharing report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/reports/share - Get share history for a report
export async function GET(req: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(req.url);
    
    // Check permission - support both header and URL token
    const token = searchParams.get('token');
    let permissionCheck;
    
    if (token) {
      // If token is in URL, use it for authorization
      req.headers.set('Authorization', `Bearer ${token}`);
      permissionCheck = await checkPermission(req, { category: 'reports', action: 'view' });
    } else {
      // Otherwise use the regular header
      permissionCheck = await checkPermission(req, { category: 'reports', action: 'view' });
    }
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const reportId = searchParams.get('reportId');
    
    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      );
    }
    
    // Verify report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Get share history
    const shares = await prisma.reportShare.findMany({
      where: { reportId },
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
        report: {
          select: {
            title: true,
            format: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      shares,
      total: shares.length,
    });
  } catch (error) {
    console.error('Error fetching report shares:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
