"use client";

import React from "react";
import { usePermissionsContext } from "@/contexts/permissions-context";
import type { PermissionRequirement } from "@/contexts/permissions-context";
import type { UserRole } from "@/lib/auth";

// Re-export so existing imports of PermissionRequirement from this file
// continue to work without any changes.
export type { PermissionRequirement } from "@/contexts/permissions-context";

/**
 * usePermissions — thin wrapper around the shared PermissionsContext.
 *
 * Previously this was a standalone hook that created its own API call and SSE
 * connection on every component that called it. Now it simply reads from the
 * single PermissionsProvider that lives in app/providers.tsx, so permissions
 * are fetched exactly ONCE per session regardless of how many components call
 * this hook.
 */
export function usePermissions() {
  return usePermissionsContext();
}

// ─── Component helpers (unchanged public API) ────────────────────────────────

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
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  const requirements = Array.isArray(requirement) ? requirement : [requirement];
  const hasAccess = requireAll
    ? hasAllPermissions(requirements)
    : hasAnyPermission(requirements);

  return <>{hasAccess ? children : fallback}</>;
}

interface RoleGateProps {
  children: React.ReactNode;
  role: UserRole | UserRole[] | string | string[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, role, fallback = null }: RoleGateProps) {
  const { hasRole } = usePermissions();
  return <>{hasRole(role) ? children : fallback}</>;
}