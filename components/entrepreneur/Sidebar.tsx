"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Home, 
  User, 
  Users, 
  Rocket, 
  BookOpen, 
  Calendar, 
  FileText, 
  DollarSign, 
  Target, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"

const navItems = [
  { 
    name: "لوحة التحكم", 
    href: "/entrepreneur-dashboard",
    icon: Home, 
    exact: true,
    permission: { category: 'dashboard', action: 'view' }
  },
  { 
    name: "الملف الشخصي", 
    href: "/entrepreneur-dashboard/profile",
    icon: User,
    permission: { category: 'profile', action: 'view' }
  },
  { 
    name: "الشركات الناشئة", 
    href: "/entrepreneur-dashboard/startups",
    icon: Briefcase,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "فريق العمل", 
    href: "/entrepreneur-dashboard/team",
    icon: Users,
    permission: { category: 'users', action: 'view' }
  },
  { 
    name: "التقديم للبرامج", 
    href: "/entrepreneur-dashboard/apply",
    icon: Rocket,
    permission: { category: 'applications', action: 'add' }
  },
  { 
    name: "الموجهون", 
    href: "/entrepreneur-dashboard/mentors",
    icon: BookOpen,
    permission: { category: 'mentorship', action: 'view' }
  },
  { 
    name: "الفعاليات", 
    href: "/entrepreneur-dashboard/events",
    icon: Calendar,
    permission: { category: 'events', action: 'view' }
  },
  { 
    name: "الموارد التعليمية", 
    href: "/entrepreneur-dashboard/resources",
    icon: FileText,
    permission: { category: 'resources', action: 'view' }
  },
  { 
    name: "طلبات التمويل", 
    href: "/entrepreneur-dashboard/funding",
    icon: DollarSign,
    permission: { category: 'funding', action: 'view' }
  },
  { 
    name: "المراحل والتقدم", 
    href: "/entrepreneur-dashboard/milestones",
    icon: Target,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "الدعم والمساعدة", 
    href: "/entrepreneur-dashboard/support",
    icon: HelpCircle,
    permission: { category: 'support', action: 'view' }
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

  // Function to check if a nav item is active
  const isActive = (item: { href: string, exact?: boolean }) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

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
                    isActive(item)
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
