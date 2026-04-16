"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/lib/auth";

export interface PermissionRequirement {
  category: string;
  action: string;
}

interface PermissionsContextType {
  permissions: PermissionRequirement[];
  loading: boolean;
  hasPermission: (req: PermissionRequirement) => boolean;
  hasAnyPermission: (reqs: PermissionRequirement[]) => boolean;
  hasAllPermissions: (reqs: PermissionRequirement[]) => boolean;
  hasRole: (role: UserRole | UserRole[] | string | string[]) => boolean;
  getRoleDisplayName: (role?: UserRole | string) => string;
  refreshPermissions: () => Promise<void>;
  refetch: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

/**
 * Single shared provider — permissions are fetched ONCE and shared across
 * all components. This prevents the N×(API call + SSE connection) problem
 * that occurred when usePermissions() was a standalone hook.
 */
export function PermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PermissionRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  const sseRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─── SSE cleanup ────────────────────────────────────────────────────────────
  const cleanupSSE = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // ─── Fetch permissions (REST) ────────────────────────────────────────────────
  const fetchUserPermissions = useCallback(async () => {
    if (!user) return;

    // ADMIN always has all permissions — skip the DB round-trip entirely
    if (user.role === UserRole.ADMIN) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/permissions", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions ?? []);
      } else {
        console.error(
          "[Permissions] Failed to fetch permissions:",
          response.status
        );
      }
    } catch (error) {
      console.error("[Permissions] Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ─── SSE connection (non-admin only) ────────────────────────────────────────
  const setupSSEConnection = useCallback(() => {
    cleanupSSE();
    if (!user) return;

    // ADMIN doesn't need real-time permission updates — skip SSE entirely
    if (user.role === UserRole.ADMIN) return;

    try {
      const sse = new EventSource(
        `/api/auth/permissions/sse?userId=${user.id}&t=${Date.now()}`,
        { withCredentials: true }
      );
      sseRef.current = sse;

      sse.addEventListener("permissions-update", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.permissions) {
            setPermissions(data.permissions);
            setLoading(false);
          }
        } catch {
          // ignore parse errors
        }
      });

      sse.addEventListener("force-permissions-refresh", () => {
        fetchUserPermissions();
      });

      sse.addEventListener("user-permissions-changed", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.changedUserId === user.id) {
            fetchUserPermissions();
          }
          window.dispatchEvent(
            new CustomEvent("user-permissions-changed", { detail: data })
          );
        } catch {
          // ignore parse errors
        }
      });

      sse.addEventListener("error", () => {
        cleanupSSE();
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setupSSEConnection();
          }, 5000);
        }
      });
    } catch (error) {
      console.error("[Permissions] Error setting up SSE connection:", error);
    }
  }, [user, cleanupSSE, fetchUserPermissions]);

  // ─── Bootstrap on user change ────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchUserPermissions();
      setupSSEConnection();
    } else {
      setPermissions([]);
      setLoading(false);
      cleanupSSE();
    }

    return () => {
      cleanupSSE();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ─── Permission helpers ──────────────────────────────────────────────────────
  const hasPermission = useCallback(
    (requirement: PermissionRequirement): boolean => {
      if (!user) return false;
      if (user.role === UserRole.ADMIN) return true;
      return permissions.some(
        (p) =>
          p.category === requirement.category && p.action === requirement.action
      );
    },
    [user, permissions]
  );

  const hasAnyPermission = useCallback(
    (requirements: PermissionRequirement[]): boolean =>
      requirements.some((req) => hasPermission(req)),
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (requirements: PermissionRequirement[]): boolean =>
      requirements.every((req) => hasPermission(req)),
    [hasPermission]
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[] | string | string[]): boolean => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];

      if (roles.some((r) => user.role === r)) return true;

      // Fallback: check admin-like permissions for custom roles
      if (roles.includes("ADMIN" as UserRole) || roles.includes("ADMIN")) {
        const adminPermissions = [
          { category: "users", action: "edit" },
          { category: "settings", action: "edit" },
        ];
        if (
          adminPermissions.every((perm) =>
            permissions.some(
              (p) => p.category === perm.category && p.action === perm.action
            )
          )
        ) {
          return true;
        }
      }

      return false;
    },
    [user, permissions]
  );

  const getRoleDisplayName = useCallback(
    (role?: UserRole | string): string => {
      if (!role) return "";
      const roleMap: Record<string, string> = {
        ADMIN: "مدير النظام",
        PROGRAM_MANAGER: "مدير برنامج",
        MENTOR: "موجه",
        INVESTOR: "مستثمر",
        ENTREPRENEUR: "رائد أعمال",
      };
      const roleStr = String(role);
      return roleMap[roleStr] ?? roleStr;
    },
    []
  );

  const refreshPermissions = useCallback(async () => {
    await fetchUserPermissions();
    setupSSEConnection();
  }, [fetchUserPermissions, setupSSEConnection]);

  const value: PermissionsContextType = {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getRoleDisplayName,
    refreshPermissions,
    refetch: fetchUserPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

/**
 * Internal hook — used by the usePermissions() wrapper in hooks/usePermissions.tsx
 */
export function usePermissionsContext(): PermissionsContextType {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error(
      "usePermissionsContext must be used within a PermissionsProvider"
    );
  }
  return context;
}