import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Get user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        profile: true,
        mentorProfile: user.role === UserRole.MENTOR,
        investorProfile: user.role === UserRole.INVESTOR,
        adminProfile: user.role === UserRole.ADMIN,
        programManagerProfile: user.role === UserRole.PROGRAM_MANAGER,
        entrepreneurProfile: user.role === UserRole.ENTREPRENEUR,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = userData;

    // Return user data
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}
