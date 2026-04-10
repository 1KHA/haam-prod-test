"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default function PendingApprovalPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md p-8">
        <div className="flex justify-center">
          <Clock className="h-16 w-16 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold">حسابك قيد المراجعة</h1>
        <p className="text-muted-foreground">
          تم استلام طلب التسجيل بنجاح. سيقوم المسؤول بمراجعة طلبك والموافقة عليه قريباً.
        </p>
        <p className="text-sm text-muted-foreground">
          بعد الموافقة، يمكنك تسجيل الدخول والوصول إلى لوحة التحكم.
        </p>
        <Button onClick={() => router.push("/auth/signin")} variant="outline">
          العودة لتسجيل الدخول
        </Button>
      </div>
    </div>
  )
}
