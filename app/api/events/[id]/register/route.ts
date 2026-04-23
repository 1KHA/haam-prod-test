import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { notifyEventRegistration, notifyEventWaitlisted, notifyEventPromotedFromWaitlist, notifyEventRegistrationRemoved } from '@/lib/services/notification-events';

export const dynamic = 'force-dynamic';
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      // Notify user about waitlist status (TASK-11)
      try {
        const waitlistCount = await prisma.eventRegistration.count({
          where: { eventId, status: 'waitlist' }
        });

        await notifyEventWaitlisted({
          registrationId: registration.id,
          eventId,
          eventTitle: event.title,
          userId: user.userId,
          waitlistPosition: waitlistCount
        });
      } catch (notifyError) {
        console.error('[Event Register] Waitlist notification error:', notifyError);
      }
      
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

    // Notify event organizers and admins about new registration
    console.log(`[Event Register] Sending registration notifications...`);
    try {
      // Get the event creator/organizer
      const eventWithOrganizer = await prisma.event.findUnique({
        where: { id: eventId },
        select: { 
          id: true,
          title: true,
          organizerId: true 
        },
      });

      // Get all admins and PMs to notify
      const staffUsers = await prisma.user.findMany({
        where: { 
          role: { in: ['ADMIN', 'PROGRAM_MANAGER'] }
        },
        select: { id: true },
      });

      const organizerIds: string[] = [];
      
      // Add event creator
      if (eventWithOrganizer?.organizerId) {
        organizerIds.push(eventWithOrganizer.organizerId);
      }
      
      // Add all staff users
      for (const staff of staffUsers) {
        if (!organizerIds.includes(staff.id)) {
          organizerIds.push(staff.id);
        }
      }

      console.log(`[Event Register] Notifying ${organizerIds.length} organizers/staff`);

      if (organizerIds.length > 0) {
        // Get the full user data for the registrant's name
        const registrant = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { name: true, email: true },
        });
        const userName = registrant?.name || registrant?.email || user.email;

        await notifyEventRegistration({
          registrationId: registration.id,
          eventId,
          eventName: eventWithOrganizer?.title || 'Event',
          userId: user.userId,
          userName,
          userEmail: user.email,
          organizerIds,
        });
        console.log(`[Event Register] Registration notifications sent successfully`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (notifyError: any) {
      console.error('[Event Register] Failed to send notifications:', notifyError.message);
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
    
    // Get user details before deletion for notification
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true, email: true }
    });

    // Delete registration
    await prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          userId: user.userId,
          eventId
        }
      }
    });

    // Notify user about registration cancellation (TASK-20)
    try {
      await notifyEventRegistrationRemoved({
        eventId,
        eventTitle: event.title,
        userId: user.userId,
        userName: userData?.name || user.email,
        removedByName: userData?.name || user.email,
        removedAt: new Date(),
        isSelfCancelled: true
      });
    } catch (notifyError) {
      console.error('[Event Register] Registration removal notification error:', notifyError);
    }
    
    // If this user was confirmed and there are people on the waitlist, 
    // move the first waitlisted person to confirmed
    if (registration.status === 'confirmed' && event.capacity !== null) {
      // Find the first person on the waitlist by registration date
      const waitlistedRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          status: 'waitlist'
        },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true } }
        }
      });
      
      if (waitlistedRegistration) {
        // Move this person to confirmed
        await prisma.eventRegistration.update({
          where: { id: waitlistedRegistration.id },
          data: { status: 'confirmed' }
        });

        // Notify user about promotion from waitlist (TASK-12)
        try {
          await notifyEventPromotedFromWaitlist({
            registrationId: waitlistedRegistration.id,
            eventId,
            eventTitle: event.title,
            userId: waitlistedRegistration.user.id,
            eventDate: event.startDate
          });
        } catch (notifyError) {
          console.error('[Event Register] Promotion notification error:', notifyError);
        }
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
