import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@prisma/client';

export interface PermissionRequirement {
  category: string;
  action: string;
}

/**
 * Hook to check user permissions in the frontend
 */
export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PermissionRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    } else {
      setPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch('/api/auth/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (requirement: PermissionRequirement): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === UserRole.ADMIN) return true;

    return permissions.some(
      (p) => p.category === requirement.category && p.action === requirement.action
    );
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (requirements: PermissionRequirement[]): boolean => {
    return requirements.some((req) => hasPermission(req));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (requirements: PermissionRequirement[]): boolean => {
    return requirements.every((req) => hasPermission(req));
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  /**
   * Get role name in Arabic
   */
  const getRoleDisplayName = (role?: UserRole): string => {
    if (!role) return '';
    
    const roleMap: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'مدير النظام',
      [UserRole.PROGRAM_MANAGER]: 'مدير برنامج',
      [UserRole.STARTUP]: 'شركة ناشئة',
      [UserRole.MENTOR]: 'موجه',
      [UserRole.INVESTOR]: 'مستثمر',
      [UserRole.JUDGE]: 'محكم',
      [UserRole.PARTICIPANT]: 'مشارك',
      [UserRole.ACCELERATOR]: 'مسرع أعمال',
    };
    
    return roleMap[role] || role;
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getRoleDisplayName,
    refetch: fetchUserPermissions,
  };
}

/**
 * Component wrapper for permission-based rendering
 */
interface PermissionGateProps {
  children: React.ReactNode;
  requirement: PermissionRequirement | PermissionRequirement[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

export function PermissionGate({
  children,
  requirement,
  fallback = null,
  requireAll = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const requirements = Array.isArray(requirement) ? requirement : [requirement];
  
  const hasAccess = requireAll
    ? hasAllPermissions(requirements)
    : hasAnyPermission(requirements);

  return <>{hasAccess ? children : fallback}</>;
}

/**
 * Component wrapper for role-based rendering
 */
interface RoleGateProps {
  children: React.ReactNode;
  role: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({
  children,
  role,
  fallback = null,
}: RoleGateProps) {
  const { hasRole } = usePermissions();

  return <>{hasRole(role) ? children : fallback}</>;
}
