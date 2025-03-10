"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Download,
  ExternalLink
} from "lucide-react"

// Mock events data
const upcomingEvents = [
  {
    id: 1,
    title: "يوم العرض التقديمي للمستثمرين",
    description: "فرصة لعرض مشروعك أمام مجموعة من المستثمرين المهتمين",
    date: "15 مارس 2025",
    time: "10:00 ص - 4:00 م",
    location: "مركز الرياض للمؤتمرات",
    type: "عرض تقديمي",
    capacity: 50,
    registered: 32,
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    title: "ورشة عمل: استراتيجيات التسويق للشركات الناشئة",
    description: "تعلم أحدث استراتيجيات التسويق الرقمي لتنمية شركتك الناشئة",
    date: "20 مارس 2025",
    time: "1:00 م - 4:00 م",
    location: "عن بعد (أونلاين)",
    type: "ورشة عمل",
    capacity: 100,
    registered: 45,
    isRegistered: true,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 3,
    title: "لقاء التواصل الشهري للشركات الناشئة",
    description: "فرصة للتواصل مع رواد الأعمال الآخرين وتبادل الخبرات",
    date: "25 مارس 2025",
    time: "6:00 م - 9:00 م",
    location: "فندق الفيصلية، الرياض",
    type: "تواصل",
    capacity: 75,
    registered: 60,
    isRegistered: true,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
]

const pastEvents = [
  {
    id: 4,
    title: "ورشة عمل: أساسيات التمويل للشركات الناشئة",
    description: "فهم أساسيات التمويل وكيفية إدارة الموارد المالية لشركتك الناشئة",
    date: "10 فبراير 2025",
    time: "10:00 ص - 1:00 م",
    location: "مركز الابتكار، الرياض",
    type: "ورشة عمل",
    hasRecording: true,
    hasMaterials: true,
    attended: true,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 5,
    title: "مؤتمر التقنية السنوي",
    description: "مؤتمر يجمع خبراء التقنية والابتكار من جميع أنحاء المنطقة",
    date: "25 يناير 2025",
    time: "9:00 ص - 6:00 م",
    location: "مركز الملك عبدالله المالي، الرياض",
    type: "مؤتمر",
    hasRecording: true,
    hasMaterials: true,
    attended: true,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 6,
    title: "ورشة عمل: تطوير المنتج الأولي",
    description: "كيفية تطوير وإطلاق النسخة الأولية من منتجك بفعالية",
    date: "15 يناير 2025",
    time: "1:00 م - 4:00 م",
    location: "عن بعد (أونلاين)",
    type: "ورشة عمل",
    hasRecording: true,
    hasMaterials: true,
    attended: false,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
]

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventType, setSelectedEventType] = useState("all")

  const filteredUpcomingEvents = upcomingEvents.filter(event => {
    const matchesSearch = event.title.includes(searchQuery) || 
                          event.description.includes(searchQuery) ||
                          event.location.includes(searchQuery)
    
    const matchesType = selectedEventType === "all" || event.type === selectedEventType
    
    return matchesSearch && matchesType
  })

  const filteredPastEvents = pastEvents.filter(event => {
    const matchesSearch = event.title.includes(searchQuery) || 
                          event.description.includes(searchQuery) ||
                          event.location.includes(searchQuery)
    
    const matchesType = selectedEventType === "all" || event.type === selectedEventType
    
    return matchesSearch && matchesType
  })

  const handleRegister = (eventId: number) => {
    // In a real app, this would send a registration request to the server
    console.log(`Registering for event ${eventId}`)
  }

  const handleCancelRegistration = (eventId: number) => {
    // In a real app, this would send a cancellation request to the server
    console.log(`Cancelling registration for event ${eventId}`)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">الفعاليات والورش</h1>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن فعاليات..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>نوع الفعالية</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            {/* Dropdown would go here in a real implementation */}
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="past">الفعاليات السابقة</TabsTrigger>
          <TabsTrigger value="upcoming">الفعاليات القادمة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      {event.type}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span>{event.registered} / {event.capacity} مسجل</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {event.isRegistered ? (
                      <Button 
                        variant="outline" 
                        className="w-full text-red-500 border-red-500 hover:bg-red-50"
                        onClick={() => handleCancelRegistration(event.id)}
                      >
                        <XCircle className="h-4 w-4 ml-2" />
                        إلغاء التسجيل
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleRegister(event.id)}
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        التسجيل
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {filteredUpcomingEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد فعاليات قادمة تطابق معايير البحث</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover filter grayscale"
                    />
                    <div className="absolute top-2 left-2 bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                      {event.type}
                    </div>
                    {event.attended && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        حضرت
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {event.hasRecording && (
                      <Button variant="outline" className="flex-1">
                        <ExternalLink className="h-4 w-4 ml-2" />
                        التسجيل
                      </Button>
                    )}
                    {event.hasMaterials && (
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 ml-2" />
                        المواد
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {filteredPastEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد فعاليات سابقة تطابق معايير البحث</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>الفعاليات الموصى بها</CardTitle>
          <CardDescription>فعاليات قد تهمك بناءً على اهتماماتك ومجال عملك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                  alt="مؤتمر التقنية المالية" 
                  className="h-16 w-16 rounded object-cover"
                />
                <div>
                  <h3 className="font-bold">مؤتمر التقنية المالية 2025</h3>
                  <p className="text-sm text-muted-foreground">10-12 أبريل 2025 • مركز الملك عبدالله المالي</p>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 ml-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">+500 مشارك</span>
                  </div>
                </div>
              </div>
              <Button>التسجيل</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                  alt="ورشة عمل الذكاء الاصطناعي" 
                  className="h-16 w-16 rounded object-cover"
                />
                <div>
                  <h3 className="font-bold">ورشة عمل: تطبيقات الذكاء الاصطناعي في الأعمال</h3>
                  <p className="text-sm text-muted-foreground">5 أبريل 2025 • عن بعد (أونلاين)</p>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 ml-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">120 مشارك</span>
                  </div>
                </div>
              </div>
              <Button>التسجيل</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
