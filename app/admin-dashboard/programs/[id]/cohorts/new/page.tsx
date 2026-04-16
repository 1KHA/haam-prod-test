"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { ArrowLeft } from "lucide-react"

export default function NewCohortPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    // Token is now in HTTP-only cookie, credentials: "include" sends it automatically
    const storedToken = null; // Cookie-based auth - no localStorage token needed
    if (storedToken) setToken(storedToken);
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.startDate || !formData.endDate) {
      showAdminToast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/cohorts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          programId: params.id,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        })
      })

      if (response.ok) {
        showAdminToast({ title: "تم بنجاح", description: "تم إنشاء الدفعة بنجاح" })
        router.push(`/admin-dashboard/programs/${params.id}/cohorts`)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create cohort')
      }
    } catch (error) {
      console.error('Error creating cohort:', error)
      showAdminToast({ title: "خطأ", description: "فشل في إنشاء الدفعة", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="space-y-6 text-right max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts`)}>
          <ArrowLeft className="h-4 w-4 ml-2" /> رجوع
        </Button>
        <h1 className="text-3xl font-bold">إضافة دفعة جديدة</h1>
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
                placeholder="مثال: الدفعة الأولى 2025"
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
                placeholder="وصف الدفعة..."
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
                  placeholder="عدد الشركات"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'جاري الإنشاء...' : 'إنشاء الدفعة'}
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
