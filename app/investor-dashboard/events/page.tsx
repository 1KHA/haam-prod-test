"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Search, 
  Filter, 
  ChevronRight,
  Star,
  StarOff,
  ExternalLink
} from "lucide-react"

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [favoriteEvents, setFavoriteEvents] = useState<number[]>([1, 3])

  const toggleFavorite = (eventId: number) => {
    if (favoriteEvents.includes(eventId)) {
      setFavoriteEvents(favoriteEvents.filter(id => id !== eventId))
    } else {
      setFavoriteEvents([...favoriteEvents, eventId])
    }
  }

  // Define event types
  type UpcomingEvent = {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    type: string;
    attendees: number;
    description: string;
    registrationDeadline: string;
    image: string;
  }

  type PastEvent = {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    type: string;
    attendees: number;
    description: string;
    image: string;
  }

  type Events = {
    upcoming: UpcomingEvent[];
    past: PastEvent[];
  }

  // Sample event data
  const events: Events = {
    upcoming: [
      {
        id: 1,
        title: "ملتقى المستثمرين السنوي",
        date: "15 أبريل 2025",
        time: "10:00 صباحاً - 4:00 مساءً",
        location: "فندق الريتز كارلتون، الرياض",
        type: "مؤتمر",
        attendees: 250,
        description: "ملتقى سنوي يجمع المستثمرين ورواد الأعمال لمناقشة أحدث الاتجاهات في عالم الاستثمار وريادة الأعمال.",
        registrationDeadline: "10 أبريل 2025",
        image: "https://placehold.co/600x400/e9ecef/495057?text=ملتقى+المستثمرين"
      },
      {
        id: 2,
        title: "يوم العرض التقديمي للشركات الناشئة",
        date: "22 أبريل 2025",
        time: "1:00 ظهراً - 5:00 مساءً",
        location: "مركز الملك عبدالله المالي، الرياض",
        type: "عروض تقديمية",
        attendees: 120,
        description: "فرصة للاستماع إلى عروض تقديمية من أفضل الشركات الناشئة في المملكة والتعرف على فرص استثمارية واعدة.",
        registrationDeadline: "20 أبريل 2025",
        image: "https://placehold.co/600x400/e9ecef/495057?text=يوم+العرض+التقديمي"
      },
      {
        id: 3,
        title: "ورشة عمل: استراتيجيات الاستثمار في التكنولوجيا المالية",
        date: "5 مايو 2025",
        time: "9:00 صباحاً - 12:00 ظهراً",
        location: "فندق فورسيزونز، الرياض",
        type: "ورشة عمل",
        attendees: 50,
        description: "ورشة عمل متخصصة تناقش أحدث استراتيجيات الاستثمار في قطاع التكنولوجيا المالية وتحليل الفرص والتحديات.",
        registrationDeadline: "1 مايو 2025",
        image: "https://placehold.co/600x400/e9ecef/495057?text=ورشة+عمل"
      },
      {
        id: 4,
        title: "لقاء مع مؤسسي الشركات الناشئة الناجحة",
        date: "12 مايو 2025",
        time: "6:00 مساءً - 9:00 مساءً",
        location: "مقر مسرعة الأعمال، الرياض",
        type: "لقاء",
        attendees: 80,
        description: "لقاء مفتوح مع مؤسسي شركات ناشئة ناجحة لمشاركة تجاربهم وقصص نجاحهم والتحديات التي واجهتهم.",
        registrationDeadline: "10 مايو 2025",
        image: "https://placehold.co/600x400/e9ecef/495057?text=لقاء+مع+المؤسسين"
      }
    ],
    past: [
      {
        id: 5,
        title: "منتدى الاستثمار الجريء",
        date: "10 مارس 2025",
        time: "9:00 صباحاً - 5:00 مساءً",
        location: "فندق الفيصلية، الرياض",
        type: "منتدى",
        attendees: 300,
        description: "منتدى يجمع خبراء الاستثمار الجريء لمناقشة أحدث الاتجاهات والفرص في السوق السعودي والعالمي.",
        image: "https://placehold.co/600x400/e9ecef/495057?text=منتدى+الاستثمار"
      },
      {
        id: 6,
        title: "ورشة عمل: تقييم الشركات الناشئة",
        date: "25 فبراير 2025",
        time: "1:00 ظهراً - 4:00 مساءً",
        location: "مركز الأعمال، الرياض",
        type: "ورشة عمل",
        attendees: 60,
        description: "ورشة عمل متخصصة في طرق وأساليب تقييم الشركات الناشئة وتحليل المخاطر والعوائد المتوقعة.",
        image: "https://placehold.co/600x400/e9ecef/495057?text=ورشة+تقييم+الشركات"
      },
      {
        id: 7,
        title: "لقاء المستثمرين الربعي",
        date: "15 يناير 2025",
        time: "6:00 مساءً - 8:00 مساءً",
        location: "نادي رجال الأعمال، الرياض",
        type: "لقاء",
        attendees: 100,
        description: "لقاء دوري للمستثمرين لمناقشة أداء السوق خلال الربع الماضي وتوقعات الربع القادم.",
        image: "https://placehold.co/600x400/e9ecef/495057?text=لقاء+المستثمرين"
      }
    ]
  }

  const filteredEvents = events[activeTab === "upcoming" ? "upcoming" : "past"].filter(event => 
    event.title.includes(searchQuery) || 
    event.description.includes(searchQuery) ||
    event.type.includes(searchQuery)
  )

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">الفعاليات والأحداث</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن فعاليات..." 
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="past">الفعاليات السابقة</TabsTrigger>
            <TabsTrigger value="upcoming">الفعاليات القادمة</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <Card key={event.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="h-full w-full object-cover"
                />
                <button 
                  className="absolute top-2 left-2 p-1 bg-white rounded-full"
                  onClick={() => toggleFavorite(event.id)}
                >
                  {favoriteEvents.includes(event.id) ? (
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {event.type}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      <Users className="h-3 w-3 mr-1" />
                      {event.attendees}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {event.description}
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm">{event.date}</span>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm">{event.time}</span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm">{event.location}</span>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {activeTab === "upcoming" && 'registrationDeadline' in event && (
                  <div className="text-sm text-muted-foreground">
                    آخر موعد للتسجيل: {(event as UpcomingEvent).registrationDeadline}
                  </div>
                )}
                <Button className="mr-auto">
                  {activeTab === "upcoming" ? "التسجيل" : "عرض التفاصيل"}
                  <ChevronRight className="h-4 w-4 mr-1" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground">لا توجد فعاليات مطابقة لبحثك</p>
          </div>
        )}
      </div>

      {activeTab === "upcoming" && filteredEvents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right">
          <h3 className="text-lg font-medium text-blue-800 mb-2">فعاليات موصى بها</h3>
          <p className="text-blue-700 mb-4">بناءً على اهتماماتك واستثماراتك السابقة، نوصي بحضور الفعاليات التالية:</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-3 rounded-md border border-blue-100">
              <Button variant="outline" size="sm">
                التسجيل
                <ExternalLink className="h-3 w-3 mr-1" />
              </Button>
              <div className="text-right">
                <h4 className="font-medium">مؤتمر التكنولوجيا المالية 2025</h4>
                <p className="text-sm text-muted-foreground">20 مايو 2025 - الرياض</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white p-3 rounded-md border border-blue-100">
              <Button variant="outline" size="sm">
                التسجيل
                <ExternalLink className="h-3 w-3 mr-1" />
              </Button>
              <div className="text-right">
                <h4 className="font-medium">قمة الاستثمار في الذكاء الاصطناعي</h4>
                <p className="text-sm text-muted-foreground">2 يونيو 2025 - جدة</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
