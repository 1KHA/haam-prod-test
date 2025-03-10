import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, UserRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if password is strong enough
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if role is valid
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any, // Type assertion to bypass type checking
      },
    });

    // Create basic profile
    await prisma.profile.create({
      data: {
        userId: user.id,
      },
    });

    // Create role-specific profile
    switch (role) {
      case UserRole.PARTICIPANT:
        await prisma.participantProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;
      case UserRole.STARTUP:
        await prisma.startupProfile.create({
          data: {
            userId: user.id,
            companyName: body.companyName || 'Default Company Name',
          },
        });
        break;
      case UserRole.MENTOR:
        await prisma.mentorProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;
      case UserRole.INVESTOR:
        await prisma.investorProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;
      case UserRole.JUDGE:
        await prisma.judgeProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;
      case UserRole.ADMIN:
        await prisma.adminProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;
      case UserRole.PROGRAM_MANAGER:
        await prisma.programManagerProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;
      case UserRole.ACCELERATOR:
        // Skip creating accelerator profile for now
        // We'll handle this in a separate API endpoint
        break;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
