"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  FileText,
  Video,
  ExternalLink,
  Check,
  X,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const sessions = [
    {
      id: 1,
      startupName: "تك سوليوشنز",
      startupLogo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      date: "2025/03/15",
      startTime: "10:00",
      endTime: "11:00",
      type: "فردية",
      format: "عن بعد",
      topic: "مراجعة خطة التسويق",
      status: "confirmed",
      notes: "التركيز على استراتيجيات التسويق الرقمي واكتساب العملاء",
      preparation: [
        "مراجعة خطة التسويق الحالية",
        "تحضير أسئلة حول استراتيجيات اكتساب العملاء",
        "تحليل أداء حملات التسويق السابقة"
      ],
      team: [
        { name: "محمد العمري", role: "المؤسس والرئيس التنفيذي" },
        { name: "سارة الخالدي", role: "مدير المنتج" }
      ]
    },
    {
      id: 2,
      startupName: "هيلث تك",
      startupLogo: "https://placehold.co/100x100/10B981/FFFFFF?text=HT",
      date: "2025/03/18",
      startTime: "14:00",
      endTime: "15:00",
      type: "فردية",
      format: "حضوري",
      topic: "استراتيجية جمع التمويل",
      status: "pending",
      notes: "مناقشة خطة جمع التمويل وإعداد العرض التقديمي للمستثمرين",
      preparation: [
        "مراجعة خطة العمل",
        "تحضير نموذج مالي محدث",
        "تحديد المستثمرين المحتملين"
      ],
      team: [
        { name: "خالد السعيد", role: "المؤسس والرئيس التنفيذي" },
        { name: "نورة العتيبي", role: "مدير التسويق" }
      ]
    },
    {
      id: 3,
      startupName: "فينتك",
      startupLogo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=FT",
      date: "2025/03/22",
      startTime: "09:00",
      endTime: "10:00",
      type: "فردية",
      format: "عن بعد",
      topic: "تطوير المنتج",
      status: "confirmed",
      notes: "مناقشة خارطة طريق المنتج والميزات القادمة",
      preparation: [
        "مراجعة خارطة طريق المنتج الحالية",
        "تحضير ملاحظات حول تحسينات المنتج",
        "تحليل ملاحظات المستخدمين"
      ],
      team: [
        { name: "عبدالله المالكي", role: "المؤسس والرئيس التنفيذي" },
        { name: "سلطان العنزي", role: "مدير التقنية" }
      ]
    },
    {
      id: 4,
      startupName: "تك سوليوشنز",
      startupLogo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      date: "2025/03/29",
      startTime: "11:00",
      endTime: "12:00",
      type: "فردية",
      format: "عن بعد",
      topic: "استراتيجية النمو",
      status: "confirmed",
      notes: "مناقشة خطط التوسع وزيادة قاعدة المستخدمين",
      preparation: [
        "تحليل معدلات النمو الحالية",
        "تحضير استراتيجيات النمو المقترحة",
        "دراسة أسواق جديدة محتملة"
      ],
      team: [
        { name: "محمد العمري", role: "المؤسس والرئيس التنفيذي" },
        { name: "سارة الخالدي", role: "مدير المنتج" }
      ]
    },
    {
      id: 5,
      startupName: "هيلث تك",
      startupLogo: "https://placehold.co/100x100/10B981/FFFFFF?text=HT",
      date: "2025/02/25",
      startTime: "13:00",
      endTime: "14:00",
      type: "فردية",
      format: "حضوري",
      topic: "تطوير النموذج الأولي",
      status: "completed",
      feedback: {
        strengths: "فريق متحمس ولديه فهم جيد للسوق المستهدف. النموذج الأولي يعالج مشكلة حقيقية في السوق.",
        improvements: "يحتاج إلى تحسين تجربة المستخدم وتبسيط عملية التسجيل. ينبغي التركيز أكثر على ميزات الأمان وحماية البيانات.",
        nextSteps: "تحسين النموذج الأولي بناءً على الملاحظات، وإجراء اختبارات مع مجموعة صغيرة من المستخدمين."
      },
      notes: "مراجعة النموذج الأولي وتقديم ملاحظات للتحسين",
      preparation: [],
      team: [
        { name: "خالد السعيد", role: "المؤسس والرئيس التنفيذي" },
        { name: "فهد الدوسري", role: "مطور تطبيقات" }
      ]
    },
    {
      id: 6,
      startupName: "فينتك",
      startupLogo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=FT",
      date: "2025/03/01",
      startTime: "10:00",
      endTime: "11:00",
      type: "فردية",
      format: "عن بعد",
      topic: "استراتيجية التسعير",
      status: "completed",
      feedback: {
        strengths: "نموذج تسعير مرن يناسب مختلف شرائح العملاء. فهم جيد لديناميكيات السوق والمنافسين.",
        improvements: "ينبغي تبسيط هيكل التسعير ليكون أكثر وضوحاً للعملاء. النظر في إضافة خطة مجانية محدودة لجذب المزيد من المستخدمين.",
        nextSteps: "إعادة صياغة استراتيجية التسعير، وإجراء اختبارات A/B لمختلف نماذج التسعير."
      },
      notes: "مناقشة استراتيجية التسعير وتحليل المنافسين",
      preparation: [],
      team: [
        { name: "عبدالله المالكي", role: "المؤسس والرئيس التنفيذي" },
        { name: "ريم القحطاني", role: "مدير العمليات" }
      ]
    }
  ]

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.startupName.includes(searchQuery) || 
                          session.topic.includes(searchQuery) ||
                          (session.notes && session.notes.includes(searchQuery))
    
    const sessionDate = new Date(session.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (activeTab === "upcoming") {
      return matchesSearch && sessionDate >= today && (session.status === "confirmed" || session.status === "pending")
    }
    if (activeTab === "completed") {
      return matchesSearch && session.status === "completed"
    }
    if (activeTab === "pending") {
      return matchesSearch && session.status === "pending"
    }
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "مؤكدة"
      case "pending": return "بانتظار التأكيد"
      case "completed": return "مكتملة"
      case "cancelled": return "ملغية"
      default: return "غير معروف"
    }
  }
  
  const getFormatIcon = (format: string) => {
    return format === "عن بعد" ? <Video className="h-4 w-4 text-blue-500" /> : <Users className="h-4 w-4 text-green-500" />
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Calendar functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }
  
  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border bg-gray-50"></div>)
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`
      
      // Find sessions for this day
      const daySessions = sessions.filter(session => session.date === dateString)
      
      days.push(
        <div key={day} className="h-24 border p-1 relative">
          <div className="text-xs font-medium mb-1">{day}</div>
          <div className="space-y-1">
            {daySessions.map((session, index) => (
              <div 
                key={index} 
                className={`text-xs p-1 rounded truncate ${getStatusColor(session.status)}`}
                title={`${session.startupName} - ${session.topic}`}
              >
                {session.startTime} - {session.startupName}
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    return days
  }
  
  const monthNames = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ]
  
  const nextMonth = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    setCurrentMonth(next)
  }
  
  const prevMonth = () => {
    const prev = new Date(currentMonth)
    prev.setMonth(prev.getMonth() - 1)
    setCurrentMonth(prev)
  }

  const upcomingCount = sessions.filter(s => {
    const sessionDate = new Date(s.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return sessionDate >= today && (s.status === "confirmed" || s.status === "pending")
  }).length
  
  const pendingCount = sessions.filter(s => s.status === "pending").length
  const completedCount = sessions.filter(s => s.status === "completed").length

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إنشاء جلسة جديدة</span>
        </Button>
        <h1 className="text-3xl font-bold">جلسات الإرشاد</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-muted-foreground">الجلسات القادمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-muted-foreground">بانتظار التأكيد</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Check className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-muted-foreground">الجلسات المكتملة</p>
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
            <CardTitle>جلسات الإرشاد</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="calendar">التقويم</TabsTrigger>
              <TabsTrigger value="completed">مكتملة</TabsTrigger>
              <TabsTrigger value="pending">بانتظار التأكيد</TabsTrigger>
              <TabsTrigger value="upcoming">قادمة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-medium text-lg">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
              </div>
              
              <div className="grid grid-cols-7 text-center">
                <div className="font-medium text-sm py-2">الأحد</div>
                <div className="font-medium text-sm py-2">الإثنين</div>
                <div className="font-medium text-sm py-2">الثلاثاء</div>
                <div className="font-medium text-sm py-2">الأربعاء</div>
                <div className="font-medium text-sm py-2">الخميس</div>
                <div className="font-medium text-sm py-2">الجمعة</div>
                <div className="font-medium text-sm py-2">السبت</div>
                
                {renderCalendar()}
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming">
              <div className="space-y-4">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </div>
                          <div className="flex items-center gap-4">
                            <h3 className="font-bold text-lg">{session.startupName}</h3>
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src={session.startupLogo} 
                                alt={`شعار ${session.startupName}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">التاريخ</div>
                            <div className="font-medium">{formatDate(session.date)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">الوقت</div>
                            <div className="font-medium">{session.startTime} - {session.endTime}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">الموضوع</div>
                            <div className="font-medium">{session.topic}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">النوع</div>
                            <div className="flex items-center gap-1">
                              {getFormatIcon(session.format)}
                              <span className="font-medium">{session.format}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground">ملاحظات</div>
                          <p className="text-muted-foreground">{session.notes}</p>
                        </div>
                        
                        {session.preparation && session.preparation.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm text-muted-foreground mb-2">التحضير المطلوب</div>
                            <ul className="list-disc list-inside space-y-1">
                              {session.preparation.map((item, index) => (
                                <li key={index} className="text-sm text-muted-foreground">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground mb-2">المشاركون</div>
                          <div className="space-y-2">
                            {session.team.map((member, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">{member.role}</div>
                                <div className="font-medium">{member.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-4">
                          {session.status === "pending" && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <X className="h-4 w-4" />
                                <span>رفض</span>
                              </Button>
                              <Button variant="default" size="sm" className="flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                <span>قبول</span>
                              </Button>
                            </div>
                          )}
                          
                          {session.status === "confirmed" && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <RefreshCw className="h-4 w-4" />
                                <span>إعادة جدولة</span>
                              </Button>
                              <Button variant="default" size="sm" className="flex items-center gap-1">
                                <Video className="h-4 w-4" />
                                <span>بدء الجلسة</span>
                              </Button>
                            </div>
                          )}
                          
                          {session.status !== "pending" && session.status !== "confirmed" && (
                            <div></div>
                          )}
                          
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <ExternalLink className="h-4 w-4" />
                            <span>عرض التفاصيل</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد جلسات</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على جلسات تطابق معايير البحث</p>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 mx-auto"
                      onClick={() => {
                        setSearchQuery("")
                        setActiveTab("upcoming")
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span>عرض جميع الجلسات</span>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="space-y-4">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </div>
                          <div className="flex items-center gap-4">
                            <h3 className="font-bold text-lg">{session.startupName}</h3>
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src={session.startupLogo} 
                                alt={`شعار ${session.startupName}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">التاريخ</div>
                            <div className="font-medium">{formatDate(session.date)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">الوقت</div>
                            <div className="font-medium">{session.startTime} - {session.endTime}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">الموضوع</div>
                            <div className="font-medium">{session.topic}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">النوع</div>
                            <div className="flex items-center gap-1">
                              {getFormatIcon(session.format)}
                              <span className="font-medium">{session.format}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground">ملاحظات</div>
                          <p className="text-muted-foreground">{session.notes}</p>
                        </div>
                        
                        <div className="flex justify-between mt-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <X className="h-4 w-4" />
                              <span>رفض</span>
                            </Button>
                            <Button variant="default" size="sm" className="flex items-center gap-1">
                              <Check className="h-4 w-4" />
                              <span>قبول</span>
                            </Button>
                          </div>
                          
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <ExternalLink className="h-4 w-4" />
                            <span>عرض التفاصيل</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد جلسات بانتظار التأكيد</h3>
                    <p className="text-muted-foreground mb-4">ليس لديك أي طلبات جلسات بانتظار التأكيد</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="space-y-4">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </div>
                          <div className="flex items-center gap-4">
                            <h3 className="font-bold text-lg">{session.startupName}</h3>
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src={session.startupLogo} 
                                alt={`شعار ${session.startupName}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div
