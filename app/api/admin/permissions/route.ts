import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
// GET /api/admin/permissions - Get all permissions for admin user management screens
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, {
      category: 'users',
      action: 'view',
    });

    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { action: 'asc' }],
    });

    return NextResponse.json(
      permissions.map((permission) => ({
        id: permission.id,
        category: permission.category,
        action: permission.action,
      }))
    );
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
