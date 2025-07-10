"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Home, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Award,
  Star,
  BarChart,
  CheckCircle,
  Clock,
  Rocket
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"

const navItems = [
  { 
    name: "لوحة التحكم", 
    href: "/judge-dashboard", 
    icon: Home,
    permission: { category: 'dashboard', action: 'view' }
  },
  { 
    name: "التقييم", 
    href: "/judge-dashboard/evaluate", 
    icon: Star,
    permission: { category: 'evaluation', action: 'view' }
  },
  { 
    name: "المشاريع بانتظار التقييم", 
    href: "/judge-dashboard/pending", 
    icon: Clock,
    permission: { category: 'evaluation', action: 'view' }
  },
  { 
    name: "التقييمات المكتملة", 
    href: "/judge-dashboard/completed", 
    icon: CheckCircle,
    permission: { category: 'evaluation', action: 'view' }
  },
  { 
    name: "الهاكاثونات", 
    href: "/judge-dashboard/hackathons", 
    icon: Rocket,
    permission: { category: 'hackathons', action: 'view' }
  },
  { 
    name: "معايير التقييم", 
    href: "/judge-dashboard/criteria", 
    icon: Award,
    permission: { category: 'evaluation', action: 'view' }
  },
  { 
    name: "التقارير والإحصائيات", 
    href: "/judge-dashboard/reports", 
    icon: BarChart,
    permission: { category: 'reports', action: 'view' }
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
