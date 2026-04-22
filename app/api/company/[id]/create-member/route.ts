import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, hashPassword } from '@/lib/auth';

// POST /api/company/[id]/create-member
// Creates a new user account and associates them with the startup
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = params.id;
    const authHeader = request.headers.get('authorization');

    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the requester owns this startup
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { creatorId: true }
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    if (startup.creatorId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role = 'Member' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
    }

    // Check if email already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: 'ENTREPRENEUR' as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        approvalStatus: 'PENDING_APPROVAL' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    // Create basic profile
    await prisma.profile.create({
      data: { userId: newUser.id }
    });

    // Create entrepreneur profile
    await prisma.entrepreneurProfile.create({
      data: { userId: newUser.id, organizationName: name }
    });

    // Associate with the startup
    await prisma.companyMember.create({
      data: {
        startupId,
        userId: newUser.id,
        role,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: 'ACTIVE' as any,
        joinedAt: new Date()
      }
    });

    return NextResponse.json({ userId: newUser.id, name: newUser.name, email: newUser.email }, { status: 201 });
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
