"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Code,
  Layers,
  Award,
  UserCheck,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function HackathonDetailsPage() {
  const params = useParams()
  const hackathonId = params.id
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for the hackathon
  const hackathon = {
    id: hackathonId,
    name: "هاكاثون الذكاء الاصطناعي 2025",
    description: "هاكاثون مخصص لتطوير حلول مبتكرة باستخدام تقنيات الذكاء الاصطناعي لمواجهة التحديات في مجالات الصحة والتعليم والخدمات الحكومية.",
    startDate: "15 مارس 2025",
    endDate: "17 مارس 2025",
    location: "مركز الملك عبدالله المالي، الرياض",
    status: "جاري",
    participants: 120,
    teamsCount: 30,
    submissions: 28,
    judgesCount: 8,
    mentors: 12,
    prizes: [
      { rank: "المركز الأول", amount: "100,000 ريال" },
      { rank: "المركز الثاني", amount: "50,000 ريال" },
      { rank: "المركز الثالث", amount: "25,000 ريال" }
    ],
    timeline: [
      { date: "15 مارس، 9:00 ص", event: "حفل الافتتاح" },
      { date: "15 مارس، 10:00 ص", event: "بدء العمل على المشاريع" },
      { date: "16 مارس، 2:00 م", event: "جلسات إرشادية مع الموجهين" },
      { date: "17 مارس، 12:00 م", event: "الموعد النهائي لتسليم المشاريع" },
      { date: "17 مارس، 2:00 م", event: "عروض المشاريع والتقييم" },
      { date: "17 مارس، 5:00 م", event: "إعلان النتائج وتوزيع الجوائز" }
    ],
    teamsList: [
      { id: 1, name: "فريق AI Innovators", members: 4, project: "نظام ذكاء اصطناعي للكشف المبكر عن الأمراض", status: "مكتمل" },
      { id: 2, name: "فريق Tech Wizards", members: 3, project: "منصة تعليمية تفاعلية باستخدام الذكاء الاصطناعي", status: "مكتمل" },
      { id: 3, name: "فريق Data Pioneers", members: 4, project: "نظام تحليل البيانات للخدمات الحكومية", status: "مكتمل" },
      { id: 4, name: "فريق Smart Solutions", members: 3, project: "روبوت محادثة ذكي للرعاية الصحية", status: "مكتمل" }
    ],
    judgesList: [
      { id: 1, name: "د. محمد العمري", specialty: "الذكاء الاصطناعي" },
      { id: 2, name: "د. سارة الفهد", specialty: "علوم البيانات" },
      { id: 3, name: "م. خالد السعيد", specialty: "تطوير البرمجيات" }
    ]
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center">
        <Link href="/admin-dashboard/hackathons">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>العودة</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{hackathon.name}</h1>
      </div>

      <div className="flex justify-end gap-4">
        <div className={`px-3 py-1 text-sm rounded-full ${hackathon.status === "جاري" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
          {hackathon.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>التفاصيل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">الموقع</p>
                <p className="font-medium">{hackathon.location}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ النهاية</p>
                  <p className="font-medium">{hackathon.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ البداية</p>
                  <p className="font-medium">{hackathon.startDate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الوصف</p>
                <p className="text-sm">{hackathon.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإحصائيات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 mb-1 text-primary" />
                <span className="text-lg font-bold">{hackathon.participants}</span>
                <span className="text-xs text-muted-foreground">مشارك</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Layers className="h-5 w-5 mb-1 text-primary" />
                <span className="text-lg font-bold">{hackathon.teamsCount}</span>
                <span className="text-xs text-muted-foreground">فريق</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <Code className="h-5 w-5 mb-1 text-primary" />
                <span className="text-lg font-bold">{hackathon.submissions}</span>
                <span className="text-xs text-muted-foreground">مشروع</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <UserCheck className="h-5 w-5 mb-1 text-primary" />
                <span className="text-lg font-bold">{hackathon.judgesCount}</span>
                <span className="text-xs text-muted-foreground">محكم</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الجوائز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hackathon.prizes.map((prize, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="font-bold">{prize.amount}</div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 ml-2 text-amber-500" />
                    <span>{prize.rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="judges">المحكمون</TabsTrigger>
          <TabsTrigger value="teams">الفرق المشاركة</TabsTrigger>
          <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>الجدول الزمني للهاكاثون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hackathon.timeline.map((item, index) => (
                  <div key={index} className="border-r-4 border-primary pr-4 py-2">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">{item.date}</div>
                      <h3 className="font-bold">{item.event}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>الفرق المشاركة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hackathon.teamsList.map((team) => (
                  <div key={team.id} className="border-r-4 border-blue-500 pr-4 py-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 text-xs rounded-full ${team.status === "مكتمل" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                          {team.status}
                        </div>
                        <div className="text-sm">{team.members} أعضاء</div>
                      </div>
                      <h3 className="font-bold">{team.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{team.project}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="judges">
          <Card>
            <CardHeader>
              <CardTitle>المحكمون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hackathon.judgesList.map((judge) => (
                  <div key={judge.id} className="border-r-4 border-purple-500 pr-4 py-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">{judge.specialty}</div>
                      <h3 className="font-bold">{judge.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-8">
        <Button variant="outline">تعديل الهاكاثون</Button>
        <Button variant="destructive">إلغاء الهاكاثون</Button>
      </div>
    </div>
  )
}
