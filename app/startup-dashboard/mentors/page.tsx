"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare, 
  Star, 
  Search,
  Filter,
  ChevronDown,
  Download,
  FileText,
  CheckCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  BookOpen
} from "lucide-react"

// Mock mentors data
const mentors = [
  {
    id: 1,
    name: "د. سارة الأحمد",
    title: "خبيرة في التقنية المالية",
    bio: "خبيرة في مجال التقنية المالية مع أكثر من 15 عامًا من الخبرة في العمل مع الشركات الناشئة والمؤسسات المالية الكبرى. حاصلة على دكتوراه في الاقتصاد من جامعة هارفارد.",
    expertise: ["التقنية المالية", "نماذج الأعمال", "التسويق"],
    email: "sarah@mentors.com",
    phone: "+966 50 123 4567",
    avatar: "س",
    color: "bg-blue-500",
    rating: 5.0,
    availability: [
      { day: "الاثنين", slots: ["10:00 ص - 12:00 م", "2:00 م - 4:00 م"] },
      { day: "الأربعاء", slots: ["1:00 م - 3:00 م"] },
      { day: "الخميس", slots: ["11:00 ص - 1:00 م"] }
    ],
    nextSession: {
      date: "15 مارس 2025",
      time: "3:00 م - 4:00 م",
      topic: "استراتيجية التسويق"
    }
  },
  {
    id: 2,
    name: "م. محمد العلي",
    title: "خبير تقني",
    bio: "مهندس برمجيات ومستشار تقني مع خبرة واسعة في تطوير المنتجات التقنية وبناء فرق التطوير. عمل سابقًا في شركات عالمية مثل جوجل وأمازون.",
    expertise: ["تطوير البرمجيات", "الذكاء الاصطناعي", "البنية التحتية"],
    email: "mohammed@mentors.com",
    phone: "+966 55 987 6543",
    avatar: "م",
    color: "bg-green-500",
    rating: 4.8,
    availability: [
      { day: "الثلاثاء", slots: ["9:00 ص - 11:00 ص", "3:00 م - 5:00 م"] },
      { day: "الخميس", slots: ["10:00 ص - 12:00 م"] },
      { day: "السبت", slots: ["11:00 ص - 1:00 م"] }
    ],
    nextSession: {
      date: "18 مارس 2025",
      time: "11:00 ص - 12:00 م",
      topic: "تحسين البنية التقنية"
    }
  }
]

// Mock past sessions data
const pastSessions = [
  {
    id: 1,
    mentorName: "د. سارة الأحمد",
    mentorAvatar: "س",
    mentorColor: "bg-blue-500",
    date: "25 فبراير 2025",
    time: "3:00 م - 4:00 م",
    topic: "خطة النمو",
    summary: "تمت مناقشة استراتيجية النمو للشركة خلال الأشهر الستة القادمة، مع التركيز على اكتساب العملاء وتحسين معدل الاحتفاظ بهم.",
    actionItems: [
      "تطوير خطة تسويق مفصلة",
      "تحليل سلوك المستخدمين الحاليين",
      "تحديد مؤشرات الأداء الرئيسية للنمو"
    ],
    resources: [
      { name: "نموذج خطة النمو", type: "PDF" },
      { name: "أدوات تحليل المستخدمين", type: "رابط" }
    ]
  },
  {
    id: 2,
    mentorName: "م. محمد العلي",
    mentorAvatar: "م",
    mentorColor: "bg-green-500",
    date: "18 فبراير 2025",
    time: "11:00 ص - 12:00 م",
    topic: "تحسين تجربة المستخدم",
    summary: "تمت مراجعة واجهة المستخدم الحالية وتحديد مجالات التحسين لزيادة مشاركة المستخدمين وتحسين تجربتهم.",
    actionItems: [
      "إجراء اختبارات المستخدمين",
      "تبسيط عملية التسجيل",
      "تحسين سرعة تحميل التطبيق"
    ],
    resources: [
      { name: "تقرير تحليل تجربة المستخدم", type: "PDF" },
      { name: "أدوات اختبار المستخدمين", type: "رابط" }
    ]
  },
  {
    id: 3,
    mentorName: "د. سارة الأحمد",
    mentorAvatar: "س",
    mentorColor: "bg-blue-500",
    date: "5 فبراير 2025",
    time: "3:00 م - 4:00 م",
    topic: "استراتيجية التسعير",
    summary: "تمت مناقشة نماذج التسعير المختلفة وتحديد النموذج الأنسب للمنتج بناءً على تحليل السوق والمنافسين.",
    actionItems: [
      "إجراء تحليل تنافسي للأسعار",
      "اختبار نماذج تسعير مختلفة",
      "تطوير استراتيجية للعروض الترويجية"
    ],
    resources: [
      { name: "نماذج التسعير للشركات الناشئة", type: "PDF" },
      { name: "أداة حساب نقطة التعادل", type: "Excel" }
    ]
  }
]

