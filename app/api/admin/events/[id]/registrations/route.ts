import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole, hasRole } from '@/lib/auth';

// GET /api/admin/events/[id]/registrations - Get registrations for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify admin role
    if (!user || !(await hasRole(authHeader, [UserRole.ADMIN]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;
    
    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { eventId: id };
    
    if (status) {
      filter.status = status;
    }
    
    // Get registrations with user info
    const registrations = await prisma.eventRegistration.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    // If search is provided, filter in memory (since we need to search across user properties)
    let filteredRegistrations = registrations;
    if (search) {
      const searchLower = search.toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteredRegistrations = registrations.filter((reg: any) => 
        reg.user.name?.toLowerCase().includes(searchLower) ||
        reg.user.email.toLowerCase().includes(searchLower) ||
        reg.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    // Get total count for pagination (this matches the same filter we applied above)
    const totalRegistrations = await prisma.eventRegistration.count({ 
      where: filter
    });
    
    return NextResponse.json({
      registrations: filteredRegistrations,
      pagination: {
        total: search ? filteredRegistrations.length : totalRegistrations,
        page,
        limit,
        totalPages: Math.ceil((search ? filteredRegistrations.length : totalRegistrations) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/events/[id]/registrations - Add registration (admin can register users)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify admin role
    if (!user || !(await hasRole(authHeader, [UserRole.ADMIN]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const body = await request.json();
    
    // Check required fields
    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
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
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: body.userId }
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if registration already exists
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: body.userId
        }
      }
    });
    
    if (existingRegistration) {
      return NextResponse.json(
        { error: 'User is already registered for this event' },
        { status: 400 }
      );
    }
    
    // Check capacity if set
    if (event.capacity !== null && event._count.registrations >= event.capacity) {
      // Add to waitlist
      const registration = await prisma.eventRegistration.create({
        data: {
          userId: body.userId,
          eventId: id,
          status: 'waitlist',
          notes: body.notes || null,
          registeredBy: user.userId
        }
      });
      
      return NextResponse.json({
        registration,
        message: 'User added to waitlist as event is at capacity',
        waitlist: true
      }, { status: 201 });
    }
    
    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId: body.userId,
        eventId: id,
        status: body.status || 'confirmed',
        notes: body.notes || null,
        registeredBy: user.userId
      }
    });
    
    return NextResponse.json({
      registration,
      message: 'Registration successful'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events/[id]/registrations/batch - Update multiple registrations
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify admin role
    if (!user || !(await hasRole(authHeader, [UserRole.ADMIN]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: eventId } = params;
    const body = await request.json();
    
    // Check if registrationIds and status are provided
    if (!body.registrationIds || !Array.isArray(body.registrationIds) || !body.status) {
      return NextResponse.json(
        { error: 'Registration IDs array and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['confirmed', 'waitlist', 'cancelled', 'attended', 'no-show'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }
    
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
    
    // Update registrations
    const updateResult = await prisma.eventRegistration.updateMany({
      where: {
        id: { in: body.registrationIds },
        eventId
      },
      data: {
        status: body.status,
        notes: body.notes !== undefined ? body.notes : undefined,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      updated: updateResult.count,
      status: body.status
    });
  } catch (error) {
    console.error('Error updating registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id]/registrations/batch - Delete multiple registrations
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);
    
    // Verify admin role
    if (!user || !(await hasRole(authHeader, [UserRole.ADMIN]))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: eventId } = params;
    const { searchParams } = new URL(request.url);
    
    // Get registrationIds from query parameters or request body
    let registrationIds: string[] = [];
    
    // If request has JSON body, extract registrationIds from there
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json();
      if (body.registrationIds && Array.isArray(body.registrationIds)) {
        registrationIds = body.registrationIds;
      }
    } else {
      // Otherwise, try to get IDs from query parameters
      const idsParam = searchParams.get('ids');
      if (idsParam) {
        registrationIds = idsParam.split(',');
      }
    }
    
    if (registrationIds.length === 0) {
      return NextResponse.json(
        { error: 'No registration IDs provided for deletion' },
        { status: 400 }
      );
    }
    
    // Delete registrations
    const deleteResult = await prisma.eventRegistration.deleteMany({
      where: {
        id: { in: registrationIds },
        eventId
      }
    });
    
    return NextResponse.json({
      deleted: deleteResult.count,
      ids: registrationIds
    });
  } catch (error) {
    console.error('Error deleting registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
