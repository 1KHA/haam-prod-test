"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket } from "lucide-react"

export default function SignUpStep1() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSelect = (type: "hackathon" | "accelerator") => {
    setIsLoading(true)
    
    // Store the selection in localStorage
    localStorage.setItem("signupType", type)
    
    // Navigate to the next step
    setTimeout(() => {
      router.push("/auth/signup/role")
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
        <p className="text-muted-foreground mt-2">اختر نوع البرنامج الذي تريد التسجيل فيه</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleSelect("hackathon")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Rocket className="h-12 w-12 mb-4 text-primary" />
            <h2 className="text-xl font-bold">هاكثون</h2>
            <p className="text-muted-foreground mt-2">
              سجل في منصة ديم وشارك في تحديات البرمجة والابتكار
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleSelect("accelerator")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Rocket className="h-12 w-12 mb-4 text-primary" />
            <h2 className="text-xl font-bold">مسرعة الأعمال</h2>
            <p className="text-muted-foreground mt-2">
              انضم إلى برنامج مسرعة الأعمال لتطوير مشروعك وتنميته
            </p>
          </CardContent>
        </Card>
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
