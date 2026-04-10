import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { emitPermissionsRefresh } from '@/lib/sse-helpers';

interface PermissionSummary {
  id: string;
  category: string;
  action: string;
  source: 'role' | 'direct';
  roleName: string | null;
}

interface PermissionsByRoleMap {
  [roleId: string]: {
    role: {
      id: string;
      name: string;
      description: string | null;
    };
    permissions: Array<{
      id: string;
      category: string;
      action: string;
    }>;
  };
}

// GET /api/admin/users/[id]/permissions - Get all permissions for a user
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

    const directRole = await prisma.role.findFirst({
      where: { name: 'Direct Permissions' }
    });

    // Get all user permissions (both role-based and direct)
    const userPermissions = await prisma.rolePermission.findMany({
      where: {
        userId: userId
      },
      include: {
        permission: true,
        role: true
      }
    });

    // Separate role-based and direct permissions.
    // Direct permissions are stored under the internal "Direct Permissions" role.
    const directPermissions = userPermissions.filter(
      up => up.roleId === directRole?.id || up.role?.name === 'Direct Permissions'
    );
    const roleBasedPermissions = userPermissions.filter(
      up => up.roleId !== null && up.roleId !== directRole?.id && up.role?.name !== 'Direct Permissions'
    );

    // Group role-based permissions by role
    const permissionsByRole = roleBasedPermissions.reduce<PermissionsByRoleMap>((acc, up) => {
      if (!acc[up.role.id]) {
        acc[up.role.id] = {
          role: {
            id: up.role.id,
            name: up.role.name,
            description: up.role.description
          },
          permissions: []
        };
      }
      
      acc[up.role.id].permissions.push({
        id: up.permission.id,
        category: up.permission.category,
        action: up.permission.action
      });
      
      return acc;
    }, {});

    // Get unique permissions (avoid duplicates)
    const allPermissions = userPermissions.reduce<PermissionSummary[]>((acc, up) => {
      const exists = acc.find(p => p.id === up.permission.id);
      if (!exists) {
        acc.push({
          id: up.permission.id,
          category: up.permission.category,
          action: up.permission.action,
          source: up.roleId === directRole?.id || up.role?.name === 'Direct Permissions' ? 'direct' : 'role',
          roleName: up.role?.name === 'Direct Permissions' ? null : (up.role?.name || null)
        });
      }
      return acc;
    }, []);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        defaultRole: user.role
      },
      allPermissions,
      permissionsByRole: Object.values(permissionsByRole),
      directPermissions: directPermissions.map(dp => ({
        id: dp.permission.id,
        category: dp.permission.category,
        action: dp.permission.action,
        assignedAt: dp.createdAt
      })),
      summary: {
        totalPermissions: allPermissions.length,
        roleBasedPermissions: roleBasedPermissions.length,
        directPermissions: directPermissions.length,
        rolesCount: Object.keys(permissionsByRole).length
      }
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to get user permissions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users/[id]/permissions - Assign specific permissions to a user
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
    const { permissionIds } = body;
    
    if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
      return NextResponse.json(
        { error: 'permissionIds array is required' },
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

    // Validate that all permissionIds exist
    const permissions = await prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds
        }
      }
    });

    if (permissions.length !== permissionIds.length) {
      return NextResponse.json(
        { error: 'One or more permissions not found' },
        { status: 404 }
      );
    }

    // Use transaction to assign permissions to user
    const result = await prisma.$transaction(async (tx) => {
      const assignedPermissions = [];

      for (const permission of permissions) {
        // Check if permission is already assigned to user (directly or through role)
        const existingAssignment = await tx.rolePermission.findFirst({
          where: {
            userId: userId,
            permissionId: permission.id
          }
        });

        if (existingAssignment) {
          console.log(`Permission ${permission.category}:${permission.action} already assigned to user ${userId}`);
          continue;
        }

        // For now, we need a role to assign permissions
        // Create a special "Direct Permissions" role if it doesn't exist
        let directRole = await tx.role.findFirst({
          where: { name: 'Direct Permissions' }
        });
        
        if (!directRole) {
          directRole = await tx.role.create({
            data: {
              name: 'Direct Permissions',
              description: 'Special role for direct user permissions'
            }
          });
        }

        // Assign permission to user via the direct permissions role
        await tx.rolePermission.create({
          data: {
            userId: userId,
            permissionId: permission.id,
            roleId: directRole.id
          }
        });

        assignedPermissions.push({
          id: permission.id,
          category: permission.category,
          action: permission.action
        });
      }

      return assignedPermissions;
    });

    // Emit permissions refresh event
    await emitPermissionsRefresh(userId, { includeConnectedUsers: true });

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${result.length} permission(s) to user`,
      assignedPermissions: result
    });
  } catch (error) {
    console.error('Error assigning permissions to user:', error);
    return NextResponse.json(
      { error: 'Failed to assign permissions to user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]/permissions - Remove specific permissions from a user
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
    const permissionIds = searchParams.get('permissionIds')?.split(',') || [];
    const removeType = searchParams.get('type') || 'direct'; // 'direct' or 'all'
    
    if (permissionIds.length === 0) {
      return NextResponse.json(
        { error: 'permissionIds parameter is required' },
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

    let result;
    if (removeType === 'all') {
      // Remove all instances of these permissions (both direct and role-based)
      result = await prisma.rolePermission.deleteMany({
        where: {
          userId: userId,
          permissionId: {
            in: permissionIds
          }
        }
      });
    } else {
      // Remove only direct permissions (from "Direct Permissions" role)
      const directRole = await prisma.role.findFirst({
        where: { name: 'Direct Permissions' }
      });
      
      if (directRole) {
        result = await prisma.rolePermission.deleteMany({
          where: {
            userId: userId,
            permissionId: {
              in: permissionIds
            },
            roleId: directRole.id
          }
        });
      } else {
        result = { count: 0 };
      }
    }

    // Emit permissions refresh event
    await emitPermissionsRefresh(userId, { includeConnectedUsers: true });

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${result.count} permission(s) from user`,
      removedCount: result.count,
      removeType
    });
  } catch (error) {
    console.error('Error removing permissions from user:', error);
    return NextResponse.json(
      { error: 'Failed to remove permissions from user' },
      { status: 500 }
    );
  }
}
