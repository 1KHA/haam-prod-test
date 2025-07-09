"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Users, 
  Rocket, 
  Calendar, 
  BookOpen, 
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Megaphone,
  Handshake
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function EntrepreneurDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Mock data for the dashboard
  const stats = [
    { title: "حالة الطلب", value: "جديد", icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
    { title: "الموجهون المتاحون", value: 15, icon: <BookOpen className="h-4 w-4 text-muted-foreground" /> },
    { title: "البرامج المفتوحة", value: 3, icon: <Rocket className="h-4 w-4 text-muted-foreground" /> },
    { title: "الفعاليات القادمة", value: 4, icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
  ]

  const upcomingEvents = [
    { id: 1, name: "ورشة عمل: كيفية بناء نموذج أعمال", date: "15 مارس 2025", time: "10:00 صباحاً", type: "ورشة عمل" },
    { id: 2, name: "جلسة تعريفية: برنامج مسرع الأعمال", date: "20 مارس 2025", time: "2:00 مساءً", type: "جلسة تعريفية" },
    { id: 3, name: "لقاء مع المستثمرين", date: "25 مارس 2025", time: "4:00 مساءً", type: "شبكات" },
  ]

  const quickActions = [
    { name: "إكمال الملف الشخصي", path: "/entrepreneur-dashboard/profile", icon: <Users className="h-4 w-4 ml-2" /> },
    { name: "إضافة أعضاء الفريق", path: "/entrepreneur-dashboard/team", icon: <Users className="h-4 w-4 ml-2" /> },
    { name: "التقديم للبرامج", path: "/entrepreneur-dashboard/apply", icon: <Rocket className="h-4 w-4 ml-2" /> },
    { name: "البحث عن موجهين", path: "/entrepreneur-dashboard/mentors", icon: <BookOpen className="h-4 w-4 ml-2" /> },
    { name: "استكشاف الموارد", path: "/entrepreneur-dashboard/resources", icon: <FileText className="h-4 w-4 ml-2" /> },
    { name: "التسجيل في الفعاليات", path: "/entrepreneur-dashboard/events", icon: <Calendar className="h-4 w-4 ml-2" /> },
  ]

  const tasks = [
    { 
      id: 1, 
      title: "إكمال ملف الشركة الناشئة", 
      deadline: "خلال 3 أيام", 
      priority: "عالية",
      icon: <AlertCircle className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />,
      priorityColor: { color: "#f58f62" }
    },
    { 
      id: 2, 
      title: "تحضير عرض تقديمي للبرنامج", 
      deadline: "خلال أسبوع", 
      priority: "متوسطة",
      icon: <Clock className="h-5 w-5 ml-2" style={{ color: "#799dd7" }} />,
      priorityColor: { color: "#799dd7" }
    },
    { 
      id: 3, 
      title: "تحديد أهداف المشروع", 
      deadline: "خلال أسبوعين", 
      priority: "منخفضة",
      icon: <CheckCircle className="h-5 w-5 ml-2" style={{ color: "#3f4249" }} />,
      priorityColor: { color: "#3f4249" }
    },
  ]

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">مرحباً، {user?.name}</h1>
        <Button onClick={() => router.push("/entrepreneur-dashboard/startup/new")}>
          إنشاء شركة ناشئة
        </Button>
        
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="resources">الموارد</TabsTrigger>
          <TabsTrigger value="events">الفعاليات</TabsTrigger>
          <TabsTrigger value="programs">البرامج</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={cardVariants} 
                initial="hidden" 
                animate="visible" 
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>المهام القادمة</CardTitle>
                <CardDescription>المهام التي تحتاج إلى إكمالها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {task.icon}
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.deadline}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium" style={task.priorityColor}>{task.priority}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الفعاليات القادمة</CardTitle>
                <CardDescription>فعاليات وورش عمل لمساعدتك في رحلة الشركة الناشئة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start">
                      <div className="space-y-1 flex-grow">
                        <p className="text-sm font-medium">
                          <span className="font-bold">{event.name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                      </div>
                      <div className="p-2 rounded-full mr-2 ml-2" style={{ backgroundColor: "#e0f2fe" }}>
                        {event.type === "ورشة عمل" && <Wrench className="h-4 w-4" style={{ color: "#799dd7" }} />}
                        {event.type === "جلسة تعريفية" && <Megaphone className="h-4 w-4" style={{ color: "#799dd7" }} />}
                        {event.type === "شبكات" && <Handshake className="h-4 w-4" style={{ color: "#799dd7" }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>ابدأ رحلة شركتك الناشئة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="justify-end h-auto py-3" 
                    onClick={() => router.push(action.path)}
                  >
                    {action.name} {action.icon}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>البرامج المتاحة</CardTitle>
              <CardDescription>برامج مسرعات الأعمال المفتوحة للتقديم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="pr-4 py-2" style={{ borderRight: "4px solid #f58f62" }}>
                  <h3 className="font-bold">برنامج مسرع الأعمال الصيفي 2025</h3>
                  <p className="text-muted-foreground">برنامج مكثف لمدة 3 أشهر للشركات الناشئة في مراحلها الأولى</p>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">الموعد النهائي للتقديم: 15 أبريل 2025</p>
                    <Button size="sm" onClick={() => router.push("/entrepreneur-dashboard/apply/1")}>
                      تقديم طلب
                    </Button>
                  </div>
                </div>
                <div className="pr-4 py-2" style={{ borderRight: "4px solid #799dd7" }}>
                  <h3 className="font-bold">برنامج التقنية المالية</h3>
                  <p className="text-muted-foreground">برنامج متخصص للشركات الناشئة في مجال التكنولوجيا المالية</p>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">الموعد النهائي للتقديم: 30 مارس 2025</p>
                    <Button size="sm" onClick={() => router.push("/entrepreneur-dashboard/apply/2")}>
                      تقديم طلب
                    </Button>
                  </div>
                </div>
                <div className="pr-4 py-2" style={{ borderRight: "4px solid #3f4249" }}>
                  <h3 className="font-bold">برنامج ابتكار الرعاية الصحية</h3>
                  <p className="text-muted-foreground">دعم الشركات الناشئة في قطاع الرعاية الصحية والعافية</p>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">الموعد النهائي للتقديم: 10 مايو 2025</p>
                    <Button size="sm" onClick={() => router.push("/entrepreneur-dashboard/apply/3")}>
                      تقديم طلب
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>الفعاليات القادمة</CardTitle>
              <CardDescription>فعاليات وورش عمل لمساعدتك في رحلة الشركة الناشئة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="pr-4 py-2" style={{ borderRight: "4px solid #f58f62" }}>
                    <div className="flex items-center">
                      {event.type === "ورشة عمل" && <Wrench className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />}
                      {event.type === "جلسة تعريفية" && <Megaphone className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />}
                      {event.type === "شبكات" && <Handshake className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />}
                      <h3 className="font-bold">{event.name}</h3>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-muted-foreground">{event.date} • {event.time}</p>
                      <Button size="sm" onClick={() => router.push(`/entrepreneur-dashboard/events/${event.id}`)}>
                        التسجيل
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={() => router.push("/entrepreneur-dashboard/events")}>
                    عرض جميع الفعاليات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>الموارد التعليمية</CardTitle>
              <CardDescription>موارد لمساعدتك في بناء شركتك الناشئة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="pr-4 py-2" style={{ borderRight: "4px solid #799dd7" }}>
                  <h3 className="font-bold">دليل بناء نموذج الأعمال</h3>
                  <p className="text-muted-foreground">دليل شامل لبناء نموذج أعمال قوي لشركتك الناشئة</p>
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline" onClick={() => router.push("/entrepreneur-dashboard/resources/1")}>
                      تحميل الدليل
                    </Button>
                  </div>
                </div>
                <div className="pr-4 py-2" style={{ borderRight: "4px solid #f58f62" }}>
                  <h3 className="font-bold">قالب خطة العمل</h3>
                  <p className="text-muted-foreground">قالب جاهز لإعداد خطة عمل احترافية</p>
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline" onClick={() => router.push("/entrepreneur-dashboard/resources/2")}>
                      تحميل القالب
                    </Button>
                  </div>
                </div>
                <div className="pr-4 py-2" style={{ borderRight: "4px solid #3f4249" }}>
                  <h3 className="font-bold">دورة تدريبية: أساسيات التسويق للشركات الناشئة</h3>
                  <p className="text-muted-foreground">دورة تدريبية لتعلم أساسيات التسويق للشركات الناشئة</p>
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline" onClick={() => router.push("/entrepreneur-dashboard/resources/3")}>
                      بدء الدورة
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={() => router.push("/entrepreneur-dashboard/resources")}>
                    عرض جميع الموارد
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
