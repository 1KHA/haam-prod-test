"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Share2,
  MessageSquare
} from "lucide-react"
import { toast } from "react-hot-toast"
import { fetchWithAuth } from "@/lib/api-client"

interface EventRegistration {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile: any;
  }
}

interface EventData {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number | null;
  status: string;
  organizer: string;
  registrationDeadline: string | null;
  registrations: EventRegistration[];
  createdAt: string;
  updatedAt: string;
  registrationCount: number;
}

export default function EventDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registrationTab, setRegistrationTab] = useState<'all' | 'confirmed' | 'waitlist' | 'cancelled'>('all')
  const [actionLoading, setActionLoading] = useState(false)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Fetch event data
  useEffect(() => {
    async function fetchEventData() {
      try {
        const response = await fetchWithAuth(`/api/admin/events/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('الفعالية غير موجودة');
          }
          throw new Error('فشل في جلب بيانات الفعالية');
        }
        
        const data = await response.json();
        setEvent(data.event);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
        
        // Use sample data for fallback
        setEvent({
          id: "1",
          title: "هاكاثون الذكاء الاصطناعي",
          description: "انضم إلينا في هذا الهاكاثون المثير لتطوير حلول مبتكرة باستخدام تقنيات الذكاء الاصطناعي.",
          eventType: "هاكاثون",
          startDate: "2025-04-15T09:00:00.000Z",
          endDate: "2025-04-15T18:00:00.000Z",
          location: "مركز الابتكار، الرياض",
          capacity: 150,
          status: "published",
          organizer: "إدارة المنصة",
          registrationDeadline: "2025-04-10T23:59:59.000Z",
          registrationCount: 120,
          registrations: [
            {
              id: "reg1",
              userId: "user1",
              status: "confirmed",
              createdAt: "2025-03-20T10:30:00.000Z",
              user: {
                id: "user1",
                name: "أحمد محمد",
                email: "ahmed@example.com",
                role: "PARTICIPANT",
                profile: { avatar: null }
              }
            },
            {
              id: "reg2",
              userId: "user2",
              status: "waitlist",
              createdAt: "2025-03-22T14:45:00.000Z",
              user: {
                id: "user2",
                name: "سارة عبدالله",
                email: "sara@example.com",
                role: "PARTICIPANT",
                profile: { avatar: null }
              }
            }
          ],
          createdAt: "2025-03-15T08:00:00.000Z",
          updatedAt: "2025-03-15T08:00:00.000Z"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchEventData();
  }, [id]);

  // Delete event
  const handleDeleteEvent = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetchWithAuth(`/api/admin/events/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('فشل في حذف الفعالية');
      }
      
      toast.success("تم حذف الفعالية بنجاح");
      router.push("/admin-dashboard/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الفعالية');
    } finally {
      setActionLoading(false);
    }
  };

  // Update registration status
  const updateRegistrationStatus = async (registrationId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetchWithAuth(`/api/admin/events/${id}/registrations/${registrationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('فشل في تحديث حالة التسجيل');
      }
      
      // Update the local state
      setEvent(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          registrations: prev.registrations.map(reg => 
            reg.id === registrationId ? { ...reg, status: newStatus } : reg
          )
        };
      });
      
      toast.success("تم تحديث حالة التسجيل");
    } catch (err) {
      console.error("Error updating registration:", err);
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث حالة التسجيل');
    } finally {
      setActionLoading(false);
    }
  };

  // Export registrations
  const exportRegistrations = () => {
    window.location.href = `/api/admin/events/${id}/registrations/export`;
  };

  // Filter registrations based on tab
  const filteredRegistrations = event?.registrations.filter(reg => {
    if (registrationTab === 'all') return true;
    return reg.status === registrationTab;
  }) || [];

  // Calculate event status
  const getEventStatus = () => {
    if (!event) return "";
    
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (now > endDate) return "مكتمل";
    if (now >= startDate) return "جاري";
    return "قادم";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error || 'حدث خطأ في تحميل بيانات الفعالية'}</div>
        <Link href="/admin-dashboard/events">
          <Button variant="outline">العودة إلى قائمة الفعاليات</Button>
        </Link>
      </div>
    );
  }

  // Format dates
  const formattedStartDate = formatDate(event.startDate);
  const formattedEndDate = formatDate(event.endDate);
  const startTime = formatTime(event.startDate);
  const endTime = formatTime(event.endDate);
  const registrationDeadline = event.registrationDeadline ? formatDate(event.registrationDeadline) : 'غير محدد';
  const eventStatus = getEventStatus();

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/admin-dashboard/events">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>العودة</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={exportRegistrations}
          >
            <Download className="h-4 w-4" />
            <span>تصدير المشاركين</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">تفاصيل الفعالية</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main event details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <Link href={`/admin-dashboard/events/${id}/edit`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit className="h-4 w-4" />
                      <span>تعديل</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handleDeleteEvent}
                    disabled={actionLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>حذف</span>
                  </Button>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800">{event.eventType}</Badge>
                    {eventStatus === "قادم" && (
                      <Badge className="bg-blue-500 text-white">قادم</Badge>
                    )}
                    {eventStatus === "جاري" && (
                      <Badge className="bg-green-500 text-white">جاري</Badge>
                    )}
                    {eventStatus === "مكتمل" && (
                      <Badge className="bg-gray-500 text-white">مكتمل</Badge>
                    )}
                    {event.status === "draft" && (
                      <Badge className="bg-yellow-100 text-yellow-800">مسودة</Badge>
                    )}
                    {event.status === "cancelled" && (
                      <Badge className="bg-red-100 text-red-800">ملغي</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-end gap-2">
                    <div>
                      <div>{formattedStartDate}</div>
                      {formattedStartDate !== formattedEndDate && (
                        <div>{formattedEndDate}</div>
                      )}
                    </div>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <div>{startTime} - {endTime}</div>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <div>{event.location}</div>
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-end gap-2">
                    <div>{event.organizer}</div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <div>
                      {event.registrationCount} / {event.capacity || 'غير محدود'}
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                    <div>الموعد النهائي للتسجيل: {registrationDeadline}</div>
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-3">وصف الفعالية</h3>
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات المشاركة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">{event.registrationCount}</div>
                <div className="text-muted-foreground">إجمالي المسجلين</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">
                  {event.registrations.filter(reg => reg.status === "confirmed").length}
                </div>
                <div className="text-muted-foreground">مؤكدون</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">
                  {event.registrations.filter(reg => reg.status === "waitlist").length}
                </div>
                <div className="text-muted-foreground">قائمة الانتظار</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">
                  {event.registrations.filter(reg => reg.status === "cancelled").length}
                </div>
                <div className="text-muted-foreground">ملغون</div>
              </div>
              
              {event.capacity && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>{Math.round((event.registrationCount / event.capacity) * 100)}%</span>
                    <span>اكتمال التسجيل</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, Math.round((event.registrationCount / event.capacity) * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registrations */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant={registrationTab === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRegistrationTab('all')}
              >
                الكل ({event.registrations.length})
              </Button>
              <Button 
                variant={registrationTab === 'confirmed' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRegistrationTab('confirmed')}
              >
                مؤكدون ({event.registrations.filter(reg => reg.status === "confirmed").length})
              </Button>
              <Button 
                variant={registrationTab === 'waitlist' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRegistrationTab('waitlist')}
              >
                قائمة الانتظار ({event.registrations.filter(reg => reg.status === "waitlist").length})
              </Button>
              <Button 
                variant={registrationTab === 'cancelled' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRegistrationTab('cancelled')}
              >
                ملغاة ({event.registrations.filter(reg => reg.status === "cancelled").length})
              </Button>
            </div>
            <CardTitle>المشاركون</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد مشاركون في هذه الفئة
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map(registration => (
                <div key={registration.id} className="flex justify-between items-center border-b pb-4">
                  <div className="flex gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {registration.status === "confirmed" ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>مؤكد</span>
                          </Badge>
                        ) : registration.status === "waitlist" ? (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>قائمة الانتظار</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            <span>ملغي</span>
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        تاريخ التسجيل: {formatDate(registration.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Share2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      </Button>
                      {registration.status !== "confirmed" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-green-600" 
                          onClick={() => updateRegistrationStatus(registration.id, "confirmed")}
                          disabled={actionLoading}
                        >
                          تأكيد
                        </Button>
                      )}
                      {registration.status !== "waitlist" && registration.status !== "cancelled" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-amber-600" 
                          onClick={() => updateRegistrationStatus(registration.id, "waitlist")}
                          disabled={actionLoading}
                        >
                          قائمة الانتظار
                        </Button>
                      )}
                      {registration.status !== "cancelled" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-red-600" 
                          onClick={() => updateRegistrationStatus(registration.id, "cancelled")}
                          disabled={actionLoading}
                        >
                          إلغاء
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{registration.user.name}</div>
                    <div className="text-sm text-muted-foreground">{registration.user.email}</div>
                    <div className="text-sm text-muted-foreground">{registration.user.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
