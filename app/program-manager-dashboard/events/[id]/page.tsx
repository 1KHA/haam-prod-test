"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  Loader2
} from "lucide-react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { fetchWithAuth } from "@/lib/api-client"

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  location: string
  organizer: string
  registrationDeadline?: string
  capacity?: number
  status: string
  registrationCount?: number
  createdAt: string
  updatedAt: string
  creatorId?: string
}

export default function EventDetail() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch event details
  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      const response = await fetchWithAuth(`/api/program-manager/events/${eventId}`, {}, 'response') as any
      
      if (response.error) {
        toast.error(response.error)
        router.push("/program-manager-dashboard/events")
        return
      }
      
      setEvent(response.data?.event || response.data)
    } catch (error) {
      console.error("Error fetching event:", error)
      toast.error("حدث خطأ في تحميل بيانات الفعالية")
      router.push("/program-manager-dashboard/events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event || !window.confirm("هل أنت متأكد من حذف هذه الفعالية؟")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetchWithAuth(`/api/program-manager/events/${eventId}`, {
        method: 'DELETE'
      }, 'response') as any

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success("تم حذف الفعالية بنجاح")
      router.push("/program-manager-dashboard/events")
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("حدث خطأ أثناء حذف الفعالية")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: "منشور", variant: "default" as const },
      draft: { label: "مسودة", variant: "secondary" as const },
      cancelled: { label: "ملغي", variant: "destructive" as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, variant: "secondary" as const }
    
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getEventTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      hackathon: "هاكاثون",
      workshop: "ورشة عمل",
      conference: "مؤتمر",
      seminar: "عرض تقديمي",
      networking: "شبكات"
    }
    return types[type] || type
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>جاري تحميل بيانات الفعالية...</span>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-2">الفعالية غير موجودة</h2>
        <p className="text-muted-foreground mb-4">لم يتم العثور على الفعالية المطلوبة</p>
        <Link href="/program-manager-dashboard/events">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة إلى قائمة الفعاليات
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          {getStatusBadge(event.status)}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/program-manager-dashboard/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <Link href={`/program-manager-dashboard/events/${eventId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDeleteEvent}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 ml-2" />
            )}
            حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الفعالية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">الوصف</h3>
                <p className="text-sm leading-relaxed">{event.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">تاريخ البدء:</span>
                    <br />
                    <span className="text-muted-foreground">
                      {format(new Date(event.startDate), "PPP p", { locale: ar })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">تاريخ الانتهاء:</span>
                    <br />
                    <span className="text-muted-foreground">
                      {format(new Date(event.endDate), "PPP p", { locale: ar })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">الموقع:</span>
                    <br />
                    <span className="text-muted-foreground">{event.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">الجهة المنظمة:</span>
                    <br />
                    <span className="text-muted-foreground">{event.organizer}</span>
                  </div>
                </div>
                
                {event.registrationDeadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">الموعد النهائي للتسجيل:</span>
                      <br />
                      <span className="text-muted-foreground">
                        {format(new Date(event.registrationDeadline), "PPP p", { locale: ar })}
                      </span>
                    </div>
                  </div>
                )}
                
                {event.capacity && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">السعة:</span>
                      <br />
                      <span className="text-muted-foreground">{event.capacity} مشارك</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium">نوع الفعالية:</span>
                <br />
                <span className="text-sm text-muted-foreground">
                  {getEventTypeDisplay(event.eventType)}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium">عدد المسجلين:</span>
                <br />
                <span className="text-sm text-muted-foreground">
                  {event.registrationCount || 0}
                  {event.capacity && ` من ${event.capacity}`}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium">تم الإنشاء:</span>
                <br />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(event.createdAt), "PPP", { locale: ar })}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium">آخر تعديل:</span>
                <br />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(event.updatedAt), "PPP", { locale: ar })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/program-manager-dashboard/events/${eventId}/registrations`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 ml-2" />
                  إدارة التسجيلات
                </Button>
              </Link>
              
              <Link href={`/program-manager-dashboard/events/${eventId}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل الفعالية
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
