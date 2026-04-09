import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

// GET /api/notifications - Get notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const recipientRecords = await prisma.notificationRecipient.findMany({
      where: { userId: user.userId },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            message: true,
            type: true,
            priority: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const notifications = recipientRecords.map((r) => ({
      id: r.notification.id,
      title: r.notification.title,
      message: r.notification.message,
      type: r.notification.type || 'info',
      priority: r.notification.priority,
      read: r.isRead,
      readAt: r.readAt,
      createdAt: r.notification.createdAt,
    }));

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
