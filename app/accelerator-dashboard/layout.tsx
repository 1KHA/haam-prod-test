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
    return <div>Loading...</div>
  }

  if (!user || user.role !== UserRole.ACCELERATOR) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TopBar />
      <Sidebar />
      <div className="pt-12 pr-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
