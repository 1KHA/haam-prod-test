"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Users, Flag, Award, Star, Book, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "لوحة التحكم", href: "/dashboard", icon: Home },
  { name: "المستخدمون", href: "/dashboard/users", icon: Users },
  { name: "الفرق", href: "/dashboard/teams", icon: Flag },
  { name: "الحكام", href: "/dashboard/judges", icon: Award },
  { name: "النتائج", href: "/dashboard/scores", icon: Star },
  { name: "الموجهون", href: "/dashboard/mentors", icon: Book },
  { name: "الفعاليات", href: "/dashboard/events", icon: Calendar },
  { name: "الجدول الزمني", href: "/dashboard/schedule", icon: Calendar },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <motion.aside
      className={cn(
        "fixed top-12 right-0 bg-card text-card-foreground border-l h-[calc(100vh-3rem)]",
        isCollapsed ? "w-16" : "w-64",
      )}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-2">
            {navItems.map((item) => (
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

