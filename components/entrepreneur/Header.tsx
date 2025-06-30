"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Bell, User, Search, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { setTheme, theme } = useTheme()

  return (
    <header className="bg-background border-b px-4 py-3 flex items-center justify-between mb-4 text-right mt-12">
      <div className="flex-1">
        <h1 className="text-xl font-bold">لوحة تحكم رائد الأعمال</h1>
        <p className="text-sm text-muted-foreground">أدر شركاتك الناشئة وقدم على البرامج المتاحة</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث..." className="pr-8 w-full" />
        </div>
        <Button variant="outline" size="icon" onClick={() => router.push("/entrepreneur-dashboard/notifications")}>
          <Bell className="h-4 w-4" />
        </Button>
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
