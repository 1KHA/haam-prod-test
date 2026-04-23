"use client"

import { useState } from "react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
import Header from "@/components/entrepreneur/Header"
import Sidebar from "@/components/entrepreneur/Sidebar"
import TopBar from "@/components/entrepreneur/TopBar"
import { cn } from "@/lib/utils"

export default function EntrepreneurDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <RouteGuard
      requiredPermission={{ category: "dashboard", action: "view" }}
      requiredRole={UserRole.ENTREPRENEUR}
    >
      <div className="flex flex-col min-h-screen text-right">
        <TopBar />
        <div className="flex flex-1 relative">
          <main
            className={cn(
              "flex-1 overflow-y-auto p-4 lg:p-6 w-full transition-all duration-300 ease-in-out",
              sidebarCollapsed ? "lg:mr-16" : "lg:mr-64"
            )}
          >
            <Header onMenuToggle={() => setMobileSidebarOpen(true)} />
            {children}
          </main>
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onCollapseChange={setSidebarCollapsed}
          />
        </div>
      </div>
    </RouteGuard>
  )
}
