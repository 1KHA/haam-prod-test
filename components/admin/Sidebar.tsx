"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Users, 
  Settings, 
  BarChart, 
  FileText, 
  DollarSign, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  Shield,
  Code,
  Building,
  CreditCard,
  Database,
  Lock,
  UserPlus,
  Briefcase,
  Bell,
  Activity,
  LineChart,
  PieChart,
  Server,
  Sliders,
  Link as LinkIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { 
    name: "لوحة التحكم", 
    href: "/admin-dashboard", 
    icon: BarChart 
  },
  { 
    name: "إدارة المستخدمين", 
    href: "/admin-dashboard/users", 
    icon: Users,
    subItems: [
      { name: "جميع المستخدمين", href: "/admin-dashboard/users" },
      { name: "طلبات التسجيل", href: "/admin-dashboard/users/registration-requests" },
      { name: "إضافة مستخدم", href: "/admin-dashboard/users/add" },
      { name: "الأدوار والصلاحيات", href: "/admin-dashboard/users/roles" }
    ]
  },
  { 
    name: "إدارة التكاملات", 
    href: "/admin-dashboard/integrations", 
    icon: LinkIcon 
  },
  { 
    name: "إدارة الشركات الناشئة", 
    href: "/admin-dashboard/startups", 
    icon: Building,
    subItems: [
      { name: "جميع الشركات", href: "/admin-dashboard/startups" },
      { name: "طلبات الانضمام", href: "/admin-dashboard/startups/applications" },
      { name: "إضافة شركة", href: "/admin-dashboard/startups/add" },
      { name: "تعيين المرشدين", href: "/admin-dashboard/startups/assign-mentors" }
    ]
  },
  { 
    name: "إدارة البرامج", 
    href: "/admin-dashboard/programs", 
    icon: Layers,
    subItems: [
      { name: "جميع البرامج", href: "/admin-dashboard/programs" },
      { name: "إضافة برنامج", href: "/admin-dashboard/programs/add" },
      { name: "إدارة الدفعات", href: "/admin-dashboard/programs/cohorts" },
      { name: "تعيين المديرين", href: "/admin-dashboard/programs/assign-managers" }
    ]
  },
  { 
    name: "إدارة الهاكاثونات", 
    href: "/admin-dashboard/hackathons", 
    icon: Code,
    subItems: [
      { name: "جميع الهاكاثونات", href: "/admin-dashboard/hackathons" },
      { name: "إضافة هاكاثون", href: "/admin-dashboard/hackathons/add" },
      { name: "تعيين المحكمين", href: "/admin-dashboard/hackathons/assign-judges" }
    ]
  },
  { 
    name: "إدارة التمويل", 
    href: "/admin-dashboard/funding", 
    icon: DollarSign,
    subItems: [
      { name: "طلبات التمويل", href: "/admin-dashboard/funding" },
      { name: "المستثمرين", href: "/admin-dashboard/funding/investors" },
      { name: "صرف التمويل", href: "/admin-dashboard/funding/disbursements" },
      { name: "التقارير المالية", href: "/admin-dashboard/funding/reports" }
    ]
  },
  { 
    name: "إدارة المدفوعات", 
    href: "/admin-dashboard/payments", 
    icon: CreditCard,
    subItems: [
      { name: "جميع المعاملات", href: "/admin-dashboard/payments" },
      { name: "المدفوعات المعلقة", href: "/admin-dashboard/payments/pending" },
      { name: "سجل المدفوعات", href: "/admin-dashboard/payments/history" }
    ]
  },
  { 
    name: "التقارير والتحليلات", 
    href: "/admin-dashboard/reports", 
    icon: FileText,
    subItems: [
      { name: "تقارير المستخدمين", href: "/admin-dashboard/reports/users" },
      { name: "تقارير الشركات", href: "/admin-dashboard/reports/startups" },
      { name: "تقارير البرامج", href: "/admin-dashboard/reports/programs" },
      { name: "تقارير التمويل", href: "/admin-dashboard/reports/funding" },
      { name: "تقارير الأداء", href: "/admin-dashboard/reports/performance" }
    ]
  },
  { 
    name: "الفعاليات", 
    href: "/admin-dashboard/events", 
    icon: Calendar,
    subItems: [
      { name: "جميع الفعاليات", href: "/admin-dashboard/events" },
      { name: "إضافة فعالية", href: "/admin-dashboard/events/add" },
      { name: "إدارة التسجيل", href: "/admin-dashboard/events/registrations" }
    ]
  },
  { 
    name: "إدارة النظام", 
    href: "/admin-dashboard/system", 
    icon: Server,
    subItems: [
      { name: "إعدادات النظام", href: "/admin-dashboard/system/settings" },
      { name: "إدارة الصفحات", href: "/admin-dashboard/system/pages" },
      { name: "إدارة الميزات", href: "/admin-dashboard/system/features" },
      { name: "النسخ الاحتياطي", href: "/admin-dashboard/system/backup" }
    ]
  },
  { 
    name: "الأمن والامتثال", 
    href: "/admin-dashboard/security", 
    icon: Lock,
    subItems: [
      { name: "سجلات النشاط", href: "/admin-dashboard/security/logs" },
      { name: "إعدادات الأمان", href: "/admin-dashboard/security/settings" },
      { name: "مراقبة النظام", href: "/admin-dashboard/security/monitoring" }
    ]
  },
  { 
    name: "الإعدادات", 
    href: "/admin-dashboard/settings", 
    icon: Settings 
  }
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const pathname = usePathname()

  const toggleExpand = (name: string) => {
    if (expandedItem === name) {
      setExpandedItem(null)
    } else {
      setExpandedItem(name)
    }
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
            {navItems.map((item) => (
              <li key={item.name} className="mb-1">
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => !isCollapsed && toggleExpand(item.name)}
                      className={cn(
                        "w-full flex items-center justify-end p-2 mx-2 rounded-lg",
                        pathname.startsWith(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {!isCollapsed && (
                        <ChevronLeft 
                          className={cn(
                            "h-4 w-4 ml-2 transition-transform", 
                            expandedItem === item.name && "transform rotate-90"
                          )} 
                        />
                      )}
                      <span className={cn("ml-2", { "sr-only": isCollapsed })}>{item.name}</span>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                    </button>
                    {!isCollapsed && expandedItem === item.name && (
                      <ul className="pr-6 mt-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center justify-end p-2 mx-2 rounded-lg text-sm",
                                pathname === subItem.href
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-accent hover:text-accent-foreground",
                              )}
                            >
                              <span>{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
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
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </motion.aside>
  )
}
