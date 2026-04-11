"use client"

import { useState, useEffect } from "react"
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
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Megaphone,
  Handshake
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Milestone {
  id: string
  title: string
  dueDate: string
  status: "upcoming" | "in_progress" | "overdue" | "completed"
  canSubmit: boolean
}

export default function EntrepreneurDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardStats, setDashboardStats] = useState({
    mentorCount: 0,
    programCount: 0,
    eventCount: 0,
    startupStatus: "-",
  })
  const [upcomingEvents, setUpcomingEvents] = useState<Array<{
    id: string; title: string; startDate: string; eventType: string
  }>>([])
  const [programs, setPrograms] = useState<Array<{
    id: string; name: string; description: string | null; applicationDeadline: string | null
  }>>([])
  const [tasks, setTasks] = useState<Array<{
    id: string
    title: string
    deadline: string
    priority: "عالية" | "متوسطة" | "منخفضة"
    icon: React.ReactNode
    priorityColor: React.CSSProperties
    href?: string
  }>>([])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const buildTasks = (startup: any, milestones: Milestone[]) => {
    const result: typeof tasks = []

    // If no startup exists, prompt to create one
    if (!startup) {
      result.push({
        id: "create-startup",
        title: "إنشاء ملف الشركة الناشئة",
        deadline: "ابدأ الآن",
        priority: "عالية",
        icon: <AlertCircle className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />,
        priorityColor: { color: "#f58f62" },
        href: "/entrepreneur-dashboard/startup/new",
      })
      return result
    }

    // Check for incomplete startup profile fields
    if (!startup.pitchDeckUrl) {
      result.push({
        id: "upload-pitch-deck",
        title: "رفع العرض التقديمي للشركة",
        deadline: "مطلوب للتقديم",
        priority: "عالية",
        icon: <AlertCircle className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />,
        priorityColor: { color: "#f58f62" },
        href: `/entrepreneur-dashboard/startups/${startup.id}/edit`,
      })
    }

    if (!startup.description) {
      result.push({
        id: "add-description",
        title: "إكمال وصف الشركة الناشئة",
        deadline: "مطلوب للتقديم",
        priority: result.length === 0 ? "عالية" : "متوسطة",
        icon: <Clock className="h-5 w-5 ml-2" style={{ color: "#799dd7" }} />,
        priorityColor: { color: "#799dd7" },
        href: `/entrepreneur-dashboard/startups/${startup.id}/edit`,
      })
    }

    // Add overdue milestones as high priority
    const overdue = milestones.filter((m) => m.status === "overdue" && m.canSubmit)
    overdue.slice(0, 2).forEach((m) => {
      result.push({
        id: m.id,
        title: m.title,
        deadline: "متأخر عن الموعد",
        priority: "عالية",
        icon: <AlertCircle className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />,
        priorityColor: { color: "#f58f62" },
        href: `/entrepreneur-dashboard/milestones`,
      })
    })

    // Add upcoming/in-progress milestones
    const pending = milestones.filter(
      (m) => (m.status === "upcoming" || m.status === "in_progress") && m.canSubmit
    )
    pending.slice(0, 3 - result.length).forEach((m) => {
      const daysLeft = Math.ceil(
        (new Date(m.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      const deadlineLabel =
        daysLeft <= 0
          ? "اليوم"
          : daysLeft === 1
          ? "غداً"
          : daysLeft <= 7
          ? `خلال ${daysLeft} أيام`
          : daysLeft <= 14
          ? "خلال أسبوع"
          : "خلال أسبوعين"

      const isUrgent = daysLeft <= 3
      result.push({
        id: m.id,
        title: m.title,
        deadline: deadlineLabel,
        priority: isUrgent ? "عالية" : m.status === "in_progress" ? "متوسطة" : "منخفضة",
        icon: isUrgent
          ? <AlertCircle className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />
          : m.status === "in_progress"
          ? <Clock className="h-5 w-5 ml-2" style={{ color: "#799dd7" }} />
          : <CheckCircle className="h-5 w-5 ml-2" style={{ color: "#3f4249" }} />,
        priorityColor: isUrgent
          ? { color: "#f58f62" }
          : m.status === "in_progress"
          ? { color: "#799dd7" }
          : { color: "#3f4249" },
        href: `/entrepreneur-dashboard/milestones`,
      })
    })

    return result
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch("/api/mentor", { headers }).then((r) => r.json()),
      fetch("/api/programs?status=ACTIVE&limit=100", { headers }).then((r) => r.json()),
      fetch("/api/events?upcoming=true&limit=3", { headers }).then((r) => r.json()),
      fetch("/api/startups", { headers }).then((r) => r.json()),
    ])
      .then(async ([mentorData, programData, eventData, startupData]) => {
        const companies = startupData?.companies || []
        const myStartup = companies[0]

        const getStatusLabel = (status?: string) => {
          if (!status) return "لا يوجد"
          if (status === "APPROVED") return "موافق عليه"
          if (status === "PENDING") return "قيد المراجعة"
          if (status === "REJECTED") return "مرفوض"
          return status
        }

        setDashboardStats({
          mentorCount: (mentorData?.mentors || []).length,
          programCount: programData?.pagination?.total ?? (programData?.programs || []).length,
          eventCount: eventData?.pagination?.total ?? (eventData?.events || []).length,
          startupStatus: myStartup ? getStatusLabel(myStartup.status) : "لا يوجد",
        })

        setUpcomingEvents((eventData?.events || []).slice(0, 3))
        setPrograms((programData?.programs || []).slice(0, 5))

        // Fetch milestones if startup exists
        let milestones: Milestone[] = []
        if (myStartup?.id) {
          try {
            const milestoneRes = await fetch(`/api/milestones?startupId=${myStartup.id}`, { headers })
            if (milestoneRes.ok) {
              const milestoneData = await milestoneRes.json()
              milestones = milestoneData?.milestones || []
            }
          } catch {
            // silently ignore — tasks will be based on profile completeness only
          }
        }

        setTasks(buildTasks(myStartup, milestones))
      })
      .catch(console.error)
  }, [user?.id])

  const stats = [
    { title: "حالة الطلب", value: dashboardStats.startupStatus, icon: <FileText className="h-4 w-4 text-muted-foreground" /> },
    { title: "الموجهون المتاحون", value: dashboardStats.mentorCount, icon: <BookOpen className="h-4 w-4 text-muted-foreground" /> },
    { title: "البرامج المفتوحة", value: dashboardStats.programCount, icon: <Rocket className="h-4 w-4 text-muted-foreground" /> },
    { title: "الفعاليات القادمة", value: dashboardStats.eventCount, icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
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
                  {tasks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">لا توجد مهام معلقة، أحسنت!</p>
                  ) : tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => task.href && router.push(task.href)}
                    >
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
                  {upcomingEvents.length === 0 ? (
                    <p className="text-muted-foreground text-sm">لا توجد فعاليات قادمة</p>
                  ) : upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start">
                      <div className="space-y-1 flex-grow">
                        <p className="text-sm font-medium">
                          <span className="font-bold">{event.title}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                      <div className="p-2 rounded-full mr-2 ml-2" style={{ backgroundColor: "#e0f2fe" }}>
                        {event.eventType === "workshop" && <Wrench className="h-4 w-4" style={{ color: "#799dd7" }} />}
                        {event.eventType === "conference" && <Megaphone className="h-4 w-4" style={{ color: "#799dd7" }} />}
                        {(!event.eventType || event.eventType === "networking") && <Handshake className="h-4 w-4" style={{ color: "#799dd7" }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>البرامج المتاحة</CardTitle>
              <CardDescription>برامج مسرعات الأعمال المفتوحة للتقديم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">لا توجد برامج مفتوحة حالياً</p>
                ) : programs.map((program, index) => {
                  const colors = ["#f58f62", "#799dd7", "#3f4249", "#22c55e", "#a855f7"]
                  return (
                    <div key={program.id} className="pr-4 py-2" style={{ borderRight: `4px solid ${colors[index % colors.length]}` }}>
                      <h3 className="font-bold">{program.name}</h3>
                      {program.description && (
                        <p className="text-muted-foreground">{program.description}</p>
                      )}
                      <div className="flex justify-between mt-2">
                        {program.applicationDeadline && (
                          <p className="text-xs text-muted-foreground">
                            الموعد النهائي: {new Date(program.applicationDeadline).toLocaleDateString("ar-SA")}
                          </p>
                        )}
                        <Button size="sm" onClick={() => router.push("/entrepreneur-dashboard/apply")}>
                          تقديم طلب
                        </Button>
                      </div>
                    </div>
                  )
                })}
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
                {upcomingEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">لا توجد فعاليات قادمة</p>
                ) : upcomingEvents.map((event) => (
                  <div key={event.id} className="pr-4 py-2" style={{ borderRight: "4px solid #f58f62" }}>
                    <div className="flex items-center">
                      {event.eventType === "workshop" && <Wrench className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />}
                      {event.eventType === "conference" && <Megaphone className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />}
                      {(!event.eventType || !["workshop", "conference"].includes(event.eventType)) && <Handshake className="h-5 w-5 ml-2" style={{ color: "#f58f62" }} />}
                      <h3 className="font-bold">{event.title}</h3>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString("ar-SA")}
                      </p>
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

      </Tabs>
    </div>
  )
}
