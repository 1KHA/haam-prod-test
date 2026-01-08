"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { fetchWithAuth } from "@/lib/api-client"
import { exportPresets } from "@/lib/export-utils"
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle,
  Calendar,
  Users,
  MapPin,
  Clock,
  Tag,
  Link,
  Share2,
  MessageSquare,
  Loader2
} from "lucide-react"

// Interface for event data
interface Event {
  id: string;
  title: string;
  eventType: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  capacity: number;
  description: string;
  registrationDeadline: string | null;
  registrationCount?: number;
}

// Convert API event to display format
function formatEventForDisplay(event: any) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const formattedStartDate = startDate.toLocaleDateString('ar-SA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const formattedEndDate = endDate.toLocaleDateString('ar-SA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const startTime = startDate.toLocaleTimeString('ar-SA', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
  
  const endTime = endDate.toLocaleTimeString('ar-SA', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });

  // Format the date range
  let dateStr = formattedStartDate;
  if (formattedStartDate !== formattedEndDate) {
    dateStr += ` - ${formattedEndDate}`;
  }
  
  // Format the time range
  const timeStr = `${startTime} - ${endTime}`;

  // Convert status to Arabic
  let statusArabic = event.status;
  if (event.status === 'published') statusArabic = 'منشور';
  if (event.status === 'draft') statusArabic = 'مسودة';
  if (event.status === 'completed') statusArabic = 'مكتمل';
  if (event.status === 'cancelled') statusArabic = 'ملغي';
  
  // Determine actual status for display (قادم, جاري, مكتمل)
  let displayStatus = 'قادم';  // Upcoming
  const now = new Date();
  if (startDate <= now && endDate >= now) {
    displayStatus = 'جاري';    // Ongoing
  } else if (endDate < now) {
    displayStatus = 'مكتمل';   // Completed
  }

  return {
    id: event.id,
    title: event.title,
    type: event.eventType,
    status: displayStatus,
    apiStatus: event.status,
    date: dateStr,
    time: timeStr,
    location: event.location,
    organizer: event.organizer,
    attendees: event.registrationCount || 0,
    description: event.description,
    registrationDeadline: event.registrationDeadline 
      ? new Date(event.registrationDeadline).toLocaleDateString('ar-SA', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      : null
  };
}

export default function EventsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  // Sample events data for fallback
  const sampleEvents = [
    { 
      id: "1", 
      title: "هاكاثون الذكاء الاصطناعي", 
      type: "هاكاثون", 
      status: "قادم", 
      apiStatus: "published",
      date: "15 أبريل 2025",
      time: "09:00 صباحًا - 06:00 مساءً",
      location: "مركز الابتكار، الرياض",
      organizer: "إدارة المنصة",
      attendees: 120,
      description: "هاكاثون لتطوير حلول مبتكرة باستخدام الذكاء الاصطناعي",
      registrationDeadline: "10 أبريل 2025"
    },
    { 
      id: "2", 
      title: "يوم المستثمر", 
      type: "عرض تقديمي", 
      status: "قادم", 
      apiStatus: "published",
      date: "20 أبريل 2025",
      time: "02:00 مساءً - 06:00 مساءً",
      location: "فندق الفيصلية، الرياض",
      organizer: "إدارة المنصة",
      attendees: 85,
      description: "فرصة للشركات الناشئة لعرض منتجاتها أمام المستثمرين",
      registrationDeadline: "15 أبريل 2025"
    },
    { 
      id: "3", 
      title: "ورشة عمل: تطوير نموذج العمل", 
      type: "ورشة عمل", 
      status: "قادم", 
      apiStatus: "published",
      date: "25 أبريل 2025",
      time: "10:00 صباحًا - 02:00 مساءً",
      location: "مقر المسرع، الرياض",
      organizer: "مسرع التقنية المالية",
      attendees: 40,
      description: "ورشة عمل لمساعدة الشركات الناشئة في تطوير نماذج أعمالها",
      registrationDeadline: "20 أبريل 2025"
    },
    { 
      id: "4", 
      title: "مؤتمر التقنيات الناشئة", 
      time: "09:00 صباحًا - 05:00 مساءً",
      location: "مركز الملك عبدالله المالي، الرياض",
      organizer: "وزارة الاتصالات وتقنية المعلومات",
      attendees: 500,
      description: "مؤتمر سنوي يجمع رواد الأعمال والمستثمرين وخبراء التقنية",
      registrationDeadline: "1 مارس 2025"
    },
    { 
      id: "5", 
      title: "لقاء الموجهين والشركات الناشئة", 
      type: "شبكات", 
      status: "جاري", 
      apiStatus: "published",
      date: "13 مارس 2025",
      time: "06:00 مساءً - 09:00 مساءً",
      location: "مقر الحاضنة، جدة",
      organizer: "حاضنة التقنيات الناشئة",
      attendees: 60,
      description: "فرصة للشركات الناشئة للتواصل مع الموجهين وبناء علاقات مهنية",
      registrationDeadline: "10 مارس 2025"
    },
    { 
      id: "6", 
      title: "ورشة عمل: التسويق الرقمي", 
      type: "ورشة عمل", 
      status: "مكتمل", 
      apiStatus: "completed",
      date: "5 مارس 2025",
      time: "01:00 مساءً - 04:00 مساءً",
      location: "مقر المسرع، الرياض",
      organizer: "مسرع التقنية المالية",
      attendees: 35,
      description: "ورشة عمل لتعليم استراتيجيات التسويق الرقمي للشركات الناشئة",
      registrationDeadline: "3 مارس 2025"
    },
    { 
      id: "7", 
      title: "هاكاثون التقنيات المالية", 
      type: "هاكاثون", 
      status: "مكتمل", 
      apiStatus: "completed",
      date: "20 فبراير 2025 - 22 فبراير 2025",
      time: "09:00 صباحًا - 09:00 مساءً",
      location: "مركز الابتكار، الرياض",
      organizer: "مسرع التقنية المالية",
      attendees: 150,
      description: "هاكاثون لتطوير حلول مبتكرة في مجال التقنيات المالية",
      registrationDeadline: "15 فبراير 2025"
    }
  ];

  // Fetch events from API
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        // Import and use fetchWithAuth for authenticated request
        const { fetchWithAuth } = await import('@/lib/api-client');
        const response = await fetchWithAuth('/api/admin/events');
        
        if (!response.ok) {
          throw new Error(`Error fetching events: ${response.statusText}`);
        }
        
        const data = await response.json();
        const formattedEvents = data.events.map(formatEventForDisplay);
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        // Fall back to sample data for demo purposes
        setEvents(sampleEvents);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);
  
  // Delete selected events
  const deleteSelectedEvents = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف الفعاليات المحددة؟')) {
      setActionLoading(true);
      try {
        const response = await fetchWithAuth('/api/admin/events', {
          method: 'DELETE',
          body: JSON.stringify({ ids: selectedEvents })
        });
        
        if (!response.ok) {
          throw new Error(`Error deleting events: ${response.statusText}`);
        }
        
        // Refresh events list
        const updatedEvents = events.filter(event => !selectedEvents.includes(event.id));
        setEvents(updatedEvents);
        setSelectedEvents([]);
        toast.success("تم حذف الفعاليات بنجاح");
      } catch (err) {
        console.error('Failed to delete events:', err);
        toast.error(`فشل في حذف الفعاليات: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Export events using the new utility
  const exportEvents = async () => {
    try {
      setActionLoading(true);
      
      // Build filters based on current tab and search
      const filters: any = {};
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      // Map tab to status/type filters
      if (activeTab === "upcoming") {
        // For upcoming events, we'd need to filter by date on backend
        filters.status = 'PUBLISHED';
      } else if (activeTab === "ongoing") {
        filters.status = 'PUBLISHED';
      } else if (activeTab === "completed") {
        filters.status = 'COMPLETED';
      } else if (activeTab === "hackathons") {
        filters.eventType = 'HACKATHON';
      } else if (activeTab === "workshops") {
        filters.eventType = 'WORKSHOP';
      } else if (activeTab === "networking") {
        filters.eventType = 'NETWORKING';
      } else if (activeTab === "draft") {
        filters.status = 'DRAFT';
      } else if (activeTab === "published") {
        filters.status = 'PUBLISHED';
      }
      
      // Add registration data if events are selected
      if (selectedEvents.length > 0) {
        filters.includeRegistrations = 'true';
        // Note: Backend would need to support filtering by IDs for selected events
      }
      
      // Use the new export utility with automatic delimiter detection
      await exportPresets.events(filters, {
        onSuccess: () => {
          toast.success("تم تنزيل ملف التصدير بنجاح");
        },
        onError: (error) => {
          toast.error(`فشل في تصدير البيانات: ${error}`);
        }
      });
    } catch (err) {
      console.error("Error exporting events:", err);
      toast.error(`فشل في تصدير البيانات: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete single event
  const deleteSingleEvent = async (eventId: string, eventTitle: string) => {
    if (window.confirm(`هل أنت متأكد من حذف "${eventTitle}"؟`)) {
      setActionLoading(true);
      try {
        const response = await fetchWithAuth(`/api/admin/events/${eventId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Error deleting event: ${response.statusText}`);
        }
        
        // Update events list
        setEvents(events.filter(e => e.id !== eventId));
        toast.success("تم حذف الفعالية بنجاح");
      } catch (err) {
        console.error("Error deleting event:", err);
        toast.error(`فشل في حذف الفعالية: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Filter events based on active tab and search query
  const filteredEvents = events.filter(event => {
    // Filter by tab
    if (activeTab === "upcoming" && event.status !== "قادم") return false
    if (activeTab === "ongoing" && event.status !== "جاري") return false
    if (activeTab === "completed" && event.status !== "مكتمل") return false
    if (activeTab === "hackathons" && event.type !== "هاكاثون") return false
    if (activeTab === "workshops" && event.type !== "ورشة عمل") return false
    if (activeTab === "networking" && event.type !== "شبكات") return false
    if (activeTab === "draft" && event.apiStatus !== "draft") return false
    if (activeTab === "published" && event.apiStatus !== "published") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleEventSelection = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId))
    } else {
      setSelectedEvents([...selectedEvents, eventId])
    }
  }

  const selectAllEvents = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(filteredEvents.map(event => event.id))
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={exportEvents}
            disabled={loading || actionLoading}
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => window.location.href = "/admin-dashboard/events/create"}
          >
            <Plus className="h-4 w-4" />
            <span>إضافة فعالية</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة الفعاليات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>الفعاليات القادمة</span>
              <Calendar className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events.filter(e => e.status === "قادم").length}</div>
            <div className="text-sm text-muted-foreground mt-1">خلال الشهر القادم</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>الفعاليات الجارية</span>
              <Clock className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events.filter(e => e.status === "جاري").length}</div>
            <div className="text-sm text-muted-foreground mt-1">حاليًا</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي المشاركين</span>
              <Users className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {events.reduce((sum, event) => sum + event.attendees, 0)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">في جميع الفعاليات</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>أنواع الفعاليات</span>
              <Tag className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(events.map(e => e.type)).size}
            </div>
            <div className="text-sm text-muted-foreground mt-1">أنواع مختلفة</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن فعالية..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 md:grid-cols-7">
            <TabsTrigger value="draft">مسودة</TabsTrigger>
            <TabsTrigger value="published">منشورة</TabsTrigger>
            <TabsTrigger value="networking">شبكات</TabsTrigger>
            <TabsTrigger value="workshops">ورش عمل</TabsTrigger>
            <TabsTrigger value="hackathons">هاكاثونات</TabsTrigger>
            <TabsTrigger value="ongoing">جارية</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedEvents.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>إرسال إشعار</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>مشاركة</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={deleteSelectedEvents}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>حذف</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>قائمة الفعاليات ({filteredEvents.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4">جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              حدث خطأ أثناء تحميل البيانات: {error}
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-1 flex items-center">
                  <input 
                    type="checkbox" 
                    className="ml-2"
                    checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                    onChange={selectAllEvents}
                  />
                  <span>الإجراءات</span>
                </div>
                <div className="col-span-1">الحالة</div>
                <div className="col-span-1">النوع</div>
                <div className="col-span-1">المشاركون</div>
                <div className="col-span-1">المنظم</div>
                <div className="col-span-1">الموقع</div>
                <div className="col-span-1">التاريخ</div>
                <div className="col-span-1">العنوان</div>
              </div>
              
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div key={event.id} className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                    <div className="col-span-1 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                      />
                      <div className="flex gap-1">
                        <button 
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => window.location.href = `/admin-dashboard/events/${event.id}`}
                          disabled={actionLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-amber-500 hover:text-amber-700"
                          onClick={() => window.location.href = `/admin-dashboard/events/${event.id}/edit`}
                          disabled={actionLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteSingleEvent(event.id, event.title)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1">
                      {event.status === "قادم" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          قادم
                        </span>
                      ) : event.status === "جاري" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          جاري
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          مكتمل
                        </span>
                      )}
                    </div>
                    <div className="col-span-1">{event.type}</div>
                    <div className="col-span-1">{event.attendees}</div>
                    <div className="col-span-1">{event.organizer}</div>
                    <div className="col-span-1">{event.location.split('،')[0]}</div>
                    <div className="col-span-1">{event.date.split(' - ')[0]}</div>
                    <div className="col-span-1">{event.title}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  لا توجد نتائج مطابقة لبحثك
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {activeTab === "upcoming" && filteredEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الفعاليات القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
                        toast.success("تم نسخ الرابط");
                      }}
                    >
                      <Link className="h-4 w-4" />
                      <span>رابط التسجيل</span>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => window.location.href = `/admin-dashboard/events/${event.id}`}
                    >
                      <Eye className="h-4 w-4" />
                      <span>التفاصيل</span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">{event.date} • {event.time}</div>
                    <div className="text-xs text-muted-foreground">الموعد النهائي للتسجيل: {event.registrationDeadline}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع الفعاليات حسب النوع</span>
              <Tag className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.type === "هاكاثون").length}</span>
                </div>
                <span className="text-muted-foreground">هاكاثون</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.type === "ورشة عمل").length}</span>
                </div>
                <span className="text-muted-foreground">ورشة عمل</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-6 h-3 bg-amber-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.type === "مؤتمر").length}</span>
                </div>
                <span className="text-muted-foreground">مؤتمر</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-5 h-3 bg-purple-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.type === "عرض تقديمي").length}</span>
                </div>
                <span className="text-muted-foreground">عرض تقديمي</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-3 bg-red-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.type === "شبكات").length}</span>
                </div>
                <span className="text-muted-foreground">شبكات</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع الفعاليات حسب المنظم</span>
              <Users className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.organizer === "إدارة المنصة").length}</span>
                </div>
                <span className="text-muted-foreground">إدارة المنصة</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.organizer === "مسرع التقنية المالية").length}</span>
                </div>
                <span className="text-muted-foreground">مسرع التقنية المالية</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-6 h-3 bg-amber-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.organizer === "حاضنة التقنيات الناشئة").length}</span>
                </div>
                <span className="text-muted-foreground">حاضنة التقنيات الناشئة</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-3 bg-purple-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">{events.filter(e => e.organizer === "وزارة الاتصالات وتقنية المعلومات").length}</span>
                </div>
                <span className="text-muted-foreground">وزارة الاتصالات وتقنية المعلومات</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
