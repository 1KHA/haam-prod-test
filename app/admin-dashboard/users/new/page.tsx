"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Role {
  id: string;
  name: string;
  description?: string;
  usersCount: number;
  permissions: Record<string, Record<string, boolean>>;
}

export default function NewUserPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Role name mapping for display
  const getRoleDisplayName = (roleName: string) => {
    const roleMap: Record<string, string> = {
      "ADMIN": "مدير النظام",
      "PROGRAM_MANAGER": "مدير برنامج", 
      "MENTOR": "موجه",
      "INVESTOR": "مستثمر",
      "ENTREPRENEUR": "رائد أعمال",
    };
    return roleMap[roleName] || roleName;
  };
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      if (!token) return;
      
      try {
        setRolesLoading(true);
        const response = await fetch('/api/admin/roles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        } else {
          console.error('Failed to fetch roles');
          // Fallback to default roles if API fails
          setRoles([
            { id: '1', name: 'ADMIN', usersCount: 0, permissions: {} },
            { id: '2', name: 'PROGRAM_MANAGER', usersCount: 0, permissions: {} },
            { id: '3', name: 'MENTOR', usersCount: 0, permissions: {} },
            { id: '4', name: 'INVESTOR', usersCount: 0, permissions: {} },
            { id: '5', name: 'ENTREPRENEUR', usersCount: 0, permissions: {} }
          ]);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Fallback to default roles
        setRoles([
          { id: '1', name: 'ADMIN', usersCount: 0, permissions: {} },
          { id: '2', name: 'PROGRAM_MANAGER', usersCount: 0, permissions: {} },
          { id: '3', name: 'MENTOR', usersCount: 0, permissions: {} },
          { id: '4', name: 'INVESTOR', usersCount: 0, permissions: {} },
          { id: '5', name: 'ENTREPRENEUR', usersCount: 0, permissions: {} }
        ]);
      } finally {
        setRolesLoading(false);
      }
    };
    
    fetchRoles();
  }, [token]);
  
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "خطأ",
        description: "صيغة البريد الإلكتروني غير صحيحة",
        variant: "destructive"
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    // Check for authentication token
    if (!token) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      })
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
  
  // Show login notice if not authenticated
  if (!token) {
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
          <CardContent className="py-8">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">يجب تسجيل الدخول أولاً لإضافة مستخدم جديد</p>
              <Button onClick={() => router.push("/auth/signin")}>تسجيل الدخول</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                  <SelectValue placeholder={rolesLoading ? "جاري التحميل..." : "اختر دور المستخدم"} />
                </SelectTrigger>
                <SelectContent>
                  {rolesLoading ? (
                    <SelectItem value="loading-placeholder" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري التحميل...
                      </div>
                    </SelectItem>
                  ) : roles.length > 0 ? (
                    roles.map((roleItem) => (
                      <SelectItem key={roleItem.id} value={roleItem.name}>
                        <div className="flex flex-col">
                          <span>{getRoleDisplayName(roleItem.name)}</span>
                          {roleItem.description && (
                            <span className="text-xs text-muted-foreground">{roleItem.description}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-roles-placeholder" disabled>لا توجد أدوار متاحة</SelectItem>
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
