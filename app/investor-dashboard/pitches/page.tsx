"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Video, 
  Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  MapPin,
  Users,
  Play,
  MessageSquare,
  FileText,
  CheckCircle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  UserPlus
} from "lucide-react"

export default function PitchesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedPitch, setExpandedPitch] = useState<number | null>(null)

  const pitches = [
    {
      id: 1,
      startupName: "تك سمارت",
      logo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      industry: "التكنولوجيا المالية",
      date: "2025/03/25",
      time: "14:00 - 15:00",
      location: "قاعة الاجتماعات الرئيسية، مركز الابتكار، الرياض",
      type: "عرض تقديمي مباشر",
      description: "عرض تقديمي لمنصة تكنولوجيا مالية تقدم حلول مدفوعات رقمية للشركات الصغيرة والمتوسطة.",
      attendees: 15,
      status: "upcoming",
      videoUrl: null,
      presenters: [
        { name: "أحمد الشمري", position: "المؤسس والرئيس التنفيذي" },
        { name: "سارة العتيبي", position: "المدير التقني" }
      ],
      feedback: [],
      meetingRequested: false
    },
    {
      id: 2,
      startupName: "هيلث تك",
      logo: "https://placehold.co/100x100/10B981/FFFFFF?text=HT",
      industry: "التكنولوجيا الصحية",
      date: "2025/03/20",
      time: "11:00 - 12:00",
      location: "قاعة الاجتماعات B، مركز الابتكار، جدة",
      type: "عرض تقديمي مباشر",
      description: "عرض تقديمي لمنصة رعاية صحية رقمية تربط المرضى بالأطباء وتقدم خدمات استشارات طبية عن بعد.",
      attendees: 12,
      status: "upcoming",
      videoUrl: null,
      presenters: [
        { name: "فيصل الغامدي", position: "المؤسس والرئيس التنفيذي" },
        { name: "ليلى المالكي", position: "المديرة الطبية" }
      ],
      feedback: [],
      meetingRequested: true
    },
    {
      id: 3,
      startupName: "إيكو سمارت",
      logo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=ES",
      industry: "التكنولوجيا الخضراء",
      date: "2025/02/15",
      time: "13:30 - 14:30",
      location: "قاعة الاجتماعات الرئيسية، مركز الابتكار، الرياض",
      type: "عرض تقديمي مسجل",
      description: "عرض تقديمي لشركة تطور حلول تكنولوجية مستدامة لإدارة الطاقة في المباني التجارية والسكنية.",
      attendees: 20,
      status: "past",
      videoUrl: "https://example.com/video/eco-smart-pitch",
      presenters: [
        { name: "عبدالله الحربي", position: "المؤسس والرئيس التنفيذي" },
        { name: "مها السليم", position: "المديرة الهندسية" }
      ],
      feedback: [
        { investor: "محمد العبدالله", rating: 4.5, comment: "فكرة مبتكرة مع فريق قوي. أرى إمكانية كبيرة للنمو في السوق المحلي والإقليمي." },
        { investor: "سارة الدوسري", rating: 4.2, comment: "نموذج أعمال واعد، لكن يحتاج إلى مزيد من التفاصيل حول استراتيجية التوسع." }
      ],
      meetingRequested: true
    },
    {
      id: 4,
      startupName: "ديليفر ناو",
      logo: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=DN",
      industry: "التجارة الإلكترونية",
      date: "2025/02/10",
      time: "10:00 - 11:00",
      location: "قاعة الاجتماعات C، مركز الابتكار، الرياض",
      type: "عرض تقديمي مسجل",
      description: "عرض تقديمي لمنصة توصيل طلبات للمتاجر المحلية والمطاعم مع خدمة توصيل سريعة في أقل من 30 دقيقة.",
      attendees: 18,
      status: "past",
      videoUrl: "https://example.com/video/deliver-now-pitch",
      presenters: [
        { name: "خالد العنزي", position: "المؤسس والرئيس التنفيذي" },
        { name: "نورة الشمري", position: "مديرة العمليات" }
      ],
      feedback: [
        { investor: "محمد العبدالله", rating: 3.8, comment: "سوق تنافسي للغاية، لكن الفريق لديه خبرة جيدة. أحتاج إلى مزيد من المعلومات حول استراتيجية التمايز." }
      ],
      meetingRequested: false
    },
    {
      id: 5,
      startupName: "إيدو تك",
      logo: "https://placehold.co/100x100/EC4899/FFFFFF?text=ET",
      industry: "التعليم التقني",
      date: "2025/04/05",
      time: "15:30 - 16:30",
      location: "عبر الإنترنت (Zoom)",
      type: "عرض تقديمي افتراضي",
      description: "عرض تقديمي لمنصة تعليمية تفاعلية تقدم دورات في البرمجة والذكاء الاصطناعي للطلاب والمهنيين.",
      attendees: 25,
      status: "upcoming",
      videoUrl: null,
      presenters: [
        { name: "سلمان الدوسري", position: "المؤسس والرئيس التنفيذي" },
        { name: "هند العتيبي", position: "مديرة المحتوى التعليمي" }
      ],
      feedback: [],
      meetingRequested: false
    }
  ]

  const categories = [
    { id: "all", name: "جميع القطاعات" },
    { id: "fintech", name: "التكنولوجيا المالية" },
    { id: "healthtech", name: "التكنولوجيا الصحية" },
    { id: "greentech", name: "التكنولوجيا الخضراء" },
    { id: "ecommerce", name: "التجارة الإلكترونية" },
    { id: "edutech", name: "التعليم التقني" }
  ]

  const filteredPitches = pitches.filter(pitch => {
    const matchesSearch = pitch.startupName.includes(searchQuery) || 
                          pitch.industry.includes(searchQuery) ||
                          pitch.description.includes(searchQuery)
    
    const matchesCategory = activeCategory === "all" || 
                           (activeCategory === "fintech" && pitch.industry === "التكنولوجيا المالية") ||
                           (activeCategory === "healthtech" && pitch.industry === "التكنولوجيا الصحية") ||
                           (activeCategory === "greentech" && pitch.industry === "التكنولوجيا الخضراء") ||
                           (activeCategory === "ecommerce" && pitch.industry === "التجارة الإلكترونية") ||
                           (activeCategory === "edutech" && pitch.industry === "التعليم التقني")
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "upcoming" && pitch.status === "upcoming") ||
                      (activeTab === "past" && pitch.status === "past")
    
    return matchesSearch && matchesCategory && matchesTab
  })

  const toggleExpandPitch = (id: number) => {
    if (expandedPitch === id) {
      setExpandedPitch(null)
    } else {
      setExpandedPitch(id)
    }
  }

  const toggleMeetingRequest = (id: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedPitches = pitches.map(pitch => {
      if (pitch.id === id) {
        return { ...pitch, meetingRequested: !pitch.meetingRequested }
      }
      return pitch
    })
    // In a real app, you would update the state with the updated pitches
    // For this demo, we'll just toggle the UI state
    const pitch = pitches.find(p => p.id === id)
    if (pitch) {
      pitch.meetingRequested = !pitch.meetingRequested
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">العروض والاجتماعات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Video className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">
              {pitches.filter(pitch => pitch.status === "upcoming").length}
            </div>
            <p className="text-muted-foreground">العروض القادمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {pitches.filter(pitch => pitch.meetingRequested).length}
            </div>
            <p className="text-muted-foreground">طلبات الاجتماع</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <FileText className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {pitches.filter(pitch => pitch.status === "past").length}
            </div>
            <p className="text-muted-foreground">العروض السابقة</p>
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
            <CardTitle>العروض التقديمية</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="past">العروض السابقة</TabsTrigger>
              <TabsTrigger value="upcoming">العروض القادمة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
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
              {filteredPitches.length > 0 ? (
                filteredPitches.map((pitch) => (
                  <Card key={pitch.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => toggleExpandPitch(pitch.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs ${
                                  pitch.status === "upcoming" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {pitch.status === "upcoming" ? "قادم" : "سابق"}
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                  {pitch.industry}
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  {pitch.type}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div>
                                  <h3 className="font-bold text-lg">{pitch.startupName}</h3>
                                  <div className="text-sm text-muted-foreground">{formatDate(pitch.date)} • {pitch.time}</div>
                                </div>
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                  <img 
                                    src={pitch.logo} 
                                    alt={`شعار ${pitch.startupName}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-4">{pitch.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">{pitch.attendees} مشارك</span>
                                </div>
                                {pitch.status === "past" && pitch.videoUrl && (
                                  <div className="flex items-center gap-1">
                                    <Play className="h-4 w-4 text-red-500" />
                                    <span className="text-sm">متاح للمشاهدة</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-red-500" />
                                <span className="text-sm">{pitch.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {expandedPitch === pitch.id && (
                        <div className="border-t p-4 bg-muted/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">المقدمون</h4>
                              <div className="space-y-2">
                                {pitch.presenters.map((presenter, index) => (
                                  <div key={index} className="flex items-center justify-end gap-3 border-b pb-2">
                                    <div>
                                      <div className="font-medium">{presenter.name}</div>
                                      <div className="text-sm text-muted-foreground">{presenter.position}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                      <Users className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {pitch.status === "past" && pitch.feedback.length > 0 && (
                                <>
                                  <h4 className="font-medium mt-6 mb-3">التقييمات والملاحظات</h4>
                                  <div className="space-y-4">
                                    {pitch.feedback.map((feedback, index) => (
                                      <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-1">
                                            {renderStars(feedback.rating)}
                                            <span className="text-sm text-muted-foreground ml-1">({feedback.rating})</span>
                                          </div>
                                          <div className="font-medium">{feedback.investor}</div>
                                        </div>
                                        <p className="text-muted-foreground text-right">{feedback.comment}</p>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div>
                              {pitch.status === "past" && pitch.videoUrl && (
                                <div className="mb-6">
                                  <h4 className="font-medium mb-3">تسجيل العرض التقديمي</h4>
                                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Button variant="outline" size="icon" className="rounded-full bg-white/20 backdrop-blur-sm">
                                        <Play className="h-8 w-8 text-white" />
                                      </Button>
                                    </div>
                                    <div className="absolute bottom-4 right-4 text-white text-sm">
                                      {pitch.startupName} - {formatDate(pitch.date)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {pitch.status === "upcoming" && (
                                <div className="mb-6">
                                  <h4 className="font-medium mb-3">تفاصيل الحضور</h4>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                      <div className="text-sm">
                                        {pitch.type === "عرض تقديمي افتراضي" ? "رابط الاجتماع سيتم إرساله قبل الموعد بـ 24 ساعة" : "التسجيل مفتوح حتى يوم العرض"}
                                      </div>
                                      <div className="font-medium">حالة التسجيل</div>
                                    </div>
                                    <div className="flex items-center justify-between border-b pb-2">
                                      <div className="text-sm">{pitch.attendees} مشارك</div>
                                      <div className="font-medium">عدد الحضور المتوقع</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm">{pitch.location}</div>
                                      <div className="font-medium">المكان</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-medium mb-3">الإجراءات</h4>
                                <div className="space-y-3">
                                  {pitch.status === "upcoming" && (
                                    <Button className="w-full flex items-center justify-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      <span>تسجيل الحضور</span>
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant={pitch.meetingRequested ? "default" : "outline"} 
                                    className="w-full flex items-center justify-center gap-2"
                                    onClick={() => toggleMeetingRequest(pitch.id)}
                                  >
                                    {pitch.meetingRequested ? (
                                      <>
                                        <CheckCircle className="h-4 w-4" />
                                        <span>تم طلب اجتماع</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="h-4 w-4" />
                                        <span>طلب اجتماع مع الفريق</span>
                                      </>
                                    )}
                                  </Button>
                                  
                                  {pitch.status === "past" && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <Button variant="outline" className="flex items-center justify-center gap-2">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>إعجاب</span>
                                      </Button>
                                      <Button variant="outline" className="flex items-center justify-center gap-2">
                                        <ThumbsDown className="h-4 w-4" />
                                        <span>عدم إعجاب</span>
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {pitch.status === "past" && (
                                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                      <MessageSquare className="h-4 w-4" />
                                      <span>إضافة تعليق</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد عروض تقديمية</h3>
                  <p className="text-muted-foreground mb-4">لم يتم العثور على عروض تقديمية تطابق معايير البحث</p>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 mx-auto"
                    onClick={() => {
                      setSearchQuery("")
                      setActiveCategory("all")
                      setActiveTab("all")
                    }}
                  >
                    <Search className="h-4 w-4" />
                    <span>عرض جميع العروض التقديمية</span>
                  </Button>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
