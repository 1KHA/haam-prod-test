"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "@/components/investor/Sidebar"
import Header from "@/components/investor/Header"
import TopBar from "@/components/investor/TopBar"

export default function InvestorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">جاري التحميل...</div>
  }

  return (
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
  )
}
