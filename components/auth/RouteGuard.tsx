"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionRequirement } from '@/lib/permissions';
import { UserRole } from '@/lib/auth';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: PermissionRequirement;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function RouteGuard({
  children,
  requiredPermission,
  requiredRole,
  redirectTo = '/',
  fallback = <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const { hasPermission, hasRole, loading: permissionsLoading } = usePermissions();
  const [authorized, setAuthorized] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Wait for auth and permissions to load
    if (authLoading || permissionsLoading) return;

    // Mark that we've completed the initial auth check
    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);
    }

    // Check if user is authenticated
    if (!user) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role requirement
    if (requiredRole && !hasRole(requiredRole)) {
      router.push(redirectTo);
      return;
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push(redirectTo);
      return;
    }

    // User is authorized
    setAuthorized(true);
  }, [
    user,
    authLoading,
    permissionsLoading,
    hasPermission,
    hasRole,
    requiredPermission,
    requiredRole,
    router,
    redirectTo,
    pathname
  ]);

  // Show loading state during initial auth check OR while loading
  if (authLoading || permissionsLoading || !hasCheckedAuth || !authorized) {
    return <>{fallback}</>;
  }

  // User is authorized, render children
  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredPermission?: PermissionRequirement;
    requiredRole?: UserRole | UserRole[];
    redirectTo?: string;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

/**
 * Hook for checking authorization in components
 */
export function useAuthorization(
  requiredPermission?: PermissionRequirement,
  requiredRole?: UserRole | UserRole[]
) {
  const { user } = useAuth();
  const { hasPermission, hasRole } = usePermissions();

  const isAuthorized = () => {
    if (!user) return false;
    
    if (requiredRole && !hasRole(requiredRole)) return false;
    
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    
    return true;
  };

  return {
    isAuthorized: isAuthorized(),
    user,
    hasPermission,
    hasRole
  };
}
