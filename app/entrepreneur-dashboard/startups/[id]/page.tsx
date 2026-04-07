"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, ArrowLeft, Download, Edit, User, Mail, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  id: string
  name: string
  position: string
  email: string
  phone: string
  avatar: string
  department: string
}

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

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  status: "completed" | "in_progress" | "upcoming" | "overdue"
  progress: number
  priority: string
  category: string
}

export default function StartupDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { token } = useAuth()
  const [company, setCompany] = useState<StartupDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [milestonesLoading, setMilestonesLoading] = useState(true)

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
          setCompany(data.company)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch company details')
        }
      } catch (err) {
        setError('An error occurred while fetching company details')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchTeamMembers = async () => {
      if (!token) return
      try {
        setTeamLoading(true)
        const response = await fetch('/api/team', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data.teamMembers)
        }
      } catch {
        // Optionally handle error
      } finally {
        setTeamLoading(false)
      }
    }

    const fetchMilestones = async () => {
      if (!token) return

      try {
        setMilestonesLoading(true)
        const response = await fetch(`/api/milestones?startupId=${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setMilestones(data.milestones || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setMilestonesLoading(false)
      }
    }
    
    fetchStartupDetails()
    fetchTeamMembers()
    fetchMilestones()
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

  if (!company) {
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
              onClick={() => router.push('/entrepreneur-dashboard/startups')}
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
            onClick={() => router.push(`/entrepreneur-dashboard/startups/${company.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
          
          {company.pitchDeckUrl && (
            <Button 
              variant="outline" 
              onClick={() => window.open(company.pitchDeckUrl!, '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              تحميل العرض التقديمي
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{company.industry}</Badge>
          <Badge variant="outline">{getStageLabel(company.stage)}</Badge>
          {getStatusBadge(company.status)}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{company.name}</CardTitle>
          <CardDescription>
            تم الإنشاء في {new Date(company.createdAt).toLocaleDateString('ar-SA')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">وصف الشركة الناشئة</h3>
            <p className="text-muted-foreground">{company.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">المشكلة</h3>
              <p className="text-muted-foreground">{company.problem}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">الحل</h3>
              <p className="text-muted-foreground">{company.solution}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">السوق المستهدف</h3>
              <p className="text-muted-foreground">{company.targetMarket || "غير محدد"}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">نموذج الإيرادات</h3>
              <p className="text-muted-foreground">{company.businessModel || "غير محدد"}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">الميزة التنافسية</h3>
            <p className="text-muted-foreground">{company.competitiveAdvantage || "غير محدد"}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">حجم الفريق</h3>
              <p className="text-muted-foreground">{company.teamSize} أشخاص</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">احتياجات التمويل</h3>
              <p className="text-muted-foreground">{company.fundingNeeds || "غير محدد"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>فريق العمل</CardTitle>
          <CardDescription>أعضاء الفريق المرتبطون بهذه الشركة الناشئة</CardDescription>
        </CardHeader>
        <CardContent>
          {teamLoading ? (
            <div className="flex justify-center items-center h-24">جاري تحميل أعضاء الفريق...</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">لا يوجد أعضاء فريق مسجلين</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="w-full">
                  <CardHeader className="pb-2 flex flex-row items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.position}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-right">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="text-sm">{member.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="text-sm">{member.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="text-sm">{member.department}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones Section */}
      <Card>
        <CardHeader>
          <CardTitle>المراحل والتقدم</CardTitle>
          <CardDescription>مراحل الشركة الناشئة المحددة من مدير البرنامج</CardDescription>
        </CardHeader>
        <CardContent>
          {milestonesLoading ? (
            <div className="flex justify-center items-center h-24">جاري تحميل المراحل...</div>
          ) : milestones.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">لا توجد مراحل مضافة لهذه الشركة بعد</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones.map((milestone) => (
                <Card key={milestone.id} className="w-full">
                  <CardHeader className="pb-2 flex flex-row items-center gap-4">
                    <div className="flex flex-col items-start">
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      <CardDescription>
                        تاريخ الاستحقاق: {new Date(milestone.dueDate).toLocaleDateString('ar-SA')}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        milestone.status === "completed" ? "bg-green-100 text-green-800" :
                        milestone.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        milestone.status === "overdue" ? "bg-red-100 text-red-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {milestone.status === "completed"
                          ? "مكتملة"
                          : milestone.status === "in_progress"
                          ? "قيد التنفيذ"
                          : milestone.status === "overdue"
                          ? "متأخرة"
                          : "قادمة"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        milestone.priority === "high" ? "bg-red-100 text-red-800" :
                        milestone.priority === "medium" ? "bg-amber-100 text-amber-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {milestone.priority === "high" ? "عالية" : milestone.priority === "medium" ? "متوسطة" : "منخفضة"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          milestone.status === "completed" ? "bg-green-500" :
                          milestone.status === "in_progress" ? "bg-blue-500" :
                          milestone.status === "overdue" ? "bg-red-500" :
                          "bg-amber-500"
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-muted-foreground">نسبة الإنجاز: {milestone.progress}%</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => router.push("/entrepreneur-dashboard/milestones")}>
              عرض جميع المراحل
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
