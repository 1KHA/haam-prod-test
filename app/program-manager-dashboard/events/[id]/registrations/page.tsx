"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  Mail,
  Loader2,
  UserCheck,
  UserX,
  Calendar
} from "lucide-react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { fetchWithAuth } from "@/lib/api-client"

interface Registration {
  id: string
  userId: string
  eventId: string
  registeredAt: string
  status: string
  user: {
    id: string
    email: string
    name: string
    phone?: string
  }
}

interface Event {
  id: string
  title: string
  eventType: string
  startDate: string
  capacity?: number
}

export default function EventRegistrations() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.id as string

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (eventId) {
      fetchRegistrations()
      fetchEventDetails()
    }
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      const response = await fetchWithAuth(`/api/program-manager/events/${eventId}`, {}, 'response') as any
      
      if (response.error) {
        console.error("Error fetching event:", response.error)
        return
      }
      
      setEvent(response.data?.event || response.data)
    } catch (error) {
      console.error("Error fetching event:", error)
    }
  }

  const fetchRegistrations = async () => {
    try {
      const response = await fetchWithAuth(`/api/program-manager/events/${eventId}/registrations`, {}, 'response') as any
      
      if (response.error) {
        toast.error(response.error)
        return
      }
      
      setRegistrations(response.data?.registrations || response.data || [])
    } catch (error) {
      console.error("Error fetching registrations:", error)
      toast.error("حدث خطأ في تحميل قائمة المسجلين")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportRegistrations = async () => {
    try {
      const response = await fetchWithAuth(`/api/program-manager/events/${eventId}/registrations/export`, {}, 'response') as any
      
      if (response.error) {
        toast.error(response.error)
        return
      }
      
      // Handle file download
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `registrations-${eventId}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success("تم تصدير قائمة المسجلين بنجاح")
    } catch (error) {
      console.error("Error exporting registrations:", error)
      toast.error("حدث خطأ أثناء تصدير قائمة المسجلين")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "مؤكد", variant: "default" as const },
      pending: { label: "في الانتظار", variant: "secondary" as const },
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

  const filteredRegistrations = registrations.filter(registration =>
    registration.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>جاري تحميل قائمة المسجلين...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة التسجيلات</h1>
          {event && (
            <p className="text-muted-foreground mt-1">
              {event.title} - {getEventTypeDisplay(event.eventType)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/program-manager-dashboard/events/${eventId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportRegistrations}
            disabled={registrations.length === 0}
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{registrations.length}</div>
                <div className="text-sm text-muted-foreground">إجمالي المسجلين</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {registrations.filter(r => r.status === 'confirmed').length}
                </div>
                <div className="text-sm text-muted-foreground">مؤكد</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {event?.capacity ? `${registrations.length}/${event.capacity}` : registrations.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {event?.capacity ? "المقاعد المشغولة" : "بدون حد أقصى"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة المسجلين</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن متقدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
          <CardDescription>
            إدارة ومراجعة قائمة المسجلين في الفعالية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد تسجيلات</h3>
              <p className="text-muted-foreground">
                لم يسجل أي شخص في هذه الفعالية بعد
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المتقدم</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">تاريخ التسجيل</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{registration.user.name || "غير محدد"}</div>
                        <div className="text-sm text-muted-foreground">{registration.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{registration.user.phone || "غير محدد"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(registration.registeredAt), "PPP p", { locale: ar })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(registration.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
