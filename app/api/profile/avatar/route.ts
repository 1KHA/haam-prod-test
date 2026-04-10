import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// Define the allowed image types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Maximum file size (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// POST /api/profile/avatar - Upload avatar image
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const avatar = formData.get('avatar') as File | null;
    
    if (!avatar) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(avatar.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }
    
    // Check file size
    if (avatar.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit of 2MB.' },
        { status: 400 }
      );
    }
    
    // Create directory for uploads if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadsDir, { recursive: true });
    
    // Generate unique filename
    const fileExtension = avatar.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${user.userId}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    
    // Save file
    const fileBuffer = await avatar.arrayBuffer();
    await writeFile(filePath, Buffer.from(fileBuffer));
    
    // Set path for database
    const avatarUrl = `/uploads/avatars/${fileName}`;
    
    // Update user profile with new avatar URL
    await prisma.profile.update({
      where: { userId: user.userId },
      data: { avatar: avatarUrl },
    });
    
    // Return success response
    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl,
    });
    
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred while uploading avatar' },
      { status: 500 }
    );
  }
}
