"use client"

import { useState } from "react"
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
  Star,
  BarChart
} from "lucide-react"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
export default function JudgeDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Mock data for the judge dashboard
  const judgeData = {
    name: "د. سارة الفهد",
    specialty: "علوم البيانات",
    assignedProjects: 12,
    evaluatedProjects: 8,
    pendingProjects: 4,
    upcomingHackathons: [
      {
        id: 1,
        name: "هاكاثون الذكاء الاصطناعي 2025",
        date: "15-17 مارس 2025",
        status: "قريباً"
      }
    ],
    activeHackathons: [
      {
        id: 2,
        name: "هاكاثون التقنية المالية",
        date: "5-7 أبريل 2025",
        status: "جاري التقييم",
        progress: 67
      }
    ],
    pendingEvaluations: [
      {
        id: 1,
        teamName: "فريق AI Innovators",
        projectName: "نظام ذكاء اصطناعي للكشف المبكر عن الأمراض",
        hackathon: "هاكاثون التقنية المالية",
        deadline: "7 أبريل 2025"
      },
      {
        id: 2,
        teamName: "فريق Tech Wizards",
        projectName: "منصة تعليمية تفاعلية باستخدام الذكاء الاصطناعي",
        hackathon: "هاكاثون التقنية المالية",
        deadline: "7 أبريل 2025"
      },
      {
        id: 3,
        teamName: "فريق Data Pioneers",
        projectName: "نظام تحليل البيانات للخدمات الحكومية",
        hackathon: "هاكاثون التقنية المالية",
        deadline: "7 أبريل 2025"
      },
      {
        id: 4,
        teamName: "فريق Smart Solutions",
        projectName: "روبوت محادثة ذكي للرعاية الصحية",
        hackathon: "هاكاثون التقنية المالية",
        deadline: "7 أبريل 2025"
      }
    ],
    completedEvaluations: [
      {
        id: 5,
        teamName: "فريق FinTech Pro",
        projectName: "منصة للمدفوعات الرقمية",
        hackathon: "هاكاثون التقنية المالية",
        score: 85
      },
      {
        id: 6,
        teamName: "فريق Blockchain Masters",
        projectName: "نظام تتبع المعاملات المالية باستخدام البلوكتشين",
        hackathon: "هاكاثون التقنية المالية",
        score: 92
      },
      {
        id: 7,
        teamName: "فريق Secure Pay",
        projectName: "تطبيق للمدفوعات الآمنة",
        hackathon: "هاكاثون التقنية المالية",
        score: 78
      },
      {
        id: 8,
        teamName: "فريق Investment AI",
        projectName: "منصة استثمارية ذكية",
        hackathon: "هاكاثون التقنية المالية",
        score: 88
      }
    ]
  }

  return (
    <RouteGuard 
      requiredPermission={{ category: 'dashboard', action: 'view' }}
      requiredRole={UserRole.PARTICIPANT}
    >
      
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">مرحباً بك {judgeData.name}</h1>
      <p className="text-muted-foreground">التخصص: {judgeData.specialty}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع المسندة</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{judgeData.assignedProjects}</div>
              <p className="text-xs text-muted-foreground">مشروع</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تم تقييمها</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{judgeData.evaluatedProjects}</div>
              <div className="flex items-center text-xs text-green-500">
                <span>{Math.round((judgeData.evaluatedProjects / judgeData.assignedProjects) * 100)}% مكتمل</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">بانتظار التقييم</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{judgeData.pendingProjects}</div>
              <p className="text-xs text-muted-foreground">مشروع</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="completed">التقييمات المكتملة</TabsTrigger>
          <TabsTrigger value="pending">بانتظار التقييم</TabsTrigger>
          <TabsTrigger value="hackathons">الهاكاثونات</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الهاكاثونات النشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {judgeData.activeHackathons.map((hackathon) => (
                    <div key={hackathon.id} className="border-r-4 border-green-500 pr-4 py-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 ml-2">
                            {hackathon.status}
                          </div>
                          <div className="text-sm">{hackathon.date}</div>
                        </div>
                        <h3 className="font-bold">{hackathon.name}</h3>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">تقدم التقييم: {hackathon.progress}%</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${hackathon.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {judgeData.upcomingHackathons.map((hackathon) => (
                    <div key={hackathon.id} className="border-r-4 border-blue-500 pr-4 py-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ml-2">
                            {hackathon.status}
                          </div>
                          <div className="text-sm">{hackathon.date}</div>
                        </div>
                        <h3 className="font-bold">{hackathon.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>المشاريع بانتظار التقييم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {judgeData.pendingEvaluations.slice(0, 3).map((project) => (
                    <div key={project.id} className="border-r-4 border-amber-500 pr-4 py-2">
                      <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">{project.hackathon}</div>
                        <h3 className="font-bold">{project.teamName}</h3>
                      </div>
                      <p className="text-sm">{project.projectName}</p>
                      <div className="flex justify-between mt-2">
                        <Button variant="outline" size="sm">تقييم المشروع</Button>
                        <div className="text-sm text-muted-foreground">الموعد النهائي: {project.deadline}</div>
                      </div>
                    </div>
                  ))}
                  {judgeData.pendingEvaluations.length > 3 && (
                    <Button variant="ghost" className="w-full">عرض جميع المشاريع ({judgeData.pendingEvaluations.length})</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>إحصائيات التقييم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <BarChart className="h-40 w-40 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">85.8</div>
                  <p className="text-muted-foreground">متوسط التقييم</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">92</div>
                  <p className="text-muted-foreground">أعلى تقييم</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">78</div>
                  <p className="text-muted-foreground">أدنى تقييم</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hackathons">
          <Card>
            <CardHeader>
              <CardTitle>الهاكاثونات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">الهاكاثونات النشطة</h3>
                  <div className="space-y-4">
                    {judgeData.activeHackathons.map((hackathon) => (
                      <div key={hackathon.id} className="border-r-4 border-green-500 pr-4 py-4">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 ml-2">
                              {hackathon.status}
                            </div>
                            <div className="text-sm">{hackathon.date}</div>
                          </div>
                          <h3 className="font-bold">{hackathon.name}</h3>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-1">تقدم التقييم: {hackathon.progress}%</div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${hackathon.progress}%` }}></div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button>عرض المشاريع</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">الهاكاثونات القادمة</h3>
                  <div className="space-y-4">
                    {judgeData.upcomingHackathons.map((hackathon) => (
                      <div key={hackathon.id} className="border-r-4 border-blue-500 pr-4 py-4">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ml-2">
                              {hackathon.status}
                            </div>
                            <div className="text-sm">{hackathon.date}</div>
                          </div>
                          <h3 className="font-bold">{hackathon.name}</h3>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button variant="outline">عرض التفاصيل</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>المشاريع بانتظار التقييم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {judgeData.pendingEvaluations.map((project) => (
                  <div key={project.id} className="border-r-4 border-amber-500 pr-4 py-4">
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">{project.hackathon}</div>
                      <h3 className="font-bold">{project.teamName}</h3>
                    </div>
                    <p className="text-sm">{project.projectName}</p>
                    <div className="flex justify-between mt-4">
                      <Button>تقييم المشروع</Button>
                      <div className="text-sm text-muted-foreground">الموعد النهائي: {project.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>التقييمات المكتملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {judgeData.completedEvaluations.map((project) => (
                  <div key={project.id} className="border-r-4 border-green-500 pr-4 py-4">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center ml-4">
                          <Star className="h-4 w-4 text-amber-500 ml-1" />
                          <span>{project.score}/100</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{project.hackathon}</div>
                      </div>
                      <h3 className="font-bold">{project.teamName}</h3>
                    </div>
                    <p className="text-sm">{project.projectName}</p>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline">عرض التفاصيل</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  
    </RouteGuard>
  )
}
