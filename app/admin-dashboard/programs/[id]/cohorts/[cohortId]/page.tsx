"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { ArrowLeft, Calendar, Users, Edit, Trash2, RefreshCw } from "lucide-react"

interface Cohort {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  status: string
  capacity: number | null
  program: { id: string; name: string; type: string }
  manager: { id: string; name: string; email: string }
  members: { id: string; role: string; joinedAt: string; startup: { id: string; name: string; email: string } }[]
  mentors: { id: string; assignedAt: string; mentor: { id: string; name: string; email: string } }[]
  stats: { membersCount: number; mentorsCount: number }
  createdAt: string
  updatedAt: string
}

export default function CohortDetailsPage({ params }: { params: { id: string; cohortId: string } }) {
  const router = useRouter()
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, [])

  useEffect(() => {
    if (!token) return;
    fetchCohort();
  }, [token, params.cohortId])

  const fetchCohort = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/cohorts/${params.cohortId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCohort(data)
      } else {
        showAdminToast({ title: "خطأ", description: "فشل في جلب بيانات الدفعة", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching cohort:', error)
      showAdminToast({ title: "خطأ", description: "فشل في جلب بيانات الدفعة", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه الدفعة؟')) return

    try {
      const response = await fetch(`/api/admin/cohorts/${params.cohortId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        showAdminToast({ title: "تم بنجاح", description: "تم حذف الدفعة" })
        router.push(`/admin-dashboard/programs/${params.id}/cohorts`)
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      showAdminToast({ title: "خطأ", description: "فشل في حذف الدفعة", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING': return <Badge variant="outline">قادم</Badge>
      case 'ACTIVE': return <Badge className="bg-green-500">نشط</Badge>
      case 'COMPLETED': return <Badge variant="secondary">مكتمل</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!token) {
    return <div className="flex justify-center items-center py-8"><p>يجب تسجيل الدخول أولاً</p></div>
  }

  if (loading) {
    return <div className="flex justify-center items-center py-8"><RefreshCw className="h-8 w-8 animate-spin" /></div>
  }

  if (!cohort) {
    return <div className="flex justify-center items-center py-8"><p>لم يتم العثور على الدفعة</p></div>
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts`)}>
            <ArrowLeft className="h-4 w-4 ml-2" /> رجوع للدفعات
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/${params.cohortId}/edit`)}>
            <Edit className="h-4 w-4 ml-2" /> تعديل
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 ml-2" /> حذف
          </Button>
        </div>
        <h1 className="text-3xl font-bold">{cohort.name}</h1>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 font-medium ${activeTab === "details" ? "border-b-2 border-primary" : ""}`}
        >
          تفاصيل الدفعة
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 font-medium ${activeTab === "members" ? "border-b-2 border-primary" : ""}`}
        >
          الشركات ({cohort.members.length})
        </button>
        <button
          onClick={() => setActiveTab("mentors")}
          className={`px-4 py-2 font-medium ${activeTab === "mentors" ? "border-b-2 border-primary" : ""}`}
        >
          المرشدين ({cohort.mentors.length})
        </button>
      </div>

      {activeTab === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusBadge(cohort.status)}
                  <span className="text-xl">{cohort.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">الوصف</h3>
                  <p className="text-muted-foreground">{cohort.description || 'لا يوجد وصف'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">تاريخ البدء</h3>
                    <p>{cohort.startDate ? new Date(cohort.startDate).toLocaleDateString('ar-SA') : '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">تاريخ الانتهاء</h3>
                    <p>{cohort.endDate ? new Date(cohort.endDate).toLocaleDateString('ar-SA') : '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">السعة</h3>
                    <p>{cohort.capacity || 'غير محدد'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">البرنامج</h3>
                    <p>{cohort.program?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> الشركات</span>
                  <span className="font-bold">{cohort.stats.membersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> المرشدين</span>
                  <span className="font-bold">{cohort.stats.mentorsCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مدير الدفعة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{cohort.manager?.name}</p>
                <p className="text-sm text-muted-foreground">{cohort.manager?.email}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <Card>
          <CardHeader>
            <CardTitle>الشركات في الدفعة ({cohort.members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {cohort.members.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>لا توجد شركات في هذه الدفعة</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <div className="grid grid-cols-3 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                  <div>البريد الإلكتروني</div>
                  <div>الدور</div>
                  <div>اسم الشركة</div>
                </div>
                {cohort.members.map(member => (
                  <div key={member.id} className="grid grid-cols-3 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                    <div>{member.startup.email}</div>
                    <div>{member.role}</div>
                    <div className="font-medium">{member.startup.name}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "mentors" && (
        <Card>
          <CardHeader>
            <CardTitle>المرشدين في الدفعة ({cohort.mentors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {cohort.mentors.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>لا يوجد مرشدين في هذه الدفعة</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <div className="grid grid-cols-3 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                  <div>البريد الإلكتروني</div>
                  <div>تاريخ التعيين</div>
                  <div>الاسم</div>
                </div>
                {cohort.mentors.map(m => (
                  <div key={m.id} className="grid grid-cols-3 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                    <div>{m.mentor.email}</div>
                    <div>{new Date(m.assignedAt).toLocaleDateString('ar-SA')}</div>
                    <div className="font-medium">{m.mentor.name}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
