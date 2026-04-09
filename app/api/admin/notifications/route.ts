import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET handler to fetch notifications
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - any user can view their own notifications
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'notifications',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const unreadOnly = searchParams.get('unread') === 'true';
    const typeFilter = searchParams.get('type');
    const priorityFilter = searchParams.get('priority');
    const search = searchParams.get('search') || '';
    
    // Determine if we need all notifications (admin) or just user's notifications
    const isAdmin = user.role === 'ADMIN' || await hasPermission(user.userId, {
      category: 'notifications',
      action: 'edit'
    });
    
    // Build the database query
    let whereClause: any = {};
    
    // Filter by recipient for non-admin users
    if (!isAdmin) {
      whereClause = {
        recipients: {
          some: {
            userId: user.userId,
          }
        }
      };
    }
    
    // Additional filters
    if (typeFilter) {
      whereClause.type = typeFilter;
    }
    
    if (priorityFilter) {
      whereClause.priority = priorityFilter;
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { message: { contains: search } }
      ];
    }
    
    // Count total notifications matching criteria
    const totalCount = await (prisma as any).notification.count({
      where: whereClause,
    });
    
    // Get notifications with pagination
    const notifications = await (prisma as any).notification.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        recipients: {
          where: isAdmin ? {} : { userId: user.userId },
          select: {
            id: true,
            userId: true,
            isRead: true,
            readAt: true,
            deliveredAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });
    
    // Transform the data for the response
    const formattedNotifications = notifications.map((notification: any) => {
      // For each notification, find the recipient record for this user
      const recipientRecord = notification.recipients.find((r: any) => 
        !isAdmin ? r.userId === user.userId : true
      );
      
      return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        status: notification.status,
        scheduledFor: notification.scheduledFor,
        createdAt: notification.createdAt.toISOString(),
        createdBy: notification.createdBy.name,
        isRead: recipientRecord ? recipientRecord.isRead : false,
        readAt: recipientRecord?.readAt ? recipientRecord.readAt.toISOString() : null,
        recipientId: recipientRecord?.id || null,
      };
    });
    
    // Calculate unread count for this user
    const unreadCount = await (prisma as any).notificationRecipient.count({
      where: {
        userId: user.userId,
        isRead: false,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      notifications: formattedNotifications,
      total: totalCount,
      unreadCount: unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
