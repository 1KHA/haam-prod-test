"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      name: "لوحة التحكم",
      path: "/accelerator-dashboard",
      icon: "📊",
    },
    {
      name: "الملف الشخصي",
      path: "/accelerator-dashboard/profile",
      icon: "👤",
    },
    {
      name: "فريق العمل",
      path: "/accelerator-dashboard/team",
      icon: "👥",
    },
    {
      name: "التقديم للبرامج",
      path: "/accelerator-dashboard/apply",
      icon: "🚀",
    },
    {
      name: "الموجهون",
      path: "/accelerator-dashboard/mentors",
      icon: "👨‍🏫",
    },
    {
      name: "الفعاليات",
      path: "/accelerator-dashboard/events",
      icon: "📅",
    },
    {
      name: "الموارد التعليمية",
      path: "/accelerator-dashboard/resources",
      icon: "📚",
    },
    {
      name: "طلبات التمويل",
      path: "/accelerator-dashboard/funding",
      icon: "💰",
    },
    {
      name: "المراحل والتقدم",
      path: "/accelerator-dashboard/milestones",
      icon: "🏆",
    },
    {
      name: "الدعم والمساعدة",
      path: "/accelerator-dashboard/support",
      icon: "🆘",
    },
  ]

  return (
    <aside className="fixed top-24 right-0 bottom-0 w-64 bg-card border-l p-4 overflow-y-auto z-30">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal",
              pathname === item.path && "bg-muted font-medium"
            )}
            onClick={() => router.push(item.path)}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
