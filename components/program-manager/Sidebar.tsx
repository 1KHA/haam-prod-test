"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  ClipboardList,
  Award,
  FileCheck,
  UserCheck,
  DollarSign,
  BookOpen,
  BarChart,
  Briefcase,
  Handshake
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"

const navItems = [
  { 
    name: "لوحة التحكم", 
    href: "/program-manager-dashboard", 
    icon: Layers,
    permission: { category: 'dashboard', action: 'view' }
  },
  { 
    name: "إدارة الدفعات", 
    href: "/program-manager-dashboard/cohorts", 
    icon: Users,
    permission: { category: 'cohorts', action: 'view' }
  },
  { 
    name: "إدارة الشركات الناشئة", 
    href: "/program-manager-dashboard/startups", 
    icon: Briefcase,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "مراجعة الطلبات", 
    href: "/program-manager-dashboard/applications", 
    icon: FileCheck,
    permission: { category: 'applications', action: 'view' }
  },
  { 
    name: "اختيار المتقدمين", 
    href: "/program-manager-dashboard/selection", 
    icon: UserCheck,
    permission: { category: 'applications', action: 'view' }
  },
  { 
    name: "تعيين الموجهين", 
    href: "/program-manager-dashboard/mentors", 
    icon: Award,
    permission: { category: 'mentorship', action: 'view' }
  },
  { 
    name: "جدولة الجلسات", 
    href: "/program-manager-dashboard/sessions", 
    icon: Handshake,
    permission: { category: 'mentorship', action: 'view' }
  },
  { 
    name: "إدارة الفعاليات", 
    href: "/program-manager-dashboard/events", 
    icon: Calendar,
    permission: { category: 'events', action: 'view' }
  },
  { 
    name: "إدارة التمويل", 
    href: "/program-manager-dashboard/funding", 
    icon: DollarSign,
    permission: { category: 'funding', action: 'view' }
  },
  { 
    name: "الموارد التعليمية", 
    href: "/program-manager-dashboard/resources", 
    icon: BookOpen,
    permission: { category: 'resources', action: 'view' }
  },
  { 
    name: "التقييم والملاحظات", 
    href: "/program-manager-dashboard/feedback", 
    icon: FileText,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "المهام والمراحل", 
    href: "/program-manager-dashboard/milestones", 
    icon: ClipboardList,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "التقارير والتحليلات", 
    href: "/program-manager-dashboard/reports", 
    icon: BarChart,
    permission: { category: 'reports', action: 'view' }
  },
  { 
    name: "المناقشات", 
    href: "/program-manager-dashboard/discussions", 
    icon: MessageSquare,
    permission: { category: 'discussions', action: 'view' }
  },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { hasPermission, loading } = usePermissions()

  // Filter navigation items based on permissions
  const filteredNavItems = useMemo(() => {
    if (loading) return []
    
    return navItems.filter(item => {
      if (!item.permission) return true
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
        <div className="flex items-center justify-start p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
                      : "hover:bg-accent hover:text-accent-foreground",
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
