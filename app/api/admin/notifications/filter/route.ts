import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET handler to filter notifications
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'notifications',
      action: 'read'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const priority = url.searchParams.get('priority') || '';
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    const channel = url.searchParams.get('channel') || '';
    
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Build where clause
    const whereClause: any = {};
    
    // Text search (title or message)
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { message: { contains: search } }
      ];
    }
    
    // Filter by status
    if (status) {
      whereClause.status = status;
    }
    
    // Filter by type
    if (type) {
      whereClause.type = type;
    }
    
    // Filter by priority
    if (priority) {
      whereClause.priority = priority;
    }
    
    // Filter by date range
    if (dateFrom) {
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        gte: new Date(dateFrom)
      };
    }
    
    if (dateTo) {
      whereClause.createdAt = {
        ...(whereClause.createdAt || {}),
        lte: new Date(dateTo)
      };
    }
    
    // Filter by channel (email or push)
    if (channel === 'email') {
      whereClause.sendEmail = true;
    } else if (channel === 'push') {
      whereClause.sendPush = true;
    } else if (channel === 'app') {
      // App channel is always true for notifications
    }

    // Query notifications with filters
    const notifications = await (prisma as any).notification.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipients: {
          select: {
            id: true,
            userId: true,
            isRead: true,
            readAt: true,
            deliveredAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });
    
    // Count total notifications that match the filter
    const totalCount = await (prisma as any).notification.count({
      where: whereClause
    });
    
    // Calculate read stats
    const readStats = notifications.map((notification: any) => {
      const recipientCount = notification.recipients.length;
      const readCount = notification.recipients.filter((r: any) => r.isRead).length;
      
      return {
        id: notification.id,
        readCount,
        totalCount: recipientCount,
        readPercentage: recipientCount > 0 ? Math.round((readCount / recipientCount) * 100) : 0
      };
    });
    
    return NextResponse.json({
      success: true,
      notifications,
      readStats,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: offset + notifications.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error filtering notifications:', error);
    return NextResponse.json(
      { error: 'Failed to filter notifications' },
      { status: 500 }
    );
  }
}
