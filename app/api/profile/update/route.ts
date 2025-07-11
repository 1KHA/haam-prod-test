import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

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

    // Get request body
    const body = await request.json();
    const { personal, company } = body;

    console.log('Updating profile with data:', { personal, company });

    // Update user data
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        name: personal.name,
        specialization: personal.specialization,
      },
    });

    // Update profile data with position field
    await prisma.profile.update({
      where: { userId: user.userId },
      data: {
        phone: personal.phone,
        bio: personal.bio,
        position: personal.position, // Now using the dedicated position field
        address: company?.address,
      },
    });

    // Update role-specific profile based on schema
    if (user.role === UserRole.ENTREPRENEUR) {
      await prisma.entrepreneurProfile.upsert({
        where: { userId: user.userId },
        update: {
          organizationName: company.name,
          website: company.website,
          description: company.description,
          industry: company.industry,
        },
        create: {
          userId: user.userId,
          organizationName: company.name || '',
          website: company.website,
          description: company.description,
          industry: company.industry,
        },
      });
    }

    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        profile: true,
        mentorProfile: user.role === UserRole.MENTOR,
        entrepreneurProfile: user.role === UserRole.ENTREPRENEUR,
        participantProfile: user.role === UserRole.PARTICIPANT,
        investorProfile: user.role === UserRole.INVESTOR,
        judgeProfile: user.role === UserRole.JUDGE,
        adminProfile: user.role === UserRole.ADMIN,
        programManagerProfile: user.role === UserRole.PROGRAM_MANAGER,
      },
    });

    // Return updated user data
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}
