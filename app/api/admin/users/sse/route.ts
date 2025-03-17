import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This is a Server-Sent Events (SSE) endpoint for real-time user updates
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode('event: ping\ndata: heartbeat\n\n'));
      
      // Function to fetch and send users
      const sendUsers = async () => {
        try {
          // Get users
          const users = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              specialization: true,
              startupProfile: {
                select: {
                  companyName: true,
                  industry: true,
                  stage: true
                }
              },
              mentorProfile: {
                select: {
                  expertise: true,
                  experience: true
                }
              },
              investorProfile: {
                select: {
                  companyName: true,
                  investmentFocus: true
                }
              },
              acceleratorProfile: {
                select: {
                  organizationName: true,
                  industry: true,
                  focusAreas: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
          
          // Transform the users to include a virtual status field
          const transformedUsers = users.map(user => {
            // Determine if the user has completed their profile
            const hasProfile = user.startupProfile || user.mentorProfile || 
                              user.investorProfile || user.acceleratorProfile;
            
            return {
              ...user,
              // Virtual status field
              status: hasProfile ? 'ACTIVE' : 'PENDING',
              // Add a program field based on profile data
              program: user.startupProfile?.companyName || 
                      user.acceleratorProfile?.organizationName || 
                      user.mentorProfile?.expertise || 
                      user.investorProfile?.companyName || '-'
            };
          });
          
          // Get total count
          const total = await prisma.user.count();
          
          // Send the data as a server-sent event
          const data = {
            users: transformedUsers,
            pagination: {
              total,
              page: 1,
              limit: users.length,
              totalPages: Math.ceil(total / users.length)
            }
          };
          
          controller.enqueue(encoder.encode(`event: users\ndata: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('Error fetching users for SSE:', error);
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Failed to fetch users' })}\n\n`));
        }
      };
      
      // Send initial users data
      await sendUsers();
      
      // Set up interval to send heartbeats and check for new users
      const intervalId = setInterval(async () => {
        // Send heartbeat
        controller.enqueue(encoder.encode('event: ping\ndata: heartbeat\n\n'));
        
        // Send updated users data
        await sendUsers();
      }, 5000); // Check for updates every 5 seconds
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
      });
    }
  });
  
  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
