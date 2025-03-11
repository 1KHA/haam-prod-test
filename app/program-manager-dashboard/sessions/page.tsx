"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Handshake, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  FileText,
  Users,
  Award,
  Plus,
  MessageSquare,
  Star
} from "lucide-react"

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")

  const sessions = [
    {
      id: 1,
      startupName: "تك سوليوشنز",
      mentorName: "د. سارة الأحمد",
      mentorExpertise: "تقنية مالية",
      sessionType: "فردية",
      date: "2025/03/15",
      time: "10:00 ص",
      duration: "60 دقيقة",
      status: "scheduled",
      topic: "استراتيجية التسويق",
      location: "عن بعد (زوم)",
      feedback: null
    },
    {
      id: 2,
      startupName: "هيلث تك",
      mentorName: "د. خالد العمري",
      mentorExpertise: "تقنيات صحية",
      sessionType: "فردية",
      date: "2025/03/16",
      time: "11:30 ص",
      duration: "60 دقيقة",
      status: "scheduled",
      topic: "تطوير المنتج",
      location: "عن بعد (زوم)",
      feedback: null
    },
    {
      id: 3,
      startupName: "جميع الشركات",
      mentorName: "أ. محمد السالم",
      mentorExpertise: "تسويق رقمي",
      sessionType: "جماعية",
      date: "2025/03/17",
      time: "2:00 م",
      duration: "90 دقيقة",
      status: "scheduled",
      topic: "استراتيجيات التسويق الرقمي",
      location: "قاعة الاجتماعات الرئيسية",
      feedback: null
    },
    {
      id: 4,
      startupName: "باي تك",
      mentorName: "م. فهد العتيبي",
      mentorExpertise: "تقنية مالية",
      sessionType: "فردية",
      date: "2025/03/10",
      time: "9:00 ص",
      duration: "60 دقيقة",
      status: "completed",
      topic: "تطوير نموذج العمل",
      location: "عن بعد (زوم)",
      feedback: {
        mentorRating: 4.8,
        startupRating: 4.5,
        mentorFeedback: "الشركة لديها فريق متميز وفكرة واعدة، لكن تحتاج إلى تحسين نموذج العمل",
        startupFeedback: "استفدنا كثيراً من خبرة المرشد في مجال التقنية المالية"
      }
    },
    {
      id: 5,
      startupName: "ميديكال إيه آي",
      mentorName: "د. خالد العمري",
      mentorExpertise: "تقنيات صحية",
      sessionType: "فردية",
      date: "2025/03/11",
      time: "1:00 م",
      duration: "60 دقيقة",
      status: "completed",
      topic: "تطبيقات الذكاء الاصطناعي في الرعاية الصحية",
      location: "عن بعد (زوم)",
      feedback: {
        mentorRating: 4.9,
        startupRating: 4.7,
        mentorFeedback: "الشركة تعمل على تقنية مبتكرة، وأنصح بالتركيز على اختبارات المستخدمين",
        startupFeedback: "جلسة مفيدة جداً، حصلنا على رؤى قيمة من خبير في المجال"
      }
    },
    {
      id: 6,
      startupName: "جميع الشركات",
      mentorName: "أ. نورة الغامدي",
      mentorExpertise: "تمويل واستثمار",
      sessionType: "جماعية",
      date: "2025/03/12",
      time: "11:00 ص",
      duration: "90 دقيقة",
      status: "completed",
      topic: "كيفية جذب المستثمرين",
      location: "قاعة الاجتماعات الرئيسية",
      feedback: {
        mentorRating: 4.7,
        startupRating: 4.6,
        mentorFeedback: "الشركات متحمسة ولديها أفكار جيدة، لكن تحتاج إلى تحسين عروضها التقديمية",
        startupFeedback: "ورشة عمل مفيدة جداً، تعلمنا الكثير عن كيفية التواصل مع المستثمرين"
      }
    },
    {
      id: 7,
      startupName: "فينتك",
      mentorName: "د. سارة الأحمد",
      mentorExpertise: "تقنية مالية",
      sessionType: "فردية",
      date: "2025/03/18",
      time: "3:00 م",
      duration: "60 دقيقة",
      status: "scheduled",
      topic: "تطوير المنتج",
      location: "عن بعد (زوم)",
      feedback: null
    },
    {
      id: 8,
      startupName: "دوكتور أونلاين",
      mentorName: "د. خالد العمري",
      mentorExpertise: "تقنيات صحية",
      sessionType: "فردية",
      date: "2025/03/09",
      time: "10:30 ص",
      duration: "60 دقيقة",
      status: "cancelled",
      topic: "استراتيجية النمو",
      location: "عن بعد (زوم)",
      feedback: null
    }
  ]

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.startupName.includes(searchQuery) || 
                          session.mentorName.includes(searchQuery) ||
                          session.topic.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "upcoming") return matchesSearch && session.status === "scheduled"
    if (activeTab === "completed") return matchesSearch && session.status === "completed"
    if (activeTab === "cancelled") return matchesSearch && session.status === "cancelled"
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500"
      case "completed": return "bg-green-500"
      case "cancelled": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled": return "مجدولة"
      case "completed": return "مكتملة"
      case "cancelled": return "ملغية"
      default: return "غير معروف"
    }
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "فردية": return "bg-purple-100 text-purple-800"
      case "جماعية": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>جدولة جلسة جديدة</span>
        </Button>
        <h1 className="text-3xl font-bold">جدولة الجلسات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{sessions.filter(session => session.status === "scheduled").length}</div>
            <p className="text-muted-foreground">جلسات قادمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{sessions.filter(session => session.status === "completed").length}</div>
            <p className="text-muted-foreground">جلسات مكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{sessions.filter(session => session.status === "cancelled").length}</div>
            <p className="text-muted-foreground">جلسات ملغية</p>
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
              <TabsTrigger value="cancelled">ملغية</TabsTrigger>
              <TabsTrigger value="completed">مكتملة</TabsTrigger>
              <TabsTrigger value="upcoming">قادمة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs ${getSessionTypeColor(session.sessionType)}`}>
                            {session.sessionType}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs ${
                            session.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                            session.status === "completed" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {getStatusText(session.status)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-lg ml-2">{session.topic}</h3>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">الشركة الناشئة</div>
                          <div className="font-medium">{session.startupName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">الموجه</div>
                          <div className="font-medium">{session.mentorName}</div>
                          <div className="text-sm text-muted-foreground">{session.mentorExpertise}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">التاريخ</div>
                          <div className="font-medium">{session.date}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">الوقت</div>
                          <div className="font-medium">{session.time}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">المدة</div>
                          <div className="font-medium">{session.duration}</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground">المكان</div>
                        <div className="font-medium">{session.location}</div>
                      </div>
                      
                      {session.feedback && (
                        <div className="bg-muted p-3 rounded-lg mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="font-medium ml-1">{session.feedback.mentorRating}/5</div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= Math.round(session.feedback.mentorRating) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-sm font-medium">تقييم الموجه</div>
                          </div>
                          <div className="text-sm mb-3">{session.feedback.mentorFeedback}</div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="font-medium ml-1">{session.feedback.startupRating}/5</div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= Math.round(session.feedback.startupRating) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-sm font-medium">تقييم الشركة</div>
                          </div>
                          <div className="text-sm">{session.feedback.startupFeedback}</div>
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-4">
                        {session.status === "scheduled" && (
                          <>
                            <Button variant="outline" size="sm">تعديل الجلسة</Button>
                            <div className="flex gap-2">
                              <Button variant="destructive" size="sm">إلغاء</Button>
                              <Button variant="default" size="sm">إرسال تذكير</Button>
                            </div>
                          </>
                        )}
                        {session.status === "completed" && (
                          <>
                            <Button variant="outline" size="sm">عرض التفاصيل</Button>
                            {session.feedback ? (
                              <Button variant="default" size="sm">تصدير التقييم</Button>
                            ) : (
                              <Button variant="default" size="sm">طلب تقييم</Button>
                            )}
                          </>
                        )}
                        {session.status === "cancelled" && (
                          <>
                            <Button variant="outline" size="sm">عرض التفاصيل</Button>
                            <Button variant="default" size="sm">إعادة جدولة</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-0">
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs ${getSessionTypeColor(session.sessionType)}`}>
                            {session.sessionType}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs ${
                            session.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                            session.status === "completed" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {getStatusText(session.status)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-lg ml-2">{session.topic}</h3>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">الشركة الناشئة</div>
                          <div className="font-medium">{session.startupName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">الموجه</div>
                          <div className="font-medium">{session.mentorName}</div>
                          <div className="text-sm text-muted-foreground">{session.mentorExpertise}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">التاريخ</div>
                          <div className="font-medium">{session.date}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">الوقت</div>
                          <div className="font-medium">{session.time}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">المدة</div>
                          <div className="font-medium">{session.duration}</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground">المكان</div>
                        <div className="font-medium">{session.location}</div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">تعديل الجلسة</Button>
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm">إلغاء</Button>
                          <Button variant="default" size="sm">إرسال تذكير</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs ${getSessionTypeColor(session.sessionType)}`}>
                            {session.sessionType}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs ${
                            session.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                            session.status === "completed" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {getStatusText(session.status)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-lg ml-2">{session.topic}</h3>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">الشركة الناشئة</div>
                          <div className="font-medium">{session.startupName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">الموجه</div>
                          <div className="font-medium">{session.mentorName}</div>
                          <div className="text-sm text-muted-foreground">{session.mentorExpertise}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">التاريخ</div>
                          <div className="font-medium">{session.date}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">الوقت</div>
                          <div className="font-medium">{session.time}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">المدة</div>
                          <div className="font-medium">{session.duration}</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground">المكان</div>
                        <div className="font-medium">{session.location}</div>
                      </div>
                      
                      {session.feedback && (
                        <div className="bg-muted p-3 rounded-lg mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="font-medium ml-1">{session.feedback.mentorRating}/5</div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= Math.round(session.feedback.mentorRating) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-sm font-medium">تقييم الموجه</div>
                          </div>
                          <div className="text-sm mb-3">{session.feedback.mentorFeedback}</div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="font-medium ml-1">{session.feedback.startupRating}/5</div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= Math.round(session.feedback.startupRating) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-sm font-medium">تقييم الشركة</div>
                          </div>
                          <div className="text-sm">{session.feedback.startupFeedback}</div>
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">عرض التفاصيل</Button>
                        {session.feedback ? (
                          <Button variant="default" size="sm">تصدير التقييم</Button>
                        ) : (
                          <Button variant="default" size="sm">طلب تقييم</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="cancelled" className="mt-0">
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs ${getSessionTypeColor(session.sessionType)}`}>
                            {session.sessionType}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs ${
                            session.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                            session.status === "completed" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {getStatusText(session.status)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-lg ml-2">{session.topic}</h3>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">الشركة الناشئة</div>
                          <div className="font-medium">{session.startupName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">الموجه</div>
                          <div className="font-medium">{session.mentorName}</div>
                          <div className="text-sm text-muted-foreground">{session.mentorExpertise}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">التاريخ</div>
                          <div className="font-medium">{session.date}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">الوقت</div>
                          <div className="font-medium">{session.time}</div>
                        </div>
                        <div>
                          <div className="text-
