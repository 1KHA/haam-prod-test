import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole, hasRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
// GET /api/program-manager/events/[id] - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify program manager role
    if (!user || !(await hasRole(authHeader, [UserRole.PROGRAM_MANAGER]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const eventId = params.id;
    
    // Get the event with creator and registration count
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Program managers can view:
    // 1. Published events (regardless of creator)
    // 2. Their own events (regardless of status)
    const canView = event.status === 'published' || event.creatorId === user.userId;
    
    if (!canView) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      event: {
        ...event,
        registrationCount: event._count.registrations
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

// PUT /api/program-manager/events/[id] - Update a specific event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify program manager role
    if (!user || !(await hasRole(authHeader, [UserRole.PROGRAM_MANAGER]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const eventId = params.id;
    const body = await request.json();
    
    // Check if event exists and user has permission to edit
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Program managers can only edit their own events
    if (existingEvent.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only edit events you created' },
        { status: 403 }
      );
    }
    
    // Validate dates if provided
    if (body.startDate && body.endDate) {
      if (new Date(body.endDate) <= new Date(body.startDate)) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }
    
    // Build update object with only provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.eventType) updateData.eventType = body.eventType;
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.location) updateData.location = body.location;
    if (body.organizer) updateData.organizer = body.organizer;
    if (body.registrationDeadline !== undefined) {
      updateData.registrationDeadline = body.registrationDeadline ? new Date(body.registrationDeadline) : null;
    }
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.status) updateData.status = body.status;
    
    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });
    
    return NextResponse.json({
      event: {
        ...updatedEvent,
        registrationCount: updatedEvent._count.registrations
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/program-manager/events/[id] - Delete a specific event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify program manager role
    if (!user || !(await hasRole(authHeader, [UserRole.PROGRAM_MANAGER]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const eventId = params.id;
    
    // Check if event exists and user has permission to delete
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Program managers can only delete their own events
    if (existingEvent.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete events you created' },
        { status: 403 }
      );
    }
    
    // Delete all registrations first
    await prisma.eventRegistration.deleteMany({
      where: { eventId: eventId }
    });
    
    // Delete the event
    await prisma.event.delete({
      where: { id: eventId }
    });
    
    return NextResponse.json({
      message: 'Event deleted successfully',
      eventId: eventId
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
