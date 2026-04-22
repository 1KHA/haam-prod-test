import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// POST /api/admin/reports/filter - Advanced filtering for reports
export async function POST(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'reports', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Extract filter parameters with defaults
    const {
      search = '',
      categories = [],
      formats = [],
      statuses = [],
      createdBy = [],
      dateRange = null,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = body;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};
    
    // Text search
    if (search && search.trim() !== '') {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    // Category filter
    if (categories && categories.length > 0) {
      // Handle both array of categories and string with comma-separated values
      if (typeof categories === 'string' && categories.includes(',')) {
        const categoryList = categories.split(',').map(c => c.trim());
        whereClause.category = { in: categoryList };
      } else {
        whereClause.category = { in: Array.isArray(categories) ? categories : [categories] };
      }
    }
    
    // Format filter
    if (formats && formats.length > 0) {
      // Handle both array of formats and string with comma-separated values
      if (typeof formats === 'string' && formats.includes(',')) {
        const formatList = formats.split(',').map(f => f.trim());
        whereClause.format = { in: formatList };
      } else {
        whereClause.format = { in: Array.isArray(formats) ? formats : [formats] };
      }
    }
    
    // Status filter
    if (statuses && statuses.length > 0) {
      // Handle both array of statuses and string with comma-separated values
      if (typeof statuses === 'string' && statuses.includes(',')) {
        const statusList = statuses.split(',').map(s => s.trim());
        whereClause.status = { in: statusList };
      } else {
        whereClause.status = { in: Array.isArray(statuses) ? statuses : [statuses] };
      }
    }
    
    // Creator filter
    if (createdBy && createdBy.length > 0) {
      whereClause.createdById = { in: createdBy };
    }
    
    // Date range filter
    if (dateRange && (dateRange.start || dateRange.end)) {
      whereClause.createdAt = {};
      
      if (dateRange.start) {
        whereClause.createdAt.gte = new Date(dateRange.start);
      }
      
      if (dateRange.end) {
        // Add one day to include the end date fully
        const endDate = new Date(dateRange.end);
        endDate.setDate(endDate.getDate() + 1);
        whereClause.createdAt.lt = endDate;
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Prepare sort object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;
    
    // Fetch reports with filtering, sorting and pagination
    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Get total count for pagination
    const total = await prisma.report.count({
      where: whereClause,
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    
    // Get available filter options
    const [
      allCategories, 
      allFormats, 
      allStatuses, 
      allCreators
    ] = await Promise.all([
      prisma.report.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.report.groupBy({
        by: ['format'],
        _count: true,
      }),
      prisma.report.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.user.findMany({
        where: {
          reports: { some: {} },
        },
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              reports: true,
            },
          },
        },
      }),
    ]);
    
    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
        hasPrev: page > 1,
      },
      filterOptions: {
        categories: allCategories.map((c: { category: string, _count: number }) => (
          { value: c.category, count: c._count }
        )),
        formats: allFormats.map((f: { format: string, _count: number }) => (
          { value: f.format, count: f._count }
        )),
        statuses: allStatuses.map((s: { status: string, _count: number }) => (
          { value: s.status, count: s._count }
        )),
        creators: allCreators.map((c: { 
          id: string, 
          name: string, 
          email: string, 
          _count: { reports: number } 
        }) => ({ 
          id: c.id, 
          name: c.name, 
          email: c.email, 
          count: c._count.reports 
        })),
      },
    });
  } catch (error) {
    console.error('Error filtering reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/reports/filter/options - Get filter options for reports
export async function GET(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'reports', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Get available filter options
    const [
      allCategories, 
      allFormats, 
      allStatuses, 
      allCreators
    ] = await Promise.all([
      prisma.report.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.report.groupBy({
        by: ['format'],
        _count: true,
      }),
      prisma.report.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.user.findMany({
        where: {
          reports: { some: {} },
        },
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              reports: true,
            },
          },
        },
      }),
    ]);
    
    // Get date statistics
    const oldestReport = await prisma.report.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    
    const newestReport = await prisma.report.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    
    return NextResponse.json({
      filterOptions: {
        categories: allCategories.map((c: { category: string, _count: number }) => (
          { value: c.category, count: c._count }
        )),
        formats: allFormats.map((f: { format: string, _count: number }) => (
          { value: f.format, count: f._count }
        )),
        statuses: allStatuses.map((s: { status: string, _count: number }) => (
          { value: s.status, count: s._count }
        )),
        creators: allCreators.map((c: { 
          id: string, 
          name: string, 
          email: string, 
          _count: { reports: number } 
        }) => ({ 
          id: c.id, 
          name: c.name, 
          email: c.email, 
          count: c._count.reports 
        })),
        dateRange: {
          min: oldestReport?.createdAt || null,
          max: newestReport?.createdAt || null,
        }
      },
    });
  } catch (error) {
    console.error('Error getting report filter options:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
