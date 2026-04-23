import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, verifyToken } from '@/lib/auth';
import { getUserPermissions } from '@/lib/permissions';
import { registerSseController, unregisterSseController } from '@/lib/sse-helpers';

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    // Get auth either from header or URL param
    const authHeader = req.headers.get('authorization');
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    
    let user;
    
    if (tokenParam) {
      // If token provided in URL (for EventSource which doesn't support custom headers)
      user = verifyToken(tokenParam);
      console.log(`[SSE] Authenticated user ${user?.userId} (${user?.email}) using token from URL param`);
    } else {
      // Traditional header-based authentication
      user = await isAuthenticated(authHeader || undefined);
      console.log(`[SSE] Authenticated user ${user?.userId} (${user?.email}) using Authorization header`);
    }
    
    if (!user) {
      console.log('[SSE] Authentication failed - no valid token provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Register this controller with the SSE connection manager
        registerSseController(user.userId, controller, req.headers.get('last-event-id') || undefined);
        
        // Send initial permissions
        const permissions = await getUserPermissions(user.userId);
        const message = {
          event: 'permissions-update',
          data: {
            permissions,
            role: user.role,
            timestamp: new Date().toISOString()
          }
        };

        controller.enqueue(encoder.encode(`event: ${message.event}\ndata: ${JSON.stringify(message.data)}\n\n`));

        // Keep connection alive
        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        }, 30000);

        // Clean up on client disconnect
        req.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          unregisterSseController(user.userId, controller);
          console.log(`SSE: Client disconnected for user ${user.userId}`);
        });

        // Keep checking for permission updates every 10 seconds
        const checkForUpdates = async () => {
          if (req.signal.aborted) {
            clearInterval(keepAlive);
            return;
          }

          try {
            const latestPermissions = await getUserPermissions(user.userId);
            
            // Get the latest user info to check for role changes
            let latestUser;
            if (tokenParam) {
              latestUser = verifyToken(tokenParam);
            } else {
              latestUser = await isAuthenticated(authHeader || undefined);
            }
            
            if (!latestUser) {
              controller.close();
              return;
            }
            
            const updateMessage = {
              event: 'permissions-update',
              data: {
                permissions: latestPermissions,
                role: latestUser.role,
                timestamp: new Date().toISOString()
              }
            };
            
            controller.enqueue(
              encoder.encode(`event: ${updateMessage.event}\ndata: ${JSON.stringify(updateMessage.data)}\n\n`)
            );
            
            // Schedule next check
            setTimeout(checkForUpdates, 10000);
          } catch (error) {
            console.error('Error checking for permission updates:', error);
            
            // Send error event
            controller.enqueue(
              encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'Error checking permissions' })}\n\n`)
            );
            
            // Continue checking despite error
            setTimeout(checkForUpdates, 10000);
          }
        };
        
        // Start periodic permission checks
        setTimeout(checkForUpdates, 10000);
      }
    });

    // Return SSE stream response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error setting up permissions SSE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
