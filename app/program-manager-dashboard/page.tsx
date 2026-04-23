"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  Rocket,
  Award,
  Loader2
} from "lucide-react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"

interface CohortStats {
  total: number
  active: number
  upcoming: number
  completed: number
  startups: number
  mentors: number
  programs: { id: string; name: string; type: string; cohortsCount: number }[]
}

interface Session {
  id: string
  startup: { id: string; name: string }
  topic: string
  date: string
  status: string
}

interface Cohort {
  id: string
  name: string
  status: string
  program: { name: string }
  stats: { membersCount: number; mentorsCount: number }
}

export default function ProgramManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<CohortStats | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cohortsRes, sessionsRes] = await Promise.all([
          fetch("/api/program-manager/cohorts?limit=10", {
            credentials: 'include',
          }),
          fetch("/api/program-manager/sessions", {
            credentials: 'include',
          }),
        ])
        if (cohortsRes.ok) {
          const d = await cohortsRes.json()
          setStats(d.statistics || null)
          setCohorts(d.cohorts || [])
        }
        if (sessionsRes.ok) {
          const d = await sessionsRes.json()
          setSessions(d.sessions || [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled" || s.status === "SCHEDULED")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <RouteGuard
      requiredPermission={{ category: 'dashboard', action: 'view' }}
      requiredRole={UserRole.PROGRAM_MANAGER}
    >
      <div className="space-y-6 text-right">
        <h1 className="text-3xl font-bold">لوحة تحكم مدير البرنامج</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end w-full overflow-x-auto">
              <TabsTrigger value="sessions">الجلسات</TabsTrigger>
              <TabsTrigger value="cohorts">الدفعات</TabsTrigger>
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
                      <div className="text-2xl font-bold">{stats?.startups ?? 0}</div>
                      <p className="text-xs text-muted-foreground">في جميع الدفعات</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">الموجهون</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.mentors ?? 0}</div>
                      <p className="text-xs text-muted-foreground">في جميع الدفعات</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">الدفعات النشطة</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.active ?? 0}</div>
                      <p className="text-xs text-muted-foreground">من أصل {stats?.total ?? 0} دفعة</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">الجلسات القادمة</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{upcomingSessions.length}</div>
                      <p className="text-xs text-muted-foreground">جلسة مجدولة</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>الدفعات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cohorts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">لا توجد دفعات</p>
                    ) : (
                      <div className="space-y-3">
                        {cohorts.slice(0, 4).map((cohort) => (
                          <div key={cohort.id} className="flex items-center justify-between">
                            <Badge variant={cohort.status === "ACTIVE" ? "default" : "outline"}>
                              {cohort.status === "ACTIVE" ? "نشط" : cohort.status === "COMPLETED" ? "مكتمل" : "قادم"}
                            </Badge>
                            <div className="text-right">
                              <div className="font-medium">{cohort.name}</div>
                              <div className="text-xs text-muted-foreground">{cohort.program.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>الجلسات القادمة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingSessions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">لا توجد جلسات قادمة</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingSessions.slice(0, 4).map((session) => (
                          <div key={session.id} className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">{new Date(session.date).toLocaleDateString("ar-SA")}</div>
                            <div className="text-right">
                              <div className="font-medium">{session.startup.name}</div>
                              <div className="text-xs text-muted-foreground">{session.topic}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cohorts">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الدفعات</CardTitle>
                </CardHeader>
                <CardContent>
                  {cohorts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">لا توجد دفعات</p>
                  ) : (
                    <div className="space-y-4">
                      {cohorts.map((cohort) => (
                        <div key={cohort.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={cohort.status === "ACTIVE" ? "default" : "outline"}>
                              {cohort.status === "ACTIVE" ? "نشط" : cohort.status === "COMPLETED" ? "مكتمل" : "قادم"}
                            </Badge>
                            <div className="text-right">
                              <div className="font-bold">{cohort.name}</div>
                              <div className="text-sm text-muted-foreground">{cohort.program.name}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">الشركات: <span className="font-medium text-foreground">{cohort.stats.membersCount}</span></div>
                            <div className="text-muted-foreground">الموجهون: <span className="font-medium text-foreground">{cohort.stats.mentorsCount}</span></div>
                          </div>
                        </div>
                      ))}
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
                  {sessions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">لا توجد جلسات</p>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session) => (
                        <div key={session.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <Badge variant={session.status === "scheduled" || session.status === "SCHEDULED" ? "default" : "secondary"}>
                              {session.status === "scheduled" || session.status === "SCHEDULED" ? "مجدولة" : session.status === "completed" || session.status === "COMPLETED" ? "مكتملة" : session.status}
                            </Badge>
                            <div className="text-right">
                                      <div className="font-medium">{session.startup.name}</div>
                              <div className="text-sm text-muted-foreground">{session.topic}</div>
                              <div className="text-xs text-muted-foreground">{new Date(session.date).toLocaleDateString("ar-SA")}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </RouteGuard>
  )
}
