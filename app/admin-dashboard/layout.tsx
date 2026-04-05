"use client"

import type React from "react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
import Sidebar from "@/components/admin/Sidebar"
import Header from "@/components/admin/Header"
import TopBar from "@/components/admin/TopBar"
import { AdminToaster } from "@/components/admin/admin-toaster"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard
      requiredPermission={{ category: "dashboard", action: "view" }}
      requiredRole={UserRole.ADMIN}
    >
      <div className="flex flex-col min-h-screen text-right">
        <TopBar />
        <div className="flex flex-1">
          <main className="flex-1 overflow-y-auto p-6 mr-64">
            <Header />
            {children}
          </main>
          <Sidebar />
        </div>
        <AdminToaster />
      </div>
    </RouteGuard>
  )
}
