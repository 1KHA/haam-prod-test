import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';
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
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const notifications = recipientRecords.map((r) => ({
      id: r.notification.id,
      recipientId: r.id,
      title: r.notification.title,
      message: r.notification.message,
      titleEn: r.notification.titleEn,
      messageEn: r.notification.messageEn,
      type: r.notification.type || 'info',
      priority: r.notification.priority,
      status: r.notification.status,
      actionUrl: r.notification.actionUrl,
      actionLabel: r.notification.actionLabel,
      actionLabelEn: r.notification.actionLabelEn,
      metadata: r.notification.metadata ? JSON.parse(r.notification.metadata) : null,
      isRead: r.isRead,
      readAt: r.readAt,
      createdAt: r.notification.createdAt,
      createdBy: r.notification.createdBy?.name || 'System',
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
