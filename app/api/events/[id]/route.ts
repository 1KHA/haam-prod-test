import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

// GET /api/events/[id] - Get a single public event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get event with registration count
    const event = await prisma.event.findUnique({
      where: { 
        id,
        // Only published events are visible to the public
        status: 'published'
      },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Get current user if authenticated
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    let userRegistration = null;
    
    // If user is authenticated, check if they are registered for this event
    if (user) {
      userRegistration = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: user.userId
          }
        }
      });
    }
    
    // Calculate additional information
    const now = new Date();
    const isAtCapacity = event.capacity !== null && 
      event._count.registrations >= event.capacity;
    const isRegistrationOpen = event.registrationDeadline ? 
      now < new Date(event.registrationDeadline) : true;
    const hasStarted = now >= new Date(event.startDate);
    const hasEnded = now > new Date(event.endDate);
    
    // Return event with additional information
    return NextResponse.json({
      event: {
        ...event,
        registrationCount: event._count.registrations,
        isAtCapacity,
        isRegistrationOpen: isRegistrationOpen && !isAtCapacity && !hasEnded,
        hasStarted,
        hasEnded,
        isUserRegistered: userRegistration !== null,
        userRegistration
      }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
