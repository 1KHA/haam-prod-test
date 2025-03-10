"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                تسجيل الخروج
              </Button>
              <span className="text-sm">
                مرحباً، {user.name}
              </span>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/auth/signin")}
            >
              تسجيل الدخول
            </Button>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">مرحباً بك في منصة الشركات الناشئة</h1>
          <p className="text-muted-foreground">ابدأ رحلة شركتك الناشئة وانضم إلى برامج مسرعات الأعمال</p>
        </div>
      </div>
    </header>
  )
}
