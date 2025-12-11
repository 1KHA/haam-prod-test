import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole, hasRole } from '@/lib/auth';
import { stringify } from 'csv-stringify/sync';

// GET /api/admin/events/export - Export events as CSV
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;
    const eventType = searchParams.get('eventType') || undefined;
    const includeRegistrations = searchParams.get('includeRegistrations') === 'true';
    
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
    
    // Get events with registration count
    const events = await prisma.event.findMany({
      where: filter,
      include: {
        _count: {
          select: { registrations: true }
        },
        ...(includeRegistrations ? {
          registrations: {
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
          }
        } : {})
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Format dates in ISO format
    const formattedEvents = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      organizer: event.organizer,
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.toISOString() : '',
      capacity: event.capacity !== null ? event.capacity.toString() : 'Unlimited',
      status: event.status,
      createdAt: event.createdAt.toISOString(),
      registrationCount: event._count.registrations.toString()
    }));
    
    // Generate CSV
    let csvData;
    let filename;
    
    if (includeRegistrations) {
      // Create a flattened list for CSV with registrations
      const rows = [];
      
      for (const event of events) {
        if (event.registrations.length === 0) {
          // Add event with no registrations
          rows.push({
            eventId: event.id,
            eventTitle: event.title,
            eventType: event.eventType,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            location: event.location,
            organizer: event.organizer,
            status: event.status,
            capacity: event.capacity !== null ? event.capacity.toString() : 'Unlimited',
            registrationCount: event._count.registrations.toString(),
            registrationId: '',
            registrationStatus: '',
            registrationDate: '',
            userId: '',
            userName: '',
            userEmail: '',
            userRole: '',
            notes: ''
          });
        } else {
          // Add event with each registration
          for (const reg of event.registrations) {
            rows.push({
              eventId: event.id,
              eventTitle: event.title,
              eventType: event.eventType,
              startDate: event.startDate.toISOString(),
              endDate: event.endDate.toISOString(),
              location: event.location,
              organizer: event.organizer,
              status: event.status,
              capacity: event.capacity !== null ? event.capacity.toString() : 'Unlimited',
              registrationCount: event._count.registrations.toString(),
              registrationId: reg.id,
              registrationStatus: reg.status,
              registrationDate: reg.createdAt.toISOString(),
              userId: reg.user.id,
              userName: reg.user.name || '',
              userEmail: reg.user.email,
              userRole: reg.user.role,
              notes: reg.notes || ''
            });
          }
        }
      }
      
      csvData = stringify(rows, { header: true });
      filename = 'events-with-registrations.csv';
    } else {
      // Simple events-only CSV
      csvData = stringify(formattedEvents, { header: true });
      filename = 'events.csv';
    }
    
    // Return CSV file
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
