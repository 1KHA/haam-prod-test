import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// POST /api/admin/reports/upload - Upload a file for a report
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

    // Get the user ID
    const userId = permissionCheck.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    // Check content type
    const contentType = req.headers.get('content-type') || '';
    
    // More lenient content type check - accept anything that mentions 'multipart/form-data'
    // Many clients and libraries send this with boundary information
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      console.error('Invalid content type:', contentType);
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data', received: contentType },
        { status: 400 }
      );
    }

    console.log('Processing multipart/form-data request with content-type:', contentType);

    // Get form data
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error('Error parsing form data:', error);
      return NextResponse.json(
        { error: 'Failed to parse multipart form data', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }
    
    const file = formData.get('file') as File | null;
    const reportId = formData.get('reportId') as string | null;
    
    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed (10MB)' },
        { status: 400 }
      );
    }
    
    // Check if report exists if reportId is provided
    if (reportId) {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
      });
      
      if (!report) {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        );
      }
    }
    
    // Get file details
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    
    // Generate a unique filename
    const uniqueFileName = `${randomUUID()}-${fileName}`;
    
    // Define upload directory (ensure it exists)
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'reports');
    await mkdir(uploadDir, { recursive: true });
    
    // Define file path
    const filePath = join(uploadDir, uniqueFileName);
    const publicFilePath = `/uploads/reports/${uniqueFileName}`;
    
    // Write file to disk
    await writeFile(filePath, fileBuffer);
    
    // If reportId is provided, update the existing report
    if (reportId) {
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
          fileUrl: publicFilePath,
          filePath: publicFilePath,
          fileSize: fileSize,
        },
      });
      
      return NextResponse.json({
        success: true,
        file: {
          name: fileName,
          type: fileType,
          size: fileSize,
          url: publicFilePath,
          reportId: updatedReport.id,
        },
      });
    } 
    // Otherwise, just return the file info for a new report
    else {
      return NextResponse.json({
        success: true,
        file: {
          name: fileName,
          type: fileType,
          size: fileSize,
          url: publicFilePath,
        },
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
