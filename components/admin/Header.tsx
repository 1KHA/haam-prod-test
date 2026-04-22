"use client"

import { User, LogOut, Menu } from "lucide-react"
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
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/NotificationBell"

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { setTheme, theme } = useTheme()
  const { signOut } = useAuth()
  const router = useRouter()

  return (
    <header className="bg-background border-b h-14 px-4 flex items-center justify-between mb-4 text-right">
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
        <h1 className="text-xl font-bold">لوحة تحكم المدير</h1>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin-dashboard/users")}>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin-dashboard/system/settings")}>الإعدادات</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              تبديل المظهر
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
