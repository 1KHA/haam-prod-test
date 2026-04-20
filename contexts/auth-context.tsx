"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/auth';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  specialization?: string;
  profile?: {
    phone?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  specialization?: string;
  phone?: string; // Add phone field
  organizationName?: string;
  // Add other role-specific fields as needed
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_DASHBOARD_MAP: Partial<Record<UserRole, string>> = {
  [UserRole.ADMIN]: '/admin-dashboard',
  [UserRole.PROGRAM_MANAGER]: '/program-manager-dashboard',
  [UserRole.MENTOR]: '/mentor-dashboard',
  [UserRole.INVESTOR]: '/investor-dashboard',
  [UserRole.ENTREPRENEUR]: '/entrepreneur-dashboard',
};

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user from localStorage on initial render (token is now in HTTP-only cookie)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setToken('cookie');
    }

    // Small delay to ensure state updates are applied before marking loading complete
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important: include cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      // Save user to state and localStorage (token is now in HTTP-only cookie)
      setUser(data.user);
      setToken('cookie'); // Placeholder - actual token is in HTTP-only cookie
      localStorage.setItem('user', JSON.stringify(data.user));
      // Note: We don't store token in localStorage anymore - it's in HTTP-only cookie

      // Redirect based on user role
      redirectBasedOnRole(data.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (userData: SignUpData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Auth context signUp with data:", userData);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // Important: include cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      console.log("Signup response:", data);

      if (data.pending) {
        router.push('/auth/pending');
        return;
      }

      // Save user to state and localStorage (token is now in HTTP-only cookie)
      setUser(data.user);
      setToken('cookie'); // Placeholder - actual token is in HTTP-only cookie
      localStorage.setItem('user', JSON.stringify(data.user));
      // Note: We don't store token in localStorage anymore - it's in HTTP-only cookie

      // Redirect based on user role
      redirectBasedOnRole(data.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Call API to clear the HTTP-only cookie
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      // Clear client-side state regardless of API response
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      // Note: token cookie is cleared by the API
      router.push('/');
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Helper function to redirect based on user role
  const redirectBasedOnRole = (role: UserRole) => {
    const dashboard = ROLE_DASHBOARD_MAP[role];
    if (dashboard) {
      setIsRedirecting(true);
      router.push(dashboard);
    } else {
      console.warn(`[AUTH] No dashboard mapping for role: ${role}`);
      router.push('/');
    }
  };

  useEffect(() => {
    if (!isRedirecting) return;
    const timeout = setTimeout(() => setIsRedirecting(false), 500);
    return () => clearTimeout(timeout);
  }, [isRedirecting]);

  const value = {
    user,
    token,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
