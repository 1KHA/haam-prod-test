import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { isAuthenticated } from '@/lib/auth';

// GET /api/admin/users/sse - Server-Sent Events endpoint for real-time user updates
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    let authHeader = req.headers.get('Authorization');
    
    // If token is provided as URL parameter, use it to build the Authorization header
    if (tokenParam && !authHeader) {
      authHeader = `Bearer ${tokenParam}`;
    }
    
    // Authenticate user
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Instead of creating a new Request, add the Authorization header to the
    // original NextRequest headers for permission checking
    if (authHeader) {
      req.headers.set('Authorization', authHeader);
    }
    
    const permissionCheck = await checkPermission(req, { category: 'users', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return new Response(
        JSON.stringify({ error: permissionCheck.error }),
        { 
          status: permissionCheck.error === 'Unauthorized' ? 401 : 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Set up SSE headers
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    };

    // Create a new ReadableStream to send SSE events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Initial data fetch function
        const fetchData = async () => {
          try {
            // Fetch users with their profiles
            const users = await prisma.user.findMany({
              include: {
                profile: true,
                mentorProfile: true,
                investorProfile: true,
                startupProfile: true,
                adminProfile: true,
                programManagerProfile: true,
                entrepreneurProfile: true,
                participantProfile: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 100, // Limit to 100 users for performance
            });

            // Get total count
            const totalCount = await prisma.user.count();

            // Format the data for client
            const formattedUsers = users.map((user: any) => {
              // Determine profile data
              const roleProfile = 
                user.mentorProfile || 
                user.investorProfile || 
                user.startupProfile || 
                user.adminProfile || 
                user.programManagerProfile || 
                user.entrepreneurProfile || 
                user.participantProfile;

              // Determine status
              const status = roleProfile ? 'ACTIVE' : 'PENDING';

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: status,
                createdAt: user.createdAt,
                specialization: user.specialization,
              };
            });

            // Calculate pagination
            const pagination = {
              total: totalCount,
              limit: 100,
              totalPages: Math.ceil(totalCount / 100),
              currentPage: 1
            };

            // Send the data as SSE
            controller.enqueue(
              encoder.encode(`event: users\ndata: ${JSON.stringify({ users: formattedUsers, pagination })}\n\n`)
            );
          } catch (error) {
            console.error('Error in SSE stream:', error);
            controller.enqueue(
              encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Failed to fetch users' })}\n\n`)
            );
          }
        };

        // Send initial data
        await fetchData();

        // Set up interval to send data every 15 seconds
        const intervalId = setInterval(fetchData, 15000);

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
