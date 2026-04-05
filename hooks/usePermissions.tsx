import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/lib/auth';

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

  // Reference to the SSE connection
  const sseRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to clean up SSE connection
  const cleanupSSE = useCallback(() => {
    if (sseRef.current) {
      console.log('Closing SSE connection for permissions');
      sseRef.current.close();
      sseRef.current = null;
    }
    
    // Clear any pending reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Fetch user permissions
  const fetchUserPermissions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for permissions fetch');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache', // Prevent caching to get fresh permissions
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
        console.log(`Loaded ${data.permissions.length} permissions for user ${user.id}`);
      } else {
        console.error('Failed to fetch permissions:', await response.text());
        if (response.status === 401) {
          // Token might be expired, user should re-login
          console.warn('Unauthorized - token might be expired');
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Setup SSE connection for real-time permission updates
  const setupSSEConnection = useCallback(() => {
    // Clean up any existing connection
    cleanupSSE();
    
    if (!user) {
      console.log('No user, skipping SSE connection setup');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for SSE connection');
        return;
      }
      
      console.log(`Setting up SSE connection for user ${user.id}`);
      
      // Create new SSE connection with token in the URL
      // Since EventSource doesn't support custom headers, we need to include the token in the URL
      const sse = new EventSource(`/api/auth/permissions/sse?token=${encodeURIComponent(token)}&userId=${user.id}&t=${new Date().getTime()}`, {
        withCredentials: true
      });
      
      // Store reference
      sseRef.current = sse;
      
      // Listen for permission updates
      sse.addEventListener('permissions-update', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received permission update via SSE:', data);
          
          if (data.permissions) {
            setPermissions(data.permissions);
            setLoading(false); // Mark as loaded when we get initial permissions
          }
        } catch (error) {
          console.error('Error processing SSE permission update:', error);
        }
      });
      
      // Listen for forced permission refresh events
      sse.addEventListener('force-permissions-refresh', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received force permission refresh via SSE:', data);
          
          // Immediately fetch the latest permissions
          fetchUserPermissions();
        } catch (error) {
          console.error('Error processing SSE force refresh:', error);
        }
      });
      
      // Listen for user-permissions-changed events (for admins viewing other users)
      sse.addEventListener('user-permissions-changed', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('User permissions changed:', data);
          
          // If this is for the current user, refresh permissions
          if (data.changedUserId === user.id) {
            fetchUserPermissions();
          }
          
          // Dispatch a custom event that components can listen for
          window.dispatchEvent(new CustomEvent('user-permissions-changed', { 
            detail: data
          }));
        } catch (error) {
          console.error('Error processing user permissions changed event:', error);
        }
      });
      
      // Handle connection open
      sse.addEventListener('open', () => {
        console.log('SSE permission stream connected');
      });
      
      // Handle errors with exponential backoff
      sse.addEventListener('error', (error) => {
        console.error('SSE permission stream error:', error);
        
        // Close the current connection
        cleanupSSE();
        
        // Try to reconnect after a delay with exponential backoff
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect SSE permissions...');
            setupSSEConnection();
          }, 5000);
        }
      });
    } catch (error) {
      console.error('Error setting up SSE connection:', error);
    }
  }, [user, cleanupSSE, fetchUserPermissions]);

  // Initialize permissions when user changes
  useEffect(() => {
    if (user) {
      console.log(`Setting up permissions for user: ${user.id} (${user.email})`);
      fetchUserPermissions();
      setupSSEConnection();
    } else {
      console.log('No user, clearing permissions');
      setPermissions([]);
      setLoading(false);
      cleanupSSE();
    }
    
    // Clean up SSE on unmount or user change
    return () => {
      cleanupSSE();
    };
  }, [user?.id]); // Only depend on user.id to avoid unnecessary re-renders

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
   * This supports both enum roles and custom roles
   */
  const hasRole = (role: UserRole | UserRole[] | string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    
    // First check standard enum role
    if (roles.some(r => user.role === r)) {
      return true;
    }
    
    // For custom roles, we need to check permissions
    // A user with a custom role will have the permissions of that role
    // but might have a standard enum role assigned in the user record
    
    // Strategy 1: Check if user has all permissions typical of a role
    // We can identify roles by their permission patterns
    if (roles.includes('ADMIN' as UserRole) || roles.includes('ADMIN')) {
      // Check if user has admin-like permissions
      const adminPermissions = [
        { category: 'users', action: 'edit' },
        { category: 'settings', action: 'edit' }
      ];
      
      const hasAllAdminPerms = adminPermissions.every(
        perm => permissions.some(
          p => p.category === perm.category && p.action === perm.action
        )
      );
      
      if (hasAllAdminPerms) return true;
    }
    
    // Add similar checks for other roles if needed
    
    return false;
  };

  /**
   * Get role display name
   */
  const getRoleDisplayName = (role?: UserRole | string): string => {
    if (!role) return '';
    
    const roleMap: Record<string, string> = {
      'ADMIN': 'مدير النظام',
      'PROGRAM_MANAGER': 'مدير برنامج',
      'MENTOR': 'موجه',
      'INVESTOR': 'مستثمر',
      'PARTICIPANT': 'مشارك',
      'ENTREPRENEUR': 'رائد أعمال'
    };
    
    // For custom roles, the role might be the display name already
    // or it might be a role ID that we need to look up
    const roleStr = String(role);
    
    if (roleMap[roleStr]) {
      return roleMap[roleStr];
    }
    
    // If not in the map, it might be a custom role name already in display format
    // For future enhancement, we could fetch role display names from an API
    return roleStr;
  };

  /**
   * Force refresh permissions - useful after role changes
   * This will immediately fetch the latest permissions and also 
   * restart the SSE connection
   */
  const refreshPermissions = async () => {
    await fetchUserPermissions();
    setupSSEConnection();
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
    refreshPermissions,
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
  role: UserRole | UserRole[] | string | string[];
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
