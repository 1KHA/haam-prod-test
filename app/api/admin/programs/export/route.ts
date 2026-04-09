import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET /api/admin/programs/export - Export programs data
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'programs',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    // Build filter conditions
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status && status.toLowerCase() !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    if (type && type.toLowerCase() !== 'all') {
      whereClause.type = type.toUpperCase();
    }

    // Fetch programs with related data
    const programs = await prisma.program.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        cohorts: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            _count: {
              select: {
                members: true,
                mentors: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the data for export
    const formattedPrograms = programs.map((program: any) => {
      // Map status for clarity
      const statusMap: Record<string, string> = {
        'DRAFT': 'مسودة',
        'ACTIVE': 'نشط',
        'COMPLETED': 'مكتمل',
        'CANCELLED': 'ملغي'
      };

      // Map type for clarity
      const typeMap: Record<string, string> = {
        'ACCELERATOR': 'مسرع أعمال',
        'INCUBATOR': 'حاضنة أعمال',
        'WORKSHOP': 'ورشة عمل',
        'BOOTCAMP': 'معسكر تدريبي',
        'HACKATHON': 'هاكاثون',
        'OTHER': 'أخرى'
      };

      // Format dates
      const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      // Count active cohorts
      const activeCohortsCount = program.cohorts.filter((c: any) => c.status === 'ACTIVE').length;
      
      // Calculate total startups and mentors
      const totalStartups = program.cohorts.reduce((acc: number, cohort: any) => acc + (cohort._count.members || 0), 0);
      const totalMentors = program.cohorts.reduce((acc: number, cohort: any) => acc + (cohort._count.mentors || 0), 0);

      return {
        id: program.id,
        name: program.name,
        description: program.description || '-',
        startDate: formatDate(program.startDate),
        endDate: formatDate(program.endDate),
        location: program.location || '-',
        type: typeMap[program.type] || program.type,
        status: statusMap[program.status] || program.status,
        capacity: program.capacity || '-',
        applicationDeadline: formatDate(program.applicationDeadline),
        requirements: program.requirements || '-',
        benefits: program.benefits || '-',
        creator: program.creator.name,
        creatorEmail: program.creator.email,
        cohortsCount: program.cohorts.length,
        activeCohortsCount: activeCohortsCount,
        totalStartups: totalStartups,
        totalMentors: totalMentors,
        createdAt: formatDate(program.createdAt.toString()),
        updatedAt: formatDate(program.updatedAt.toString())
      };
    });

    // Convert to CSV
    const headers = [
      'معرف البرنامج',
      'اسم البرنامج',
      'الوصف',
      'تاريخ البدء',
      'تاريخ الانتهاء',
      'الموقع',
      'النوع',
      'الحالة',
      'السعة',
      'الموعد النهائي للتقديم',
      'المتطلبات',
      'الفوائد',
      'منشئ البرنامج',
      'بريد المنشئ',
      'عدد الدفعات',
      'عدد الدفعات النشطة',
      'إجمالي الشركات الناشئة',
      'إجمالي الموجهين',
      'تاريخ الإنشاء',
      'تاريخ التحديث'
    ];

    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    formattedPrograms.forEach((program: any) => {
      const row = [
        program.id,
        `"${program.name.replace(/"/g, '""')}"`, // Escape quotes in names
        `"${program.description.replace(/"/g, '""')}"`,
        program.startDate,
        program.endDate,
        `"${program.location.replace(/"/g, '""')}"`,
        `"${program.type}"`,
        `"${program.status}"`,
        program.capacity,
        program.applicationDeadline,
        `"${program.requirements.replace(/"/g, '""')}"`,
        `"${program.benefits.replace(/"/g, '""')}"`,
        `"${program.creator.replace(/"/g, '""')}"`,
        `"${program.creatorEmail}"`,
        program.cohortsCount,
        program.activeCohortsCount,
        program.totalStartups,
        program.totalMentors,
        program.createdAt,
        program.updatedAt
      ];
      csv += row.join(',') + '\n';
    });

    // Set headers for file download
    const headers_response = new Headers();
    headers_response.set('Content-Type', 'text/csv; charset=utf-8');
    headers_response.set('Content-Disposition', 'attachment; filename="programs-export.csv"');

    // Add UTF-8 BOM to ensure proper encoding
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;
    
    return new NextResponse(csvWithBom, {
      status: 200,
      headers: headers_response,
    });
  } catch (error) {
    console.error('Error exporting programs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
