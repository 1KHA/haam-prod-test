"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Building,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Tag,
  FileText,
  ArrowRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface FundingDetailsProps {
  params: {
    id: string;
  };
}

export default function FundingDetails({ params }: FundingDetailsProps) {
  const router = useRouter()
  const { id } = params
  const [isLoading, setIsLoading] = useState(true)
  const [funding, setFunding] = useState<any>(null)

  // Sample funding data
  const fundingData = {
    id: "1", 
    title: "استثمار مباشر - تك سمارت",
    amount: "5,000,000 ريال", 
    entity: "تك سمارت", 
    status: "مكتمل", 
    date: "15 يناير 2025",
    category: "استثمار",
    startupId: "123",
    startupName: "تك سمارت",
    fundingType: "استثمار مباشر",
    investorName: "صندوق الاستثمارات العامة",
    description: "تمويل استثماري مباشر لدعم نمو شركة تك سمارت في مجال التقنيات المالية. سيتم استخدام التمويل في توسيع فريق العمل وتطوير المنتج وزيادة انتشار الشركة في الأسواق المحلية والإقليمية.",
    createdBy: "محمد العامر",
    createdAt: "10 يناير 2025",
    updatedAt: "15 يناير 2025",
    documents: [
      {
        id: "doc1",
        name: "اتفاقية الاستثمار.pdf",
        type: "pdf",
        size: "2.4 MB",
        uploadedAt: "10 يناير 2025"
      },
      {
        id: "doc2",
        name: "خطة استخدام التمويل.xlsx",
        type: "xlsx",
        size: "1.2 MB",
        uploadedAt: "12 يناير 2025"
      }
    ],
    milestones: [
      {
        id: "ml1",
        title: "توقيع العقد",
        date: "15 يناير 2025",
        status: "مكتمل"
      },
      {
        id: "ml2",
        title: "الدفعة الأولى",
        date: "30 يناير 2025",
        status: "قادم"
      },
      {
        id: "ml3",
        title: "الدفعة الثانية",
        date: "30 مارس 2025",
        status: "قادم"
      }
    ]
  }

  // Fetch funding data on component mount
  useEffect(() => {
    const fetchFundingData = async () => {
      try {
        // Get token from localStorage
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        
        // Fetch funding data from API
        const response = await fetch(`/api/admin/financing/funding/${id}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch funding data')
        }
        
        const data = await response.json()
        setFunding(data.data || fundingData) // Fallback to sample data if API fails
      } catch (error) {
        console.error('Error fetching funding data:', error)
        toast.error('حدث خطأ أثناء تحميل بيانات التمويل')
        // Fallback to sample data on error
        setFunding(fundingData)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFundingData()
  }, [id])

  // Delete funding handler
  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذا التمويل؟")) {
      try {
        // Get token from localStorage
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        
        // Delete funding via API
        const response = await fetch(`/api/admin/financing/funding/${id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete funding')
        }
        
        toast.success("تم حذف التمويل بنجاح")
        router.push("/admin-dashboard/financing/funding")
      } catch (error) {
        console.error("Error deleting funding:", error)
        toast.error("حدث خطأ أثناء حذف التمويل")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!funding) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">لم يتم العثور على التمويل</h2>
        <p className="text-muted-foreground mb-6">
          تعذر العثور على التمويل المطلوب، ربما تم حذفه أو تغيير المعرف الخاص به.
        </p>
        <Link href="/admin-dashboard/financing/funding">
          <Button>العودة إلى قائمة التمويلات</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 className="h-4 w-4" />
            <span>حذف</span>
          </Button>
          <Link href={`/admin-dashboard/financing/funding/${id}/edit`}>
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              <span>تعديل</span>
            </Button>
          </Link>
          <Link href="/admin-dashboard/financing/funding">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>العودة</span>
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">تفاصيل التمويل</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge 
                  variant="outline" 
                  className={funding.status === "مكتمل" 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : funding.status === "قيد المراجعة"
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {funding.status}
                </Badge>
                <CardTitle className="text-2xl">{funding.title}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">مبلغ التمويل</p>
                    <p className="font-medium">{funding.amount}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ التمويل</p>
                    <p className="font-medium">{funding.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">نوع التمويل</p>
                    <p className="font-medium">{funding.fundingType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">المستثمر / الجهة الممولة</p>
                    <p className="font-medium">{funding.investorName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">الشركة الناشئة</p>
                    <Link href={`/admin-dashboard/startups/${funding.startupId}`}>
                      <p className="font-medium text-primary hover:underline">{funding.startupName}</p>
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">الفئة</p>
                    <p className="font-medium">{funding.category}</p>
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] my-6 bg-border" />

              <div>
                <h3 className="text-lg font-medium mb-3">تفاصيل التمويل</h3>
                <p className="text-muted-foreground text-right leading-relaxed">
                  {funding.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المراحل والمدفوعات</CardTitle>
              <CardDescription>مراحل التمويل والمدفوعات المرتبطة به</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funding.milestones.map((milestone: any, index: number) => (
                  <div 
                    key={milestone.id} 
                    className={`relative pt-3 pb-6 pl-6 ${
                      index !== funding.milestones.length - 1 ? "border-r border-dashed" : ""
                    }`}
                  >
                    <div className="absolute right-[-8px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-background"></div>
                    <div className="flex justify-between items-start">
                      <Badge 
                        variant="outline" 
                        className={milestone.status === "مكتمل" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }
                      >
                        {milestone.status}
                      </Badge>
                      <div>
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المستندات</CardTitle>
              <CardDescription>المستندات المرفقة بالتمويل</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {funding.documents.map((doc: any) => (
                  <li key={doc.id} className="flex justify-between items-center p-2 border rounded hover:bg-accent/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {doc.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="justify-center border-t pt-4">
              <Button variant="outline" size="sm" className="w-full">
                تحميل جميع المستندات
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-medium">{funding.createdAt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-medium">{funding.updatedAt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">بواسطة</p>
                <p className="font-medium">{funding.createdBy}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin-dashboard/financing/funding/${id}/edit`}>
                <Button variant="outline" className="w-full justify-between">
                  <span>تعديل التمويل</span>
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/admin-dashboard/startups/${funding.startupId}`}>
                <Button variant="outline" className="w-full justify-between">
                  <span>عرض الشركة الناشئة</span>
                  <Building className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/admin-dashboard/financing/funding/${id}/payments`}>
                <Button variant="outline" className="w-full justify-between">
                  <span>عرض المدفوعات المرتبطة</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
