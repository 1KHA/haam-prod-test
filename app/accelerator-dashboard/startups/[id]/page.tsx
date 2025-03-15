"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, ArrowLeft, Download, Edit, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StartupDetails {
  id: string
  name: string
  industry: string
  stage: string
  description: string
  problem: string
  solution: string
  targetMarket: string
  businessModel: string
  competitiveAdvantage: string
  teamSize: number
  fundingNeeds: string
  pitchDeckUrl: string | null
  status: string
  createdAt: string
}

export default function StartupDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const [startup, setStartup] = useState<StartupDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (!token) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/startups/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setStartup(data.startup)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch startup details')
        }
      } catch (err) {
        setError('An error occurred while fetching startup details')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStartupDetails()
  }, [token, params.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد المراجعة</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">تمت الموافقة</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">مرفوض</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStageLabel = (stage: string) => {
    const stageMap: Record<string, string> = {
      'idea': 'فكرة',
      'prototype': 'نموذج أولي',
      'mvp': 'منتج قابل للحياة',
      'early_traction': 'جذب مبكر',
      'growth': 'نمو',
      'scale': 'توسع'
    }
    
    return stageMap[stage] || stage
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">جاري تحميل البيانات...</div>
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            رجوع
          </Button>
          <h1 className="text-3xl font-bold">تفاصيل الشركة الناشئة</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 ml-2" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!startup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            رجوع
          </Button>
          <h1 className="text-3xl font-bold">تفاصيل الشركة الناشئة</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لم يتم العثور على الشركة الناشئة</h3>
            <p className="text-muted-foreground mb-6">لا يمكن العثور على الشركة الناشئة المطلوبة</p>
            <Button 
              onClick={() => router.push('/accelerator-dashboard/startups')}
            >
              العودة إلى قائمة الشركات الناشئة
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          رجوع
        </Button>
        <h1 className="text-3xl font-bold">تفاصيل الشركة الناشئة</h1>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/accelerator-dashboard/startups/${startup.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
          
          {startup.pitchDeckUrl && (
            <Button 
              variant="outline" 
              onClick={() => window.open(startup.pitchDeckUrl!, '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              تحميل العرض التقديمي
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{startup.industry}</Badge>
          <Badge variant="outline">{getStageLabel(startup.stage)}</Badge>
          {getStatusBadge(startup.status)}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{startup.name}</CardTitle>
          <CardDescription>
            تم الإنشاء في {new Date(startup.createdAt).toLocaleDateString('ar-SA')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">وصف الشركة الناشئة</h3>
            <p className="text-muted-foreground">{startup.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">المشكلة</h3>
              <p className="text-muted-foreground">{startup.problem}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">الحل</h3>
              <p className="text-muted-foreground">{startup.solution}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">السوق المستهدف</h3>
              <p className="text-muted-foreground">{startup.targetMarket || "غير محدد"}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">نموذج الإيرادات</h3>
              <p className="text-muted-foreground">{startup.businessModel || "غير محدد"}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">الميزة التنافسية</h3>
            <p className="text-muted-foreground">{startup.competitiveAdvantage || "غير محدد"}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">حجم الفريق</h3>
              <p className="text-muted-foreground">{startup.teamSize} أشخاص</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">احتياجات التمويل</h3>
              <p className="text-muted-foreground">{startup.fundingNeeds || "غير محدد"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
