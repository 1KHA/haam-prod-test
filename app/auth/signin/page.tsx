"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      
      // In a real app, this would be determined by the user's role in the database
      // For demo purposes, we'll use the email to determine the role
      if (email.includes("admin") || email.includes("moderator")) {
        // Redirect moderators to the admin dashboard
        router.push("/dashboard")
      } else {
        // Redirect regular users to the participant dashboard
        router.push("/participant-dashboard")
      }
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
        <p className="text-muted-foreground mt-2">أدخل بياناتك للوصول إلى حسابك</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            البريد الإلكتروني
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              كلمة المرور
            </label>
            <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  )
}
