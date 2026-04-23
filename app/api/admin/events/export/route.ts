import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole, hasRole } from '@/lib/auth';
import { createCSVResponse, getDelimiterFromRequest } from '@/lib/csv-utils';

export const dynamic = 'force-dynamic';
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
    const delimiter = getDelimiterFromRequest(searchParams);
    
    // Build filter object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    
    if (search) {
      filter.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { organizer: { contains: search } }
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
    
    // Format the data for export with Arabic headers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedEvents = events.map((event: any) => {
      // Map status for clarity in Arabic
      const statusMap: Record<string, string> = {
        'DRAFT': 'مسودة',
        'PUBLISHED': 'منشور',
        'CANCELLED': 'ملغي',
        'COMPLETED': 'مكتمل'
      };

      // Map event type for clarity in Arabic
      const eventTypeMap: Record<string, string> = {
        'WORKSHOP': 'ورشة عمل',
        'SEMINAR': 'ندوة',
        'CONFERENCE': 'مؤتمر',
        'NETWORKING': 'تواصل',
        'TRAINING': 'تدريب',
        'HACKATHON': 'هاكاثون',
        'COMPETITION': 'مسابقة',
        'OTHER': 'أخرى'
      };

      // Format dates
      const formatDate = (dateString: string | Date | null) => {
        if (!dateString) return '-';
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      return {
        id: event.id,
        title: event.title,
        description: event.description || '-',
        eventType: eventTypeMap[event.eventType] || event.eventType,
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate),
        location: event.location || '-',
        organizer: event.organizer || '-',
        registrationDeadline: formatDate(event.registrationDeadline),
        capacity: event.capacity !== null ? event.capacity.toString() : 'غير محدود',
        status: statusMap[event.status] || event.status,
        registrationCount: event._count.registrations.toString(),
        createdAt: formatDate(event.createdAt)
      };
    });

    // Use CSV utility to create proper response with configurable delimiter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let csvData;
    let filename;
    
    if (includeRegistrations) {
      // CSV with registrations - Arabic headers
      const headers = [
        'معرف الفعالية',
        'عنوان الفعالية',
        'نوع الفعالية',
        'تاريخ البدء',
        'تاريخ الانتهاء',
        'الموقع',
        'المنظم',
        'الحالة',
        'السعة',
        'عدد التسجيلات',
        'معرف التسجيل',
        'حالة التسجيل',
        'تاريخ التسجيل',
        'معرف المستخدم',
        'اسم المستخدم',
        'بريد المستخدم',
        'دور المستخدم'
      ];

      // Prepare data for CSV generation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const csvRows: any[] = [];
      
      for (const event of events) {
        const eventData = formattedEvents.find(e => e.id === event.id)!;
        
        if (!event.registrations || event.registrations.length === 0) {
          // Add event with no registrations
          csvRows.push({
            'معرف الفعالية': eventData.id,
            'عنوان الفعالية': eventData.title,
            'نوع الفعالية': eventData.eventType,
            'تاريخ البدء': eventData.startDate,
            'تاريخ الانتهاء': eventData.endDate,
            'الموقع': eventData.location,
            'المنظم': eventData.organizer,
            'الحالة': eventData.status,
            'السعة': eventData.capacity,
            'عدد التسجيلات': eventData.registrationCount,
            'معرف التسجيل': '-',
            'حالة التسجيل': '-',
            'تاريخ التسجيل': '-',
            'معرف المستخدم': '-',
            'اسم المستخدم': '-',
            'بريد المستخدم': '-',
            'دور المستخدم': '-'
          });
        } else {
          // Add event with each registration
          for (const reg of event.registrations) {
            csvRows.push({
              'معرف الفعالية': eventData.id,
              'عنوان الفعالية': eventData.title,
              'نوع الفعالية': eventData.eventType,
              'تاريخ البدء': eventData.startDate,
              'تاريخ الانتهاء': eventData.endDate,
              'الموقع': eventData.location,
              'المنظم': eventData.organizer,
              'الحالة': eventData.status,
              'السعة': eventData.capacity,
              'عدد التسجيلات': eventData.registrationCount,
              'معرف التسجيل': reg.id,
              'حالة التسجيل': reg.status,
              'تاريخ التسجيل': reg.createdAt.toISOString().split('T')[0],
              'معرف المستخدم': reg.userId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              'اسم المستخدم': (reg as any).user?.name || '-',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              'بريد المستخدم': (reg as any).user?.email || '-',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              'دور المستخدم': (reg as any).user?.role || '-'
            });
          }
        }
      }
      
      filename = 'events-with-registrations.csv';
      
      return createCSVResponse({
        headers,
        data: csvRows,
        delimiter,
        filename
      });
    } else {
      // Simple events-only CSV - Arabic headers
      const headers = [
        'معرف الفعالية',
        'العنوان',
        'الوصف',
        'نوع الفعالية',
        'تاريخ البدء',
        'تاريخ الانتهاء',
        'الموقع',
        'المنظم',
        'الموعد النهائي للتسجيل',
        'السعة',
        'الحالة',
        'عدد التسجيلات',
        'تاريخ الإنشاء'
      ];

      // Map data to object format for CSV utility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const csvRows = formattedEvents.map((event: any) => ({
        'معرف الفعالية': event.id,
        'العنوان': event.title,
        'الوصف': event.description,
        'نوع الفعالية': event.eventType,
        'تاريخ البدء': event.startDate,
        'تاريخ الانتهاء': event.endDate,
        'الموقع': event.location,
        'المنظم': event.organizer,
        'الموعد النهائي للتسجيل': event.registrationDeadline,
        'السعة': event.capacity,
        'الحالة': event.status,
        'عدد التسجيلات': event.registrationCount,
        'تاريخ الإنشاء': event.createdAt
      }));

      filename = 'events.csv';
      
      return createCSVResponse({
        headers,
        data: csvRows,
        delimiter,
        filename
      });
    }
  } catch (error) {
    console.error('Error exporting events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
