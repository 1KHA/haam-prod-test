"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Building, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Tag,
  FileText,
  Briefcase,
  Target,
  Lightbulb,
  Loader2,
  Edit,
  Trash2
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  description: string
  problem: string
  solution: string
  targetMarket: string | null
  businessModel: string | null
  competitiveAdvantage: string | null
  teamSize: number
  fundingNeeds: string | null
  pitchDeckUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string
    email: string
    accelerator: {
      name: string
      industry: string | null
      focusAreas: string | null
      programLength: string | null
      website: string | null
      description: string | null
    } | null
  }
}

export default function StartupDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch startup details
  useEffect(() => {
    if (!token) return;

    const fetchStartupDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/startups/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch startup details');
        }

        const data = await response.json();
        setStartup(data);
      } catch (err) {
        console.error('Error fetching startup details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات الشركة الناشئة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStartupDetails();
  }, [params.id, token]);

  // Handle delete startup
  const handleDeleteStartup = async () => {
    if (!token || !startup) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${startup.name}؟`)) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/admin/startups/${startup.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete startup');
      }

      showAdminToast({
        title: "تم بنجاح",
        description: "تم حذف الشركة الناشئة بنجاح"
      });
      
      // Navigate back to startups list
      router.push('/admin-dashboard/startups');
    } catch (err) {
      console.error('Error deleting startup:', err);
      showAdminToast({
        title: "خطأ",
        description: err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الشركة الناشئة',
        variant: "destructive"
      });
      setDeleteLoading(false);
    }
  };

  // Handle edit startup
  const handleEditStartup = () => {
    router.push(`/admin-dashboard/startups/${params.id}/edit`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            نشط
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            معلق
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لم يتم العثور على الشركة الناشئة
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.push('/admin-dashboard/startups')}
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleEditStartup}
          >
            <Edit className="h-4 w-4" />
            <span>تعديل</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleDeleteStartup}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>حذف</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{startup.name}</h1>
          {getStatusBadge(startup.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>معلومات الشركة الناشئة</span>
                <Building className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>الوصف</span>
                </h3>
                <p className="text-muted-foreground">{startup.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span>المشكلة</span>
                </h3>
                <p className="text-muted-foreground">{startup.problem}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span>الحل</span>
                </h3>
                <p className="text-muted-foreground">{startup.solution}</p>
              </div>
              
              {startup.targetMarket && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>السوق المستهدف</span>
                  </h3>
                  <p className="text-muted-foreground">{startup.targetMarket}</p>
                </div>
              )}
              
              {startup.businessModel && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>نموذج العمل</span>
                  </h3>
                  <p className="text-muted-foreground">{startup.businessModel}</p>
                </div>
              )}
              
              {startup.competitiveAdvantage && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span>الميزة التنافسية</span>
                  </h3>
                  <p className="text-muted-foreground">{startup.competitiveAdvantage}</p>
                </div>
              )}
              
              {startup.pitchDeckUrl && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>عرض تقديمي</span>
                  </h3>
                  <a 
                    href={startup.pitchDeckUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    عرض العرض التقديمي
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>معلومات المسرع</span>
                <Building className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {startup.creator.accelerator ? (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">{startup.creator.accelerator.name}</span>
                    <span className="text-muted-foreground">اسم المسرع</span>
                  </div>
                  
                  {startup.creator.accelerator.industry && (
                    <div className="flex justify-between">
                      <span>{startup.creator.accelerator.industry}</span>
                      <span className="text-muted-foreground">القطاع</span>
                    </div>
                  )}
                  
                  {startup.creator.accelerator.focusAreas && (
                    <div className="flex justify-between">
                      <span>{startup.creator.accelerator.focusAreas}</span>
                      <span className="text-muted-foreground">مجالات التركيز</span>
                    </div>
                  )}
                  
                  {startup.creator.accelerator.programLength && (
                    <div className="flex justify-between">
                      <span>{startup.creator.accelerator.programLength}</span>
                      <span className="text-muted-foreground">مدة البرنامج</span>
                    </div>
                  )}
                  
                  {startup.creator.accelerator.website && (
                    <div className="flex justify-between">
                      <a 
                        href={startup.creator.accelerator.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {startup.creator.accelerator.website}
                      </a>
                      <span className="text-muted-foreground">الموقع الإلكتروني</span>
                    </div>
                  )}
                  
                  {startup.creator.accelerator.description && (
                    <div>
                      <h3 className="font-semibold mb-2 text-muted-foreground">الوصف</h3>
                      <p>{startup.creator.accelerator.description}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  لا توجد معلومات عن المسرع
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>معلومات أساسية</span>
                <FileText className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{startup.industry}</span>
                <span className="text-muted-foreground">القطاع</span>
              </div>
              
              <div className="flex justify-between">
                <span>{startup.stage}</span>
                <span className="text-muted-foreground">المرحلة</span>
              </div>
              
              <div className="flex justify-between">
                <span>{startup.teamSize}</span>
                <span className="text-muted-foreground">حجم الفريق</span>
              </div>
              
              {startup.fundingNeeds && (
                <div className="flex justify-between">
                  <span>{startup.fundingNeeds}</span>
                  <span className="text-muted-foreground">احتياجات التمويل</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>{formatDate(startup.createdAt)}</span>
                <span className="text-muted-foreground">تاريخ الإنشاء</span>
              </div>
              
              <div className="flex justify-between">
                <span>{formatDate(startup.updatedAt)}</span>
                <span className="text-muted-foreground">تاريخ التحديث</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>معلومات المنشئ</span>
                <Users className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{startup.creator.name}</span>
                <span className="text-muted-foreground">الاسم</span>
              </div>
              
              <div className="flex justify-between">
                <span>{startup.creator.email}</span>
                <span className="text-muted-foreground">البريد الإلكتروني</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
