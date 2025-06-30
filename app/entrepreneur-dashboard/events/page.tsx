"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  Wrench,
  Megaphone,
  Handshake,
  CalendarDays,
  ArrowRight
} from "lucide-react"

interface Event {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  type: "workshop" | "info" | "networking" | "demo" | "other"
  capacity: number
  registered: number
  status: "upcoming" | "past" | "ongoing"
  isRegistered: boolean
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  
  // Mock data for events
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      name: "ورشة عمل: كيفية بناء نموذج أعمال",
      description: "ورشة عمل تفاعلية لتعلم كيفية بناء نموذج أعمال قوي لشركتك الناشئة. ستتعلم كيفية تحديد القيمة المقترحة، وشرائح العملاء، وقنوات التوزيع، ومصادر الإيرادات، والتكاليف الرئيسية.",
      date: "15 مارس 2025",
      time: "10:00 صباحاً - 12:00 ظهراً",
      location: "مركز الابتكار، الرياض",
      type: "workshop",
      capacity: 30,
      registered: 18,
      status: "upcoming",
      isRegistered: false
    },
    {
      id: "2",
      name: "جلسة تعريفية: برنامج مسرع الأعمال",
      description: "جلسة تعريفية حول برنامج مسرع الأعمال الصيفي 2025. ستتعرف على تفاصيل البرنامج، والفوائد، وعملية التقديم، والجدول الزمني.",
      date: "20 مارس 2025",
      time: "2:00 مساءً - 3:30 مساءً",
      location: "عبر الإنترنت (زوم)",
      type: "info",
      capacity: 100,
      registered: 45,
      status: "upcoming",
      isRegistered: true
    },
    {
      id: "3",
      name: "لقاء مع المستثمرين",
      description: "فرصة للقاء مع مستثمرين محتملين وعرض شركتك الناشئة. سيكون هناك وقت للعروض التقديمية والتواصل.",
      date: "25 مارس 2025",
      time: "4:00 مساءً - 7:00 مساءً",
      location: "فندق الفيصلية، الرياض",
      type: "networking",
      capacity: 50,
      registered: 32,
      status: "upcoming",
      isRegistered: false
    },
    {
      id: "4",
      name: "يوم العرض: الدفعة الثالثة",
      description: "يوم العرض للشركات الناشئة في الدفعة الثالثة من برنامج مسرع الأعمال. ستقوم الشركات الناشئة بعرض منتجاتها وخدماتها أمام المستثمرين والإعلام.",
      date: "10 فبراير 2025",
      time: "1:00 مساءً - 5:00 مساءً",
      location: "مركز الملك عبدالله المالي، الرياض",
      type: "demo",
      capacity: 200,
      registered: 180,
      status: "past",
      isRegistered: true
    },
    {
      id: "5",
      name: "ورشة عمل: استراتيجيات التسويق للشركات الناشئة",
      description: "ورشة عمل حول استراتيجيات التسويق الفعالة للشركات الناشئة. ستتعلم كيفية بناء علامة تجارية قوية، واستخدام وسائل التواصل الاجتماعي، وتحسين محركات البحث.",
      date: "5 فبراير 2025",
      time: "10:00 صباحاً - 1:00 مساءً",
      location: "مركز الابتكار، الرياض",
      type: "workshop",
      capacity: 30,
      registered: 30,
      status: "past",
      isRegistered: true
    },
    {
      id: "6",
      name: "ورشة عمل: التمويل والاستثمار",
      description: "ورشة عمل حول كيفية الحصول على التمويل والاستثمار لشركتك الناشئة. ستتعلم كيفية إعداد عرض استثماري قوي، والتفاوض مع المستثمرين، وتقييم شركتك الناشئة.",
      date: "5 أبريل 2025",
      time: "10:00 صباحاً - 1:00 مساءً",
      location: "مركز الابتكار، الرياض",
      type: "workshop",
      capacity: 30,
      registered: 10,
      status: "upcoming",
      isRegistered: false
    }
  ])

  // Filter events based on search query, selected type, and active tab
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.includes(searchQuery) || 
                          event.description.includes(searchQuery) || 
                          event.location.includes(searchQuery)
    
    const matchesType = selectedType === null || event.type === selectedType
    
    if (activeTab === "upcoming") return matchesSearch && matchesType && event.status === "upcoming"
    if (activeTab === "past") return matchesSearch && matchesType && event.status === "past"
    if (activeTab === "registered") return matchesSearch && matchesType && event.isRegistered
    
    return matchesSearch && matchesType
  })

  const handleRegister = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, isRegistered: true, registered: event.registered + 1 } 
        : event
    ))
  }

  const handleCancelRegistration = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, isRegistered: false, registered: event.registered - 1 } 
        : event
    ))
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "workshop":
        return <Wrench className="h-5 w-5 text-blue-500" />
      case "info":
        return <Megaphone className="h-5 w-5 text-green-500" />
      case "networking":
        return <Handshake className="h-5 w-5 text-amber-500" />
      case "demo":
        return <CalendarDays className="h-5 w-5 text-purple-500" />
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  const getEventTypeText = (type: string) => {
    switch (type) {
      case "workshop":
        return "ورشة عمل"
      case "info":
        return "جلسة تعريفية"
      case "networking":
        return "لقاء تواصل"
      case "demo":
        return "يوم عرض"
      default:
        return "فعالية"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">الفعاليات</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="registered">فعالياتي</TabsTrigger>
          <TabsTrigger value="past">الفعاليات السابقة</TabsTrigger>
          <TabsTrigger value="upcoming">الفعاليات القادمة</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث..." 
              className="pr-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button 
              variant={selectedType === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              الكل
            </Button>
            <Button 
              variant={selectedType === "workshop" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedType("workshop")}
            >
              ورش عمل
            </Button>
            <Button 
              variant={selectedType === "info" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedType("info")}
            >
              جلسات تعريفية
            </Button>
            <Button 
              variant={selectedType === "networking" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedType("networking")}
            >
              لقاءات تواصل
            </Button>
            <Button 
              variant={selectedType === "demo" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedType("demo")}
            >
              أيام عرض
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab}>
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    العودة للقائمة
                  </Button>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getEventTypeIcon(selectedEvent.type)}
                      <CardTitle>{selectedEvent.name}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">{getEventTypeText(selectedEvent.type)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-right">وصف الفعالية</h3>
                    <p className="text-right">{selectedEvent.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">التاريخ</p>
                          <p className="text-sm text-muted-foreground">{selectedEvent.date}</p>
                        </div>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">الوقت</p>
                          <p className="text-sm text-muted-foreground">{selectedEvent.time}</p>
                        </div>
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">المكان</p>
                          <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                        </div>
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">السعة</p>
                          <p className="text-sm text-muted-foreground">{selectedEvent.registered} / {selectedEvent.capacity}</p>
                        </div>
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">الحالة</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEvent.status === "upcoming" ? "قادمة" : 
                             selectedEvent.status === "ongoing" ? "جارية" : "منتهية"}
                          </p>
                        </div>
                        {selectedEvent.status === "upcoming" ? 
                          <Clock className="h-5 w-5 text-blue-500" /> : 
                          selectedEvent.status === "ongoing" ? 
                          <CheckCircle className="h-5 w-5 text-green-500" /> : 
                          <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">حالة التسجيل</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEvent.isRegistered ? "مسجل" : "غير مسجل"}
                          </p>
                        </div>
                        {selectedEvent.isRegistered ? 
                          <CheckCircle className="h-5 w-5 text-green-500" /> : 
                          <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                {selectedEvent.status === "upcoming" ? (
                  selectedEvent.isRegistered ? (
                    <Button 
                      variant="outline" 
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                    >
                      إلغاء التسجيل
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleRegister(selectedEvent.id)}
                      disabled={selectedEvent.registered >= selectedEvent.capacity}
                    >
                      التسجيل في الفعالية
                    </Button>
                  )
                ) : (
                  <Button variant="outline" disabled>
                    انتهت الفعالية
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {event.isRegistered && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">مسجل</span>
                        )}
                        {event.status === "past" && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">منتهية</span>
                        )}
                        {event.registered >= event.capacity && event.status !== "past" && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">مكتملة</span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getEventTypeIcon(event.type)}
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                        </div>
                        <CardDescription className="mt-1">{getEventTypeText(event.type)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">التاريخ</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">الوقت</p>
                          <p className="text-sm text-muted-foreground">{event.time}</p>
                        </div>
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">المكان</p>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-right line-clamp-2">{event.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {event.registered} / {event.capacity} مسجل
                    </div>
                    <div className="flex gap-2">
                      {event.status === "upcoming" && !event.isRegistered && (
                        <Button 
                          onClick={() => handleRegister(event.id)}
                          disabled={event.registered >= event.capacity}
                        >
                          التسجيل
                        </Button>
                      )}
                      {event.status === "upcoming" && event.isRegistered && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleCancelRegistration(event.id)}
                        >
                          إلغاء التسجيل
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedEvent(event)}
                      >
                        التفاصيل
                        <ArrowRight className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}

              {filteredEvents.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">لا توجد فعاليات متطابقة مع البحث</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
