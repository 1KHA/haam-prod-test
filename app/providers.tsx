"use client";

import React from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { PermissionsProvider } from "@/contexts/permissions-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { Toaster as HotToaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* PermissionsProvider must be inside AuthProvider (uses useAuth)
          and outside everything else so all components share ONE instance */}
      <PermissionsProvider>
        <NotificationProvider>
          {children}
          <HotToaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                maxWidth: "360px",
                padding: "12px 14px",
                borderRadius: "12px",
                fontSize: "14px",
                lineHeight: "1.4",
              },
            }}
          />
        </NotificationProvider>
      </PermissionsProvider>
    </AuthProvider>
  );
}
