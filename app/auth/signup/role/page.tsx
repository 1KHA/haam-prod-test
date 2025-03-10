"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Shield } from "lucide-react"

export default function SignUpRoleSelection() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [signupType, setSignupType] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve the signup type from localStorage
    const type = localStorage.getItem("signupType")
    if (!type) {
      // If no type is found, redirect back to the first step
      router.push("/auth/signup")
    } else {
      setSignupType(type)
    }
  }, [router])

  const handleSelect = (role: "user" | "moderator" | "accelerator") => {
    setIsLoading(true)
    
    // Store the selection in localStorage
    localStorage.setItem("signupRole", role)
    
    // Navigate to the final step
    setTimeout(() => {
      router.push("/auth/signup/form")
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">اختر نوع الحساب</h1>
        <p className="text-muted-foreground mt-2">
          {signupType === "hackathon" 
            ? "حدد دورك في الهاكاثون" 
            : "حدد دورك في مسرع الأعمال"}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleSelect("user")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <User className="h-12 w-12 mb-4 text-primary" />
            <h2 className="text-xl font-bold">مشارك</h2>
            <p className="text-muted-foreground mt-2">
              {signupType === "hackathon" 
                ? "سجل كمشارك في الهاكاثون وانضم إلى الفرق" 
                : "سجل كرائد أعمال في برنامج المسرع"}
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => handleSelect("moderator")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Shield className="h-12 w-12 mb-4 text-primary" />
            <h2 className="text-xl font-bold">مشرف</h2>
            <p className="text-muted-foreground mt-2">
              {signupType === "hackathon" 
                ? "سجل كمشرف أو موجه في الهاكاثون" 
                : "سجل كمرشد أو مستشار في برنامج المسرع"}
            </p>
          </CardContent>
        </Card>
        
        {signupType !== "hackathon" && (
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleSelect("accelerator")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Shield className="h-12 w-12 mb-4 text-primary" />
              <h2 className="text-xl font-bold">مسرع أعمال</h2>
              <p className="text-muted-foreground mt-2">
                سجل كمسرع أعمال لإدارة البرامج والشركات الناشئة
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/auth/signup")}
        >
          رجوع
        </Button>
      </div>
    </div>
  )
}
