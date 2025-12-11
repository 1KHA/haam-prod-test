import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole, hasRole, TokenPayload } from '@/lib/auth';

// GET /api/admin/events - Get all events
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify admin role
    if (!user || !(await hasRole(authHeader, [UserRole.ADMIN]))) {
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
    
    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { organizer: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (eventType) {
      filter.eventType = eventType;
    }
    
    // Get events with count of registrations
    const events = await prisma.event.findMany({
      where: filter,
      include: {
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

// POST /api/admin/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify admin role
    if (!user || !(await hasRole(authHeader, [UserRole.ADMIN]))) {
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
    
    // Create event
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
      }
    });
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events - Delete multiple events
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify admin role
    if (!user || !(await hasRole(authHeader, [UserRole.ADMIN]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'No event IDs provided for deletion' },
        { status: 400 }
      );
    }
    
    // First delete all registrations for these events
    await prisma.eventRegistration.deleteMany({
      where: {
        eventId: {
          in: body.ids
        }
      }
    });
    
    // Then delete the events
    const result = await prisma.event.deleteMany({
      where: {
        id: {
          in: body.ids
        }
      }
    });
    
    return NextResponse.json({
      deleted: result.count,
      ids: body.ids
    });
  } catch (error) {
    console.error('Error deleting events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
