"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Star, 
  MessageSquare,
  BookOpen,
  Briefcase,
  Award,
  Globe
} from "lucide-react"

interface Mentor {
  id: string
  name: string
  position: string
  company: string
  email: string
  phone: string
  avatar: string
  expertise: string[]
  bio: string
  rating: number
  availability: {
    day: string
    slots: string[]
  }[]
  sessions: {
    id: string
    date: string
    time: string
    status: "upcoming" | "completed" | "cancelled"
    notes?: string
  }[]
}

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null)
  
  // Mock data for mentors
  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: "1",
      name: "د. أحمد محمد",
      position: "مستشار استراتيجي",
      company: "شركة الاستشارات العالمية",
      email: "ahmed@example.com",
      phone: "+966 50 123 4567",
      avatar: "/placeholder-avatar.jpg",
      expertise: ["استراتيجية الأعمال", "التخطيط المالي", "تطوير المنتجات"],
      bio: "خبرة أكثر من 15 عاماً في مجال الاستشارات الاستراتيجية للشركات الناشئة. ساعد أكثر من 50 شركة ناشئة في الحصول على تمويل وتطوير استراتيجيات النمو.",
      rating: 4.8,
      availability: [
        {
          day: "الأحد",
          slots: ["10:00 - 11:00", "14:00 - 15:00"]
        },
        {
          day: "الثلاثاء",
          slots: ["13:00 - 14:00", "16:00 - 17:00"]
        }
      ],
      sessions: [
        {
          id: "s1",
          date: "15 مارس 2025",
          time: "10:00 - 11:00",
          status: "upcoming"
        },
        {
          id: "s2",
          date: "10 فبراير 2025",
          time: "14:00 - 15:00",
          status: "completed",
          notes: "مناقشة استراتيجية التسويق وخطة النمو للربع القادم"
        }
      ]
    },
    {
      id: "2",
      name: "م. سارة علي",
      position: "مديرة تقنية",
      company: "شركة التقنية المتقدمة",
      email: "sara@example.com",
      phone: "+966 50 765 4321",
      avatar: "/placeholder-avatar.jpg",
      expertise: ["تطوير البرمجيات", "الذكاء الاصطناعي", "تجربة المستخدم"],
      bio: "مهندسة برمجيات مع خبرة 10 سنوات في تطوير المنتجات التقنية. قادت فرق تطوير في شركات عالمية وساهمت في إطلاق منتجات تقنية ناجحة.",
      rating: 4.9,
      availability: [
        {
          day: "الاثنين",
          slots: ["11:00 - 12:00", "15:00 - 16:00"]
        },
        {
          day: "الأربعاء",
          slots: ["10:00 - 11:00", "14:00 - 15:00"]
        }
      ],
      sessions: [
        {
          id: "s3",
          date: "20 مارس 2025",
          time: "11:00 - 12:00",
          status: "upcoming"
        }
      ]
    },
    {
      id: "3",
      name: "محمد خالد",
      position: "مستشار مالي",
      company: "مجموعة الاستثمار المالية",
      email: "mohammed@example.com",
      phone: "+966 50 111 2222",
      avatar: "/placeholder-avatar.jpg",
      expertise: ["التمويل", "الاستثمار", "إدارة المخاطر"],
      bio: "خبير مالي متخصص في تمويل الشركات الناشئة وإعداد خطط الاستثمار. ساعد أكثر من 30 شركة ناشئة في الحصول على تمويل بقيمة إجمالية تتجاوز 50 مليون دولار.",
      rating: 4.7,
      availability: [
        {
          day: "الأحد",
          slots: ["13:00 - 14:00", "16:00 - 17:00"]
        },
        {
          day: "الخميس",
          slots: ["10:00 - 11:00", "15:00 - 16:00"]
        }
      ],
      sessions: [
        {
          id: "s4",
          date: "5 فبراير 2025",
          time: "13:00 - 14:00",
          status: "completed",
          notes: "مراجعة خطة التمويل وإعداد العرض للمستثمرين"
        },
        {
          id: "s5",
          date: "1 فبراير 2025",
          time: "16:00 - 17:00",
          status: "cancelled"
        }
      ]
    },
    {
      id: "4",
      name: "نورة عبدالله",
      position: "مديرة تسويق",
      company: "وكالة التسويق الرقمي",
      email: "noura@example.com",
      phone: "+966 50 333 4444",
      avatar: "/placeholder-avatar.jpg",
      expertise: ["التسويق الرقمي", "العلاقات العامة", "استراتيجية المحتوى"],
      bio: "خبيرة تسويق مع تركيز على استراتيجيات التسويق الرقمي للشركات الناشئة. قادت حملات تسويقية ناجحة لأكثر من 40 شركة ناشئة في مختلف القطاعات.",
      rating: 4.6,
      availability: [
        {
          day: "الاثنين",
          slots: ["09:00 - 10:00", "13:00 - 14:00"]
        },
        {
          day: "الأربعاء",
          slots: ["11:00 - 12:00", "16:00 - 17:00"]
        }
      ],
      sessions: []
    },
    {
      id: "5",
      name: "د. فهد سعود",
      position: "مستشار قانوني",
      company: "مكتب الاستشارات القانونية",
      email: "fahad@example.com",
      phone: "+966 50 555 6666",
      avatar: "/placeholder-avatar.jpg",
      expertise: ["الملكية الفكرية", "قوانين الشركات", "العقود التجارية"],
      bio: "مستشار قانوني متخصص في قوانين الشركات الناشئة والملكية الفكرية. قدم استشارات قانونية لأكثر من 60 شركة ناشئة وساعدهم في حماية حقوقهم الفكرية.",
      rating: 4.9,
      availability: [
        {
          day: "الثلاثاء",
          slots: ["10:00 - 11:00", "14:00 - 15:00"]
        },
        {
          day: "الخميس",
          slots: ["13:00 - 14:00", "16:00 - 17:00"]
        }
      ],
      sessions: [
        {
          id: "s6",
          date: "25 مارس 2025",
          time: "10:00 - 11:00",
          status: "upcoming"
        }
      ]
    }
  ])

  // Extract all unique expertise areas
  const allExpertise = Array.from(new Set(mentors.flatMap(mentor => mentor.expertise)))

  // Filter mentors based on search query and selected expertise
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.includes(searchQuery) || 
                          mentor.position.includes(searchQuery) || 
                          mentor.company.includes(searchQuery) ||
                          mentor.expertise.some(exp => exp.includes(searchQuery))
    
    const matchesExpertise = selectedExpertise === null || mentor.expertise.includes(selectedExpertise)
    
    return matchesSearch && matchesExpertise
  })

  // Get upcoming sessions across all mentors
  const upcomingSessions = mentors.flatMap(mentor => 
    mentor.sessions
      .filter(session => session.status === "upcoming")
      .map(session => ({
        ...session,
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorAvatar: mentor.avatar
      }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const handleSelectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor)
  }

  const handleBookSession = (mentor: Mentor) => {
    // In a real app, this would open a booking modal or navigate to a booking page
    alert(`سيتم فتح نافذة حجز جلسة مع ${mentor.name}`)
  }

  const handleFilterByExpertise = (expertise: string | null) => {
    setSelectedExpertise(expertise)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">الموجهون</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="sessions">الجلسات</TabsTrigger>
          <TabsTrigger value="all">جميع الموجهين</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
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
                variant={selectedExpertise === null ? "default" : "outline"} 
                size="sm"
                onClick={() => handleFilterByExpertise(null)}
              >
                الكل
              </Button>
              {allExpertise.map(expertise => (
                <Button 
                  key={expertise} 
                  variant={selectedExpertise === expertise ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleFilterByExpertise(expertise)}
                >
                  {expertise}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col items-end">
                      <CardTitle className="text-lg">{mentor.name}</CardTitle>
                      <CardDescription>{mentor.position}</CardDescription>
                      <CardDescription>{mentor.company}</CardDescription>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      <img 
                        src={mentor.avatar} 
                        alt={mentor.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= mentor.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{mentor.rating}/5</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {mentor.expertise.map((exp, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-right line-clamp-3">{mentor.bio}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectMentor(mentor)}
                  >
                    عرض التفاصيل
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleBookSession(mentor)}
                  >
                    حجز جلسة
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {filteredMentors.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">لا يوجد موجهين متطابقين مع البحث</p>
              </div>
            )}
          </div>

          {selectedMentor && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMentor(null)}
                  >
                    إغلاق
                  </Button>
                  <div className="text-right">
                    <CardTitle>{selectedMentor.name}</CardTitle>
                    <CardDescription>{selectedMentor.position} - {selectedMentor.company}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-right">نبذة</h3>
                      <p className="text-sm text-right">{selectedMentor.bio}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-right">مجالات الخبرة</h3>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {selectedMentor.expertise.map((exp, index) => (
                          <span 
                            key={index} 
                            className="text-sm bg-muted px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            {exp}
                            {exp.includes("استراتيجية") && <Briefcase className="h-4 w-4" />}
                            {exp.includes("تطوير") && <BookOpen className="h-4 w-4" />}
                            {exp.includes("تمويل") || exp.includes("مالي") && <Briefcase className="h-4 w-4" />}
                            {exp.includes("تسويق") && <Globe className="h-4 w-4" />}
                            {exp.includes("قانون") && <Award className="h-4 w-4" />}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-right">معلومات التواصل</h3>
                      <div className="space-y-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm">{selectedMentor.email}</span>
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm">{selectedMentor.phone}</span>
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-right">الأوقات المتاحة</h3>
                      <div className="space-y-2">
                        {selectedMentor.availability.map((avail, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <div className="flex items-center justify-end gap-2 mb-2">
                              <span className="font-medium">{avail.day}</span>
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              {avail.slots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded-full">
                                  <span>{slot}</span>
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleBookSession(selectedMentor)}
                    >
                      حجز جلسة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div></div>
            <div className="text-sm text-muted-foreground">
              الجلسات القادمة: {upcomingSessions.length}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">قادمة</span>
                    </div>
                    <div className="text-right">
                      <CardTitle className="text-lg">جلسة مع {session.mentorName}</CardTitle>
                      <CardDescription className="mt-1">{session.date} - {session.time}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-end gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">الموجه</span>
                      <span className="text-sm text-muted-foreground">{session.mentorName}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      <img 
                        src={session.mentorAvatar} 
                        alt={session.mentorName} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">
                    إلغاء الجلسة
                  </Button>
                  <Button>
                    <MessageSquare className="h-4 w-4 ml-2" />
                    إرسال رسالة
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {upcomingSessions.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">لا توجد جلسات قادمة</p>
                <Button className="mt-4" onClick={() => setActiveTab("all")}>
                  حجز جلسة جديدة
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>الجلسات السابقة</CardTitle>
              <CardDescription>سجل الجلسات السابقة مع الموجهين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mentors.flatMap(mentor => 
                  mentor.sessions
                    .filter(session => session.status === "completed")
                    .map(session => (
                      <div key={session.id} className="border-r-4 border-green-500 pr-4 py-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-muted-foreground">{session.date} - {session.time}</span>
                          <div className="text-right">
                            <p className="font-medium">{mentor.name}</p>
                            <p className="text-sm text-muted-foreground">{mentor.position}</p>
                          </div>
                        </div>
                        {session.notes && (
                          <p className="text-sm mt-2 text-right">{session.notes}</p>
                        )}
                      </div>
                    ))
                )}

                {mentors.flatMap(mentor => mentor.sessions).filter(session => session.status === "completed").length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">لا توجد جلسات سابقة</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
