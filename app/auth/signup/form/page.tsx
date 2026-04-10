"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/lib/auth"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function SignUpForm() {
  const router = useRouter()
  const { signUp, isLoading, error } = useAuth()
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialization: "",
    organizationName: "",
  })
  
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    phone: "",
  })

  const specializations = [
    "هندسة البرمجيات",
    "علوم الحاسب",
    "الذكاء الاصطناعي",
    "تحليل البيانات",
    "أمن المعلومات",
    "تطوير الويب",
    "تطوير تطبيقات الجوال",
    "إدارة المشاريع التقنية",
    "تصميم واجهات المستخدم",
    "تجربة المستخدم",
    "التسويق الرقمي",
    "ريادة الأعمال",
    "الهندسة المدنية",
    "الهندسة الميكانيكية",
    "الهندسة الكهربائية",
    "الهندسة الصناعية",
    "الطب",
    "الصيدلة",
    "التمريض",
    "العلوم الصحية",
    "المحاسبة",
    "المالية",
    "إدارة الأعمال",
    "الموارد البشرية",
    "القانون",
    "التعليم",
    "علم النفس",
    "علم الاجتماع",
    "الإعلام والاتصال",
    "الفنون والتصميم",
    "أخرى"
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === "password" || name === "confirmPassword") {
      validatePasswords(name, value)
    }

    if (name === "phone") {
      if (/[a-zA-Z]/.test(value)) {
        setErrors(prev => ({ ...prev, phone: "رقم الهاتف لا يجب أن يحتوي على أحرف إنجليزية" }))
      } else if (value && !/^\+?[0-9\s\-]{7,20}$/.test(value)) {
        setErrors(prev => ({ ...prev, phone: "رقم الهاتف يجب أن يحتوي على أرقام فقط" }))
      } else {
        setErrors(prev => ({ ...prev, phone: "" }))
      }
    }
  }
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, specialization: value }))
  }
  
  const validatePassword = (value: string): string => {
    if (value.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
    if (!/[A-Z]/.test(value)) return "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل"
    if (!/[a-z]/.test(value)) return "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل"
    if (!/[0-9]/.test(value)) return "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل"
    if (!/[^A-Za-z0-9]/.test(value)) return "كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل"
    return ""
  }

  const validatePasswords = (field: string, value: string) => {
    if (field === "password") {
      const passwordError = validatePassword(value)
      setErrors(prev => ({ ...prev, password: passwordError }))

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

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setErrors(prev => ({ ...prev, password: passwordError }))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "كلمات المرور غير متطابقة" }))
      return
    }

    if (formData.phone && /[a-zA-Z]/.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: "رقم الهاتف لا يجب أن يحتوي على أحرف إنجليزية" }))
      return
    }
    
    // Always register as ENTREPRENEUR — other roles are admin-only
    const userData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      role: UserRole.ENTREPRENEUR,
      specialization: formData.specialization,
      phone: formData.phone,
      organizationName: formData.organizationName,
    };
    
    await signUp(userData);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">تسجيل رائد أعمال</h1>
        <p className="text-muted-foreground mt-2">
          أكمل بياناتك للانضمام إلى مسرعة الأعمال
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
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="organizationName" className="text-sm font-medium">
            اسم المشروع أو المنظمة
          </label>
          <Input
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="اسم شركتك أو مشروعك الناشئ"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="specialization" className="text-sm font-medium">
            التخصص
          </Label>
          <Select
            value={formData.specialization}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger id="specialization" className="text-right justify-end">
              <SelectValue placeholder="اختر تخصصك" />
            </SelectTrigger>
            <SelectContent position="item-aligned" align="start" className="text-right justify-end">
              {specializations.map((specialization) => (
                <SelectItem key={specialization} value={specialization} className="text-right justify-end">
                  {specialization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onClick={() => router.push("/auth/signup")}
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