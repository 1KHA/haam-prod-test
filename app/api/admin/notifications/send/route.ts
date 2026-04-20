import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification-service';

// POST handler to send notifications
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - only admins and program managers can send notifications
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'notifications',
      action: 'create'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse the request body
    const data = await request.json();
    const { 
      title,
      message,
      recipients,
      recipientType,
      priority = 'medium',
      sendEmail = false,
      sendPush = false
    } = data;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required fields' },
        { status: 400 }
      );
    }

    // Validate recipient information
    if (!recipientType && (!recipients || !Array.isArray(recipients) || recipients.length === 0)) {
      return NextResponse.json(
        { error: 'Either recipientType or specific recipients must be provided' },
        { status: 400 }
      );
    }

    // Get recipient user IDs based on recipientType or specific recipients
    let recipientUserIds: string[] = [];
    
    if (recipientType) {
      // Get users based on role
      let whereClause: any = {};
      
      switch (recipientType) {
        case 'all':
          // No filter, get all users
          break;
        case 'entrepreneurs':
          whereClause.role = 'ENTREPRENEUR';
          break;
        case 'mentors':
          whereClause.role = 'MENTOR';
          break;
        case 'investors':
          whereClause.role = 'INVESTOR';
          break;
        case 'program_managers':
          whereClause.role = 'PROGRAM_MANAGER';
          break;
        case 'participants':
          // PARTICIPANT role removed - treat as no-op or skip
          whereClause.role = 'ENTREPRENEUR'; // fallback
          break;
        case 'admins':
          whereClause.role = 'ADMIN';
          break;
        default:
          return NextResponse.json(
            { error: `Invalid recipientType: ${recipientType}` },
            { status: 400 }
          );
      }
      
      // Query users based on role filter
      const users = await prisma.user.findMany({
        where: whereClause,
        select: { id: true }
      });
      
      recipientUserIds = users.map(user => user.id);
    } else if (recipients && Array.isArray(recipients)) {
      // Use the provided recipient IDs
      // Validate that these users actually exist
      const users = await prisma.user.findMany({
        where: { id: { in: recipients } },
        select: { id: true }
      });
      
      recipientUserIds = users.map(user => user.id);
    }
    
    if (recipientUserIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipients found' },
        { status: 400 }
      );
    }
    
    // Determine if this is a scheduled notification
    const isScheduled = data.scheduledFor && new Date(data.scheduledFor) > new Date();
    
    // Create the notification in the database
    const notification = await (prisma as any).notification.create({
      data: {
        title,
        message,
        type: data.type || 'system',
        priority,
        status: isScheduled ? 'scheduled' : 'sent',
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        sendEmail,
        sendPush,
        createdById: user.userId,
        // Create recipients at the same time
        recipients: {
          create: recipientUserIds.map(userId => ({
            userId,
            isRead: false,
            deliveredAt: isScheduled ? null : new Date()
          }))
        }
      },
      include: {
        recipients: true
      }
    });
    
    // Broadcast real-time SSE push to connected recipients (skip scheduled)
    if (!isScheduled) {
      await NotificationService.broadcastToUsers(recipientUserIds, {
        type: 'new_notification',
        data: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          actionLabel: notification.actionLabel,
          actionLabelEn: notification.actionLabelEn,
          metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
          createdAt: notification.createdAt.toISOString(),
          isRead: false,
        },
      });
    }

    // If email sending is requested, queue emails
    if (sendEmail && !isScheduled) {
      // In a real implementation, we would queue email sending here
      // For example:
      // await emailQueue.add({
      //   recipientIds: recipientUserIds,
      //   subject: title,
      //   message: message,
      //   notificationId: notification.id
      // });
      console.log(`Would send email to ${recipientUserIds.length} recipients with subject "${title}"`);
    }
    
    // If push notification sending is requested, queue push notifications
    if (sendPush && !isScheduled) {
      // In a real implementation, we would queue push notification sending here
      // For example:
      // await pushQueue.add({
      //   recipientIds: recipientUserIds,
      //   title: title,
      //   body: message,
      //   notificationId: notification.id
      // });
      console.log(`Would send push notifications to ${recipientUserIds.length} recipients`);
    }
    
    return NextResponse.json({
      success: true,
      message: isScheduled ? 'Notification scheduled successfully' : 'Notifications sent successfully',
      details: {
        notificationId: notification.id,
        recipientCount: recipientUserIds.length,
        title,
        priority,
        sentAt: new Date().toISOString(),
        scheduledFor: isScheduled ? new Date(data.scheduledFor).toISOString() : null,
        deliveryChannels: {
          inApp: true,
          email: sendEmail,
          push: sendPush
        }
      }
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
