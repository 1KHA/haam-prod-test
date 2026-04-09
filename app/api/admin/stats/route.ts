import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'dashboard', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const [
      totalUsers,
      lastMonthUsers,
      usersByRole,
      activePrograms,
      upcomingEvents,
      totalStartups,
      recentNotifications,
      recentFunding,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { lte: lastMonth } } }),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.program.count({ where: { status: 'ACTIVE' } }),
      prisma.event.count({
        where: {
          status: 'published',
          startDate: { gte: now, lte: twoWeeksFromNow },
        },
      }),
      prisma.startup.count(),
      prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          message: true,
          createdAt: true,
          type: true,
        },
      }),
      prisma.funding.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          amount: true,
          startupName: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const userGrowth =
      lastMonthUsers > 0
        ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
        : 0;

    const roleMap: Record<string, number> = {};
    for (const group of usersByRole) {
      roleMap[group.role] = group._count.id;
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        growthPercent: userGrowth,
        byRole: {
          ENTREPRENEUR: roleMap['ENTREPRENEUR'] || 0,
          MENTOR: roleMap['MENTOR'] || 0,
          PROGRAM_MANAGER: roleMap['PROGRAM_MANAGER'] || 0,
          INVESTOR: roleMap['INVESTOR'] || 0,
          ADMIN: roleMap['ADMIN'] || 0,
        },
      },
      programs: {
        active: activePrograms,
      },
      events: {
        upcoming: upcomingEvents,
      },
      startups: {
        total: totalStartups,
      },
      recentActivity: recentNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        createdAt: n.createdAt,
      })),
      recentFunding: recentFunding.map((f) => ({
        id: f.id,
        title: f.title,
        amount: f.amount,
        startupName: f.startupName,
        status: f.status,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
