import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { notifyEventRegistration } from '@/lib/services/notification-events';

// GET /api/events/[id]/register - Check registration status for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // If no user is logged in, return that they are not registered
    if (!user) {
      return NextResponse.json({
        registered: false,
        status: null,
        message: 'User not authenticated'
      });
    }
    
    const { id: eventId } = params;
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check registration status
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          userId: user.userId,
          eventId
        }
      }
    });
    
    if (registration) {
      return NextResponse.json({
        registered: true,
        status: registration.status,
        registrationId: registration.id,
        registeredAt: registration.createdAt
      });
    }
    
    return NextResponse.json({
      registered: false,
      status: null
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/register - Register for an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - users must be logged in to register
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id: eventId } = params;
    
    // Parse body if present (registration may not require any additional data)
    let body = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Body is empty or invalid, use empty object
    }
    
    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
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
        { error: 'Event not found or not available for registration' },
        { status: 404 }
      );
    }
    
    // Check if registration deadline has passed
    const now = new Date();
    if (event.registrationDeadline && now > new Date(event.registrationDeadline)) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
        { status: 400 }
      );
    }
    
    // Check if event has already ended
    if (now > new Date(event.endDate)) {
      return NextResponse.json(
        { error: 'Event has already ended' },
        { status: 400 }
      );
    }
    
    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          userId: user.userId,
          eventId
        }
      }
    });
    
    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this event', registration: existingRegistration },
        { status: 400 }
      );
    }
    
    // Check if event is at capacity
    if (event.capacity !== null && event._count.registrations >= event.capacity) {
      // Add to waitlist if event is at capacity
      const registration = await prisma.eventRegistration.create({
        data: {
          userId: user.userId,
          eventId,
          status: 'waitlist'
        }
      });
      
      return NextResponse.json({
        registration,
        message: 'You have been added to the waitlist as this event is at capacity',
        waitlist: true
      }, { status: 201 });
    }
    
    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId: user.userId,
        eventId,
        status: 'confirmed'
      }
    });

    // Notify event organizers about new registration
    try {
      // Get the event creator/organizer
      const eventWithOrganizer = await prisma.event.findUnique({
        where: { id: eventId },
        select: { 
          id: true,
          name: true,
          createdById: true 
        },
      });

      if (eventWithOrganizer?.createdById) {
        await notifyEventRegistration({
          registrationId: registration.id,
          eventId,
          eventName: eventWithOrganizer.name,
          userId: user.userId,
          userName: user.name || user.email,
          userEmail: user.email,
          organizerIds: [eventWithOrganizer.createdById],
        });
      }
    } catch (notifyError) {
      console.error('[Event Register] Failed to send notifications:', notifyError);
      // Don't fail the request if notification fails
    }
    
    return NextResponse.json({
      registration,
      message: 'Registration successful'
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/register - Cancel registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - users must be logged in to cancel
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id: eventId } = params;
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if registration exists
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          userId: user.userId,
          eventId
        }
      }
    });
    
    if (!registration) {
      return NextResponse.json(
        { error: 'You are not registered for this event' },
        { status: 404 }
      );
    }
    
    // Check if event has already started
    const now = new Date();
    if (now >= new Date(event.startDate)) {
      return NextResponse.json(
        { error: 'Cannot cancel registration after event has started' },
        { status: 400 }
      );
    }
    
    // Delete registration
    await prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          userId: user.userId,
          eventId
        }
      }
    });
    
    // If this user was confirmed and there are people on the waitlist, 
    // move the first waitlisted person to confirmed
    if (registration.status === 'confirmed' && event.capacity !== null) {
      // Find the first person on the waitlist by registration date
      const waitlistedRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          status: 'waitlist'
        },
        orderBy: { createdAt: 'asc' }
      });
      
      if (waitlistedRegistration) {
        // Move this person to confirmed
        await prisma.eventRegistration.update({
          where: { id: waitlistedRegistration.id },
          data: { status: 'confirmed' }
        });
        
        // TODO: Send notification to this user that they're now confirmed
      }
    }
    
    return NextResponse.json({
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
