"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Users, 
  User, 
  MessageSquare, 
  Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Share2,
  Mail,
  Phone,
  Globe,
  MapPin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Briefcase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Award,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BookOpen,
  Star,
  Plus,
  Rocket
} from "lucide-react"

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("mentors")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedMentor, setExpandedMentor] = useState<number | null>(null)

  const mentors = [
    {
      id: 1,
      name: "أحمد محمد",
      avatar: "https://placehold.co/100x100/4F46E5/FFFFFF?text=AM",
      title: "مستشار استراتيجي",
      company: "تك إنوفيشن",
      location: "الرياض، المملكة العربية السعودية",
      expertise: ["استراتيجية الأعمال", "التمويل", "التسويق"],
      bio: "خبرة أكثر من 15 عاماً في مجال ريادة الأعمال والاستشارات الاستراتيجية. ساعدت أكثر من 50 شركة ناشئة على النمو وجمع التمويل.",
      email: "ahmed@example.com",
      phone: "+966 50 123 4567",
      website: "www.example.com",
      sessions: 48,
      startups: 15,
      rating: 4.9,
      category: "strategy"
    },
    {
      id: 2,
      name: "سارة الخالدي",
      avatar: "https://placehold.co/100x100/10B981/FFFFFF?text=SK",
      title: "خبيرة تسويق رقمي",
      company: "ديجيتال ماركتينج",
      location: "جدة، المملكة العربية السعودية",
      expertise: ["التسويق الرقمي", "وسائل التواصل الاجتماعي", "تحليلات البيانات"],
      bio: "متخصصة في التسويق الرقمي مع خبرة 10 سنوات في مساعدة الشركات الناشئة على بناء وجودها الرقمي وتنمية قاعدة عملائها.",
      email: "sarah@example.com",
      phone: "+966 55 987 6543",
      website: "www.example.com",
      sessions: 36,
      startups: 12,
      rating: 4.7,
      category: "marketing"
    },
    {
      id: 3,
      name: "محمد العمري",
      avatar: "https://placehold.co/100x100/F59E0B/FFFFFF?text=MA",
      title: "مطور تقني",
      company: "تك سوليوشنز",
      location: "الدمام، المملكة العربية السعودية",
      expertise: ["تطوير البرمجيات", "الذكاء الاصطناعي", "تجربة المستخدم"],
      bio: "مطور تقني ومؤسس شركات ناشئة مع خبرة في بناء منتجات تقنية مبتكرة. متخصص في تطوير البرمجيات والذكاء الاصطناعي.",
      email: "mohammed@example.com",
      phone: "+966 54 567 8901",
      website: "www.example.com",
      sessions: 28,
      startups: 8,
      rating: 4.8,
      category: "technology"
    },
    {
      id: 4,
      name: "نورة العتيبي",
      avatar: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=NA",
      title: "مستشارة مالية",
      company: "فينانشال إكسبرتس",
      location: "الرياض، المملكة العربية السعودية",
      expertise: ["التمويل", "الاستثمار", "إدارة المخاطر"],
      bio: "مستشارة مالية مع خبرة في مساعدة الشركات الناشئة على إدارة مواردها المالية وجذب الاستثمارات. حاصلة على شهادة CFA.",
      email: "noura@example.com",
      phone: "+966 56 234 5678",
      website: "www.example.com",
      sessions: 32,
      startups: 10,
      rating: 4.6,
      category: "finance"
    },
    {
      id: 5,
      name: "فهد الدوسري",
      avatar: "https://placehold.co/100x100/EC4899/FFFFFF?text=FD",
      title: "خبير إدارة المنتجات",
      company: "برودكت لاب",
      location: "جدة، المملكة العربية السعودية",
      expertise: ["إدارة المنتجات", "تطوير الأعمال", "تجربة المستخدم"],
      bio: "خبير في إدارة المنتجات مع خبرة في قيادة فرق المنتجات في شركات تقنية كبرى. متخصص في بناء منتجات تركز على المستخدم.",
      email: "fahad@example.com",
      phone: "+966 59 876 5432",
      website: "www.example.com",
      sessions: 24,
      startups: 7,
      rating: 4.5,
      category: "product"
    }
  ]

  const events = [
    {
      id: 1,
      title: "لقاء الموجهين الشهري",
      description: "لقاء شهري للموجهين لتبادل الخبرات والتجارب ومناقشة التحديات",
      date: "2025/03/15",
      time: "18:00 - 20:00",
      location: "مركز الابتكار، الرياض",
      type: "networking",
      attendees: 25
    },
    {
      id: 2,
      title: "ورشة عمل: استراتيجيات الإرشاد الفعال",
      description: "ورشة عمل تفاعلية حول أفضل الممارسات والاستراتيجيات للإرشاد الفعال",
      date: "2025/03/20",
      time: "14:00 - 17:00",
      location: "فندق الفيصلية، الرياض",
      type: "workshop",
      attendees: 18
    },
    {
      id: 3,
      title: "مؤتمر الابتكار وريادة الأعمال",
      description: "مؤتمر سنوي يجمع الموجهين والمستثمرين ورواد الأعمال لمناقشة أحدث الاتجاهات والفرص",
      date: "2025/04/10",
      time: "09:00 - 18:00",
      location: "مركز الملك عبدالله المالي، الرياض",
      type: "conference",
      attendees: 150
    }
  ]

  const categories = [
    { id: "all", name: "جميع المجالات" },
    { id: "strategy", name: "استراتيجية الأعمال" },
    { id: "marketing", name: "التسويق" },
    { id: "technology", name: "التكنولوجيا" },
    { id: "finance", name: "التمويل" },
    { id: "product", name: "إدارة المنتجات" }
  ]

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.includes(searchQuery) || 
                          mentor.title.includes(searchQuery) ||
                          mentor.expertise.some(e => e.includes(searchQuery))
    
    const matchesCategory = activeCategory === "all" || mentor.category === activeCategory
    
    return matchesSearch && matchesCategory
  })

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.includes(searchQuery) || 
                          event.description.includes(searchQuery)
    
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const toggleExpand = (id: number) => {
    if (expandedMentor === id) {
      setExpandedMentor(null)
    } else {
      setExpandedMentor(id)
    }
  }

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
      />
    ))
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">مجتمع الموجهين</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{mentors.length}</div>
            <p className="text-muted-foreground">الموجهون</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-muted-foreground">الفعاليات القادمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground">المناقشات النشطة</p>
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
            <CardTitle>مجتمع الموجهين</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="events">الفعاليات</TabsTrigger>
              <TabsTrigger value="mentors">الموجهون</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mentors" className="mt-0">
              <div className="flex justify-end gap-2 mb-4">
                {categories.map(category => (
                  <Button 
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-4">
                {filteredMentors.length > 0 ? (
                  filteredMentors.map((mentor) => (
                    <div key={mentor.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className="p-4 border-b cursor-pointer"
                        onClick={() => toggleExpand(mentor.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {renderStars(mentor.rating)}
                                <span className="text-sm text-muted-foreground ml-1">({mentor.rating})</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div>
                                  <h3 className="font-bold text-lg">{mentor.name}</h3>
                                  <div className="text-sm text-muted-foreground">{mentor.title} @ {mentor.company}</div>
                                </div>
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                  <img 
                                    src={mentor.avatar} 
                                    alt={`صورة ${mentor.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end mb-2">
                              {mentor.expertise.map((skill, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-1 bg-muted text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span>{mentor.sessions} جلسة</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Rocket className="h-4 w-4 text-purple-500" />
                                  <span>{mentor.startups} شركة ناشئة</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-red-500" />
                                <span>{mentor.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {expandedMentor === mentor.id && (
                        <div className="p-4 bg-muted/20">
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">نبذة</h4>
                            <p className="text-muted-foreground">{mentor.bio}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{mentor.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{mentor.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span>{mentor.website}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              <span>مراسلة</span>
                            </Button>
                            <Button className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>طلب جلسة</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا يوجد موجهون</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على موجهين يطابقون معايير البحث</p>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 mx-auto"
                      onClick={() => {
                        setSearchQuery("")
                        setActiveCategory("all")
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span>عرض جميع الموجهين</span>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="mt-0">
              <div className="space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {event.type === "networking" && "لقاء تواصل"}
                                {event.type === "workshop" && "ورشة عمل"}
                                {event.type === "conference" && "مؤتمر"}
                              </div>
                              <h3 className="font-bold text-lg">{event.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">{event.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">التاريخ</div>
                                <div>{formatDate(event.date)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">الوقت</div>
                                <div>{event.time}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">المكان</div>
                                <div>{event.location}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="text-sm font-medium">{event.attendees} مشارك</div>
                            <Button className="flex items-center gap-1">
                              <Plus className="h-4 w-4" />
                              <span>تسجيل</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد فعاليات</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على فعاليات تطابق معايير البحث</p>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 mx-auto"
                      onClick={() => {
                        setSearchQuery("")
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span>عرض جميع الفعاليات</span>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
