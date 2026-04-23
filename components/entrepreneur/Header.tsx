"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { User, LogIn, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { NotificationBell } from "@/components/NotificationBell"

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { setTheme, theme } = useTheme()

  return (
    <header className="bg-background border-b px-4 py-3 flex items-center justify-between mb-4 text-right">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">لوحة تحكم رائد الأعمال</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">أدر شركاتك الناشئة وقدم على البرامج المتاحة</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/entrepreneur-dashboard/profile")}>
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/entrepreneur-dashboard/settings")}>
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                تبديل المظهر
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/auth/signin")}
          >
            <LogIn className="h-4 w-4 ml-2" />
            تسجيل الدخول
          </Button>
        )}
      </div>
    </header>
  )
}
