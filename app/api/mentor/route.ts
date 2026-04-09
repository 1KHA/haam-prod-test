import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

// GET /api/mentor - Get list of all mentors (available to authenticated users)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const mentors = await prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        mentorProfile: {
          select: {
            expertise: true,
            experience: true,
            availability: true,
          },
        },
        profile: {
          select: {
            bio: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ mentors });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
