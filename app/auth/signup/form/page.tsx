"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/lib/auth"

export default function SignUpForm() {
  const router = useRouter()
  const { signUp, isLoading, error } = useAuth()
  const [signupType, setSignupType] = useState<string | null>(null)
  const [signupRole, setSignupRole] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })
  
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Retrieve the signup type and role from localStorage
    const type = localStorage.getItem("signupType")
    const role = localStorage.getItem("signupRole")
    
    if (!type || !role) {
      // If no type or role is found, redirect back to the first step
      router.push("/auth/signup")
    } else {
      setSignupType(type)
      setSignupRole(role)
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate password and confirmPassword
    if (name === "password" || name === "confirmPassword") {
      validatePasswords(name, value)
    }
  }
  
  const validatePasswords = (field: string, value: string) => {
    if (field === "password") {
      if (value.length < 8) {
        setErrors(prev => ({ ...prev, password: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }))
      } else {
        setErrors(prev => ({ ...prev, password: "" }))
      }
      
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "كلمات المرور غير متطابقة" }))
      } else if (formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "" }))
      }
    }
    
    if (field === "confirmPassword") {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: "كلمات المرور غير متطابقة" }))
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "كلمات المرور غير متطابقة" }))
      return
    }
    
    if (formData.password.length < 8) {
      setErrors(prev => ({ ...prev, password: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }))
      return
    }
    
    // Get the role from localStorage
    const role = localStorage.getItem("signupRole")
    
    // Map the role to UserRole enum
    let userRole: UserRole;
    if (role === "moderator") {
      if (signupType === "hackathon") {
        userRole = UserRole.JUDGE;
      } else {
        userRole = UserRole.MENTOR;
      }
    } else {
      if (signupType === "hackathon") {
        userRole = UserRole.PARTICIPANT;
      } else {
        userRole = UserRole.STARTUP;
      }
    }
    
    // Create user data
    const userData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      role: userRole,
      companyName: userRole === UserRole.STARTUP ? "My Startup" : undefined,
    };
    
    // Sign up user
    await signUp(userData);
    
    // Clear localStorage
    localStorage.removeItem("signupType");
    localStorage.removeItem("signupRole");
    
    // No need to handle redirection here as it's handled in the auth context
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">إكمال التسجيل</h1>
        <p className="text-muted-foreground mt-2">
          {signupType === "hackathon" 
            ? (signupRole === "user" ? "أكمل بياناتك للتسجيل كمشارك في الهاكاثون" : "أكمل بياناتك للتسجيل كمشرف في الهاكاثون")
            : (signupRole === "user" ? "أكمل بياناتك للتسجيل كرائد أعمال" : "أكمل بياناتك للتسجيل كمرشد في المسرع")}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              الاسم الأول
            </label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              الاسم الأخير
            </label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            البريد الإلكتروني
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            رقم الهاتف
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            كلمة المرور
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            تأكيد كلمة المرور
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/auth/signup/role")}
          >
            رجوع
          </Button>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
          </Button>
        </div>
      </form>
    </div>
  )
}
