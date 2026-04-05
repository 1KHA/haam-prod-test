"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Loader2, Trash2, Edit, User, Mail, Briefcase, Calendar, Tag, Shield } from "lucide-react"
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
  
  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.push("/admin-dashboard/users")}
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة إلى قائمة المستخدمين</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.push(`/admin-dashboard/users/${userId}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>تعديل</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>حذف</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">تفاصيل المستخدم</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="permissions">الأدوار والصلاحيات</TabsTrigger>
          <TabsTrigger value="activity">النشاطات</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">الاسم</p>
                    <p className="text-lg">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">البريد الإلكتروني</p>
                    <p className="text-lg">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">الدور</p>
                    <p className="text-lg">{getRoleDisplayName(user.role)}</p>
                  </div>
                </div>
                
                {user.specialization && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">التخصص</p>
                      <p className="text-lg">{user.specialization}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">تاريخ التسجيل</p>
                    <p className="text-lg">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>الملف الشخصي</CardTitle>
              </CardHeader>
              <CardContent>
                {user.role === 'STARTUP' && user.startupProfile ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">معلومات الشركة الناشئة</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">اسم الشركة</p>
                        <p>{user.startupProfile.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">المجال</p>
                        <p>{user.startupProfile.industry || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">المرحلة</p>
                        <p>{user.startupProfile.stage || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">تاريخ التأسيس</p>
                        <p>{user.startupProfile.foundingDate ? formatDate(user.startupProfile.foundingDate) : '-'}</p>
                      </div>
                    </div>
                    {user.startupProfile.description && (
                      <div>
                        <p className="text-sm font-medium">الوصف</p>
                        <p>{user.startupProfile.description}</p>
                      </div>
                    )}
                  </div>
                ) : user.role === 'MENTOR' && user.mentorProfile ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">معلومات الموجه</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">مجال الخبرة</p>
                        <p>{user.mentorProfile.expertise || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">الخبرة</p>
                        <p>{user.mentorProfile.experience || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">الإتاحة</p>
                        <p>{user.mentorProfile.availability || '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : user.role === 'INVESTOR' && user.investorProfile ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">معلومات المستثمر</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">اسم الشركة</p>
                        <p>{user.investorProfile.companyName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">مجال الاستثمار</p>
                        <p>{user.investorProfile.investmentFocus || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">مرحلة الاستثمار</p>
                        <p>{user.investorProfile.investmentStage || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">حجم الاستثمار</p>
                        <p>{user.investorProfile.investmentSize || '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : user.role === 'ENTREPRENEUR' && user.entrepreneurProfile ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">معلومات رائد الأعمال</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">اسم المنظمة</p>
                        <p>{user.entrepreneurProfile.organizationName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">المجال</p>
                        <p>{user.entrepreneurProfile.industry || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">مجالات التركيز</p>
                        <p>{user.entrepreneurProfile.focusAreas || '-'}</p>
                      </div>
                      {user.entrepreneurProfile.website && (
                        <div>
                          <p className="text-sm font-medium">الموقع الإلكتروني</p>
                          <p>{user.entrepreneurProfile.website}</p>
                        </div>
                      )}
                    </div>
                    {user.entrepreneurProfile.description && (
                      <div>
                        <p className="text-sm font-medium">الوصف</p>
                        <p>{user.entrepreneurProfile.description}</p>
                      </div>
                    )}
                  </div>
                ) : user.role === 'ACCELERATOR' && user.acceleratorProfile ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">معلومات مسرع الأعمال</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">اسم المنظمة</p>
                        <p>{user.acceleratorProfile.organizationName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">المجال</p>
                        <p>{user.acceleratorProfile.industry || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">مجالات التركيز</p>
                        <p>{user.acceleratorProfile.focusAreas || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">مدة البرنامج</p>
                        <p>{user.acceleratorProfile.programLength || '-'}</p>
                      </div>
                    </div>
                    {user.acceleratorProfile.description && (
                      <div>
                        <p className="text-sm font-medium">الوصف</p>
                        <p>{user.acceleratorProfile.description}</p>
                      </div>
                    )}
                  </div>
                ) : user.role === 'PROGRAM_MANAGER' && user.programManagerProfile ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">معلومات مدير البرنامج</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">البرامج</p>
                        <p>{user.programManagerProfile.programs || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">المسؤوليات</p>
                        <p>{user.programManagerProfile.responsibilities || '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : user.role === 'ADMIN' && user.adminProfile ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">معلومات المدير</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">القسم</p>
                        <p>{user.adminProfile.department || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">الصلاحيات</p>
                        <p>{user.adminProfile.permissions || '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">لم يتم إكمال الملف الشخصي بعد.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <UserRolePermissionManager userId={userId} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {user.startups && user.startups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الشركات الناشئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.startups.map((startup) => (
                    <div key={startup.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {startup.status === 'APPROVED' ? (
                            <span className="text-green-600">معتمدة</span>
                          ) : startup.status === 'REJECTED' ? (
                            <span className="text-red-600">مرفوضة</span>
                          ) : (
                            <span className="text-amber-600">قيد المراجعة</span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">{startup.name}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium">المجال</p>
                          <p>{startup.industry}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">المرحلة</p>
                          <p>{startup.stage}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">تاريخ الإنشاء</p>
                          <p>{formatDate(startup.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {user.teamMembers && user.teamMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>أعضاء الفريق</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.teamMembers.map((member) => (
                    <div key={member.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {member.department}
                        </div>
                        <h3 className="text-lg font-semibold">{member.name}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium">المنصب</p>
                          <p>{member.position}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">البريد الإلكتروني</p>
                          <p>{member.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">الهاتف</p>
                          <p>{member.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(!user.startups || user.startups.length === 0) && (!user.teamMembers || user.teamMembers.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">لا توجد نشاطات لعرضها.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف المستخدم {user.name}؟ هذا الإجراء لا يمكن التراجع عنه وسيؤدي إلى حذف جميع بيانات المستخدم.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  )
}
