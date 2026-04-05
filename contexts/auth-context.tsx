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

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      // Save user and token to state and localStorage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      console.log("Signup response:", data);

      // Save user and token to state and localStorage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      // Redirect based on user role
      redirectBasedOnRole(data.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
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
