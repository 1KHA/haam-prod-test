import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { randomUUID } from 'crypto';
import { StorageService } from '@/lib/services/storage-service';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const permissionCheck = await checkPermission(req, { category: 'reports', action: 'add' });
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    if (!permissionCheck.userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data', received: contentType },
        { status: 400 }
      );
    }

    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse multipart form data', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    const reportId = formData.get('reportId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed (10MB)' }, { status: 400 });
    }

    if (reportId) {
      const report = await prisma.report.findUnique({ where: { id: reportId } });
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFileName = `${randomUUID()}-${file.name}`;
    const result = await StorageService.upload('reports', uniqueFileName, buffer, file.type || 'application/octet-stream');

    if (reportId) {
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: { fileUrl: result.url, filePath: result.url, fileSize: file.size },
      });
      return NextResponse.json({
        success: true,
        file: { name: file.name, type: file.type, size: file.size, url: result.url, reportId: updatedReport.id },
      });
    }

    return NextResponse.json({
      success: true,
      file: { name: file.name, type: file.type, size: file.size, url: result.url },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
