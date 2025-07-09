import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { isAuthenticated } from '@/lib/auth';

export interface PermissionRequirement {
  category: string;
  action: string;
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  userId: string,
  requirement: PermissionRequirement
): Promise<boolean> {
  try {
    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
            role: true,
          },
        },
      },
    });

    if (!user) return false;

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) return true;

    // Get role-based permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: {
          name: getRoleNameInArabic(user.role),
        },
        permission: {
          category: requirement.category,
          action: requirement.action,
        },
      },
      include: {
        permission: true,
      },
    });

    // Check if user has the required permission through their role
    if (rolePermissions.length > 0) return true;

    // Check user-specific permissions
    const userSpecificPermission = user.rolePermissions.find(
      (rp) =>
        rp.permission.category === requirement.category &&
        rp.permission.action === requirement.action &&
        rp.userId === userId
    );

    return !!userSpecificPermission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  requirements: PermissionRequirement[]
): Promise<boolean> {
  for (const requirement of requirements) {
    if (await hasPermission(userId, requirement)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  requirements: PermissionRequirement[]
): Promise<boolean> {
  for (const requirement of requirements) {
    if (!(await hasPermission(userId, requirement))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<PermissionRequirement[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
            role: true,
          },
        },
      },
    });

    if (!user) return [];

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      const allPermissions = await prisma.permission.findMany();
      return allPermissions.map((p) => ({
        category: p.category,
        action: p.action,
      }));
    }

    // Get role-based permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: {
          name: getRoleNameInArabic(user.role),
        },
        userId: null, // Role-level permissions
      },
      include: {
        permission: true,
      },
    });

    // Get user-specific permissions
    const userSpecificPermissions = user.rolePermissions.filter(
      (rp) => rp.userId === userId
    );

    // Combine and deduplicate permissions
    const allPermissions = [
      ...rolePermissions.map((rp) => ({
        category: rp.permission.category,
        action: rp.permission.action,
      })),
      ...userSpecificPermissions.map((rp) => ({
        category: rp.permission.category,
        action: rp.permission.action,
      })),
    ];

    // Remove duplicates
    const uniquePermissions = allPermissions.filter(
      (permission, index, self) =>
        index ===
        self.findIndex(
          (p) => p.category === permission.category && p.action === permission.action
        )
    );

    return uniquePermissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Middleware to check permissions for API routes
 */
export function withPermission(requirement: PermissionRequirement | PermissionRequirement[]) {
  return async function middleware(req: NextRequest) {
    try {
      // Get auth header
      const authHeader = req.headers.get('authorization');
      const user = await isAuthenticated(authHeader || undefined);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Check permissions
      const requirements = Array.isArray(requirement) ? requirement : [requirement];
      const hasRequiredPermission = await hasAnyPermission(user.userId, requirements);

      if (!hasRequiredPermission) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      // Continue to the route handler
      return NextResponse.next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper function to check permissions in API route handlers
 */
export async function checkPermission(
  req: NextRequest,
  requirement: PermissionRequirement | PermissionRequirement[]
): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = req.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return { authorized: false, error: 'Unauthorized' };
    }

    const requirements = Array.isArray(requirement) ? requirement : [requirement];
    const hasRequiredPermission = await hasAnyPermission(user.userId, requirements);

    if (!hasRequiredPermission) {
      return { authorized: false, error: 'Forbidden - Insufficient permissions' };
    }

    return { authorized: true, userId: user.userId };
  } catch (error) {
    console.error('Permission check error:', error);
    return { authorized: false, error: 'Internal server error' };
  }
}

/**
 * Helper function to get role name in Arabic
 */
function getRoleNameInArabic(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'مدير النظام',
    [UserRole.PROGRAM_MANAGER]: 'مدير برنامج',
    [UserRole.MENTOR]: 'موجه',
    [UserRole.INVESTOR]: 'مستثمر',
    [UserRole.JUDGE]: 'محكم',
    [UserRole.PARTICIPANT]: 'مشارك',
    [UserRole.ENTREPRENEUR]: 'رائد أعمال',
  };
  return roleMap[role] || role;
}

/**
 * Check if user owns a resource (for conditional permissions)
 */
export async function isResourceOwner(
  userId: string,
  resourceType: 'startup' | 'team' | 'funding' | 'profile',
  resourceId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case 'startup':
        const startup = await prisma.startup.findUnique({
          where: { id: resourceId },
        });
        return startup?.creatorId === userId;

      case 'team':
        const teamMember = await prisma.teamMember.findUnique({
          where: { id: resourceId },
        });
        return teamMember?.creatorId === userId;

      case 'profile':
        return resourceId === userId;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
}

/**
 * Permission check for conditional access (e.g., own data only)
 */
export async function hasConditionalPermission(
  userId: string,
  requirement: PermissionRequirement,
  condition: {
    type: 'ownership' | 'assignment';
    resourceType?: 'startup' | 'team' | 'funding' | 'profile';
    resourceId?: string;
  }
): Promise<boolean> {
  // First check if user has the base permission
  const hasBasePermission = await hasPermission(userId, requirement);
  if (!hasBasePermission) return false;

  // Then check the condition
  if (condition.type === 'ownership' && condition.resourceType && condition.resourceId) {
    return await isResourceOwner(userId, condition.resourceType, condition.resourceId);
  }

  // Add more condition types as needed
  return true;
}
