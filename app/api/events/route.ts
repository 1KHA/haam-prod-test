import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
// GET /api/events - Get all public events
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const eventType = searchParams.get('eventType') || undefined;
    const upcoming = searchParams.get('upcoming') === 'true';
    const past = searchParams.get('past') === 'true';
    
    // Build filter object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      // Only show published events to the public
      status: 'published'
    };
    
    // Filter by event type if provided
    if (eventType) {
      filter.eventType = eventType;
    }
    
    // Search in title, description, location, or organizer
    if (search) {
      filter.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { organizer: { contains: search } }
      ];
    }
    
    // Filter by event date
    const now = new Date();
    if (upcoming && !past) {
      // Only upcoming events (end date is in the future)
      filter.endDate = { gte: now };
    } else if (past && !upcoming) {
      // Only past events (end date is in the past)
      filter.endDate = { lt: now };
    }
    
    // Get events with registration count
    const events = await prisma.event.findMany({
      where: filter,
      select: {
        id: true,
        title: true,
        description: true,
        eventType: true,
        startDate: true,
        endDate: true,
        location: true,
        organizer: true,
        registrationDeadline: true,
        capacity: true,
        status: true,
        createdAt: true,
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { startDate: 'asc' },
      skip,
      take: limit
    });
    
    // Transform events to include registration count and availability
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedEvents = events.map((event: any) => {
      // Calculate if event is at capacity
      const isAtCapacity = event.capacity !== null && 
        event._count.registrations >= event.capacity;
        
      // Calculate if registration is still open
      const isRegistrationOpen = event.registrationDeadline ? 
        new Date() < new Date(event.registrationDeadline) : true;
        
      // Calculate if event has already ended
      const hasEnded = new Date() > new Date(event.endDate);
      
      return {
        ...event,
        registrationCount: event._count.registrations,
        isAtCapacity,
        isRegistrationOpen: isRegistrationOpen && !isAtCapacity && !hasEnded,
        hasEnded
      };
    });
    
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
