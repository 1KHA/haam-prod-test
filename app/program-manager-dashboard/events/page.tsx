"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")

  const events = [
    {
      id: 1,
      title: "يوم العرض التقديمي",
      type: "عرض تقديمي",
      date: "2025/04/15",
      time: "10:00 ص - 2:00 م",
      location: "قاعة المؤتمرات الرئيسية",
      status: "upcoming",
      attendeeCount: 120,
      startupCount: 12,
      mentorCount: 8,
      description: "يوم العرض التقديمي للشركات الناشئة في دفعة الابتكار 2025، حيث تقدم الشركات عروضها أمام المستثمرين والموجهين"
    },
    {
      id: 2,
      title: "ورشة عمل: استراتيجيات التسويق الرقمي",
      type: "ورشة عمل",
      date: "2025/03/20",
      time: "1:00 م - 4:00 م",
      location: "قاعة التدريب 2",
      status: "upcoming",
      attendeeCount: 35,
      startupCount: 15,
      mentorCount: 2,
      description: "ورشة عمل متخصصة في استراتيجيات التسويق الرقمي للشركات الناشئة، يقدمها خبراء في المجال"
    },
    {
      id: 3,
      title: "لقاء مع المستثمرين",
      type: "شبكات تواصل",
      date: "2025/03/25",
      time: "6:00 م - 9:00 م",
      location: "فندق الريتز كارلتون",
      status: "upcoming",
      attendeeCount: 80,
      startupCount: 20,
      mentorCount: 5,
      description: "فرصة للشركات الناشئة للتواصل مع المستثمرين وعرض أفكارهم ومشاريعهم في جو غير رسمي"
    },
    {
      id: 4,
      title: "ورشة عمل: جمع التمويل",
      type: "ورشة عمل",
      date: "2025/02/10",
      time: "10:00 ص - 1:00 م",
      location: "قاعة التدريب 1",
      status: "completed",
      attendeeCount: 40,
      startupCount: 18,
      mentorCount: 3,
      description: "ورشة عمل حول استراتيجيات جمع التمويل للشركات الناشئة، وكيفية إعداد عروض استثمارية ناجحة"
    },
    {
      id: 5,
      title: "هاكاثون الابتكار",
      type: "هاكاثون",
      date: "2025/01/15",
      time: "9:00 ص - 9:00 م",
      location: "مركز الابتكار",
      status: "completed",
      attendeeCount: 150,
      startupCount: 25,
      mentorCount: 10,
      description: "هاكاثون لمدة يوم كامل لتطوير حلول مبتكرة للتحديات التي تواجه الشركات الناشئة في مجال التقنية المالية"
    },
    {
      id: 6,
      title: "ندوة: مستقبل الذكاء الاصطناعي",
      type: "ندوة",
      date: "2025/04/05",
      time: "11:00 ص - 1:00 م",
      location: "قاعة المؤتمرات الرئيسية",
      status: "cancelled",
      attendeeCount: 0,
      startupCount: 0,
      mentorCount: 0,
      description: "ندوة حول مستقبل الذكاء الاصطناعي وتأثيره على الشركات الناشئة، يقدمها خبراء في المجال"
    }
  ]

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.includes(searchQuery) || 
                          event.description.includes(searchQuery) ||
                          event.type.includes(searchQuery) ||
                          event.location.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "upcoming") return matchesSearch && event.status === "upcoming"
    if (activeTab === "completed") return matchesSearch && event.status === "completed"
    if (activeTab === "cancelled") return matchesSearch && event.status === "cancelled"
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming": return "قادم"
      case "completed": return "مكتمل"
      case "cancelled": return "ملغي"
      default: return "غير معروف"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "عرض تقديمي": return "bg-purple-100 text-purple-800"
      case "ورشة عمل": return "bg-blue-100 text-blue-800"
      case "شبكات تواصل": return "bg-green-100 text-green-800"
      case "هاكاثون": return "bg-amber-100 text-amber-800"
      case "ندوة": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إنشاء فعالية جديدة</span>
        </Button>
        <h1 className="text-3xl font-bold">إدارة الفعاليات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{events.filter(event => event.status === "upcoming").length}</div>
            <p className="text-muted-foreground">فعاليات قادمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{events.filter(event => event.status === "completed").length}</div>
            <p className="text-muted-foreground">فعاليات مكتملة</p>
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
              <TabsTrigger value="completed">مكتملة</TabsTrigger>
              <TabsTrigger value="upcoming">قادمة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs ${getTypeColor(event.type)}`}>
                        {event.type}
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
                        <div className="font-medium">{event.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">الوقت</div>
                        <div className="font-medium">{event.time}</div>
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
                  
                  {event.status !== "cancelled" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 ml-2 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">الحضور</div>
                          <div className="font-medium">{event.attendeeCount}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">الشركات الناشئة</div>
                        <div className="font-medium">{event.startupCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">الموجهين</div>
                        <div className="font-medium">{event.mentorCount}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    
                    {event.status === "upcoming" && (
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm">إلغاء</Button>
                        <Button variant="default" size="sm">تعديل</Button>
                        <Button variant="default" size="sm">إدارة الحضور</Button>
                      </div>
                    )}
                    
                    {event.status === "completed" && (
                      <div className="flex gap-2">
                        <Button variant="default" size="sm">عرض التقرير</Button>
                        <Button variant="default" size="sm">الصور والفيديوهات</Button>
                      </div>
                    )}
                    
                    {event.status === "cancelled" && (
                      <Button variant="default" size="sm">إعادة جدولة</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
