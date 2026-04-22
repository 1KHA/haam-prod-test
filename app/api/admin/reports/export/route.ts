import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { createCSVResponse, getDelimiterFromRequest } from '@/lib/csv-utils';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
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

    // Get delimiter from request parameters
    const delimiter = getDelimiterFromRequest(searchParams);

    // Define CSV headers
    const headers = [
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
    ];
    
    // Map reports to CSV data format
    const csvData = reports.map(report => ({
      "الرقم التعريفي": report.id,
      "العنوان": report.title,
      "الوصف": report.description,
      "التصنيف": report.category,
      "الصيغة": report.format,
      "الحالة": report.status,
      "تاريخ النشر": report.publishDate ? new Date(report.publishDate).toLocaleDateString('ar-SA') : '',
      "الوقت المجدول": report.scheduledTime || '',
      "عدد مرات التنزيل": report.downloadCount,
      "المنشئ": report.createdBy?.name || '',
      "تاريخ الإنشاء": new Date(report.createdAt).toLocaleString('ar-SA'),
      "تاريخ التحديث": new Date(report.updatedAt).toLocaleString('ar-SA')
    }));
    
    // Update download count for each exported report
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await Promise.all(reports.map((report: any) => 
      prisma.report.update({
        where: { id: report.id },
        data: { downloadCount: { increment: 1 } }
      })
    ));
    
    // First check if they requested an Excel format
    if (exportFormat === 'xlsx') {
      // For simplicity, we'll redirect to the CSV version for now
      // In a production system, you'd convert the data to XLSX format here
      console.log('XLSX export requested, but providing CSV as fallback');
    }
    
    // Generate a filename with the current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `reports-export-${currentDate}.csv`;
    
    // Use the CSV utility to create proper response
    return createCSVResponse({
      headers,
      data: csvData,
      delimiter,
      filename
    });
  } catch (error) {
    console.error('Error exporting reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
