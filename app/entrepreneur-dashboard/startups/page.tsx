"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Rocket, AlertCircle, CheckCircle, Clock, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  description: string
  status: string
  createdAt: string
}

export default function StartupsPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, token } = useAuth()
  const [companies, setCompanies] = useState<Startup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/startups', {
        })
        
        if (response.ok) {
          const data = await response.json()
          setCompanies(data.companies)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch companies')
        }
      } catch (err) {
        setError('An error occurred while fetching companies')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCompanies()
  }, [token])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3" />
            قيد المراجعة
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3" />
            تمت الموافقة
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3" />
            مرفوض
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
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

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => router.push('/entrepreneur-dashboard/startup/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إنشاء شركة ناشئة جديدة
        </Button>
        <h1 className="text-3xl font-bold">الشركات الناشئة</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 ml-2" />
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>جاري تحميل البيانات...</p>
        </div>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد شركات ناشئة بعد</h3>
            <p className="text-muted-foreground mb-6">ابدأ بإنشاء شركة ناشئة جديدة لعرض مشروعك</p>
            <Button 
              onClick={() => router.push('/entrepreneur-dashboard/startup/new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              إنشاء شركة ناشئة جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{company.name}</h3>
                    <div>{getStatusBadge(company.status)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{company.industry}</Badge>
                    <Badge variant="outline">{getStageLabel(company.stage)}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{company.description}</p>
                  <p className="text-xs text-muted-foreground">
                    تم الإنشاء في {new Date(company.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="bg-muted p-6 flex flex-row md:flex-col justify-end items-center gap-3 md:min-w-[200px]">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => router.push(`/entrepreneur-dashboard/startups/${company.id}`)}
                  >
                    عرض التفاصيل
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/entrepreneur-dashboard/startups/${company.id}/edit`)}
                  >
                    تعديل
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
