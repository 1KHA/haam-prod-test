"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  Trash2, 
  Users, 
  Eye,
  Plus,
  RefreshCw,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

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
  cohorts: Cohort[]
  stats: {
    cohortsCount: number
    activeCohortsCount: number
    totalStartups: number
    totalMentors: number
  }
  createdAt: string
  updatedAt: string
}

interface Cohort {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  status: string
  capacity: number | null
  manager: {
    id: string
    name: string
    email: string
  }
  stats: {
    membersCount: number
    mentorsCount: number
  }
}

export default function ProgramDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [cohortSearchQuery, setCohortSearchQuery] = useState("")
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch program details (includes cohorts)
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
  
  // Get cohort status badge
  const getCohortStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <Badge variant="outline">قادم</Badge>;
      case 'ACTIVE':
        return <Badge className="bg-green-500">نشط</Badge>;
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
        <RefreshCw className="h-8 w-8 animate-spin" />
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
  
  // Filter cohorts based on search query
  const filteredCohorts = program.cohorts?.filter(cohort => 
    !cohortSearchQuery || 
    cohort.name.toLowerCase().includes(cohortSearchQuery.toLowerCase())
  ) || [];

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
        <h1 className="text-3xl font-bold">
          {program?.name}
          <span className="mr-2">{getStatusBadge(program?.status || '')}</span>
        </h1>
      </div>
      
      <Tabs 
        defaultValue="details" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="details">تفاصيل البرنامج</TabsTrigger>
          <TabsTrigger value="cohorts">الدفعات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
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
                    <p className="text-muted-foreground">{{
                      ACCELERATOR: "مسرع أعمال",
                      INCUBATOR: "حاضنة أعمال",
                      WORKSHOP: "ورشة عمل",
                      BOOTCAMP: "معسكر تدريبي",
                      HACKATHON: "هاكاثون",
                      OTHER: "أخرى",
                    }[program.type] || program.type}</p>
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
              إدارة الدفعات
            </Button>
          </div>
        </div>
      </div>
        </TabsContent>
        
        <TabsContent value="cohorts" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/new`)}
            >
              <Plus className="h-4 w-4" />
              <span>إضافة دفعة</span>
            </Button>
            
            <div className="relative w-64">
              <input
                type="text"
                placeholder="البحث عن دفعة..."
                className="w-full px-4 py-2 pr-10 border rounded-md"
                value={cohortSearchQuery}
                onChange={(e) => setCohortSearchQuery(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                🔍
              </span>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>قائمة الدفعات ({filteredCohorts.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">جاري تحميل الدفعات...</p>
                </div>
              ) : filteredCohorts.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>لا توجد دفعات{cohortSearchQuery ? ' مطابقة لبحثك' : ' في هذا البرنامج'}</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/new`)}
                  >
                    إضافة دفعة جديدة
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                    <div className="col-span-1">الإجراءات</div>
                    <div className="col-span-1">عدد المرشدين</div>
                    <div className="col-span-1">عدد الشركات</div>
                    <div className="col-span-1">تاريخ الانتهاء</div>
                    <div className="col-span-1">تاريخ البدء</div>
                    <div className="col-span-1">اسم الدفعة</div>
                  </div>
                  
                  {filteredCohorts.map((cohort) => (
                    <div key={cohort.id} className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                      <div className="col-span-1 flex items-center gap-2">
                        <button 
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/${cohort.id}`)}
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-amber-500 hover:text-amber-700"
                          onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/${cohort.id}/edit`)}
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="col-span-1 flex items-center">
                        {getCohortStatusBadge(cohort.status)}
                      </div>
                      <div className="col-span-1">{cohort.stats?.mentorsCount || 0}</div>
                      <div className="col-span-1">{cohort.stats?.membersCount || 0}</div>
                      <div className="col-span-1">
                        {cohort.endDate 
                          ? new Date(cohort.endDate).toLocaleDateString('ar-SA')
                          : '-'}
                      </div>
                      <div className="col-span-1">
                        {cohort.startDate 
                          ? new Date(cohort.startDate).toLocaleDateString('ar-SA')
                          : '-'}
                      </div>
                      <div 
                        className="col-span-1 font-medium cursor-pointer hover:text-primary" 
                        onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/${cohort.id}`)}
                      >
                        {cohort.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
