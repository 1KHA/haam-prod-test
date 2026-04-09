"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
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
  Globe,
  Loader2
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

interface BookedSession {
  id: string
  startupId: string
  startupName: string
  mentorId: string
  mentorName: string
  mentorAvatar?: string
  topic: string
  type: string
  status: string
  date: string
  time: string
  duration: number
  location: string
  notes: string
}

export default function MentorsPage() {
  const { toast } = useToast()
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null)
  
  // Booking dialog state
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null)
  const [userStartups, setUserStartups] = useState<{id: string, name: string}[]>([])
  const [isBooking, setIsBooking] = useState(false)
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    startupId: "",
    topic: "",
    date: "",
    time: "10:00",
    duration: 60,
    location: "",
    notes: "",
    type: "INDIVIDUAL"
  })

  // Mock data for mentors (will be replaced by API data if available)
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

  // Load real mentors from API (overrides mock data)
  useEffect(() => {
    if (!token) return
    fetch("/api/mentor", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const apiMentors = (data.mentors || []).map((m: {
          id: string; name: string; email: string;
          mentorProfile?: { expertise?: string; experience?: string; availability?: string };
          profile?: { bio?: string; phone?: string; avatar?: string };
        }) => ({
          id: m.id,
          name: m.name,
          position: m.mentorProfile?.experience || "",
          company: "",
          email: m.email,
          phone: m.profile?.phone || "",
          avatar: m.profile?.avatar || "/placeholder-avatar.jpg",
          expertise: m.mentorProfile?.expertise
            ? m.mentorProfile.expertise.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          bio: m.profile?.bio || "",
          rating: 0,
          availability: m.mentorProfile?.availability
            ? [{ day: m.mentorProfile.availability, slots: [] }]
            : [],
          sessions: [],
        }))
        if (apiMentors.length > 0) {
          setMentors(apiMentors)
        }
      })
      .catch(console.error)
  }, [token])

  // Load user's startups
  useEffect(() => {
    if (!token) return
    fetch("/api/startups", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const startups = data.companies || []
        setUserStartups(startups.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
        if (startups.length > 0) {
          setBookingForm(prev => ({ ...prev, startupId: startups[0].id }))
        }
      })
      .catch(console.error)
  }, [token])

  // Load booked sessions
  useEffect(() => {
    if (!token || activeTab !== "sessions") return
    setIsLoadingSessions(true)
    fetch("/api/entrepreneur/sessions", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setBookedSessions(data.sessions || [])
      })
      .catch(console.error)
      .finally(() => setIsLoadingSessions(false))
  }, [token, activeTab])

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

  // Get upcoming sessions across all mentors (mock data)
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
    setBookingMentor(mentor)
    setShowBookDialog(true)
  }

  const handleSubmitBooking = async () => {
    if (!token || !bookingMentor) return
    if (!bookingForm.startupId || !bookingForm.topic || !bookingForm.date) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }
    
    setIsBooking(true)
    try {
      const res = await fetch("/api/entrepreneur/sessions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          mentorId: bookingMentor.id,
          startupId: bookingForm.startupId,
          topic: bookingForm.topic,
          date: bookingForm.date,
          time: bookingForm.time,
          duration: bookingForm.duration,
          location: bookingForm.location,
          notes: bookingForm.notes,
          type: bookingForm.type
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "خطأ", description: data.error || "فشل في حجز الجلسة", variant: "destructive" })
      } else {
        toast({ title: "تم", description: `تم حجز جلسة مع ${bookingMentor.name} بنجاح` })
        setShowBookDialog(false)
        setBookingForm({
          startupId: userStartups[0]?.id || "",
          topic: "",
          date: "",
          time: "10:00",
          duration: 60,
          location: "",
          notes: "",
          type: "INDIVIDUAL"
        })
        // Refresh sessions if on sessions tab
        if (activeTab === "sessions") {
          setIsLoadingSessions(true)
          fetch("/api/entrepreneur/sessions", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((data) => setBookedSessions(data.sessions || []))
            .finally(() => setIsLoadingSessions(false))
        }
      }
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء حجز الجلسة", variant: "destructive" })
    } finally {
      setIsBooking(false)
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    if (!token) return
    try {
      const res = await fetch("/api/entrepreneur/sessions", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ sessionId, action: "cancel" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "خطأ", description: data.error || "فشل في إلغاء الجلسة", variant: "destructive" })
      } else {
        toast({ title: "تم", description: "تم إلغاء الجلسة بنجاح" })
        // Refresh sessions
        setIsLoadingSessions(true)
        fetch("/api/entrepreneur/sessions", { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.json())
          .then((data) => setBookedSessions(data.sessions || []))
          .finally(() => setIsLoadingSessions(false))
      }
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء إلغاء الجلسة", variant: "destructive" })
    }
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
              الجلسات القادمة: {bookedSessions.filter(s => s.status === "SCHEDULED").length}
            </div>
          </div>

          {isLoadingSessions ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookedSessions.filter(s => s.status === "SCHEDULED").map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">قادمة</span>
                      </div>
                      <div className="text-right">
                        <CardTitle className="text-lg">{session.topic}</CardTitle>
                        <CardDescription className="mt-1">{session.date} - {session.time}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-end gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">{session.mentorName}</span>
                        <span className="text-sm text-muted-foreground">{session.startupName}</span>
                        {session.location && (
                          <span className="text-sm text-muted-foreground">📍 {session.location}</span>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        <img 
                          src={session.mentorAvatar || "/placeholder-avatar.jpg"} 
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
                    <Button variant="outline" onClick={() => handleCancelSession(session.id)}>
                      إلغاء الجلسة
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {bookedSessions.filter(s => s.status === "SCHEDULED").length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">لا توجد جلسات قادمة</p>
                  <Button className="mt-4" onClick={() => setActiveTab("all")}>
                    حجز جلسة جديدة
                  </Button>
                </div>
              )}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>الجلسات السابقة</CardTitle>
              <CardDescription>سجل الجلسات السابقة مع الموجهين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingSessions ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {bookedSessions.filter(s => s.status === "COMPLETED").map((session) => (
                      <div key={session.id} className="border-r-4 border-green-500 pr-4 py-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-muted-foreground">{session.date} - {session.time}</span>
                          <div className="text-right">
                            <p className="font-medium">{session.topic}</p>
                            <p className="text-sm text-muted-foreground">{session.mentorName}</p>
                          </div>
                        </div>
                        {session.notes && (
                          <p className="text-sm mt-2 text-right">{session.notes}</p>
                        )}
                      </div>
                    ))}

                    {bookedSessions.filter(s => s.status === "COMPLETED").length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">لا توجد جلسات سابقة</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent className="max-w-lg">
          <div dir="rtl">
            <DialogHeader>
              <DialogTitle>حجز جلسة مع {bookingMentor?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="startup">الشركة <span className="text-red-500">*</span></Label>
                <select
                  id="startup"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={bookingForm.startupId}
                  onChange={(e) => setBookingForm({ ...bookingForm, startupId: e.target.value })}
                >
                  {userStartups.map((startup) => (
                    <option key={startup.id} value={startup.id}>{startup.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">موضوع الجلسة <span className="text-red-500">*</span></Label>
                <Input
                  id="topic"
                  placeholder="مثال: مراجعة خطة العمل"
                  value={bookingForm.topic}
                  onChange={(e) => setBookingForm({ ...bookingForm, topic: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">الوقت</Label>
                  <Input
                    id="time"
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">المدة (دقيقة)</Label>
                  <select
                    id="duration"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={bookingForm.duration}
                    onChange={(e) => setBookingForm({ ...bookingForm, duration: Number(e.target.value) })}
                  >
                    <option value={30}>30 دقيقة</option>
                    <option value={60}>60 دقيقة</option>
                    <option value={90}>90 دقيقة</option>
                    <option value={120}>120 دقيقة</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">نوع الجلسة</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                  >
                    <option value="INDIVIDUAL">فردية</option>
                    <option value="GROUP">جماعية</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">مكان/رابط الجلسة</Label>
                <Input
                  id="location"
                  placeholder="مثال: Zoom, Google Meet, أو عنوان المكتب"
                  value={bookingForm.location}
                  onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="أي ملاحظات إضافية للموجه..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBookDialog(false)}>إلغاء</Button>
              <Button 
                onClick={handleSubmitBooking} 
                disabled={isBooking || !bookingForm.topic || !bookingForm.date}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحجز...
                  </>
                ) : (
                  "تأكيد الحجز"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