export default function MentorsPage() {
  const [activeTab, setActiveTab] = useState("mentors")
  const [selectedMentor, setSelectedMentor] = useState<number | null>(null)
  const [sessionNotes, setSessionNotes] = useState("")
  const [sessionTopic, setSessionTopic] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const handleScheduleSession = () => {
    // In a real app, this would send a session request to the server
    console.log("Scheduling session with mentor", selectedMentor, {
      topic: sessionTopic,
      notes: sessionNotes,
      date: selectedDate,
      time: selectedTime
    })
    
    // Reset form
    setSessionTopic("")
    setSessionNotes("")
    setSelectedDate("")
    setSelectedTime("")
    setSelectedMentor(null)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">الموجهون</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="sessions">جلسات سابقة</TabsTrigger>
          <TabsTrigger value="schedule">جدولة جلسة</TabsTrigger>
          <TabsTrigger value="mentors">الموجهون المخصصون</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mentors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-row-reverse items-center gap-4">
                        <div className={`h-16 w-16 rounded-full ${mentor.color} text-white flex items-center justify-center`}>
                          <span className="text-xl font-bold">{mentor.avatar}</span>
                        </div>
                        <div className="text-right">
                          <CardTitle>{mentor.name}</CardTitle>
                          <CardDescription>{mentor.title}</CardDescription>
                          <div className="flex items-center mt-1">
                            <span className="text-sm ml-1">{mentor.rating}</span>
                            <div className="text-amber-500 text-sm">★★★★★</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <p className="text-sm">{mentor.bio}</p>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">مجالات الخبرة:</h4>
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise.map((skill, i) => (
                            <span 
                              key={i} 
                              className={`text-xs px-2 py-1 rounded-full ${
                                mentor.color === "bg-blue-500" 
                                  ? "bg-blue-100 text-blue-800" 
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span className="text-sm">{mentor.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span className="text-sm">{mentor.phone}</span>
                        </div>
                      </div>
                      
                      {mentor.nextSession && (
                        <div className="bg-muted p-3 rounded-lg">
                          <h4 className="text-sm font-medium mb-1">الجلسة القادمة:</h4>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                              <span className="text-sm">{mentor.nextSession.date}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                              <span className="text-sm">{mentor.nextSession.time}</span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 ml-2 text-muted-foreground" />
                              <span className="text-sm">{mentor.nextSession.topic}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedMentor(mentor.id)}
                    >
                      <Calendar className="h-4 w-4 ml-2" />
                      جدولة جلسة
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 ml-2" />
                      مراسلة
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>جدولة جلسة إرشادية جديدة</CardTitle>
              <CardDescription>حدد الموجه والموعد والموضوع للجلسة القادمة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="mentor" className="text-sm font-medium">اختر الموجه</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentors.map(mentor => (
                      <div 
                        key={mentor.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer ${
                          selectedMentor === mentor.id 
                            ? `border-${mentor.color.replace('bg-', '')} bg-${mentor.color.replace('bg-', '')}/5` 
                            : 'border-transparent hover:border-muted-foreground/20'
                        }`}
                        onClick={() => setSelectedMentor(mentor.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full ${mentor.color} text-white flex items-center justify-center`}>
                            <span className="font-bold">{mentor.avatar}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{mentor.name}</h3>
                            <p className="text-sm text-muted-foreground">{mentor.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedMentor && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="date" className="text-sm font-medium">اختر التاريخ والوقت</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date" className="text-xs text-muted-foreground">التاريخ</label>
                          <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="time" className="text-xs text-muted-foreground">الوقت</label>
                          <Input
                            id="time"
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <h4 className="font-medium">أوقات توفر الموجه:</h4>
                        <ul className="mt-1 space-y-1">
                          {mentors.find(m => m.id === selectedMentor)?.availability.map((avail, i) => (
                            <li key={i}>
                              <span className="font-medium">{avail.day}:</span> {avail.slots.join(', ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="topic" className="text-sm font-medium">موضوع الجلسة</label>
                      <Input
                        id="topic"
                        placeholder="مثال: استراتيجية التسويق، تطوير المنتج، التمويل"
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-sm font-medium">ملاحظات إضافية</label>
                      <Textarea
                        id="notes"
                        placeholder="أضف أي معلومات إضافية ترغب في مناقشتها خلال الجلسة"
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleScheduleSession}>
                        <Calendar className="h-4 w-4 ml-2" />
                        جدولة الجلسة
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions">
          <div className="space-y-6">
            {pastSessions.map((session, index) => (
              <motion.div
                key={session.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-row-reverse items-center gap-4">
                        <div className={`h-12 w-12 rounded-full ${session.mentorColor} text-white flex items-center justify-center`}>
                          <span className="text-lg font-bold">{session.mentorAvatar}</span>
                        </div>
                        <div className="text-right">
                          <CardTitle>{session.topic}</CardTitle>
                          <CardDescription>مع {session.mentorName}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 ml-1" />
                          {session.date}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-4 w-4 ml-1" />
                          {session.time}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">ملخص الجلسة:</h3>
                        <p className="text-sm">{session.summary}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">النقاط المطلوب تنفيذها:</h3>
                        <ul className="text-sm space-y-1 mr-5 list-disc">
                          {session.actionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {session.resources.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-1">الموارد:</h3>
                          <div className="flex flex-wrap gap-2">
                            {session.resources.map((resource, i) => (
                              <Button key={i} variant="outline" size="sm" className="text-xs">
                                <FileText className="h-3 w-3 ml-1" />
                                {resource.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 ml-2" />
                      تنزيل الملخص
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 ml-2" />
                      إرسال متابعة
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>موجهون موصى بهم</CardTitle>
          <CardDescription>موجهون إضافيون قد يساعدونك في مجالات محددة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <span className="font-bold">ن</span>
                </div>
                <div>
                  <h3 className="font-bold">د. نورة الفهد</h3>
                  <p className="text-sm text-muted-foreground">خبيرة في التمويل والاستثمار</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">التمويل</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">الاستثمار</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">إدارة المخاطر</span>
                  </div>
                </div>
              </div>
              <Button>طلب توجيه</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <span className="font-bold">ع</span>
                </div>
                <div>
                  <h3 className="font-bold">أ. عبدالله الزهراني</h3>
                  <p className="text-sm text-muted-foreground">خبير في تجربة المستخدم والتصميم</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">تجربة المستخدم</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">التصميم</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">اختبار المستخدمين</span>
                  </div>
                </div>
              </div>
              <Button>طلب توجيه</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
