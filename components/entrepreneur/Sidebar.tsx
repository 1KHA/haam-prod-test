"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  User, 
  Users, 
  Rocket, 
  BookOpen, 
  Calendar, 
  Target, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Bell,
  X
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
  { 
    name: "الإشعارات", 
    href: "/entrepreneur-dashboard/notifications",
    icon: Bell
    // No permission required - all entrepreneurs can see notifications
  },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose, collapsed = false, onCollapseChange }: SidebarProps) {
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

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-12 right-0 bg-card text-card-foreground border-l h-[calc(100vh-3rem)] z-50",
          "hidden lg:block",
          collapsed ? "w-16" : "w-64",
        )}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex flex-col h-full text-right">
          <div className="flex items-center justify-end p-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => onCollapseChange?.(!collapsed)}>
              {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
                    <span className={cn("mr-2", { "sr-only": collapsed })}>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed top-12 right-0 bg-card text-card-foreground border-l h-[calc(100vh-3rem)] w-64 z-50 lg:hidden"
          >
            <div className="flex flex-col h-full text-right">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold">القائمة</span>
                <Button variant="ghost" size="icon" onClick={onMobileClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex-1 overflow-y-auto">
                <ul className="py-2">
                  {filteredNavItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center justify-start p-2 mx-2 rounded-lg",
                          isActive(item)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-[#e0f2fe] hover:text-accent-foreground",
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="mr-2">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
