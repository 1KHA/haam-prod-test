"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  User, 
  Search, 
  Filter, 
  MessageSquare, 
  UserPlus,
  Mail,
  Calendar,
  Briefcase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Tag,
  MapPin,
  Star,
  Share2,
  Rocket,
  Phone,
  Globe
} from "lucide-react"

export default function NetworkPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("investors")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedInvestor, setExpandedInvestor] = useState<number | null>(null)

  const investors = [
    {
      id: 1,
      name: "سلطان الخالدي",
      avatar: "https://placehold.co/100x100/4F46E5/FFFFFF?text=SK",
      title: "شريك مؤسس",
      company: "صندوق الاستثمارات التقنية",
      location: "الرياض، المملكة العربية السعودية",
      expertise: ["التكنولوجيا المالية", "الذكاء الاصطناعي", "التجارة الإلكترونية"],
      bio: "مستثمر ذو خبرة 20 عاماً في مجال التكنولوجيا. استثمر في أكثر من 50 شركة ناشئة في المنطقة.",
      email: "sultan@example.com",
      phone: "+966 50 123 4567",
      website: "www.example.com",
      investments: 32,
      startups: 18,
      rating: 4.9,
      category: "vc"
    },
    {
      id: 2,
      name: "نورة العتيبي",
      avatar: "https://placehold.co/100x100/10B981/FFFFFF?text=NA",
      title: "مستثمر ملاك",
      company: "مستقل",
      location: "جدة، المملكة العربية السعودية",
      expertise: ["الصحة الرقمية", "التعليم التقني", "التكنولوجيا المالية"],
      bio: "مستثمرة ملاك متخصصة في قطاع الصحة الرقمية والتعليم التقني. تركز على الشركات الناشئة في مراحلها المبكرة.",
      email: "noura@example.com",
      phone: "+966 55 987 6543",
      website: "www.example.com",
      investments: 15,
      startups: 8,
      rating: 4.7,
      category: "angel"
    },
    {
      id: 3,
      name: "فهد المنصور",
      avatar: "https://placehold.co/100x100/F59E0B/FFFFFF?text=FM",
      title: "مدير استثمار",
      company: "شركة الاستثمارات الرقمية",
      location: "الدمام، المملكة العربية السعودية",
      expertise: ["البنية التحتية التقنية", "الأمن السيبراني", "الحوسبة السحابية"],
      bio: "مدير استثمار متخصص في قطاع التكنولوجيا. يركز على الشركات الناشئة في مجال البنية التحتية التقنية والأمن السيبراني.",
      email: "fahad@example.com",
      phone: "+966 54 567 8901",
      website: "www.example.com",
      investments: 22,
      startups: 12,
      rating: 4.8,
      category: "vc"
    },
    {
      id: 4,
      name: "سارة الدوسري",
      avatar: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=SD",
      title: "مديرة برنامج المنح",
      company: "مؤسسة دعم الابتكار",
      location: "الرياض، المملكة العربية السعودية",
      expertise: ["الاستدامة", "التأثير الاجتماعي", "التكنولوجيا الخضراء"],
      bio: "مديرة برنامج المنح في مؤسسة دعم الابتكار. تركز على دعم الشركات الناشئة ذات التأثير الاجتماعي والبيئي.",
      email: "sarah@example.com",
      phone: "+966 56 234 5678",
      website: "www.example.com",
      investments: 18,
      startups: 15,
      rating: 4.6,
      category: "grant"
    },
    {
      id: 5,
      name: "عبدالله العمري",
      avatar: "https://placehold.co/100x100/EC4899/FFFFFF?text=AA",
      title: "مدير صندوق",
      company: "صندوق الاستثمار الجريء",
      location: "جدة، المملكة العربية السعودية",
      expertise: ["التكنولوجيا المالية", "التجارة الإلكترونية", "الخدمات اللوجستية"],
      bio: "مدير صندوق استثماري متخصص في الشركات الناشئة في مراحل النمو. لديه خبرة في قطاعات التكنولوجيا المالية والتجارة الإلكترونية.",
      email: "abdullah@example.com",
      phone: "+966 59 876 5432",
      website: "www.example.com",
      investments: 28,
      startups: 14,
      rating: 4.5,
      category: "vc"
    }
  ]

  const events = [
    {
      id: 1,
      title: "ملتقى المستثمرين السنوي",
      description: "ملتقى سنوي يجمع المستثمرين ورواد الأعمال لمناقشة أحدث الاتجاهات والفرص الاستثمارية",
      date: "2025/04/15",
      time: "09:00 - 17:00",
      location: "فندق الفيصلية، الرياض",
      type: "conference",
      attendees: 150
    },
    {
      id: 2,
      title: "جلسة نقاش: مستقبل الاستثمار في التكنولوجيا المالية",
      description: "جلسة نقاش تفاعلية حول مستقبل الاستثمار في قطاع التكنولوجيا المالية في المنطقة",
      date: "2025/03/20",
      time: "14:00 - 16:00",
      location: "مركز الابتكار، الرياض",
      type: "panel",
      attendees: 45
    },
    {
      id: 3,
      title: "يوم العرض للشركات الناشئة",
      description: "فرصة للاطلاع على أحدث الشركات الناشئة الواعدة وفرص الاستثمار فيها",
      date: "2025/03/25",
      time: "10:00 - 15:00",
      location: "مركز الملك عبدالله المالي، الرياض",
      type: "demo_day",
      attendees: 80
    }
  ]

  const categories = [
    { id: "all", name: "جميع المستثمرين" },
    { id: "vc", name: "رأس المال الجريء" },
    { id: "angel", name: "مستثمرون ملائكة" },
    { id: "grant", name: "مؤسسات المنح" },
    { id: "corporate", name: "شركات استثمارية" }
  ]

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.includes(searchQuery) || 
                          investor.title.includes(searchQuery) ||
                          investor.company.includes(searchQuery) ||
                          investor.expertise.some(e => e.includes(searchQuery))
    
    const matchesCategory = activeCategory === "all" || investor.category === activeCategory
    
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
    if (expandedInvestor === id) {
      setExpandedInvestor(null)
    } else {
      setExpandedInvestor(id)
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
        <h1 className="text-3xl font-bold">شبكة المستثمرين</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{investors.length}</div>
            <p className="text-muted-foreground">المستثمرون</p>
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
            <Briefcase className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {investors.reduce((acc, curr) => acc + curr.investments, 0)}
            </div>
            <p className="text-muted-foreground">الاستثمارات</p>
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
            <CardTitle>شبكة المستثمرين</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="events">الفعاليات</TabsTrigger>
              <TabsTrigger value="investors">المستثمرون</TabsTrigger>
            </TabsList>
            
            <TabsContent value="investors" className="mt-0">
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
                {filteredInvestors.length > 0 ? (
                  filteredInvestors.map((investor) => (
                    <div key={investor.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className="p-4 border-b cursor-pointer"
                        onClick={() => toggleExpand(investor.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {renderStars(investor.rating)}
                                <span className="text-sm text-muted-foreground ml-1">({investor.rating})</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div>
                                  <h3 className="font-bold text-lg">{investor.name}</h3>
                                  <div className="text-sm text-muted-foreground">{investor.title} @ {investor.company}</div>
                                </div>
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                  <img 
                                    src={investor.avatar} 
                                    alt={`صورة ${investor.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end mb-2">
                              {investor.expertise.map((skill, index) => (
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
                                  <Briefcase className="h-4 w-4 text-blue-500" />
                                  <span>{investor.investments} استثمار</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Rocket className="h-4 w-4 text-purple-500" />
                                  <span>{investor.startups} شركة ناشئة</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-red-500" />
                                <span>{investor.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {expandedInvestor === investor.id && (
                        <div className="p-4 bg-muted/20">
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">نبذة</h4>
                            <p className="text-muted-foreground">{investor.bio}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{investor.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{investor.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span>{investor.website}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              <span>مراسلة</span>
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Share2 className="h-4 w-4" />
                              <span>مشاركة</span>
                            </Button>
                            <Button className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4" />
                              <span>إضافة للشبكة</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا يوجد مستثمرون</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على مستثمرين يطابقون معايير البحث</p>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 mx-auto"
                      onClick={() => {
                        setSearchQuery("")
                        setActiveCategory("all")
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span>عرض جميع المستثمرين</span>
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
                                {event.type === "conference" && "مؤتمر"}
                                {event.type === "panel" && "جلسة نقاش"}
                                {event.type === "demo_day" && "يوم عرض"}
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
                              <Calendar className="h-4 w-4" />
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
