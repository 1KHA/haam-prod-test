import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole, hasRole } from '@/lib/auth';
import { notifyEventRegistrationRemoved } from '@/lib/services/notification-events';

// GET /api/program-manager/events/[id]/registrations - Get event registrations
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
    
    // Check if event exists and user has permission to view registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        title: true, 
        creatorId: true, 
        status: true,
        capacity: true,
        startDate: true,
        endDate: true
      }
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Program managers can view registrations for:
    // 1. Published events (regardless of creator)
    // 2. Their own events (regardless of status)
    const canView = event.status === 'published' || event.creatorId === user.userId;
    
    if (!canView) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Get registrations with user details
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate statistics
    const totalRegistrations = registrations.length;
    const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed').length;
    const pendingRegistrations = registrations.filter(r => r.status === 'pending').length;
    const cancelledRegistrations = registrations.filter(r => r.status === 'cancelled').length;
    
    // Group by role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registrationsByRole = registrations.reduce((acc: any, reg) => {
      const role = reg.user.role;
      if (!acc[role]) acc[role] = 0;
      acc[role]++;
      return acc;
    }, {});
    
    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        capacity: event.capacity,
        startDate: event.startDate,
        endDate: event.endDate
      },
      registrations,
      statistics: {
        total: totalRegistrations,
        confirmed: confirmedRegistrations,
        pending: pendingRegistrations,
        cancelled: cancelledRegistrations,
        available: event.capacity ? event.capacity - confirmedRegistrations : null,
        byRole: registrationsByRole
      }
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/program-manager/events/[id]/registrations - Update registration status
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
    
    // Validate request body
    if (!body.registrationId || !body.status) {
      return NextResponse.json(
        { error: 'Missing registrationId or status' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['confirmed', 'pending', 'cancelled'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be confirmed, pending, or cancelled' },
        { status: 400 }
      );
    }
    
    // Check if event exists and user has permission
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        creatorId: true, 
        status: true,
        capacity: true
      }
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Program managers can manage registrations for:
    // 1. Published events (regardless of creator) 
    // 2. Their own events (regardless of status)
    const canManage = event.status === 'published' || event.creatorId === user.userId;
    
    if (!canManage) {
      return NextResponse.json({ 
        error: 'You do not have permission to manage registrations for this event' 
      }, { status: 403 });
    }
    
    // Check if registration exists for this event
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: body.registrationId },
      include: { user: { select: { name: true, email: true } } }
    });
    
    if (!registration || registration.eventId !== eventId) {
      return NextResponse.json({ 
        error: 'Registration not found for this event' 
      }, { status: 404 });
    }
    
    // If confirming and event has capacity, check availability
    if (body.status === 'confirmed' && event.capacity) {
      const confirmedCount = await prisma.eventRegistration.count({
        where: {
          eventId: eventId,
          status: 'confirmed'
        }
      });
      
      // Don't count current registration if it's already confirmed
      const currentlyConfirmed = registration.status === 'confirmed' ? 1 : 0;
      const availableSpots = event.capacity - (confirmedCount - currentlyConfirmed);
      
      if (availableSpots < 1) {
        return NextResponse.json({
          error: 'Event is at full capacity'
        }, { status: 400 });
      }
    }
    
    // Update the registration
    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: body.registrationId },
      data: { 
        status: body.status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    return NextResponse.json({
      registration: updatedRegistration,
      message: `Registration ${body.status} successfully`
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/program-manager/events/[id]/registrations - Cancel/Remove registration
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
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');
    
    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }
    
    // Check if event exists and user has permission
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        title: true,
        creatorId: true, 
        status: true 
      }
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Program managers can manage registrations for:
    // 1. Published events (regardless of creator)
    // 2. Their own events (regardless of status)
    const canManage = event.status === 'published' || event.creatorId === user.userId;
    
    if (!canManage) {
      return NextResponse.json({ 
        error: 'You do not have permission to manage registrations for this event' 
      }, { status: 403 });
    }
    
    // Check if registration exists for this event
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { user: { select: { name: true, email: true } } }
    });
    
    if (!registration || registration.eventId !== eventId) {
      return NextResponse.json({ 
        error: 'Registration not found for this event' 
      }, { status: 404 });
    }
    
    // Get admin name for notification
    const adminUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true }
    });

    // Delete the registration
    await prisma.eventRegistration.delete({
      where: { id: registrationId }
    });

    // Notify user about registration removal (TASK-20)
    try {
      await notifyEventRegistrationRemoved({
        eventId,
        eventTitle: event?.title || 'Event',
        userId: registration.userId,
        userName: registration.user.name || registration.user.email,
        removedByName: adminUser?.name || 'Admin',
        removedAt: new Date(),
        isSelfCancelled: false,
        reason: 'Removed by event administrator'
      });
    } catch (notifyError) {
      console.error('[PM Registrations DELETE] Notification error:', notifyError);
    }
    
    return NextResponse.json({
      message: 'Registration removed successfully',
      registrationId: registrationId,
      user: registration.user
    });
  } catch (error) {
    console.error('Error removing registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
