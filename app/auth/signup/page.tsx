"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
        <p className="text-muted-foreground mt-2">انضم إلى مسرعة الأعمال كرائد أعمال</p>
      </div>
      
      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/auth/signup/form")}>
        <CardContent className="p-8 flex flex-col items-center text-center">
          <Rocket className="h-16 w-16 mb-4 text-primary" />
          <h2 className="text-xl font-bold">مسرعة الأعمال</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            انضم إلى برنامج مسرعة الأعمال لتطوير مشروعك وتنميته
          </p>
          <Button size="lg" className="w-full max-w-xs">
            سجل كرائد أعمال
          </Button>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>هل تريد الانضمام كمرشد أو مستثمر أو مدير برنامج؟</p>
        <p className="mt-1">يرجى التواصل مع مسؤول المنصة لإنشاء حسابك.</p>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <a href="/auth/signin" className="text-primary hover:underline">
            تسجيل الدخول
          </a>
        </p>
      </div>
    </div>
  )
}