import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole, hasRole } from '@/lib/auth';

// GET /api/program-manager/events - Get all events accessible to program manager
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify program manager role
    if (!user || !(await hasRole(authHeader, [UserRole.PROGRAM_MANAGER]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;
    const eventType = searchParams.get('eventType') || undefined;
    
    // Build filter object - Program managers can see all published events and their own drafts
    const filter: any = {
      OR: [
        { status: 'published' }, // All published events
        { status: 'draft', creatorId: user.userId } // Their own drafts
      ]
    };
    
    if (search) {
      filter.AND = [
        ...(filter.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { organizer: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }
    
    // Additional filters
    if (status) {
      if (status === 'published' || status === 'draft' || status === 'cancelled') {
        // Override the OR condition if specific status is requested
        delete filter.OR;
        filter.status = status;
        // But still limit draft events to user's own
        if (status === 'draft') {
          filter.creatorId = user.userId;
        }
      }
    }
    
    if (eventType) {
      filter.eventType = eventType;
    }
    
    // Get events with count of registrations
    const events = await prisma.event.findMany({
      where: filter,
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
      },
      orderBy: { startDate: 'asc' },
      skip,
      take: limit
    });
    
    // Transform events to include registration count
    const transformedEvents = events.map((event: any) => ({
      ...event,
      registrationCount: event._count.registrations
    }));
    
    // Get total count for pagination
    const totalEvents = await prisma.event.count({ where: filter });
    
    return NextResponse.json({
      events: transformedEvents,
      pagination: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.ceil(totalEvents / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/program-manager/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify program manager role
    if (!user || !(await hasRole(authHeader, [UserRole.PROGRAM_MANAGER]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'eventType', 'startDate', 'endDate', 'location', 'organizer'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Make sure end date is after start date
    if (new Date(body.endDate) <= new Date(body.startDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    // Create event - program manager creates as published by default
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description || '',
        eventType: body.eventType,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        location: body.location,
        organizer: body.organizer,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
        capacity: body.capacity || null,
        status: body.status || 'published',
        creatorId: user.userId
      },
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
        ...event,
        registrationCount: event._count.registrations
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/program-manager/events - Delete multiple events
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify program manager role
    if (!user || !(await hasRole(authHeader, [UserRole.PROGRAM_MANAGER]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'No event IDs provided for deletion' },
        { status: 400 }
      );
    }
    
    // Program managers can only delete their own events
    const eventsToDelete = await prisma.event.findMany({
      where: {
        id: { in: body.ids },
        creatorId: user.userId // Ensure they can only delete their own events
      }
    });
    
    if (eventsToDelete.length !== body.ids.length) {
      return NextResponse.json(
        { error: 'You can only delete events you created' },
        { status: 403 }
      );
    }
    
    const eventIds = eventsToDelete.map(event => event.id);
    
    // First delete all registrations for these events
    await prisma.eventRegistration.deleteMany({
      where: {
        eventId: {
          in: eventIds
        }
      }
    });
    
    // Then delete the events
    const result = await prisma.event.deleteMany({
      where: {
        id: {
          in: eventIds
        }
      }
    });
    
    return NextResponse.json({
      deleted: result.count,
      ids: eventIds
    });
  } catch (error) {
    console.error('Error deleting events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
