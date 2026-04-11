"use client"

import { NotificationBell } from "@/components/NotificationBell"

export default function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground h-12 flex items-center justify-between px-4 text-right">
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="text-sm font-medium">منصة دِيَم</div>
      </div>
      <div className="text-sm">لوحة تحكم رائد الأعمال</div>
    </div>
  )
}
