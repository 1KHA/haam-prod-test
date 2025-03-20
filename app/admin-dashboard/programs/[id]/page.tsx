"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { ArrowLeft, Calendar, Edit, Trash2, Users } from "lucide-react"

interface Program {
  id: string
  name: string
  description: string
  startDate: string | null
  endDate: string | null
  location: string | null
  type: string
  status: string
  capacity: number | null
  applicationDeadline: string | null
  requirements: string | null
  benefits: string | null
  creator: {
    id: string
    name: string
    email: string
  }
  stats: {
    cohortsCount: number
    activeCohortsCount: number
    totalStartups: number
  }
  createdAt: string
  updatedAt: string
}

export default function ProgramDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch program details
  useEffect(() => {
    if (!token) return;
    
    const fetchProgram = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/admin/programs/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch program');
        }
        
        const data = await response.json();
        setProgram(data);
      } catch (error) {
        console.error('Error fetching program:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات البرنامج",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgram();
  }, [token, params.id]);
  
  // Handle delete program
  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا البرنامج؟')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/programs/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete program');
      }
      
      showAdminToast({
        title: "تم بنجاح",
        description: "تم حذف البرنامج بنجاح"
      });
      
      router.push('/admin-dashboard/programs');
    } catch (error) {
      console.error('Error deleting program:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في حذف البرنامج",
        variant: "destructive"
      });
    }
  };
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline">مسودة</Badge>;
      case 'ACTIVE':
        return <Badge>نشط</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">مكتمل</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (!token) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>يجب تسجيل الدخول أولاً</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>جاري التحميل...</p>
      </div>
    );
  }
  
  if (!program) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>لم يتم العثور على البرنامج</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => router.push('/admin-dashboard/programs')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>رجوع</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => router.push(`/admin-dashboard/programs/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>تعديل</span>
          </Button>
          
          <Button 
            variant="destructive" 
            className="flex items-center gap-1"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>حذف</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">تفاصيل البرنامج</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>{getStatusBadge(program.status)}</div>
                <CardTitle className="text-2xl">{program.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">الوصف</h3>
                  <p className="text-muted-foreground">{program.description || 'لا يوجد وصف'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">النوع</h3>
                    <p className="text-muted-foreground">{program.type}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">الموقع</h3>
                    <p className="text-muted-foreground">{program.location || 'غير محدد'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">السعة</h3>
                    <p className="text-muted-foreground">{program.capacity || 'غير محدد'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">الموعد النهائي للتقديم</h3>
                    <p className="text-muted-foreground">
                      {program.applicationDeadline 
                        ? new Date(program.applicationDeadline).toLocaleDateString('ar-SA') 
                        : 'غير محدد'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">تاريخ البدء</h3>
                    <p className="text-muted-foreground">
                      {program.startDate 
                        ? new Date(program.startDate).toLocaleDateString('ar-SA') 
                        : 'غير محدد'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">تاريخ الانتهاء</h3>
                    <p className="text-muted-foreground">
                      {program.endDate 
                        ? new Date(program.endDate).toLocaleDateString('ar-SA') 
                        : 'غير محدد'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">المتطلبات</h3>
                  <p className="text-muted-foreground">{program.requirements || 'لا توجد متطلبات محددة'}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">الفوائد</h3>
                  <p className="text-muted-foreground">{program.benefits || 'لا توجد فوائد محددة'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">إحصائيات البرنامج</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>عدد الدفعات</span>
                  </div>
                  <span className="font-bold">{program.stats.cohortsCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span>الدفعات النشطة</span>
                  </div>
                  <span className="font-bold">{program.stats.activeCohortsCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>عدد الشركات</span>
                  </div>
                  <span className="font-bold">{program.stats.totalStartups}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">تم الإنشاء بواسطة</h3>
                  <p className="text-muted-foreground">{program.creator.name}</p>
                  <p className="text-xs text-muted-foreground">{program.creator.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">تاريخ الإنشاء</h3>
                  <p className="text-muted-foreground">
                    {new Date(program.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">آخر تحديث</h3>
                  <p className="text-muted-foreground">
                    {new Date(program.updatedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button 
              className="w-full"
              onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts`)}
            >
              عرض الدفعات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
