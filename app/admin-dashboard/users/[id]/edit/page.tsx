"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Arabic to enum mapping for roles
const ARABIC_ROLE_MAP: Record<string, string> = {
  'مدير النظام': 'ADMIN',
  'مدير برنامج': 'PROGRAM_MANAGER',
  'موجه': 'MENTOR',
  'مستثمر': 'INVESTOR',
  'رائد أعمال': 'ENTREPRENEUR',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  'ADMIN': 'مدير النظام',
  'PROGRAM_MANAGER': 'مدير برنامج',
  'MENTOR': 'موجه',
  'INVESTOR': 'مستثمر',
  'ENTREPRENEUR': 'رائد أعمال',
}

interface RoleOption {
  id: string
  name: string
  enumValue: string
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([])
  
  const router = useRouter()
  const { toast } = useToast()
  const { refreshPermissions } = usePermissions()
  const userId = params.id
  
  // Fetch available roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const response = await fetch('/api/admin/roles', {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        })
        if (response.ok) {
          const data = await response.json()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const roles: RoleOption[] = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            enumValue: ARABIC_ROLE_MAP[r.name] || r.name,
          }))
          setAvailableRoles(roles)
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
      }
    }
    fetchRoles()
  }, [])

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get token from localStorage
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        const response = await fetch(`/api/admin/users/${userId}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        const data = await response.json()
        
        if (response.ok) {
          setName(data.name)
          setEmail(data.email)
          setRole(data.role)
          setSpecialization(data.specialization || "")
        } else {
          toast({
            title: "خطأ",
            description: data.error || "فشل في جلب بيانات المستخدم",
            variant: "destructive"
          })
          router.push('/admin-dashboard/users')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        toast({
          title: "خطأ",
          description: "فشل في جلب بيانات المستخدم",
          variant: "destructive"
        })
        router.push('/admin-dashboard/users')
      } finally {
        setIsFetching(false)
      }
    }
    
    fetchUser()
  }, [userId, router, toast])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !role) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData: any = {
        name,
        email,
        role,
        specialization: specialization || undefined
      }
      
      // Only include password if it was changed
      if (password) {
        userData.password = password
      }
      
      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(userData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "تم تحديث المستخدم بنجاح",
          description: `تم تحديث بيانات المستخدم ${data.name} بنجاح`
        })
        
        // Refresh permissions if role changed
        await refreshPermissions()
        
        // Redirect to users list
        router.push('/admin-dashboard/users')
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل تحديث المستخدم",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "خطأ",
        description: "فشل تحديث المستخدم",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل بيانات المستخدم...</span>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تعديل المستخدم</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => router.push("/admin-dashboard/users")}
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى قائمة المستخدمين</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات المستخدم</CardTitle>
          <CardDescription>تعديل معلومات المستخدم</CardDescription>
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
              <Label htmlFor="password">كلمة المرور (اتركها فارغة إذا لم ترغب في تغييرها)</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">الدور</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="اختر دور المستخدم" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.length > 0 ? (
                    availableRoles.map((r) => (
                      <SelectItem key={r.id} value={r.enumValue}>
                        {r.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="ADMIN">مدير النظام</SelectItem>
                      <SelectItem value="PROGRAM_MANAGER">مدير برنامج</SelectItem>
                      <SelectItem value="MENTOR">موجه</SelectItem>
                      <SelectItem value="INVESTOR">مستثمر</SelectItem>
                      <SelectItem value="ENTREPRENEUR">رائد أعمال</SelectItem>
                    </>
                  )}
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
                  جاري التحديث...
                </>
              ) : (
                'تحديث المستخدم'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Toaster />
    </div>
  )
}
