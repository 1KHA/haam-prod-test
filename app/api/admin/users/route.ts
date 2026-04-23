import { NextRequest, NextResponse } from 'next/server';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { hashPassword } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';

export const dynamic = 'force-dynamic';
function normalizeApprovalStatus(status?: string | null) {
  if (status === 'PENDING') {
    return 'PENDING_APPROVAL';
  }

  if (status === 'ACTIVE' || status === 'PENDING_APPROVAL' || status === 'SUSPENDED') {
    return status;
  }

  return 'ACTIVE';
}

/**
 * GET /api/admin/users
 * Get users list for admin (for email sending, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'users', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '0');
    const offsetParam = parseInt(searchParams.get('offset') || '0');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const offset = Number.isFinite(page) && page > 0
      ? (page - 1) * limit
      : offsetParam;

    // Build where clause
    const where: Prisma.UserWhereInput = {};
    if (role) {
      where.role = role as UserRole;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Get users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          specialization: true,
          approvalStatus: true,
          createdAt: true,
          programManagerProfile: {
            select: {
              programs: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      createdAt: user.createdAt,
      status: normalizeApprovalStatus(user.approvalStatus),
      program: user.programManagerProfile?.programs || '-',
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total,
      limit,
      offset,
      pagination: {
        total,
        limit,
        offset,
        page: Number.isFinite(page) && page > 0 ? page : Math.floor(offset / limit) + 1,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'users', action: 'create' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { name, email, password, role: rawRole, specialization } = await request.json();

    if (!name || !email || !password || !rawRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Map Arabic display names to Prisma enum values
    const roleMap: Record<string, UserRole> = {
      'مدير النظام': UserRole.ADMIN,
      'مدير برنامج': UserRole.PROGRAM_MANAGER,
      'موجه': UserRole.MENTOR,
      'مستثمر': UserRole.INVESTOR,
      'رائد أعمال': UserRole.ENTREPRENEUR,
      'محكم': UserRole.MENTOR,
    };
    const role = (roleMap[rawRole] ?? rawRole) as UserRole;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        specialization: specialization || null,
        approvalStatus: 'ACTIVE',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Fire user_created email scenario if enabled
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scenario = await (prisma as any).emailScenarioSettings.findUnique({
        where: { scenarioType: 'user_created' },
        include: { template: { select: { name: true } } },
      });
      if (scenario?.isEnabled && scenario.template?.name) {
        const sendToRoles: string[] = (() => {
          try { return JSON.parse(scenario.sendToRoles || '["all"]'); }
          catch { return ['all']; }
        })();

        // Always send welcome email to the newly created user
        await EmailService.sendToUser({
          userId: user.id,
          templateName: scenario.template.name,
          variables: { user: { name: user.name, email: user.email }, tempPassword: password },
          scenarioType: 'user_created',
        });

        // Also notify admins if sendToRoles includes 'admin' or 'all'
        if (sendToRoles.includes('admin') || sendToRoles.includes('all')) {
          const admins = await prisma.user.findMany({
            where: { role: 'ADMIN', id: { not: user.id } },
            select: { id: true },
          });
          for (const admin of admins) {
            await EmailService.sendToUser({
              userId: admin.id,
              templateName: scenario.template.name,
              variables: { user: { name: user.name, email: user.email }, tempPassword: password },
              scenarioType: 'user_created',
            });
          }
        }
      }
    } catch (emailError) {
      console.error('[Admin Users POST] Failed to send user_created email:', emailError);
    }

    return NextResponse.json({ success: true, ...user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
