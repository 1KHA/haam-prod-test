"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Loader2, Trash2, Edit, User, Briefcase, Calendar, Tag, Shield, CheckCircle, Clock, Ban } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import UserRolePermissionManager from "@/components/admin/UserRolePermissionManager"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  specialization?: string
  createdAt: string
  updatedAt: string
  status: string
  startupProfile?: any
  mentorProfile?: any
  investorProfile?: any
  acceleratorProfile?: any
  adminProfile?: any
  programManagerProfile?: any
  entrepreneurProfile?: any  // Added missing profile
  startups?: any[]
  teamMembers?: any[]
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const userId = params.id
  
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
          setUser(data)
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
        setIsLoading(false)
      }
    }
    
    fetchUser()
  }, [userId, router, toast])
  
  // Delete user
  const deleteUser = async () => {
    setIsDeleting(true)
    
    try {
      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (response.ok) {
        toast({
          title: "تم حذف المستخدم بنجاح",
          description: "تم حذف المستخدم وجميع بياناته بنجاح"
        })
        
        // Redirect to users list
        router.push('/admin-dashboard/users')
      } else {
        const data = await response.json()
        toast({
          title: "خطأ",
          description: data.error || "فشل حذف المستخدم",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "خطأ",
        description: "فشل حذف المستخدم",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // Get role display name - standardized with auth.ts and permissions.ts
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'مدير النظام',
      'PROGRAM_MANAGER': 'مدير برنامج',
      'MENTOR': 'موجه',
      'INVESTOR': 'مستثمر',
      'ENTREPRENEUR': 'رائد أعمال'
    }
    
    // If the role is not in the map, log a warning and return the role as-is
    if (!roleMap[role]) {
      console.warn(`Warning: No Arabic mapping found for role "${role}". Using the role value directly.`);
    }
    
    return roleMap[role] || role
  }
  
  // Get the appropriate profile based on role
  const getRoleSpecificProfile = (user: UserProfile) => {
    // Normalize role to uppercase for consistent comparison
    const role = user.role.toUpperCase();
    
    switch (role) {
      case 'MENTOR':
        return user.mentorProfile;
      case 'INVESTOR':
        return user.investorProfile;
      case 'ADMIN':
        return user.adminProfile;
      case 'PROGRAM_MANAGER':
        return user.programManagerProfile;
      case 'ENTREPRENEUR':
        return user.entrepreneurProfile;
      default:
        console.warn(`No profile mapping found for role: ${role}`);
        return null;
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل بيانات المستخدم...</span>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-bold mb-4">لم يتم العثور على المستخدم</h2>
        <Button 
          variant="outline" 
          onClick={() => router.push("/admin-dashboard/users")}
        >
          العودة إلى قائمة المستخدمين
        </Button>
      </div>
    )
  }
  
  // Status badge helper
  const statusBadge = (status: string) => {
    if (status === 'ACTIVE')
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" />نشط</span>
    if (status === 'PENDING_APPROVAL' || status === 'PENDING')
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" />قيد المراجعة</span>
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><Ban className="h-3 w-3" />معلق</span>
  }

  // Role-specific profile fields
  const roleProfile = getRoleSpecificProfile(user)
  const roleFields: { label: string; value: string }[] = (() => {
    if (!roleProfile) return []
    switch (user.role) {
      case 'MENTOR':
        return [
          { label: 'مجال الخبرة', value: roleProfile.expertise || '-' },
          { label: 'الخبرة', value: roleProfile.experience || '-' },
          { label: 'الإتاحة', value: roleProfile.availability || '-' },
        ]
      case 'INVESTOR':
        return [
          { label: 'اسم الشركة', value: roleProfile.companyName || '-' },
          { label: 'مجال الاستثمار', value: roleProfile.investmentFocus || '-' },
          { label: 'مرحلة الاستثمار', value: roleProfile.investmentStage || '-' },
          { label: 'حجم الاستثمار', value: roleProfile.investmentSize || '-' },
        ]
      case 'ENTREPRENEUR':
        return [
          { label: 'اسم المنظمة', value: roleProfile.organizationName || '-' },
          { label: 'المجال', value: roleProfile.industry || '-' },
          { label: 'مجالات التركيز', value: roleProfile.focusAreas || '-' },
          { label: 'الموقع الإلكتروني', value: roleProfile.website || '-' },
        ]
      case 'PROGRAM_MANAGER':
        return [
          { label: 'البرامج', value: roleProfile.programs || '-' },
          { label: 'المسؤوليات', value: roleProfile.responsibilities || '-' },
        ]
      case 'ADMIN':
        return [
          { label: 'القسم', value: roleProfile.department || '-' },
          { label: 'الصلاحيات', value: roleProfile.permissions || '-' },
        ]
      default:
        return []
    }
  })()

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تفاصيل المستخدم</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push(`/admin-dashboard/users/${userId}/edit`)}>
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
          <Button variant="destructive" size="sm" className="gap-1" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:justify-end">
          <TabsTrigger value="activity">النشاطات</TabsTrigger>
          <TabsTrigger value="permissions">الأدوار والصلاحيات</TabsTrigger>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
        </TabsList>

        {/* ── Profile tab ── */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Identity card */}
            <Card className="lg:col-span-1">
              <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                {/* Avatar */}
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Shield className="h-3 w-3" />
                    {getRoleDisplayName(user.role)}
                  </span>
                  {statusBadge(user.status)}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-col gap-3 text-sm">
                <div className="w-full flex items-start gap-2">
                  <Tag className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">التخصص</p>
                    <p>{user.specialization || '-'}</p>
                  </div>
                </div>
                <div className="w-full flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">تاريخ التسجيل</p>
                    <p>{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div className="w-full flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">آخر تحديث</p>
                    <p>{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Role profile */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  معلومات {getRoleDisplayName(user.role)}
                </CardTitle>
                <CardDescription>البيانات المرتبطة بدور المستخدم</CardDescription>
              </CardHeader>
              <CardContent>
                {roleFields.length > 0 ? (
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    {roleFields.map(({ label, value }) => (
                      <div key={label} className="border-b pb-3">
                        <dt className="text-xs text-muted-foreground mb-1">{label}</dt>
                        <dd className="font-medium break-words">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <User className="h-10 w-10 opacity-30" />
                    <p>لم يتم إكمال الملف الشخصي بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Permissions tab ── */}
        <TabsContent value="permissions">
          <UserRolePermissionManager userId={userId} />
        </TabsContent>

        {/* ── Activity tab ── */}
        <TabsContent value="activity" className="space-y-4">
          {user.startups && user.startups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الشركات الناشئة</CardTitle>
                <CardDescription>{user.startups.length} شركة مرتبطة بهذا المستخدم</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.startups.map((startup) => (
                  <div key={startup.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        startup.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        startup.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {startup.status === 'APPROVED' ? 'معتمدة' : startup.status === 'REJECTED' ? 'مرفوضة' : 'قيد المراجعة'}
                      </span>
                      <h3 className="font-semibold">{startup.name}</h3>
                    </div>
                    <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div><dt className="text-muted-foreground text-xs">المجال</dt><dd className="break-words">{startup.industry || '-'}</dd></div>
                      <div><dt className="text-muted-foreground text-xs">المرحلة</dt><dd className="break-words">{startup.stage || '-'}</dd></div>
                      <div><dt className="text-muted-foreground text-xs">تاريخ الإنشاء</dt><dd className="break-words">{formatDate(startup.createdAt)}</dd></div>
                    </dl>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {user.teamMembers && user.teamMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>أعضاء الفريق</CardTitle>
                <CardDescription>{user.teamMembers.length} عضو</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.teamMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{member.department}</span>
                      <h3 className="font-semibold">{member.name}</h3>
                    </div>
                    <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div><dt className="text-muted-foreground text-xs">المنصب</dt><dd className="break-words">{member.position || '-'}</dd></div>
                      <div><dt className="text-muted-foreground text-xs">البريد</dt><dd className="break-all">{member.email || '-'}</dd></div>
                      <div><dt className="text-muted-foreground text-xs">الهاتف</dt><dd className="break-words">{member.phone || '-'}</dd></div>
                    </dl>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(!user.startups || user.startups.length === 0) && (!user.teamMembers || user.teamMembers.length === 0) && (
            <Card>
              <CardContent className="py-12 flex flex-col items-center gap-2 text-muted-foreground">
                <User className="h-10 w-10 opacity-30" />
                <p>لا توجد نشاطات لعرضها</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف <strong>{user.name}</strong>؟ هذا الإجراء لا يمكن التراجع عنه وسيحذف جميع بياناته.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={deleteUser} disabled={isDeleting}>
              {isDeleting ? <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري الحذف...</> : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
