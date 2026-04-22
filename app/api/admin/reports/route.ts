import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// GET /api/admin/reports - Get reports with filtering
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

    // Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const format = searchParams.get('format') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (search) {
      // SQLite doesn't support 'insensitive' mode, using standard contains
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Handle comma-separated categories
    if (category) {
      // If category contains comma, treat it as multiple possible values
      if (category.includes(',')) {
        const categories = category.split(',').map(c => c.trim());
        whereClause.category = { in: categories };
      } else {
        whereClause.category = category;
      }
    }

    // Handle comma-separated status values
    if (status) {
      // If status contains comma, treat it as multiple possible values
      if (status.includes(',')) {
        const statuses = status.split(',').map(s => s.trim());
        whereClause.status = { in: statuses };
      } else {
        whereClause.status = status;
      }
    }

    if (format) {
      whereClause.format = format;
    }

    // Fetch reports
    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
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
    const hasMore = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
        hasPrev,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/reports - Create a new report
export async function POST(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'reports', action: 'add' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Get user ID from permission check
    const userId = permissionCheck.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    console.log('Creating report with data:', body);
    
    // Validate required fields
    const { title, description, category, format, status } = body;
    
    if (!title || !description || !category || !format || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        format,
        status,
        publishDate: body.publishDate ? new Date(body.publishDate) : null,
        scheduledTime: body.scheduledTime,
        fileUrl: body.fileUrl,
        filePath: body.filePath,
        fileSize: body.fileSize,
        createdById: userId,
      },
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

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
