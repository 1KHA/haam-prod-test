import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { isAuthenticated } from '@/lib/auth';

// GET /api/admin/users/sse - Server-Sent Events endpoint for real-time user updates
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    // Extract query parameters for filtering
    const searchQuery = url.searchParams.get('search') || '';
    const roleFilter = url.searchParams.get('role') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    let authHeader = req.headers.get('Authorization');
    
    console.log('[SSE] Received token param:', tokenParam ? 'Present (value hidden)' : 'None');
    console.log('[SSE] Original auth header:', authHeader ? 'Present (value hidden)' : 'None');
    
    // If token is provided as URL parameter, use it to build the Authorization header
    // Ensure we're handling different token formats correctly
    if (tokenParam && !authHeader) {
      // Check if token already includes "Bearer" prefix
      authHeader = tokenParam.startsWith('Bearer ') 
        ? tokenParam 
        : `Bearer ${tokenParam}`;
      console.log('[SSE] Using token from URL parameter');
    }
    
    // Authenticate user with proper error handling
    console.log('[SSE] Authenticating with header:', authHeader ? 'Present (value hidden)' : 'None');
    let user = null;
    try {
      user = await isAuthenticated(authHeader || undefined);
    } catch (authError) {
      console.error('[SSE] Authentication error:', authError);
    }
    console.log('[SSE] Authentication result:', user ? 'Successful' : 'Failed');
    
    if (!user) {
      console.error('[SSE] Authentication failed - no valid user found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or missing authentication token' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Check permissions directly with the user ID instead of creating a new request
    let permissionGranted = false;
    
    // First check if user is admin (admins get all permissions)
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    });
    
    if (userRecord && userRecord.role === 'ADMIN') {
      permissionGranted = true;
      console.log('[SSE] User is admin, granting permissions automatically');
    } else {
      // For non-admins, check permissions manually
      // Since we can't directly modify the original request headers, we'll check the permission directly
      // Create an array of role names, filtering out undefined values
      const roleNames: string[] = ['مدير النظام', 'مدير برنامج']; // Include common admin roles
      
      // Only add the user's role if it exists
      if (userRecord?.role) {
        roleNames.push(userRecord.role);
      }
      
      const hasPermission = await prisma.rolePermission.findFirst({
        where: {
          OR: [
            {
              // Check role-based permissions
              role: {
                name: {
                  in: roleNames
                }
              },
              permission: {
                category: 'users',
                action: 'view'
              }
            },
            {
              // Check user-specific permissions
              userId: user.userId,
              permission: {
                category: 'users',
                action: 'view'
              }
            }
          ]
        }
      });
      
      permissionGranted = !!hasPermission;
      console.log('[SSE] Permission check result:', permissionGranted ? 'Granted' : 'Denied');
    }
    
    if (!permissionGranted) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Insufficient permissions' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
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
        const fetchData = async () => {
          try {
            // Build filter conditions
            const where: any = {};
            
            // Apply search filter
            if (searchQuery) {
              where.OR = [
                { name: { contains: searchQuery } },
                { email: { contains: searchQuery } }
              ];
            }
            
            // Apply role filter - normalize it to uppercase if provided
            if (roleFilter && roleFilter.toUpperCase() !== 'ALL') {
              where.role = roleFilter.toUpperCase();
              console.log('[SSE] Applying role filter:', roleFilter.toUpperCase());
            }
            
            // Calculate pagination
            const skip = (page - 1) * limit;
            
            // Fetch users with their profiles
            const users = await prisma.user.findMany({
              where,
              include: {
                profile: true,
                mentorProfile: true,
                investorProfile: true,
                startupProfile: true,
                adminProfile: true,
                programManagerProfile: true,
                entrepreneurProfile: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              skip: skip,
              take: limit,
            });

            // Get total count with filters
            const totalCount = await prisma.user.count({ where });

            // Format the data for client
            const formattedUsers = users.map((user: any) => {
              // Determine profile data
              const roleProfile = 
                user.mentorProfile || 
                user.investorProfile || 
                user.startupProfile || 
                user.adminProfile || 
                user.programManagerProfile || 
                user.entrepreneurProfile;

              // Determine status
              const status = roleProfile ? 'ACTIVE' : 'PENDING';

              // Get program information if available
              let programName = '-';
              if (user.programManagerProfile?.programs) {
                programName = user.programManagerProfile.programs;
              }

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: status,
                createdAt: user.createdAt,
                specialization: user.specialization,
                program: programName
              };
            });

            // Calculate pagination
            const pagination = {
              total: totalCount,
              limit: limit,
              totalPages: Math.ceil(totalCount / limit),
              currentPage: page
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

        // Set up interval to send data every 10 seconds
        const intervalId = setInterval(fetchData, 10000);

        // Keep connection alive with more frequent heartbeats
        const heartbeatId = setInterval(() => {
          controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${new Date().toISOString()}\n\n`));
        }, 20000);

        // Clean up on close with better error handling
        req.signal.addEventListener('abort', () => {
          try {
            clearInterval(intervalId);
            clearInterval(heartbeatId);
            controller.close();
            console.log('SSE connection closed properly');
          } catch (error) {
            console.error('Error during SSE connection cleanup:', error);
          }
        });
      }
    });

    return new Response(stream, { headers, status: 200 });
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
