"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function NewUserPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !role) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          specialization: specialization || undefined
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "تم إنشاء المستخدم بنجاح",
          description: `تم إنشاء المستخدم ${data.name} بنجاح`
        })
        
        // Redirect to users list
        router.push('/admin-dashboard/users')
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل إنشاء المستخدم",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "خطأ",
        description: "فشل إنشاء المستخدم",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => router.push("/admin-dashboard/users")}
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى قائمة المستخدمين</span>
        </Button>
        <h1 className="text-3xl font-bold">إضافة مستخدم جديد</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات المستخدم</CardTitle>
          <CardDescription>أدخل معلومات المستخدم الجديد</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input 
                id="name" 
                placeholder="أدخل اسم المستخدم" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@domain.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">الدور</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="اختر دور المستخدم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">مدير النظام</SelectItem>
                  <SelectItem value="PROGRAM_MANAGER">مدير برنامج</SelectItem>
                  <SelectItem value="MENTOR">موجه</SelectItem>
                  <SelectItem value="INVESTOR">مستثمر</SelectItem>
                  <SelectItem value="PARTICIPANT">مشارك</SelectItem>
                  <SelectItem value="ENTREPRENEUR">رائد أعمال</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialization">التخصص (اختياري)</Label>
              <Input 
                id="specialization" 
                placeholder="أدخل تخصص المستخدم" 
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin-dashboard/users")}
              type="button"
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء المستخدم'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Toaster />
    </div>
  )
}
