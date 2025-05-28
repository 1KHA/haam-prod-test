"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Home, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Rocket,
  DollarSign,
  TrendingUp,
  BarChart,
  Briefcase,
  Users,
  Search,
  PieChart,
  Video,
  UserPlus,
  FileCheck,
  Activity,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"

const navItems = [
  { 
    name: "لوحة التحكم", 
    href: "/investor-dashboard", 
    icon: Home,
    permission: { category: 'dashboard', action: 'view' }
  },
  { 
    name: "الملف الشخصي", 
    href: "/investor-dashboard/profile", 
    icon: Settings,
    permission: { category: 'users', action: 'view' }
  },
  { 
    name: "اكتشاف الشركات الناشئة", 
    href: "/investor-dashboard/discover", 
    icon: Search,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "المحفظة الاستثمارية", 
    href: "/investor-dashboard/portfolio", 
    icon: Briefcase,
    permission: { category: 'portfolio', action: 'view' }
  },
  { 
    name: "الفرص الاستثمارية", 
    href: "/investor-dashboard/opportunities", 
    icon: TrendingUp,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "العناية الواجبة", 
    href: "/investor-dashboard/due-diligence", 
    icon: FileCheck,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "العروض والاجتماعات", 
    href: "/investor-dashboard/pitches", 
    icon: Video,
    permission: { category: 'startups', action: 'view' }
  },
  { 
    name: "إدارة الصفقات", 
    href: "/investor-dashboard/deals", 
    icon: DollarSign,
    permission: { category: 'funding', action: 'view' }
  },
  { 
    name: "أداء الشركات الناشئة", 
    href: "/investor-dashboard/performance", 
    icon: Activity,
    permission: { category: 'portfolio', action: 'view' }
  },
  { 
    name: "التقارير المالية", 
    href: "/investor-dashboard/reports", 
    icon: FileText,
    permission: { category: 'reports', action: 'view' }
  },
  { 
    name: "التحليلات", 
    href: "/investor-dashboard/analytics", 
    icon: BarChart,
    permission: { category: 'analytics', action: 'view' }
  },
  { 
    name: "الفعاليات", 
    href: "/investor-dashboard/events", 
    icon: Calendar,
    permission: { category: 'events', action: 'view' }
  },
  { 
    name: "شبكة المستثمرين", 
    href: "/investor-dashboard/network", 
    icon: Users,
    permission: { category: 'discussions', action: 'view' }
  },
  { 
    name: "المناقشات", 
    href: "/investor-dashboard/discussions", 
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
                    "flex items-center justify-end p-2 mx-2 rounded-lg",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span className={cn("ml-2", { "sr-only": isCollapsed })}>{item.name}</span>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </motion.aside>
  )
}
