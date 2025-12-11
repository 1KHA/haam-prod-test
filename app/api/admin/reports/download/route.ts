import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import path from 'path';

// GET /api/admin/reports/download - Download a report file
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
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Extract file path
    const filePath = report.filePath;
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path not found for this report' },
        { status: 404 }
      );
    }

    // Resolve the absolute path by joining with the project root
    const absoluteFilePath = path.join(process.cwd(), 'public', filePath);
    
    // Determine content type based on file format
    let contentType = 'application/octet-stream'; // Default
    
    if (report.format === 'PDF') {
      contentType = 'application/pdf';
    } else if (report.format === 'XLSX') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (report.format === 'PPTX') {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (report.format === 'CSV') {
      contentType = 'text/csv';
    }

    // Generate filename for download
    const filename = path.basename(filePath);

    // Update download count
    await prisma.report.update({
      where: { id: reportId },
      data: {
        downloadCount: { increment: 1 },
      },
    });

    // Log the download action
    console.log(`Report downloaded by user: ${userId}, Report ID: ${reportId}`);

    // We'll use Next.js static file serving capabilities
    // If the file is in the public directory, we can simply redirect to its URL
    const publicPath = filePath.replace(/^public\//, '');
    
    // Build the URL to the file 
    const fileUrl = new URL(`/${publicPath}`, req.url);
    
    // Add the download parameters to the URL
    fileUrl.searchParams.set('download', 'true');
    fileUrl.searchParams.set('filename', filename);
    
    // Redirect to the file URL
    return NextResponse.redirect(fileUrl, 307);
  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
