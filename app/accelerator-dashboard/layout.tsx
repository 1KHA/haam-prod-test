"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/lib/auth"
import Header from "@/components/accelerator/Header"
import Sidebar from "@/components/accelerator/Sidebar"
import TopBar from "@/components/accelerator/TopBar"

export default function AcceleratorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.ACCELERATOR)) {
      router.push("/auth/signin")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">جاري التحميل...</div>
  }

  if (!user || user.role !== UserRole.ACCELERATOR) {
    return null
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
