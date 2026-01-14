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
    // Get user with their assigned role permissions
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

    if (!user) {
      console.log(`[PERMISSIONS] No user found with ID: ${userId}`);
      return false;
    }

    console.log(`[PERMISSIONS] Checking permission for user: ${userId}, default role: ${user.role}, required: ${requirement.category}:${requirement.action}`);

    // Admin users get all permissions (based on default role)
    if (user.role === UserRole.ADMIN) {
      console.log(`[PERMISSIONS] Admin user detected, granting all permissions`);
      return true;
    }

    // Check all user's assigned permissions (both role-based and direct)
    const hasRequiredPermission = user.rolePermissions.some(
      (rp) =>
        rp.permission.category === requirement.category &&
        rp.permission.action === requirement.action
    );

    if (hasRequiredPermission) {
      console.log(`[PERMISSIONS] Permission granted through assigned roles/permissions`);
      return true;
    }

    // Fallback: Check default role permissions for backward compatibility
    const arabicRoleName = getRoleNameInArabic(user.role);
    const defaultRolePermission = await prisma.rolePermission.findFirst({
      where: {
        role: {
          OR: [
            { name: arabicRoleName },
            { name: user.role.toString() }
          ]
        },
        permission: {
          category: requirement.category,
          action: requirement.action,
        },
        userId: null, // Role-based permissions, not user-specific
      },
    });

    if (defaultRolePermission) {
      console.log(`[PERMISSIONS] Permission granted through default role: ${arabicRoleName}`);
      return true;
    }

    console.log(`[PERMISSIONS] Permission denied - no matching permissions found`);
    return false;
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

    if (!user) {
      console.warn(`No user found with ID: ${userId}`);
      return [];
    }

    console.log(`Getting permissions for user: ${userId}, role: ${user.role}`);

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      console.log(`User is an admin, granting all permissions`);
      const allPermissions = await prisma.permission.findMany();
      return allPermissions.map((p) => ({
        category: p.category,
        action: p.action,
      }));
    }

    // Find the role in the database - try multiple strategies
    let rolePermissions: any[] = [];
    
    // Strategy 1: Try with Arabic role name mapping
    const arabicRoleName = getRoleNameInArabic(user.role);
    console.log(`Role mapped to Arabic: ${user.role} -> ${arabicRoleName}`);
    
    // Strategy 2: Find the role record in the database
    const userRoleRecord = await prisma.role.findFirst({
      where: {
        OR: [
          { name: arabicRoleName },
          { name: user.role.toString() } // Also try with the enum value directly
        ]
      }
    });
    
    if (userRoleRecord) {
      console.log(`Found role in database: ${userRoleRecord.name} (ID: ${userRoleRecord.id})`);
      
      // Try lookup by role ID (most reliable)
      const permissionsByRoleId = await prisma.rolePermission.findMany({
        where: {
          roleId: userRoleRecord.id,
          userId: null,
        },
        include: {
          permission: true,
          role: true,
        },
      });
      
      console.log(`Found ${permissionsByRoleId.length} permissions using roleId lookup`);
      rolePermissions = [...permissionsByRoleId];
    }
    
    // Strategy 3: If no permissions found yet, try by name
    if (rolePermissions.length === 0) {
      const permissionsByName = await prisma.rolePermission.findMany({
        where: {
          role: {
            name: arabicRoleName,
          },
          userId: null,
        },
        include: {
          permission: true,
          role: true,
        },
      });
      
      console.log(`Found ${permissionsByName.length} role-based permissions by name: ${arabicRoleName}`);
      rolePermissions = [...permissionsByName];
    }
    
    // Strategy 4: Try with the raw role name
    if (rolePermissions.length === 0) {
      const permissionsByRawName = await prisma.rolePermission.findMany({
        where: {
          role: {
            name: user.role.toString(),
          },
          userId: null,
        },
        include: {
          permission: true,
          role: true,
        },
      });
      
      console.log(`Found ${permissionsByRawName.length} permissions using raw role name: ${user.role.toString()}`);
      rolePermissions = [...rolePermissions, ...permissionsByRawName];
    }

    // Get user-specific permissions
    const userSpecificPermissions = user.rolePermissions.filter(
      (rp) => rp.userId === userId
    );

    console.log(`Found ${userSpecificPermissions.length} user-specific permissions`);

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

    console.log(`Returning ${uniquePermissions.length} unique permissions for user ${userId}`);
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
  const roleMap: Record<string, string> = {
    'ADMIN': 'مدير النظام',
    'PROGRAM_MANAGER': 'مدير برنامج',
    'MENTOR': 'موجه',
    'INVESTOR': 'مستثمر',
    'PARTICIPANT': 'مشارك',
    'ENTREPRENEUR': 'رائد أعمال',
    'STARTUP': 'شركة ناشئة',
    'JUDGE': 'محكم',
    'ACCELERATOR': 'مسرع أعمال'
  };
  
  // If the role is not in the map, log a warning and return the role as-is
  if (!roleMap[role]) {
    console.warn(`Warning: No Arabic mapping found for role "${role}". Using the role value directly.`);
    return String(role);
  }
  
  return roleMap[role];
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
