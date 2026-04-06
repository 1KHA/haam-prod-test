"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "react-hot-toast"
import { 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Calendar as CalendarIcon,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react"

// Interface for event data
interface Event {
  id: string;
  title: string;
  eventType: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  registrationDeadline: string | null;
  isRegistered?: boolean;
  registrationStatus?: string;
}

export default function EntrepreneurEvents() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Check if registration deadline has passed
  const isRegistrationClosed = (deadline: string | null, startDate: string) => {
    const now = new Date();
    const deadlineDate = deadline ? new Date(deadline) : new Date(startDate);
    return now > deadlineDate;
  };

  // Check if event date has passed
  const isEventPassed = (endDate: string) => {
    const now = new Date();
    const eventEndDate = new Date(endDate);
    return now > eventEndDate;
  };

  // Process event data for display
  const processEvent = (event: Event, isRegistered: boolean, registrationStatus: string | null = null) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    // Determine if event is upcoming, ongoing, or past
    const now = new Date();
    let status = "upcoming";
    if (now > endDate) {
      status = "past";
    } else if (now >= startDate && now <= endDate) {
      status = "ongoing";
    }

    return {
      ...event,
      formattedStartDate: formatDate(event.startDate),
      formattedEndDate: formatDate(event.endDate),
      startTime: formatTime(event.startDate),
      endTime: formatTime(event.endDate),
      status,
      isRegistrationClosed: isRegistrationClosed(event.registrationDeadline, event.startDate),
      isPassed: isEventPassed(event.endDate),
      isRegistered: isRegistered,
      registrationStatus: registrationStatus
    };
  };

  // Fetch all events
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const eventsResponse = await fetchWithAuth('/api/events?limit=100');
        
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const eventsData = await eventsResponse.json();
        
        // Now check registration status for each event
        const registrationPromises = eventsData.events.map(async (event: Event) => {
          try {
            const regResponse = await fetchWithAuth(`/api/events/${event.id}/register`);
            if (regResponse.ok) {
              const regData = await regResponse.json();
              return processEvent(event, regData.registered, regData.status);
            }
          } catch (err) {
            console.error(`Failed to fetch registration status for event ${event.id}`, err);
          }
          return processEvent(event, false);
        });
        
        const processedEvents = await Promise.all(registrationPromises);
        
        setEvents(processedEvents);
        setMyEvents(processedEvents.filter((event) => event.isRegistered));
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
        toast.error('فشل تحميل الفعاليات');
        setEvents([]);
        setMyEvents([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);

  // Register for an event
  const registerForEvent = async (eventId: string) => {
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
      
      // Update events list with new registration status
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            isRegistered: true,
            registrationStatus: data.registration.status
          };
        }
        return event;
      }));
      
      // Update my events list
      setMyEvents(current => {
        const eventToAdd = events.find(e => e.id === eventId);
        if (eventToAdd && !current.some(e => e.id === eventId)) {
          return [...current, {
            ...eventToAdd,
            isRegistered: true,
            registrationStatus: data.registration.status
          }];
        }
        return current;
      });
      
      toast.success('تم تسجيلك بنجاح في الفعالية!');
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error(`فشل التسجيل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };
  
  // Cancel registration for an event
  const cancelRegistration = async (eventId: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء تسجيلك في هذه الفعالية؟')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/api/events/${eventId}/register`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel registration');
      }
      
      // Update events list with new registration status
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            isRegistered: false,
            registrationStatus: null
          };
        }
        return event;
      }));
      
      // Update my events list
      setMyEvents(current => current.filter(event => event.id !== eventId));
      
      toast.success('تم إلغاء تسجيلك بنجاح!');
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error(`فشل إلغاء التسجيل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  // Filter events based on active tab and search query
  const filteredEvents = events.filter(event => {
    // Filter by tab
    if (activeTab === "upcoming" && event.status !== "upcoming") return false;
    if (activeTab === "ongoing" && event.status !== "ongoing") return false;
    if (activeTab === "past" && event.status !== "past") return false;
    if (activeTab === "registered" && !event.isRegistered) return false;
    // Normalize eventType for filtering (API returns English values)
    const normalizedEventType = event.eventType?.toLowerCase();
    if (activeTab === "hackathons" && normalizedEventType !== "hackathon") return false;
    if (activeTab === "workshops" && normalizedEventType !== "workshop") return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.eventType.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Get status badge based on event status
  const getStatusBadge = (event: any) => {
    if (event.isPassed) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">انتهى</Badge>;
    }
    if (event.status === "ongoing") {
      return <Badge variant="outline" className="bg-green-100 text-green-800">جاري</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-100 text-blue-800">قادم</Badge>;
  };

  // Get registration status badge
  const getRegistrationBadge = (event: any) => {
    if (!event.isRegistered) return null;
    
    if (event.registrationStatus === "confirmed") {
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        <span>مسجل</span>
      </Badge>;
    }
    
    if (event.registrationStatus === "waitlist") {
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

  // Get registration button based on event status
  const getRegistrationButton = (event: any) => {
    if (event.isPassed) {
      return <Button disabled variant="outline">انتهى الفعالية</Button>;
    }
    
    if (event.isRegistrationClosed) {
      return <Button disabled variant="outline">التسجيل مغلق</Button>;
    }
    
    if (event.isRegistered) {
      return <Button 
        variant="outline" 
        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
        onClick={() => cancelRegistration(event.id)}
      >
        إلغاء التسجيل
      </Button>;
    }
    
    return <Button 
      variant="default"
      onClick={() => registerForEvent(event.id)}
    >
      التسجيل
    </Button>;
  };

  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">الفعاليات</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>الفعاليات القادمة</span>
              <Calendar className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {events.filter(event => event.status === "upcoming").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">فعالية</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>فعالياتي</span>
              <User className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {events.filter(event => event.isRegistered).length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">مسجل فيها</div>
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
            <div className="text-3xl font-bold">
              {events.filter(event => event.status === "ongoing").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">حالياً</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="البحث عن فعالية..." 
            className="pl-3 pr-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="registered">فعالياتي</TabsTrigger>
            <TabsTrigger value="workshops">ورش عمل</TabsTrigger>
            <TabsTrigger value="hackathons">هاكاثونات</TabsTrigger>
            <TabsTrigger value="past">المنتهية</TabsTrigger>
            <TabsTrigger value="ongoing">الجارية</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Events list */}
      {loading ? (
        <div className="text-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">جاري تحميل الفعاليات...</p>
        </div>
      ) : error ? (
        <div className="text-center p-12 text-red-500">
          <p>{error}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center p-12 bg-muted rounded-md">
          <p className="text-muted-foreground">لا توجد فعاليات مطابقة للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className={`h-2 w-full ${event.status === 'upcoming' ? 'bg-blue-500' : event.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(event)}
                  {getRegistrationBadge(event)}
                </div>
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                <div className="text-sm text-muted-foreground">{event.eventType}</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <div>
                      <div>{event.formattedStartDate}</div>
                      {event.formattedStartDate !== event.formattedEndDate && (
                        <div>{event.formattedEndDate}</div>
                      )}
                    </div>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <div>{event.startTime} - {event.endTime}</div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <div>{event.location}</div>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {event.registrationDeadline && (
                    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                      <span>الموعد النهائي للتسجيل: {formatDate(event.registrationDeadline)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/entrepreneur-dashboard/events/${event.id}`)}
                >
                  التفاصيل
                </Button>
                {getRegistrationButton(event)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* My upcoming events section */}
      {activeTab === "all" && myEvents.filter(e => e.status !== "past").length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">فعالياتي القادمة</h2>
          <div className="space-y-4">
            {myEvents
              .filter(event => event.status !== "past")
              .map(event => (
                <Card key={`my-${event.id}`} className="relative overflow-hidden">
                  <div className="flex p-6">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <Button 
                          variant="outline" 
                          className="md:order-last"
                          onClick={() => router.push(`/entrepreneur-dashboard/events/${event.id}`)}
                        >
                          التفاصيل
                        </Button>
                        <div className="space-y-1 text-right">
                          <div className="font-medium text-lg">{event.title}</div>
                          <div className="flex flex-col text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span>{event.formattedStartDate} • {event.startTime} - {event.endTime}</span>
                              <CalendarIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{event.location}</span>
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center min-w-24">
                      {getRegistrationBadge(event)}
                    </div>
                  </div>
                  <div className={`h-1 w-full absolute bottom-0 left-0 ${
                    event.status === 'upcoming' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                </Card>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
