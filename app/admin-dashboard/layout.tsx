"use client"

import type React from "react"
import { useState } from "react"
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <RouteGuard
      requiredPermission={{ category: "dashboard", action: "view" }}
      requiredRole={UserRole.ADMIN}
    >
      <div className="flex flex-col min-h-screen text-right">
        <TopBar />
        <div className="flex flex-1 relative">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 w-full lg:mr-64">
            <Header onMenuToggle={() => setMobileSidebarOpen(true)} />
            {children}
          </main>
          <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
        </div>
        <AdminToaster />
      </div>
    </RouteGuard>
  )
}
