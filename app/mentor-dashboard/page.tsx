"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  AlertCircle,
  Rocket,
  Star,
  Loader2
} from "lucide-react"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  status: string
}

interface Session {
  id: string
  startupName: string
  topic: string
  type: string
  status: string
  date: string
  time: string
  duration: number
}

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [startups, setStartups] = useState<Startup[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const headers = { Authorization: `Bearer ${token}` }

    const fetchAll = async () => {
      try {
        const [startupsRes, sessionsRes, profileRes] = await Promise.all([
          fetch("/api/mentor/startups", { headers }),
          fetch("/api/mentor/sessions", { headers }),
          fetch("/api/mentor/profile", { headers }),
        ])
        if (startupsRes.ok) {
          const d = await startupsRes.json()
          setStartups(d.startups || [])
        }
        if (sessionsRes.ok) {
          const d = await sessionsRes.json()
          setSessions(d.sessions || [])
        }
        if (profileRes.ok) {
          const d = await profileRes.json()
          setUserName(d.name || "")
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED")
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED")
  const totalHours = Math.round(completedSessions.reduce((sum, s) => sum + (s.duration || 60), 0) / 60)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const formatDateTime = (date: string, time: string) => {
    return `${date} - ${time}`
  }

  return (
    <RouteGuard
      requiredPermission={{ category: 'dashboard', action: 'view' }}
      requiredRole={UserRole.MENTOR}
    >
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">
        {userName ? `مرحباً بك ${userName}` : "مرحباً بك"}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="justify-end">
            <TabsTrigger value="feedback">التقييمات</TabsTrigger>
            <TabsTrigger value="sessions">الجلسات</TabsTrigger>
            <TabsTrigger value="startups">الشركات الناشئة</TabsTrigger>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الشركات الناشئة</CardTitle>
                    <Rocket className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{startups.length}</div>
                    <p className="text-xs text-muted-foreground">شركات ناشئة تحت إشرافك</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">جلسات الإرشاد</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sessions.length}</div>
                    <p className="text-xs text-muted-foreground">{upcomingSessions.length} جلسات قادمة</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الجلسات المكتملة</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedSessions.length}</div>
                    <p className="text-xs text-muted-foreground">جلسة مكتملة</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ساعات الإرشاد</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalHours}</div>
                    <p className="text-xs text-muted-foreground">ساعة إرشاد إجمالية</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>الجلسات القادمة</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">لا توجد جلسات قادمة</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingSessions.slice(0, 3).map((session) => (
                        <div key={session.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 ml-2 text-amber-500" />
                            <div>
                              <div className="font-medium">{session.startupName}</div>
                              <div className="text-sm text-muted-foreground">{formatDateTime(session.date, session.time)}</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-muted-foreground">{session.duration} د</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الشركات الناشئة تحت إشرافك</CardTitle>
                </CardHeader>
                <CardContent>
                  {startups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">لا توجد شركات ناشئة</p>
                  ) : (
                    <div className="space-y-4">
                      {startups.slice(0, 3).map((startup) => (
                        <div key={startup.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center ml-3 text-xs font-bold shrink-0">
                              {startup.name.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium">{startup.name}</div>
                              <div className="text-sm text-muted-foreground">{startup.industry}</div>
                            </div>
                          </div>
                          <Badge variant="outline">{startup.stage}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="startups">
            <Card>
              <CardHeader>
                <CardTitle>الشركات الناشئة تحت إشرافك</CardTitle>
              </CardHeader>
              <CardContent>
                {startups.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">لا توجد شركات ناشئة</p>
                ) : (
                  <div className="space-y-4">
                    {startups.map((startup, i) => {
                      const colors = ["blue", "purple", "green", "amber", "rose"]
                      const color = colors[i % colors.length]
                      return (
                        <div key={startup.id} className={`border-r-4 border-${color}-500 pr-4 py-4`}>
                          <div className="flex items-center justify-between">
                            <Badge variant={startup.status === "APPROVED" ? "default" : "outline"}>
                              {startup.status === "APPROVED" ? "نشط" : startup.status}
                            </Badge>
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-bold text-lg text-right">{startup.name}</div>
                                <div className="text-sm text-muted-foreground text-right">{startup.industry}</div>
                              </div>
                              <div className={`h-12 w-12 rounded-full bg-${color}-500 text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                                {startup.name.substring(0, 2)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">المرحلة: {startup.stage}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>جلسات الإرشاد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold mb-4">الجلسات القادمة</h3>
                    {upcomingSessions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">لا توجد جلسات قادمة</p>
                    ) : (
                      <div className="space-y-4">
                        {upcomingSessions.map((session) => (
                          <div key={session.id} className="border-r-4 border-amber-500 pr-4 py-2">
                            <div className="flex items-center">
                              <AlertCircle className="h-5 w-5 ml-2 text-amber-500" />
                              <h4 className="font-bold">{session.startupName}</h4>
                            </div>
                            <p className="text-muted-foreground">{session.topic}</p>
                            <div className="flex justify-between mt-2">
                              <div className="text-sm">المدة: {session.duration} دقيقة</div>
                              <div className="text-sm">{session.date} - {session.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold mb-4">الجلسات السابقة</h3>
                    {completedSessions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">لا توجد جلسات مكتملة</p>
                    ) : (
                      <div className="space-y-4">
                        {completedSessions.map((session) => (
                          <div key={session.id} className="border-r-4 border-gray-300 pr-4 py-2">
                            <h4 className="font-bold">{session.startupName}</h4>
                            <p className="text-muted-foreground">{session.topic}</p>
                            <div className="flex justify-between mt-2">
                              <div className="text-sm">المدة: {session.duration} دقيقة</div>
                              <div className="text-sm">{session.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>التقييمات والملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold">{sessions.length}</div>
                    <p className="text-muted-foreground">إجمالي الجلسات</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold">{completedSessions.length}</div>
                    <p className="text-muted-foreground">جلسات مكتملة</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold">{startups.length}</div>
                    <p className="text-muted-foreground">شركات تحت الإشراف</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
    </RouteGuard>
  )
}
