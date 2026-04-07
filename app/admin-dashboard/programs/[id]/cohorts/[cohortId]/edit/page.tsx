"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { ArrowLeft, RefreshCw } from "lucide-react"

interface Cohort {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  status: string
  capacity: number | null
}

export default function EditCohortPage({ params }: { params: { id: string; cohortId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING',
    capacity: ''
  })

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, [])

  useEffect(() => {
    if (!token) return;
    fetchCohort();
  }, [token, params.cohortId])

  const fetchCohort = async () => {
    setFetching(true)
    try {
      const response = await fetch(`/api/admin/cohorts/${params.cohortId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || '',
          description: data.description || '',
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
          status: data.status || 'UPCOMING',
          capacity: data.capacity?.toString() || ''
        })
      } else {
        showAdminToast({ title: "خطأ", description: "فشل في جلب بيانات الدفعة", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching cohort:', error)
      showAdminToast({ title: "خطأ", description: "فشل في جلب بيانات الدفعة", variant: "destructive" })
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.startDate || !formData.endDate) {
      showAdminToast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/cohorts/${params.cohortId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        })
      })

      if (response.ok) {
        showAdminToast({ title: "تم بنجاح", description: "تم تحديث الدفعة بنجاح" })
        router.push(`/admin-dashboard/programs/${params.id}/cohorts/${params.cohortId}`)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update cohort')
      }
    } catch (error) {
      console.error('Error updating cohort:', error)
      showAdminToast({ title: "خطأ", description: "فشل في تحديث الدفعة", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (!token) {
    return <div className="flex justify-center items-center py-8"><p>يجب تسجيل الدخول أولاً</p></div>
  }

  if (fetching) {
    return <div className="flex justify-center items-center py-8"><RefreshCw className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6 text-right max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/${params.cohortId}`)}>
          <ArrowLeft className="h-4 w-4 ml-2" /> رجوع
        </Button>
        <h1 className="text-3xl font-bold">تعديل الدفعة</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الدفعة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الدفعة *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">تاريخ البدء *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">تاريخ الانتهاء *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الحالة</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value="UPCOMING">قادم</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="COMPLETED">مكتمل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">السعة</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'جاري التحديث...' : 'تحديث الدفعة'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
