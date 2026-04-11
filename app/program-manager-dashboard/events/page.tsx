"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchWithAuth } from "@/lib/api-client"
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Trash2,
  UserCheck
} from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  location: string
  organizer: string
  capacity: number | null
  status: string
  registrationCount: number
  creator: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  events: Event[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const response = await fetchWithAuth('/api/program-manager/events', {}, 'direct') as Response

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data: ApiResponse = await response.json()
      setEvents(data.events)
    } catch (error) {
      console.error('Error fetching events:', error)
      // For now, use fallback data if API fails
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    setActionLoading(eventId)
    try {
      const response = await fetchWithAuth(`/api/program-manager/events/${eventId}`, {
        method: 'DELETE',
      }, 'direct') as Response

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      // Remove event from local state
      setEvents(events.filter(event => event.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Create new event navigation
  const handleCreateEvent = () => {
    router.push('/program-manager-dashboard/events/create')
  }

  // Edit event navigation
  const handleEditEvent = (eventId: string) => {
    router.push(`/program-manager-dashboard/events/${eventId}/edit`)
  }

  // Manage attendance navigation
  const handleManageAttendance = (eventId: string) => {
    router.push(`/program-manager-dashboard/events/${eventId}/registrations`)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.includes(searchQuery) || 
                          event.description.includes(searchQuery) ||
                          event.eventType.includes(searchQuery) ||
                          event.location.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "published") return matchesSearch && event.status === "published"
    if (activeTab === "draft") return matchesSearch && event.status === "draft"
    if (activeTab === "cancelled") return matchesSearch && event.status === "cancelled"
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800"
      case "draft": return "bg-yellow-100 text-yellow-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published": return "منشور"
      case "draft": return "مسودة"
      case "cancelled": return "ملغي"
      default: return "غير معروف"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "conference": return "bg-purple-100 text-purple-800"
      case "workshop": return "bg-blue-100 text-blue-800"
      case "hackathon": return "bg-amber-100 text-amber-800"
      case "seminar": return "bg-indigo-100 text-indigo-800"
      case "networking": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الفعاليات</h1>
        <Button onClick={handleCreateEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إنشاء فعالية جديدة</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{events.filter(event => event.status === "published").length}</div>
            <p className="text-muted-foreground">فعاليات منشورة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{events.filter(event => event.status === "draft").length}</div>
            <p className="text-muted-foreground">مسودات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{events.filter(event => event.status === "cancelled").length}</div>
            <p className="text-muted-foreground">فعاليات ملغية</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  className="pl-3 pr-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardTitle>الفعاليات</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="cancelled">ملغية</TabsTrigger>
              <TabsTrigger value="draft">مسودات</TabsTrigger>
              <TabsTrigger value="published">منشورة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">لا توجد فعاليات</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg overflow-hidden mt-4">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs ${getTypeColor(event.eventType)}`}>
                          {event.eventType}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">التاريخ</div>
                          <div className="font-medium">{formatDate(event.startDate)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">الوقت</div>
                          <div className="font-medium">{formatTime(event.startDate, event.endDate)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">المكان</div>
                          <div className="font-medium">{event.location}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 ml-2 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">التسجيلات</div>
                          <div className="font-medium">{event.registrationCount}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">السعة</div>
                        <div className="font-medium">{event.capacity || 'غير محدود'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">المنظم</div>
                        <div className="font-medium">{event.organizer}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/program-manager-dashboard/events/${event.id}`)}
                      >
                        عرض التفاصيل
                      </Button>
                      
                      <div className="flex gap-2">
                        {event.status !== "cancelled" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleManageAttendance(event.id)}
                              disabled={actionLoading === event.id}
                            >
                              <UserCheck className="h-4 w-4 ml-2" />
                              إدارة الحضور
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditEvent(event.id)}
                              disabled={actionLoading === event.id}
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={actionLoading === event.id}
                            >
                              {actionLoading === event.id ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Trash2 className="h-4 w-4 ml-2" />
                              )}
                              إلغاء
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
