"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TopBar() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-card border-b flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/accelerator-dashboard/help")}
        >
          المساعدة
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/accelerator-dashboard/settings")}
        >
          الإعدادات
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/accelerator-dashboard/notifications")}
        >
          الإشعارات
        </Button>
      </div>
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">لوحة تحكم مسرع الأعمال</h2>
      </div>
    </div>
  )
}
