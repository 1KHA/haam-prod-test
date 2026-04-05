"use client"

import type React from "react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
import Sidebar from "@/components/investor/Sidebar"
import Header from "@/components/investor/Header"
import TopBar from "@/components/investor/TopBar"

export default function InvestorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard
      requiredPermission={{ category: "dashboard", action: "view" }}
      requiredRole={UserRole.INVESTOR}
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
