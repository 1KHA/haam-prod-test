"use client"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
import Header from "@/components/entrepreneur/Header"
import Sidebar from "@/components/entrepreneur/Sidebar"
import TopBar from "@/components/entrepreneur/TopBar"

export default function EntrepreneurDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard
      requiredPermission={{ category: "dashboard", action: "view" }}
      requiredRole={UserRole.ENTREPRENEUR}
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
      </div>
    </RouteGuard>
  )
}
