"use client";

import React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { Toaster as HotToaster } from 'react-hot-toast';
import { AdminToaster } from '@/components/admin/admin-toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <ShadcnToaster />
        <HotToaster position="top-right" />
        <AdminToaster />
      </NotificationProvider>
    </AuthProvider>
  );
}
