"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useAuth } from './auth-context';

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { token, user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/admin/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Set up SSE for real-time notifications
  const setupSSE = () => {
    if (!token) return;
    
    // Close any existing connection
    if (eventSource) {
      eventSource.close();
    }
    
    // Properly encode the token to prevent issues with special characters
    const encodedToken = encodeURIComponent(token);
    
    // Create a new SSE connection
    const sse = new EventSource(`/api/admin/notifications/sse?token=${encodedToken}`);
    
    sse.addEventListener('notifications', (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        console.error('Error processing notifications SSE event:', err);
      }
    });
    
    sse.addEventListener('new_notification', (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);
        if (!newNotification.isRead) {
          setUnreadCount((prev) => prev + 1);
        }
      } catch (err) {
        console.error('Error processing new notification SSE event:', err);
      }
    });
    
    sse.addEventListener('error', (event) => {
      console.error('SSE connection error:', event);
      // Don't close on error, let the browser retry
    });
    
    setEventSource(sse);
    
    // Clean up function
    return () => {
      sse.close();
    };
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/admin/notifications/mark-read`, {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetchWithAuth(`/api/admin/notifications/mark-read`, {
        method: 'POST',
        body: JSON.stringify({ all: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  // Initial fetch and setup SSE when component mounts and token changes
  useEffect(() => {
    if (token) {
      fetchNotifications();
      const cleanup = setupSSE();
      
      // Clean up on unmount
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [token]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// Custom hook to use the notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
