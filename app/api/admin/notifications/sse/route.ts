import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

// GET /api/admin/notifications/sse - Server-Sent Events endpoint for real-time notifications
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    let authHeader = req.headers.get('Authorization');
    
    // If token is provided as URL parameter, use it to build the Authorization header
    if (tokenParam && !authHeader) {
      // First try to decode the token in case it's URL encoded
      try {
        const decodedToken = decodeURIComponent(tokenParam);
        // Check if the token already has the Bearer prefix
        authHeader = decodedToken.startsWith('Bearer ') 
          ? decodedToken 
          : `Bearer ${decodedToken}`;
        
        console.log('[Notifications SSE] Using token from URL parameter');
      } catch (error) {
        console.error('[Notifications SSE] Error decoding token:', error);
        // Fall back to the original token if decoding fails
        authHeader = tokenParam.startsWith('Bearer ') 
          ? tokenParam 
          : `Bearer ${tokenParam}`;
      }
    }
    
    // Log the authorization process for debugging
    console.log('[Notifications SSE] Authenticating user with token');
    
    // Authenticate user with better error handling
    let user;
    try {
      user = await isAuthenticated(authHeader || undefined);
      console.log('[Notifications SSE] Authentication result:', user ? 'Success' : 'Failed');
    } catch (authError) {
      console.error('[Notifications SSE] Authentication error:', authError);
      user = null;
    }
    
    if (!user) {
      console.error('[Notifications SSE] Authentication failed - Invalid or expired token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }
    
    // Set up SSE headers with CORS support
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Create a new ReadableStream to send SSE events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Track the last known notification timestamp for detecting new notifications
        let lastNotificationTimestamp = new Date();
        
        // Initial data fetch function
        const fetchNotifications = async () => {
          try {
            // Get the user's recent notifications
            const notifications = await (prisma as any).notification.findMany({
              where: {
                recipients: {
                  some: {
                    userId: user.userId,
                  }
                }
              },
              include: {
                createdBy: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                recipients: {
                  where: { 
                    userId: user.userId 
                  },
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
              take: 10, // Limit to 10 most recent notifications
            });
            
            // Format the notifications for the client
            const formattedNotifications = notifications.map((notification: any) => {
              // Find this user's recipient record for this notification
              const recipientRecord = notification.recipients[0]; // Should be only one since we filtered by userId
              
              return {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type || 'system',
                priority: notification.priority,
                isRead: recipientRecord ? recipientRecord.isRead : false,
                createdAt: notification.createdAt.toISOString(),
                createdBy: notification.createdBy?.name || 'System',
                recipientId: recipientRecord?.id
              };
            });
            
            // Get the count of unread notifications
            const unreadCount = await (prisma as any).notificationRecipient.count({
              where: {
                userId: user.userId,
                isRead: false,
              },
            });

            // Send the current notifications data
            controller.enqueue(
              encoder.encode(`event: notifications\ndata: ${JSON.stringify({ 
                notifications: formattedNotifications,
                unreadCount 
              })}\n\n`)
            );

            // Check for new notifications since the last fetch
            const newNotifications = await (prisma as any).notification.findMany({
              where: {
                createdAt: { gt: lastNotificationTimestamp },
                recipients: {
                  some: {
                    userId: user.userId,
                  }
                }
              },
              include: {
                createdBy: {
                  select: {
                    id: true,
                    name: true,
                  }
                },
                recipients: {
                  where: { 
                    userId: user.userId 
                  },
                  select: {
                    id: true,
                    isRead: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              }
            });
            
            // If we found new notifications, send them as individual events
            if (newNotifications.length > 0) {
              // Update our timestamp
              lastNotificationTimestamp = new Date();
              
              // Send each new notification as a separate event
              for (const notification of newNotifications) {
                const recipientRecord = notification.recipients[0];
                
                const formattedNotification = {
                  id: notification.id,
                  title: notification.title,
                  message: notification.message,
                  type: notification.type || 'system',
                  priority: notification.priority,
                  isRead: recipientRecord ? recipientRecord.isRead : false,
                  createdAt: notification.createdAt.toISOString(),
                  createdBy: notification.createdBy?.name || 'System',
                  recipientId: recipientRecord?.id
                };
                
                controller.enqueue(
                  encoder.encode(`event: new_notification\ndata: ${JSON.stringify(formattedNotification)}\n\n`)
                );
              }
            }
          } catch (error) {
            console.error('Error in SSE stream:', error);
            controller.enqueue(
              encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Failed to fetch notifications' })}\n\n`)
            );
          }
        };

        // Send initial data
        await fetchNotifications();

        // Set up interval to check for new notifications every 10 seconds
        const intervalId = setInterval(fetchNotifications, 10000);

        // Keep connection alive with periodic heartbeats
        const heartbeatId = setInterval(() => {
          controller.enqueue(encoder.encode(`:heartbeat\n\n`));
        }, 30000);

        // Clean up on close
        req.signal.addEventListener('abort', () => {
          clearInterval(intervalId);
          clearInterval(heartbeatId);
          controller.close();
        });
      }
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
