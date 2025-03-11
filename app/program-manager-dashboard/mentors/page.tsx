"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Award, Star, UserCheck, Mail, Phone } from "lucide-react"

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const mentors = [
    {
      id: 1,
      name: "د. سارة الأحمد",
      title: "مستشارة استراتيجية",
      expertise: ["تقنية مالية", "استراتيجية الأعمال", "التسويق"],
      rating: 4.8,
      reviewCount: 24,
      sessionCount: 36,
      startupCount: 8,
      email: "sarah@example.com",
      phone: "+966 50 123 4567",
      availability: "متاح",
      bio: "خبيرة في مجال التقنية المالية مع أكثر من 15 عامًا من الخبرة في تطوير استراتيجيات الأعمال للشركات الناشئة"
    },
    {
      id: 2,
      name: "م. فهد العتيبي",
      title: "مهندس برمجيات",
      expertise: ["تطوير البرمجيات", "الذكاء الاصطناعي", "تقنية مالية"],
      rating: 4.7,
      reviewCount: 18,
      sessionCount: 29,
      startupCount: 6,
      email: "fahad@example.com",
      phone: "+966 55 987 6543",
      availability: "متاح",
      bio: "مهندس برمجيات متخصص في تطوير حلول الذكاء الاصطناعي والتقنية المالية، عمل سابقًا في شركات عالمية مثل جوجل وأمازون"
    },
    {
      id: 3,
      name: "أ. نورة الغامدي",
      title: "مستشارة مالية",
      expertise: ["تمويل واستثمار", "جمع التمويل", "نماذج الأعمال"],
      rating: 4.9,
      reviewCount: 32,
      sessionCount: 45,
      startupCount: 12,
      email: "noura@example.com",
      phone: "+966 54 111 2222",
      availability: "متاح",
      bio: "مستشارة مالية متخصصة في مساعدة الشركات الناشئة على جمع التمويل وتطوير نماذج الأعمال المستدامة"
    },
    {
      id: 4,
      name: "د. خالد العمري",
      title: "طبيب واستشاري تقنيات صحية",
      expertise: ["تقنيات صحية", "الطب الرقمي", "الذكاء الاصطناعي في الصحة"],
      rating: 4.6,
      reviewCount: 15,
      sessionCount: 22,
      startupCount: 5,
      email: "khalid@example.com",
      phone: "+966 56 333 4444",
      availability: "غير متاح حاليًا",
      bio: "طبيب واستشاري في مجال التقنيات الصحية، متخصص في تطبيقات الذكاء الاصطناعي في المجال الطبي"
    },
    {
      id: 5,
      name: "أ. محمد السالم",
      title: "خبير تسويق رقمي",
      expertise: ["تسويق رقمي", "وسائل التواصل الاجتماعي", "تحليلات البيانات"],
      rating: 4.5,
      reviewCount: 20,
      sessionCount: 30,
      startupCount: 10,
      email: "mohammed@example.com",
      phone: "+966 59 555 6666",
      availability: "متاح",
      bio: "خبير في التسويق الرقمي ووسائل التواصل الاجتماعي، ساعد العديد من الشركات الناشئة على تطوير استراتيجيات تسويقية ناجحة"
    }
  ]

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.includes(searchQuery) || 
                          mentor.title.includes(searchQuery) ||
                          mentor.bio.includes(searchQuery) ||
                          mentor.expertise.some(exp => exp.includes(searchQuery))
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "available") return matchesSearch && mentor.availability === "متاح"
    if (activeTab === "unavailable") return matchesSearch && mentor.availability !== "متاح"
    
    return matchesSearch
  })

  const getAvailabilityColor = (availability: string) => {
    return availability === "متاح" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة موجه جديد</span>
        </Button>
        <h1 className="text-3xl font-bold">تعيين الموجهين</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Award className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{mentors.length}</div>
            <p className="text-muted-foreground">إجمالي الموجهين</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserCheck className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{mentors.filter(mentor => mentor.availability === "متاح").length}</div>
            <p className="text-muted-foreground">موجهين متاحين</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Star className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">{(mentors.reduce((acc, mentor) => acc + mentor.rating, 0) / mentors.length).toFixed(1)}</div>
            <p className="text-muted-foreground">متوسط التقييم</p>
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
            <CardTitle>الموجهين</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="unavailable">غير متاحين</TabsTrigger>
              <TabsTrigger value="available">متاحين</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredMentors.map((mentor) => (
              <div key={mentor.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs ${getAvailabilityColor(mentor.availability)}`}>
                      {mentor.availability}
                    </div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg">{mentor.name}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="font-medium">{mentor.title}</div>
                    <p className="text-muted-foreground mt-1">{mentor.bio}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-1">مجالات الخبرة</div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {mentor.expertise.map((exp, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">عدد الجلسات</div>
                      <div className="font-medium">{mentor.sessionCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">الشركات الناشئة</div>
                      <div className="font-medium">{mentor.startupCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">التقييم</div>
                      <div className="flex items-center">
                        <div className="font-medium ml-1">{mentor.rating}</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= Math.round(mentor.rating) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground mr-1">({mentor.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                      <div className="font-medium">{mentor.email}</div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                      <div className="font-medium">{mentor.phone}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">عرض الملف الكامل</Button>
                    
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">تعيين لشركة ناشئة</Button>
                      <Button variant="default" size="sm">جدولة جلسة</Button>
                    </div>
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
