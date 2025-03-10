"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { HelpCircle, Settings, Bell, Rocket, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TopBar() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-primary text-primary-foreground flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          onClick={() => router.push("/accelerator-dashboard/help")}
        >
          <HelpCircle className="h-4 w-4 ml-2" />
          المساعدة
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          onClick={() => router.push("/accelerator-dashboard/settings")}
        >
          <Settings className="h-4 w-4 ml-2" />
          الإعدادات
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          onClick={() => router.push("/accelerator-dashboard/notifications")}
        >
          <Bell className="h-4 w-4 ml-2" />
          الإشعارات
        </Button>
      </div>
      <div className="flex items-center">
        <span className="font-bold text-lg ml-2">منصة الشركات الناشئة</span>
        <div className="flex">
          <Lightbulb className="h-6 w-6 ml-1" />
          <Rocket className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
