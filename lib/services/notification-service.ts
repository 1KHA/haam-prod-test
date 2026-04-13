/**
 * Notification Service Layer
 * 
 * Core service for creating, broadcasting, and managing notifications.
 * Supports real-time delivery via SSE, bilingual content (AR/EN), and action buttons.
 */

import { prisma } from '@/lib/prisma';

// Global SSE connections store
// Map of userId -> array of controller functions
const sseConnections = new Map<string, Array<(data: string) => void>>();

// Pending notifications for users who are not currently connected
// Map of userId -> array of pending notification payloads
const pendingNotifications = new Map<string, Array<{ type: string; data: unknown }>>();

export type NotificationType = 
  | 'system' 
  | 'application' 
  | 'milestone' 
  | 'reminder' 
  | 'security'
  | 'event'
  | 'team'
  | 'funding'
  | 'mentorship';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface CreateNotificationParams {
  title: string;
  message: string;
  titleEn?: string;
  messageEn?: string;
  type: NotificationType;
  priority?: NotificationPriority;
  recipientIds: string[];
  createdBy?: string;
  actionUrl?: string;
  actionLabel?: string;
  actionLabelEn?: string;
  metadata?: Record<string, unknown>;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export interface NotificationWithRecipients {
  id: string;
  title: string;
  message: string;
  titleEn: string | null;
  messageEn: string | null;
  type: string | null;
  priority: string;
  actionUrl: string | null;
  actionLabel: string | null;
  actionLabelEn: string | null;
  metadata: string | null;
  createdAt: Date;
  createdById: string;
  recipients: {
    id: string;
    userId: string;
    isRead: boolean;
    readAt: Date | null;
    deliveredAt: Date | null;
  }[];
}

export class NotificationService {
  /**
   * Create and send notification to multiple recipients
   */
  static async createNotification(
    params: CreateNotificationParams
  ): Promise<NotificationWithRecipients> {
    const {
      title,
      message,
      titleEn,
      messageEn,
      type,
      priority = 'medium',
      recipientIds,
      createdBy,
      actionUrl,
      actionLabel,
      actionLabelEn,
      metadata,
      sendEmail = false,
      sendPush = false,
    } = params;

    // Remove duplicates from recipientIds
    const uniqueRecipientIds = [...new Set(recipientIds)];

    // Create notification with recipients in a transaction
    const notification = await prisma.$transaction(async (tx) => {
      const created = await (tx as any).notification.create({
        data: {
          title,
          message,
          titleEn,
          messageEn,
          type,
          priority,
          sendEmail,
          sendPush,
          actionUrl,
          actionLabel,
          actionLabelEn,
          metadata: metadata ? JSON.stringify(metadata) : null,
          createdById: createdBy || 'system',
          recipients: {
            create: uniqueRecipientIds.map((userId) => ({
              userId,
              deliveredAt: new Date(),
            })),
          },
        },
        include: {
          recipients: true,
        },
      });

      return created;
    });

    // Broadcast to connected clients via SSE
    await this.broadcastToUsers(uniqueRecipientIds, {
      type: 'new_notification',
      data: this.formatNotification(notification),
    });

    // TODO: Send email if enabled
    if (sendEmail) {
      // await this.sendEmailNotifications(notification, uniqueRecipientIds);
    }

    // TODO: Send push if enabled
    if (sendPush) {
      // await this.sendPushNotifications(notification, uniqueRecipientIds);
    }

    return notification;
  }

  /**
   * Register an SSE connection for a user
   * Also delivers any pending notifications that were queued while user was offline
   */
  static registerConnection(userId: string, controller: (data: string) => void): () => void {
    if (!sseConnections.has(userId)) {
      sseConnections.set(userId, []);
    }
    
    const connections = sseConnections.get(userId)!;
    connections.push(controller);

    // Deliver any pending notifications immediately
    const pending = pendingNotifications.get(userId);
    if (pending && pending.length > 0) {
      console.log(`[NotificationService] Delivering ${pending.length} pending notifications to user ${userId}`);
      for (const payload of pending) {
        try {
          const dataString = `event: ${payload.type}
data: ${JSON.stringify(payload.data)}

`;
          controller(dataString);
        } catch (error) {
          console.error(`[NotificationService] Error sending pending notification to user ${userId}:`, error);
        }
      }
      // Clear pending notifications after delivery
      pendingNotifications.delete(userId);
    }

    console.log(`[NotificationService] Registered SSE connection for user ${userId}, total connections: ${connections.length}`);

    // Return cleanup function
    return () => {
      const idx = connections.indexOf(controller);
      if (idx > -1) {
        connections.splice(idx, 1);
      }
      if (connections.length === 0) {
        sseConnections.delete(userId);
        console.log(`[NotificationService] Removed last SSE connection for user ${userId}`);
      } else {
        console.log(`[NotificationService] Removed SSE connection for user ${userId}, remaining: ${connections.length}`);
      }
    };
  }

  /**
   * Broadcast to specific users via SSE
   * If user is not connected, notification is queued for later delivery
   */
  private static async broadcastToUsers(
    userIds: string[],
    payload: { type: string; data: unknown }
  ): Promise<void> {
    const dataString = `event: ${payload.type}\ndata: ${JSON.stringify(payload.data)}\n\n`;

    for (const userId of userIds) {
      const connections = sseConnections.get(userId);
      if (connections && connections.length > 0) {
        // User is online - send immediately
        let deliveredCount = 0;
        connections.forEach((controller) => {
          try {
            controller(dataString);
            deliveredCount++;
          } catch (error) {
            console.error(`[NotificationService] Error broadcasting to user ${userId}:`, error);
          }
        });
        console.log(`[NotificationService] Delivered ${payload.type} to user ${userId} (${deliveredCount} connections)`);
      } else {
        // User is offline - queue for later delivery
        console.log(`[NotificationService] User ${userId} offline, queuing ${payload.type} notification`);
        if (!pendingNotifications.has(userId)) {
          pendingNotifications.set(userId, []);
        }
        pendingNotifications.get(userId)!.push(payload);
        
        // Limit pending queue to prevent memory issues (keep last 50)
        const queue = pendingNotifications.get(userId)!;
        if (queue.length > 50) {
          queue.splice(0, queue.length - 50);
        }
      }
    }
  }

  /**
   * Mark a notification as read for a specific user
   */
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const recipient = await (prisma as any).notificationRecipient.findFirst({
        where: {
          notificationId,
          userId,
        },
      });

      if (!recipient) {
        return false;
      }

      await (prisma as any).notificationRecipient.update({
        where: { id: recipient.id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('[NotificationService] Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await (prisma as any).notificationRecipient.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      console.error('[NotificationService] Error marking all notifications as read:', error);
      return 0;
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await (prisma as any).notificationRecipient.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error('[NotificationService] Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Get paginated notifications for a user
   */
  static async getNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      onlyUnread?: boolean;
    } = {}
  ): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    const { limit = 50, offset = 0, onlyUnread = false } = options;

    try {
      const whereClause: any = {
        userId,
      };

      if (onlyUnread) {
        whereClause.isRead = false;
      }

      // Get total count
      const total = await (prisma as any).notificationRecipient.count({
        where: whereClause,
      });

      // Get unread count
      const unreadCount = await (prisma as any).notificationRecipient.count({
        where: {
          userId,
          isRead: false,
        },
      });

      // Get notifications
      const recipients = await (prisma as any).notificationRecipient.findMany({
        where: whereClause,
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
        orderBy: {
          notification: {
            createdAt: 'desc',
          },
        },
        take: limit,
        skip: offset,
      });

      const notifications = recipients.map((r: any) => ({
        id: r.notification.id,
        recipientId: r.id,
        title: r.notification.title,
        message: r.notification.message,
        titleEn: r.notification.titleEn,
        messageEn: r.notification.messageEn,
        type: r.notification.type,
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

      return { notifications, total, unreadCount };
    } catch (error) {
      console.error('[NotificationService] Error getting notifications:', error);
      return { notifications: [], total: 0, unreadCount: 0 };
    }
  }

  /**
   * Get pending notifications count for a user (notifications queued while offline)
   */
  static getPendingCount(userId: string): number {
    return pendingNotifications.get(userId)?.length || 0;
  }

  /**
   * Delete old notifications (cleanup)
   */
  static async cleanupOldNotifications(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await (prisma as any).notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          recipients: {
            every: {
              isRead: true,
            },
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error('[NotificationService] Error cleaning up old notifications:', error);
      return 0;
    }
  }

  /**
   * Format notification for client
   */
  private static formatNotification(notification: any): any {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      titleEn: notification.titleEn,
      messageEn: notification.messageEn,
      type: notification.type,
      priority: notification.priority,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      actionLabelEn: notification.actionLabelEn,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
      createdAt: notification.createdAt.toISOString(),
      createdById: notification.createdById,
    };
  }
}

export default NotificationService;
