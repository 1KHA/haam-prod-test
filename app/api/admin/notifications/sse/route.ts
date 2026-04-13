import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification-service';

// GET /api/admin/notifications/sse - Server-Sent Events endpoint for real-time notifications
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    let authHeader = req.headers.get('Authorization');
    
    // If token is provided as URL parameter, use it to build the Authorization header
    if (tokenParam && !authHeader) {
      try {
        const decodedToken = decodeURIComponent(tokenParam);
        authHeader = decodedToken.startsWith('Bearer ') 
          ? decodedToken 
          : `Bearer ${decodedToken}`;
      } catch (error) {
        console.error('[Notifications SSE] Error decoding token:', error);
        authHeader = tokenParam.startsWith('Bearer ') 
          ? tokenParam 
          : `Bearer ${tokenParam}`;
      }
    }
    
    // Authenticate user
    let user;
    try {
      user = await isAuthenticated(authHeader || undefined);
    } catch (authError) {
      console.error('[Notifications SSE] Authentication error:', authError);
      user = null;
    }
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or expired token' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    console.log(`[Notifications SSE] User ${user.userId} connected`);

    // Set up SSE headers
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    };

    // Create a new ReadableStream for SSE
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection confirmation
        controller.enqueue(
          encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId: user.userId, timestamp: new Date().toISOString() })}\n\n`)
        );

        // Register this connection with the NotificationService
        // This enables instant push delivery when notifications are created
        const unregister = NotificationService.registerConnection(
          user.userId,
          (data: string) => {
            try {
              controller.enqueue(encoder.encode(data));
            } catch (error) {
              console.error(`[Notifications SSE] Error sending to user ${user.userId}:`, error);
            }
          }
        );

        // Send initial notifications data via API call
        // This ensures the client has current state immediately
        NotificationService.getNotifications(user.userId, { limit: 50 })
          .then(({ notifications, unreadCount }) => {
            controller.enqueue(
              encoder.encode(`event: notifications\ndata: ${JSON.stringify({ notifications, unreadCount })}\n\n`)
            );
          })
          .catch((error) => {
            console.error('[Notifications SSE] Error fetching initial notifications:', error);
            controller.enqueue(
              encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Failed to fetch notifications' })}\n\n`)
            );
          });

        // Keep connection alive with periodic heartbeats
        const heartbeatId = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`:heartbeat\n\n`));
          } catch (error) {
            console.error(`[Notifications SSE] Heartbeat failed for user ${user.userId}:`, error);
          }
        }, 30000);

        // Clean up on close
        req.signal.addEventListener('abort', () => {
          console.log(`[Notifications SSE] User ${user.userId} disconnected`);
          clearInterval(heartbeatId);
          unregister(); // Remove from NotificationService
          controller.close();
        });
      }
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('[Notifications SSE] Error setting up SSE:', error);
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
