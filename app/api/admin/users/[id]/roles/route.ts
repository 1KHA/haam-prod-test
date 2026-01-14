import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { emitPermissionsRefresh } from '@/lib/sse-helpers';

// GET /api/admin/users/[id]/roles - Get all roles assigned to a user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { 
      category: 'users', 
      action: 'view' 
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = params.id;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user-specific role assignments
    const userRoles = await prisma.rolePermission.findMany({
      where: {
        userId: userId
      },
      include: {
        role: true,
        permission: true
      },
      distinct: ['roleId']
    });

    // Get unique roles assigned to this user
    const assignedRoles = userRoles.reduce((acc, rp) => {
      const roleExists = acc.find(r => r.id === rp.role.id);
      if (!roleExists) {
        acc.push({
          id: rp.role.id,
          name: rp.role.name,
          description: rp.role.description,
          assignedAt: rp.createdAt
        });
      }
      return acc;
    }, [] as any[]);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        defaultRole: user.role
      },
      assignedRoles,
      totalRoles: assignedRoles.length
    });
  } catch (error) {
    console.error('Error getting user roles:', error);
    return NextResponse.json(
      { error: 'Failed to get user roles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users/[id]/roles - Assign roles to a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { 
      category: 'users', 
      action: 'edit' 
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = params.id;
    const body = await request.json();
    const { roleIds } = body;
    
    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return NextResponse.json(
        { error: 'roleIds array is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate that all roleIds exist
    const roles = await prisma.role.findMany({
      where: {
        id: {
          in: roleIds
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (roles.length !== roleIds.length) {
      return NextResponse.json(
        { error: 'One or more roles not found' },
        { status: 404 }
      );
    }

    // Use transaction to assign roles to user
    const result = await prisma.$transaction(async (tx) => {
      const assignedRoles = [];

      for (const role of roles) {
        // Check if role is already assigned to user
        const existingAssignment = await tx.rolePermission.findFirst({
          where: {
            userId: userId,
            roleId: role.id
          }
        });

        if (existingAssignment) {
          console.log(`Role ${role.name} already assigned to user ${userId}`);
          continue;
        }

        // Assign all permissions from this role to the user
        for (const rolePerm of role.permissions) {
          // Check if user already has this permission (avoid duplicates)
          const existingPermission = await tx.rolePermission.findFirst({
            where: {
              userId: userId,
              permissionId: rolePerm.permissionId
            }
          });

          if (!existingPermission) {
            await tx.rolePermission.create({
              data: {
                userId: userId,
                roleId: role.id,
                permissionId: rolePerm.permissionId
              }
            });
          }
        }

        assignedRoles.push({
          id: role.id,
          name: role.name,
          description: role.description,
          permissionsCount: role.permissions.length
        });
      }

      return assignedRoles;
    });

    // Emit permissions refresh event
    await emitPermissionsRefresh(userId, { includeConnectedUsers: true });

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${result.length} role(s) to user`,
      assignedRoles: result
    });
  } catch (error) {
    console.error('Error assigning roles to user:', error);
    return NextResponse.json(
      { error: 'Failed to assign roles to user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]/roles - Remove roles from a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { 
      category: 'users', 
      action: 'edit' 
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const roleIds = searchParams.get('roleIds')?.split(',') || [];
    
    if (roleIds.length === 0) {
      return NextResponse.json(
        { error: 'roleIds parameter is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove role assignments from user
    const result = await prisma.rolePermission.deleteMany({
      where: {
        userId: userId,
        roleId: {
          in: roleIds
        }
      }
    });

    // Emit permissions refresh event
    await emitPermissionsRefresh(userId, { includeConnectedUsers: true });

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${result.count} role assignment(s) from user`,
      removedCount: result.count
    });
  } catch (error) {
    console.error('Error removing roles from user:', error);
    return NextResponse.json(
      { error: 'Failed to remove roles from user' },
      { status: 500 }
    );
  }
}
