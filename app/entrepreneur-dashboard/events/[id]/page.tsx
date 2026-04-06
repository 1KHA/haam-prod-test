"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "react-hot-toast"
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Users,
  CheckCircle, 
  XCircle,
  Loader2, 
  UserPlus
} from "lucide-react"

// Interface for API response event data
interface EventResponse {
  event: {
    id: string;
    title: string;
    eventType: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    organizer: string;
    capacity: number | null;
    registrationDeadline: string | null;
    status: string;
    registrationCount: number;
    isAtCapacity: boolean;
    isRegistrationOpen: boolean;
    hasStarted: boolean;
    hasEnded: boolean;
    isUserRegistered: boolean;
    userRegistration: {
      id: string;
      status: string;
      createdAt: string;
    } | null;
  }
}

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<EventResponse["event"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch event details
  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`/api/events/${eventId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setEvent(data.event);
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);

  // Register for event
  const registerForEvent = async () => {
    if (!event) return;
    
    setActionLoading(true);
    try {
      const response = await fetchWithAuth(`/api/events/${eventId}/register`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register for event');
      }
      
      const data = await response.json();
      
      // Update event with new registration status
      setEvent({
        ...event,
        isUserRegistered: true,
        userRegistration: {
          id: data.registration.id,
          status: data.registration.status,
          createdAt: data.registration.createdAt
        }
      });
      
      toast.success(data.waitlist 
        ? 'تم إضافتك إلى قائمة الانتظار للفعالية' 
        : 'تم تسجيلك بنجاح في الفعالية!');
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error(`فشل التسجيل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Cancel registration
  const cancelRegistration = async () => {
    if (!event) return;
    
    if (!window.confirm('هل أنت متأكد من إلغاء تسجيلك في هذه الفعالية؟')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetchWithAuth(`/api/events/${eventId}/register`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel registration');
      }
      
      // Update event with new registration status
      setEvent({
        ...event,
        isUserRegistered: false,
        userRegistration: null
      });
      
      toast.success('تم إلغاء تسجيلك بنجاح!');
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error(`فشل إلغاء التسجيل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Get registration status badge
  const getRegistrationBadge = () => {
    if (!event?.isUserRegistered || !event.userRegistration) return null;
    
    if (event.userRegistration.status === "confirmed") {
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        <span>تأكيد التسجيل</span>
      </Badge>;
    }
    
    if (event.userRegistration.status === "waitlist") {
      return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>قائمة الانتظار</span>
      </Badge>;
    }
    
    return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
      <XCircle className="h-3 w-3" />
      <span>ملغي</span>
    </Badge>;
  };

  // Get event status badge
  const getEventStatusBadge = () => {
    if (!event) return null;
    
    if (event.hasEnded) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">انتهى</Badge>;
    }
    
    if (event.hasStarted) {
      return <Badge variant="outline" className="bg-green-100 text-green-800">جاري</Badge>;
    }
    
    return <Badge variant="outline" className="bg-blue-100 text-blue-800">قادم</Badge>;
  };

  // Get registration action button
  const getRegistrationButton = () => {
    if (!event) return null;
    
    if (event.hasEnded) {
      return <Button disabled variant="outline">انتهى الفعالية</Button>;
    }
    
    if (!event.isRegistrationOpen) {
      return <Button disabled variant="outline">التسجيل مغلق</Button>;
    }
    
    if (event.isUserRegistered) {
      return <Button 
        variant="outline" 
        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
        onClick={cancelRegistration}
        disabled={actionLoading}
      >
        {actionLoading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <XCircle className="h-4 w-4 ml-2" />}
        إلغاء التسجيل
      </Button>;
    }
    
    return <Button 
      variant="default"
      onClick={registerForEvent}
      disabled={actionLoading}
    >
      {actionLoading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <UserPlus className="h-4 w-4 ml-2" />}
      التسجيل
    </Button>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">جاري تحميل تفاصيل الفعالية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold mt-4">حدث خطأ</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold mt-4">الفعالية غير موجودة</h2>
          <p className="mt-2 text-muted-foreground">لا يمكن العثور على الفعالية المطلوبة</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push("/entrepreneur-dashboard/events")}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة إلى صفحة الفعاليات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start">
        <Button 
          variant="outline" 
          onClick={() => router.push("/entrepreneur-dashboard/events")}
          className="order-2 lg:order-1"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          العودة إلى الفعاليات
        </Button>
        <h1 className="text-3xl font-bold order-1 lg:order-2 text-right">{event.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - first two columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className={`h-2 w-full ${
              event.hasEnded ? 'bg-gray-500' : 
              event.hasStarted ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {getEventStatusBadge()}
                  <Badge variant="outline">{event.eventType}</Badge>
                </div>
                {getRegistrationBadge()}
              </div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">تفاصيل الفعالية</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-end gap-2">
                      <div>
                        <div>{formatDate(event.startDate)}</div>
                        {formatDate(event.startDate) !== formatDate(event.endDate) && (
                          <div>{formatDate(event.endDate)}</div>
                        )}
                      </div>
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                      <div>{formatTime(event.startDate)} - {formatTime(event.endDate)}</div>
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                      <div>{event.location}</div>
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                      <div>{event.organizer}</div>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">معلومات التسجيل</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{event.registrationCount}</div>
                      <div className="text-muted-foreground">عدد المسجلين</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {event.capacity ? event.capacity : 'غير محدود'}
                      </div>
                      <div className="text-muted-foreground">السعة</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {event.registrationDeadline 
                          ? formatDate(event.registrationDeadline)
                          : 'غير محدد'}
                      </div>
                      <div className="text-muted-foreground">آخر موعد للتسجيل</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {event.isRegistrationOpen 
                          ? <span className="text-green-600">مفتوح</span> 
                          : <span className="text-red-600">مغلق</span>}
                      </div>
                      <div className="text-muted-foreground">حالة التسجيل</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - third column on large screens */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">حالة التسجيل</div>
                {event.isUserRegistered ? (
                  <div className="font-semibold text-green-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      {event.userRegistration?.status === 'waitlist' 
                        ? 'أنت في قائمة الانتظار'
                        : 'أنت مسجل في هذه الفعالية'}
                    </span>
                  </div>
                ) : (
                  <div className="font-semibold text-muted-foreground">
                    أنت غير مسجل
                  </div>
                )}
              </div>
              
              {event.isUserRegistered && event.userRegistration?.status === 'confirmed' && (
                <div className="text-center p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="text-sm font-medium text-green-800">تم تأكيد تسجيلك</div>
                  <div className="text-xs text-green-600 mt-1">
                    نتطلع إلى رؤيتك في الفعالية!
                  </div>
                </div>
              )}
              
              {event.isUserRegistered && event.userRegistration?.status === 'waitlist' && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">أنت في قائمة الانتظار</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    سيتم إشعارك في حالة توفر مكان لك
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full">
                {getRegistrationButton()}
              </div>
            </CardFooter>
          </Card>

          {event.capacity && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>المشاركون</span>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        event.registrationCount / event.capacity > 0.9 
                          ? 'bg-red-500' 
                          : event.registrationCount / event.capacity > 0.7 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (event.registrationCount / event.capacity) * 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="font-medium">
                      {event.registrationCount} / {event.capacity}
                    </div>
                    <div className="text-muted-foreground">
                      {event.isAtCapacity 
                        ? 'اكتمل العدد' 
                        : `${Math.floor((event.registrationCount / event.capacity) * 100)}% مسجل`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
