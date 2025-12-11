import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import path from 'path';

// GET /api/admin/reports/print - Get a printable version of a report
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
    const reportId = searchParams.get('id');
    
    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Fetch report by ID
    const report = await prisma.report.findUnique({
      where: { id: reportId },
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

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Update print count
    await prisma.report.update({
      where: { id: reportId },
      data: {
        printCount: { increment: 1 },
      },
    });

    // Log the print action
    console.log(`Report printed by user: ${userId}, Report ID: ${reportId}`);

    // Generate HTML for printing
    const htmlContent = generatePrintableHTML(report);

    // Return HTML content with appropriate headers
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating printable report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML for a printable version of the report
 */
function generatePrintableHTML(report: any): string {
  const createdDate = new Date(report.createdAt).toLocaleDateString('ar-SA');
  const updatedDate = new Date(report.updatedAt).toLocaleDateString('ar-SA');
  const publishDate = report.publishDate 
    ? new Date(report.publishDate).toLocaleDateString('ar-SA')
    : 'غير محدد';
  
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير: ${report.title}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 1cm;
      }
    }
    
    @font-face {
      font-family: 'Tajawal';
      src: url('/fonts/Tajawal-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    
    @font-face {
      font-family: 'Tajawal';
      src: url('/fonts/Tajawal-Bold.woff2') format('woff2');
      font-weight: bold;
      font-style: normal;
    }
    
    body {
      font-family: 'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 2cm;
      max-width: 21cm;
      margin: 0 auto;
      direction: rtl;
    }
    
    .header {
      text-align: center;
      margin-bottom: 2em;
      border-bottom: 1px solid #ddd;
      padding-bottom: 1em;
    }
    
    .logo {
      max-width: 150px;
      margin-bottom: 1em;
    }
    
    h1 {
      font-size: 24px;
      margin: 0;
      color: #444;
    }
    
    .report-meta {
      display: flex;
      justify-content: space-between;
      margin: 2em 0;
      flex-wrap: wrap;
      font-size: 14px;
    }
    
    .meta-item {
      margin-bottom: 0.5em;
      width: 48%;
    }
    
    .meta-label {
      font-weight: bold;
      margin-left: 0.5em;
    }
    
    .report-content {
      margin: 2em 0;
      white-space: pre-wrap;
    }
    
    .report-footer {
      margin-top: 3em;
      border-top: 1px solid #ddd;
      padding-top: 1em;
      font-size: 12px;
      text-align: center;
      color: #777;
    }
    
    .status {
      display: inline-block;
      padding: 0.25em 0.5em;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .status-draft {
      background-color: #f8f9fa;
      color: #6c757d;
    }
    
    .status-published {
      background-color: #d1e7dd;
      color: #0f5132;
    }
    
    .status-archived {
      background-color: #f8d7da;
      color: #842029;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    @media print {
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">طباعة التقرير</button>
  
  <div class="header">
    <img src="/logo.png" alt="شعار" class="logo">
    <h1>${report.title}</h1>
  </div>
  
  <div class="report-meta">
    <div class="meta-item">
      <span class="meta-label">التصنيف:</span>
      <span>${report.category}</span>
    </div>
    
    <div class="meta-item">
      <span class="meta-label">الصيغة:</span>
      <span>${report.format}</span>
    </div>
    
    <div class="meta-item">
      <span class="meta-label">الحالة:</span>
      <span class="status status-${report.status === 'published' ? 'published' : report.status === 'archived' ? 'archived' : 'draft'}">${report.status}</span>
    </div>
    
    <div class="meta-item">
      <span class="meta-label">تاريخ النشر:</span>
      <span>${publishDate}</span>
    </div>
    
    <div class="meta-item">
      <span class="meta-label">المنشئ:</span>
      <span>${report.createdBy?.name || 'غير معروف'}</span>
    </div>
    
    <div class="meta-item">
      <span class="meta-label">تاريخ الإنشاء:</span>
      <span>${createdDate}</span>
    </div>
    
    <div class="meta-item">
      <span class="meta-label">آخر تحديث:</span>
      <span>${updatedDate}</span>
    </div>
    
    ${report.scheduledTime ? `
    <div class="meta-item">
      <span class="meta-label">الوقت المجدول:</span>
      <span>${report.scheduledTime}</span>
    </div>` : ''}
  </div>
  
  <div class="report-content">
    ${report.description}
  </div>
  
  <div class="report-footer">
    <p>تم إنشاء هذا التقرير من منصة هام | HAAM - جميع الحقوق محفوظة &copy; ${new Date().getFullYear()}</p>
    <p>رقم التقرير: ${report.id}</p>
  </div>
  
  <script>
    // Auto-print when the page loads
    window.onload = function() {
      // Small delay to ensure the content is fully rendered
      setTimeout(function() {
        // Automatically open the print dialog when the page loads
        window.print();
      }, 1000);
    };
    
    // Log print status for debugging
    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      mediaQueryList.addEventListener('change', function(mql) {
        if (!mql.matches) {
          console.log('Finished printing');
        }
      });
    }
  </script>
</body>
</html>`;
}
