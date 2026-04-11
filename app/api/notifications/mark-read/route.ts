/**
 * POST /api/notifications/mark-read
 * 
 * Mark notifications as read for the current user.
 * Supports marking individual notifications or all unread notifications.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, all } = body;

    // Mark all notifications as read
    if (all === true) {
      const result = await prisma.notificationRecipient.updateMany({
        where: {
          userId: user.userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
        count: result.count,
      });
    }

    // Validate notificationIds
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'notificationIds array is required (or set all: true)' },
        { status: 400 }
      );
    }

    // Find recipient records for these notifications
    const recipientRecords = await prisma.notificationRecipient.findMany({
      where: {
        userId: user.userId,
        notificationId: {
          in: notificationIds,
        },
      },
    });

    if (recipientRecords.length === 0) {
      return NextResponse.json(
        { error: 'No notifications found for the provided IDs' },
        { status: 404 }
      );
    }

    // Mark notifications as read
    const result = await prisma.notificationRecipient.updateMany({
      where: {
        id: {
          in: recipientRecords.map(r => r.id),
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
      count: result.count,
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
