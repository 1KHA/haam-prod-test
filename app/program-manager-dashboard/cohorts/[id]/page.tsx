"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { ArrowLeft, Calendar, Edit, Trash2, Users } from "lucide-react"

interface Cohort {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  status: string
  capacity: number | null
  program: {
    id: string
    name: string
    type: string
  }
  stats: {
    membersCount: number
    mentorsCount: number
  }
  createdAt: string
  updatedAt: string
}

export default function CohortDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch cohort details
  useEffect(() => {
    if (!token) return;
    
    const fetchCohort = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/program-manager/cohorts/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch cohort');
        }
        
        const data = await response.json();
        setCohort(data);
      } catch (error) {
        console.error('Error fetching cohort:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات الدفعة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCohort();
  }, [token, params.id]);
  
  // Handle delete cohort
  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/program-manager/cohorts/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete cohort');
      }
      
      showAdminToast({
        title: "تم بنجاح",
        description: "تم حذف الدفعة بنجاح"
      });
      
      router.push('/program-manager-dashboard/cohorts');
    } catch (error) {
      console.error('Error deleting cohort:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في حذف الدفعة",
        variant: "destructive"
      });
    }
  };
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <Badge variant="outline">قادم</Badge>;
      case 'ACTIVE':
        return <Badge>نشط</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">مكتمل</Badge>;
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
  
  if (!cohort) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>لم يتم العثور على الدفعة</p>
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
            onClick={() => router.push('/program-manager-dashboard/cohorts')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>رجوع</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => router.push(`/program-manager-dashboard/cohorts/${params.id}/edit`)}
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
        <h1 className="text-3xl font-bold">تفاصيل الدفعة</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>{getStatusBadge(cohort.status)}</div>
                <CardTitle className="text-2xl">{cohort.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">الوصف</h3>
                  <p className="text-muted-foreground">{cohort.description || 'لا يوجد وصف'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">البرنامج</h3>
                    <p className="text-muted-foreground">{cohort.program.name}</p>
                    <p className="text-xs text-muted-foreground">{cohort.program.type}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">السعة</h3>
                    <p className="text-muted-foreground">{cohort.capacity || 'غير محدد'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">تاريخ البدء</h3>
                    <p className="text-muted-foreground">
                      {new Date(cohort.startDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">تاريخ الانتهاء</h3>
                    <p className="text-muted-foreground">
                      {new Date(cohort.endDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">إحصائيات الدفعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>عدد الشركات</span>
                  </div>
                  <span className="font-bold">{cohort.stats.membersCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>عدد المرشدين</span>
                  </div>
                  <span className="font-bold">{cohort.stats.mentorsCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>المدة</span>
                  </div>
                  <span className="font-bold">
                    {Math.ceil((new Date(cohort.endDate).getTime() - new Date(cohort.startDate).getTime()) / (1000 * 60 * 60 * 24))} يوم
                  </span>
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
                  <h3 className="text-sm font-semibold mb-1">تاريخ الإنشاء</h3>
                  <p className="text-muted-foreground">
                    {new Date(cohort.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">آخر تحديث</h3>
                  <p className="text-muted-foreground">
                    {new Date(cohort.updatedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full"
              onClick={() => router.push(`/program-manager-dashboard/cohorts/${params.id}/members`)}
            >
              إدارة الشركات
            </Button>
            
            <Button 
              className="w-full"
              onClick={() => router.push(`/program-manager-dashboard/cohorts/${params.id}/mentors`)}
            >
              إدارة المرشدين
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
