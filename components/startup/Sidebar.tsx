"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  DollarSign, 
  FileText, 
  Target, 
  MessageSquare,
  FileBarChart,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"

const navItems = [
  { 
    name: "لوحة التحكم", 
    href: "/startup-dashboard", 
    icon: Home,
    permission: { category: 'dashboard', action: 'view' }
  },
  { 
    name: "فريق العمل", 
    href: "/startup-dashboard/team", 
    icon: Users,
    permission: { category: 'users', action: 'view' }
  },
  { 
    name: "الفعاليات", 
    href: "/startup-dashboard/events", 
    icon: Calendar,
    permission: { category: 'events', action: 'view' }
  },
  { 
    name: "الموجهون", 
    href: "/startup-dashboard/mentors", 
    icon: BookOpen,
    permission: { category: 'mentorship', action: 'view' }
  },
  { 
    name: "التمويل", 
    href: "/startup-dashboard/funding", 
    icon: DollarSign,
    permission: { category: 'funding', action: 'view' }
  },
  { 
    name: "الموارد", 
    href: "/startup-dashboard/resources", 
    icon: FileText,
    permission: { category: 'resources', action: 'view' }
  },
  { 
    name: "المراحل", 
    href: "/startup-dashboard/milestones", 
    icon: Target,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "التقارير", 
    href: "/startup-dashboard/reports", 
    icon: FileBarChart,
    permission: { category: 'reports', action: 'view' }
  },
  { 
    name: "المناقشات", 
    href: "/startup-dashboard/discussions", 
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
