import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { StorageService } from '@/lib/services/storage-service';

export const dynamic = 'force-dynamic';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const avatar = formData.get('avatar') as File | null;

    if (!avatar) {
      return NextResponse.json({ error: 'No avatar file provided' }, { status: 400 });
    }
    if (!ALLOWED_FILE_TYPES.includes(avatar.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }
    if (avatar.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit of 2MB.' },
        { status: 400 }
      );
    }

    const fileExtension = avatar.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${user.userId}.${fileExtension}`;
    const buffer = Buffer.from(await avatar.arrayBuffer());

    const result = await StorageService.upload('avatars', fileName, buffer, avatar.type);

    await prisma.profile.upsert({
      where:  { userId: user.userId },
      update: { avatar: result.url },
      create: { userId: user.userId, avatar: result.url },
    });

    return NextResponse.json({ message: 'Avatar uploaded successfully', avatar: result.url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'An error occurred while uploading avatar' }, { status: 500 });
  }
}
