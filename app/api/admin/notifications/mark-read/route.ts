import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
// POST handler to mark notifications as read
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - users can mark their own notifications as read
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'notifications',
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse the request body
    const data = await request.json();
    const { notificationIds, all = false } = data;

    // Validate input
    if (!all && (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0)) {
      return NextResponse.json(
        { error: 'Invalid input: notificationIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // In a real implementation, this would update the database
    // For demo purposes, we'll just return a success response
    
    const now = new Date();
    let updatedCount = 0;
    
    // If all=true, mark all notifications as read
    if (all) {
      // Update all notifications for this user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (prisma as any).notificationRecipient.updateMany({
        where: {
          userId: user.userId,
          isRead: false, // Only update unread notifications
        },
        data: {
          isRead: true,
          readAt: now,
        },
      });
      
      updatedCount = result.count;
      
      return NextResponse.json({ 
        success: true, 
        message: 'All notifications marked as read',
        updatedCount: updatedCount
      });
    } 
    // Otherwise, mark specific notifications as read
    else {
      // We need to make sure these notification IDs belong to the user
      // First, find valid recipient records
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recipientRecords = await (prisma as any).notificationRecipient.findMany({
        where: {
          userId: user.userId,
          notificationId: { in: notificationIds },
        },
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validRecipientIds = recipientRecords.map((record: any) => record.id);
      
      // Now update those specific recipient records
      if (validRecipientIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (prisma as any).notificationRecipient.updateMany({
          where: {
            id: { in: validRecipientIds },
            isRead: false, // Only update unread notifications
          },
          data: {
            isRead: true,
            readAt: now,
          },
        });
        
        updatedCount = result.count;
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Notifications marked as read',
        updatedIds: notificationIds,
        updatedCount: updatedCount
      });
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
