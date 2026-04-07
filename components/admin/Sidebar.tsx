"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { 
  Home, 
  Users, 
  Settings, 
  Shield, 
  Building, 
  Rocket, 
  DollarSign, 
  Calendar, 
  BarChart, 
  Bell,
  FileText,
  Plug,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { PermissionRequirement } from "@/lib/permissions"

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionRequirement;
  hidden?: boolean;
}

const navItems: NavItem[] = [
  { 
    name: "لوحة التحكم", 
    href: "/admin-dashboard", 
    icon: Home,
    permission: { category: "dashboard", action: "view" }
  },
  { 
    name: "المستخدمون", 
    href: "/admin-dashboard/users", 
    icon: Users,
    permission: { category: "users", action: "view" }
  },
  { 
    name: "الأدوار والصلاحيات", 
    href: "/admin-dashboard/users/roles", 
    icon: Shield,
    permission: { category: "users", action: "edit" }
  },
  { 
    name: "إعدادات النظام", 
    href: "/admin-dashboard/system/settings", 
    icon: Settings,
    permission: { category: "settings", action: "view" }
  },
  { 
    name: "الشركات الناشئة", 
    href: "/admin-dashboard/startups", 
    icon: Building,
    permission: { category: "startups", action: "view" }
  },
  {
    name: "المراحل",
    href: "/admin-dashboard/milestones",
    icon: ClipboardList,
    permission: { category: "startups", action: "view" }
  },
  { 
    name: "البرامج", 
    href: "/admin-dashboard/programs", 
    icon: Rocket,
    permission: { category: "programs", action: "view" }
  },
  { 
    name: "التمويل", 
    href: "/admin-dashboard/financing", 
    icon: DollarSign,
    permission: { category: "funding", action: "view" },
    hidden: true
  },
  { 
    name: "الفعاليات", 
    href: "/admin-dashboard/events", 
    icon: Calendar,
    permission: { category: "events", action: "view" }
  },
  { 
    name: "سجلات الأمان", 
    href: "/admin-dashboard/security/logs", 
    icon: Shield,
    permission: { category: "settings", action: "view" },
    hidden: true
  },
  { 
    name: "التحليلات", 
    href: "/admin-dashboard/analytics", 
    icon: BarChart,
    permission: { category: "analytics", action: "view" },
    hidden: true
  },
  { 
    name: "الإشعارات", 
    href: "/admin-dashboard/notifications", 
    icon: Bell,
    permission: { category: "notifications", action: "view" }
  },
  { 
    name: "التقارير", 
    href: "/admin-dashboard/reports", 
    icon: FileText,
    permission: { category: "reports", action: "view" }
  },
  { 
    name: "التكاملات", 
    href: "/admin-dashboard/integrations", 
    icon: Plug,
    permission: { category: "integrations", action: "view" },
    hidden: true
  },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { hasPermission, loading } = usePermissions()

  // Filter navigation items based on permissions and hidden status
  const filteredNavItems = useMemo(() => {
    if (loading) return []
    
    return navItems.filter(item => {
      // Skip hidden items
      if (item.hidden) return false
      
      // If no permission is specified, show the item
      if (!item.permission) return true
      
      // Check if user has the required permission
      return hasPermission(item.permission)
    })
  }, [hasPermission, loading])

  return (
    <motion.aside
      className={cn(
        "fixed top-12 right-0 bg-card text-card-foreground border-l h-[calc(100vh-3rem)]",
        isCollapsed ? "w-16" : "w-64",
      )}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      <div className="flex flex-col h-full text-right">
        <div className="flex items-center justify-end p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-2">
            {filteredNavItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-start p-2 mx-2 rounded-lg",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-[#e0f2fe] hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn("mr-2", { "sr-only": isCollapsed })}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </motion.aside>
  )
}
