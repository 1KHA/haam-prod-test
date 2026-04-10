import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, UserRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, specialization, phone, organizationName } = body;

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
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم ورمز خاص' },
        { status: 400 }
      );
    }

    // Validate phone
    if (phone && /[a-zA-Z]/.test(phone)) {
      return NextResponse.json(
        { error: 'رقم الهاتف لا يجب أن يحتوي على أحرف إنجليزية' },
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

    // Only ENTREPRENEUR can register publicly — all other roles must be created by admin
    const ALLOWED_PUBLIC_ROLES: UserRole[] = [UserRole.ENTREPRENEUR];
    if (!ALLOWED_PUBLIC_ROLES.includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'التسجيل العام متاح لرواد الأعمال فقط. يرجى التواصل مع المسؤول لإنشاء حسابات الأدوار الأخرى.' },
        { status: 403 }
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

    // Create user with specialization
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any, // Type assertion to bypass type checking
        specialization, // Add specialization directly
        approvalStatus: role === UserRole.ENTREPRENEUR ? "PENDING_APPROVAL" : "ACTIVE",
      } as any,
    });

    console.log('User created with specialization:', specialization);

    // Create basic profile with phone
    await prisma.profile.create({
      data: {
        userId: user.id,
        phone, // Add phone field directly
      },
    });

    console.log('Profile created with phone:', phone);

    // Create role-specific profile
    switch (role) {
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
      case UserRole.ENTREPRENEUR:
        await prisma.entrepreneurProfile.create({
          data: {
            userId: user.id,
            organizationName: organizationName || 'Default Entrepreneur Name',
          },
        });
        break;
    }

    // Fetch the complete user data with profile
    const completeUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
      },
    });

    console.log('Complete user data:', completeUser);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Return user data and token
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      specialization: user.specialization,
      profile: completeUser?.profile,
    };

    if (role === UserRole.ENTREPRENEUR) {
      return NextResponse.json({
        pending: true,
        message: "تم إنشاء حسابك بنجاح. في انتظار موافقة المسؤول للدخول إلى لوحة التحكم.",
      }, { status: 201 });
    }
    // For other roles (admin-created, shouldn't reach here via public signup)
    return NextResponse.json({ user: userData, token });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
