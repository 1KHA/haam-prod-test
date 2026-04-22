"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MapPin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users,
  Check,
  Loader2
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function CreateEvent() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    organizer: "",
    registrationDeadline: "",
    capacity: "",
    status: "published"
  })

  // Event types for dropdown
  const eventTypes = [
    "هاكاثون",
    "ورشة عمل",
    "مؤتمر",
    "عرض تقديمي",
    "شبكات"
  ]

  // Status options for dropdown
  const statusOptions = [
    { value: "draft", label: "مسودة" },
    { value: "published", label: "منشور" },
    { value: "cancelled", label: "ملغي" }
  ]

  // Organizers for dropdown
  const organizers = [
    "إدارة المنصة",
    "مسرع التقنية المالية",
    "حاضنة التقنيات الناشئة",
    "وزارة الاتصالات وتقنية المعلومات"
  ]

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelect = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format dates to ISO strings
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity) || null,
      }
      
      // Import and use fetchWithAuth for authenticated request
      const { fetchWithAuth } = await import('@/lib/api-client');
      
      const response = await fetchWithAuth('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      toast.success("تم إنشاء الفعالية بنجاح");
      router.push("/admin-dashboard/events");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الفعالية");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إضافة فعالية جديدة</h1>
        <Link href="/admin-dashboard/events">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>العودة</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الفعالية</CardTitle>
          <CardDescription>أدخل معلومات الفعالية الجديدة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الفعالية</Label>
                <Input 
                  id="title" 
                  name="title"
                  placeholder="عنوان الفعالية"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">نوع الفعالية</Label>
                <Select 
                  name="eventType"
                  value={formData.eventType} 
                  onValueChange={(value) => handleSelect("eventType", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر نوع الفعالية" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <Input 
                  id="startDate" 
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input 
                  id="endDate" 
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDeadline">الموعد النهائي للتسجيل</Label>
                <Input 
                  id="registrationDeadline" 
                  name="registrationDeadline"
                  type="datetime-local"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">السعة</Label>
                <Input 
                  id="capacity" 
                  name="capacity"
                  type="number"
                  placeholder="عدد المشاركين"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">الموقع</Label>
                <Input 
                  id="location" 
                  name="location"
                  placeholder="مكان الفعالية"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizer">الجهة المنظمة</Label>
                <Select 
                  name="organizer"
                  value={formData.organizer} 
                  onValueChange={(value) => handleSelect("organizer", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الجهة المنظمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizers.map(organizer => (
                      <SelectItem key={organizer} value={organizer}>
                        {organizer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">حالة الفعالية</Label>
                <Select 
                  name="status"
                  value={formData.status} 
                  onValueChange={(value) => handleSelect("status", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف الفعالية</Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="أدخل وصفاً تفصيلياً للفعالية"
                value={formData.description}
                onChange={handleChange}
                required
                className="min-h-32 text-right"
              />
            </div>

            <div className="flex gap-4 justify-start">
              <Button type="submit" disabled={isSubmitting} className="w-40">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    حفظ الفعالية
                  </>
                )}
              </Button>
              <Link href="/admin-dashboard/events">
                <Button variant="outline" type="button" className="w-40">
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
