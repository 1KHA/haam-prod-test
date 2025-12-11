import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { format } from 'date-fns';

// GET /api/admin/reports/export - Export reports
export async function GET(req: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(req.url);
    
    // Check permission - support both header and URL token
    const token = searchParams.get('token');
    let permissionCheck;
    
    if (token) {
      // If token is in URL, use it for authorization
      req.headers.set('Authorization', `Bearer ${token}`);
      permissionCheck = await checkPermission(req, { category: 'reports', action: 'view' });
    } else {
      // Otherwise use the regular header
      permissionCheck = await checkPermission(req, { category: 'reports', action: 'view' });
    }
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Get userId for logging
    const userId = permissionCheck.userId;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const format = searchParams.get('format') || '';
    const exportFormat = searchParams.get('exportFormat') || 'xlsx'; // Default to XLSX

    // Build filter conditions
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (status) {
      whereClause.status = status;
    }

    if (format) {
      whereClause.format = format;
    }

    // Fetch reports with filter criteria
    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
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

    // Log the export action
    console.log(`Reports exported by user: ${userId} Filter criteria:`, {
      search,
      category,
      status,
      format
    });

    // Generate CSV header
    const csvHeader = [
      "الرقم التعريفي",
      "العنوان",
      "الوصف",
      "التصنيف",
      "الصيغة",
      "الحالة",
      "تاريخ النشر",
      "الوقت المجدول",
      "عدد مرات التنزيل",
      "المنشئ",
      "تاريخ الإنشاء",
      "تاريخ التحديث"
    ].join(',');
    
    // Generate CSV rows
    const csvRows = reports.map((report: any) => [
      `"${report.id}"`,
      `"${report.title}"`,
      `"${report.description.replace(/"/g, '""')}"`,
      `"${report.category}"`,
      `"${report.format}"`,
      `"${report.status}"`,
      `"${report.publishDate ? new Date(report.publishDate).toLocaleDateString('ar-SA') : ''}"`,
      `"${report.scheduledTime || ''}"`,
      `"${report.downloadCount}"`,
      `"${report.createdBy?.name || ''}"`,
      `"${new Date(report.createdAt).toLocaleString('ar-SA')}"`,
      `"${new Date(report.updatedAt).toLocaleString('ar-SA')}"`
    ].join(','));
    
    // Combine header and rows
    const csv = [csvHeader, ...csvRows].join('\n');
    
    // Update download count for each exported report
    await Promise.all(reports.map((report: any) => 
      prisma.report.update({
        where: { id: report.id },
        data: { downloadCount: { increment: 1 } }
      })
    ));
    
    // Generate a filename with the current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `reports-export-${currentDate}.csv`;
    
    // First check if they requested an Excel format
    if (exportFormat === 'xlsx') {
      // For simplicity, we'll redirect to the CSV version for now
      // In a production system, you'd convert the data to XLSX format here
      console.log('XLSX export requested, but providing CSV as fallback');
    }
    
    // Return CSV with proper headers for download
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error exporting reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
