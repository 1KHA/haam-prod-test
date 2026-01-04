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
        
        // Initial data fetch function
        const fetchNotifications = async () => {
          try {
            // In a real implementation, this would query the database for user's notifications
            // For demo purposes, we'll use mock data
            const mockNotifications = [
              {
                id: '1',
                title: 'تحديث النظام',
                message: 'تم تحديث النظام إلى الإصدار 2.5.0',
                type: 'system',
                isRead: false,
                createdAt: new Date().toISOString(),
                priority: 'high'
              },
              {
                id: '2',
                title: 'طلب جديد',
                message: 'تم استلام طلب انضمام جديد من شركة ناشئة',
                type: 'application',
                isRead: true,
                createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
                priority: 'medium'
              },
              {
                id: '3',
                title: 'تذكير: جلسة إرشادية',
                message: 'لديك جلسة إرشادية مجدولة غدًا الساعة 2 مساءً',
                type: 'reminder',
                isRead: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                priority: 'medium'
              }
            ];

            const unreadCount = mockNotifications.filter(n => !n.isRead).length;

            // Send the data as SSE
            controller.enqueue(
              encoder.encode(`event: notifications\ndata: ${JSON.stringify({ 
                notifications: mockNotifications,
                unreadCount 
              })}\n\n`)
            );

            // Add a new notification every 30 seconds for demo purposes
            if (Math.random() > 0.5) {
              const newNotification = {
                id: Date.now().toString(),
                title: 'إشعار جديد',
                message: `إشعار جديد تم إنشاؤه في ${new Date().toLocaleTimeString('ar-SA')}`,
                type: 'system',
                isRead: false,
                createdAt: new Date().toISOString(),
                priority: 'medium'
              };
              
              controller.enqueue(
                encoder.encode(`event: new_notification\ndata: ${JSON.stringify(newNotification)}\n\n`)
              );
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
