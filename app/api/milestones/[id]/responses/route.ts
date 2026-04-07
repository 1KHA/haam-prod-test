import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canViewStartupMilestones } from '@/lib/milestones';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function getMilestoneAccess(id: string, authHeader?: string | null) {
  const user = await isAuthenticated(authHeader || undefined);

  if (!user) {
    return { user: null, milestone: null, access: null };
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    select: {
      id: true,
      startupId: true,
      title: true,
    },
  });

  if (!milestone) {
    return { user, milestone: null, access: null };
  }

  const access = await canViewStartupMilestones(milestone.startupId, user);
  return { user, milestone, access };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, milestone, access } = await getMilestoneAccess(
      params.id,
      request.headers.get('authorization')
    );

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (!access?.canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const responses = await prisma.milestoneResponse.findMany({
      where: {
        milestoneId: params.id,
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      responses: responses.map((response) => ({
        id: response.id,
        message: response.message,
        fileName: response.fileName,
        fileUrl: response.fileUrl,
        fileType: response.fileType,
        fileSize: response.fileSize,
        createdAt: response.createdAt,
        submitter: response.submitter,
      })),
    });
  } catch (error) {
    console.error('Get milestone responses error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestone responses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, milestone, access } = await getMilestoneAccess(
      params.id,
      request.headers.get('authorization')
    );

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (!access?.canView || user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json({ error: 'Only entrepreneurs can respond to milestones' }, { status: 403 });
    }

    const formData = await request.formData();
    const message = (formData.get('message') as string | null)?.trim() || '';
    const file = formData.get('file') as File | null;

    if (!message && !file) {
      return NextResponse.json({ error: 'A message or file is required' }, { status: 400 });
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File size exceeds maximum allowed (10MB)' }, { status: 400 });
      }

      const uploadDir = join(process.cwd(), 'public', 'uploads', 'milestone-responses');
      await mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `${randomUUID()}-${file.name}`;
      const filePath = join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      await writeFile(filePath, fileBuffer);

      fileUrl = `/uploads/milestone-responses/${uniqueFileName}`;
      fileName = file.name;
      fileType = file.type;
      fileSize = file.size;
    }

    const response = await prisma.milestoneResponse.create({
      data: {
        milestoneId: params.id,
        submittedBy: user.userId,
        message: message || null,
        fileName,
        fileUrl,
        fileType,
        fileSize,
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      response: {
        id: response.id,
        message: response.message,
        fileName: response.fileName,
        fileUrl: response.fileUrl,
        fileType: response.fileType,
        fileSize: response.fileSize,
        createdAt: response.createdAt,
        submitter: response.submitter,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create milestone response error:', error);
    return NextResponse.json({ error: 'Failed to submit milestone response' }, { status: 500 });
  }
}
