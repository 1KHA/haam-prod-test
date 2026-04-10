"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, Building, Rocket, Calendar, Award, BookOpen, DollarSign } from "lucide-react"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"

interface AdminStats {
  users: {
    total: number
    growthPercent: number
    byRole: {
      ENTREPRENEUR: number
      MENTOR: number
      PROGRAM_MANAGER: number
      INVESTOR: number
      ADMIN: number
    }
  }
  programs: { active: number }
  events: { upcoming: number }
  startups: { total: number }
  recentActivity: Array<{
    id: string
    title: string
    message: string
    type: string
    createdAt: string
  }>
  recentFunding: Array<{
    id: string
    title: string
    amount: string
    startupName: string
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const diffMs = Date.now() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays > 0) return `منذ ${diffDays} ${diffDays === 1 ? "يوم" : "أيام"}`
    if (diffHours > 0) return `منذ ${diffHours} ${diffHours === 1 ? "ساعة" : "ساعات"}`
    return "منذ قليل"
  }

  return (
    <RouteGuard
      requiredPermission={{ category: "dashboard", action: "view" }}
      requiredRole={UserRole.ADMIN}
    >
      <div className="space-y-6 text-right">
        <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="funding">التمويل</TabsTrigger>
              <TabsTrigger value="programs">البرامج</TabsTrigger>
              <TabsTrigger value="users">المستخدمون</TabsTrigger>
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.users.total.toLocaleString() ?? "-"}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats && stats.users.growthPercent !== 0
                          ? `${stats.users.growthPercent > 0 ? "+" : ""}${stats.users.growthPercent}% من الشهر الماضي`
                          : "لا توجد بيانات مقارنة"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">البرامج النشطة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.programs.active ?? "-"}</div>
                      <p className="text-xs text-muted-foreground">برنامج نشط حالياً</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Rocket className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">إجمالي الشركات الناشئة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.startups.total ?? "-"}</div>
                      <p className="text-xs text-muted-foreground">شركة ناشئة مسجلة</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">الفعاليات القادمة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.events.upcoming ?? "-"}</div>
                      <p className="text-xs text-muted-foreground">خلال الأسبوعين القادمين</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>أحدث الأنشطة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentActivity.map((activity) => (
                          <div key={activity.id} className="border-r-4 border-blue-500 pr-4 py-2">
                            <h3 className="font-bold">{activity.title}</h3>
                            <p className="text-muted-foreground">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">لا توجد أنشطة حديثة</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>أحدث طلبات التمويل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.recentFunding && stats.recentFunding.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentFunding.map((f) => (
                          <div key={f.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <h4 className="font-medium">{f.startupName}</h4>
                              <p className="text-sm text-muted-foreground">{f.amount} - {f.status}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(f.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">لا توجد طلبات تمويل حديثة</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات المستخدمين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <h3 className="font-bold text-xl">{stats?.users.byRole.ENTREPRENEUR ?? 0}</h3>
                      <p className="text-muted-foreground">مؤسسي الشركات الناشئة</p>
                      <Users className="h-8 w-8 mt-2 text-primary" />
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <h3 className="font-bold text-xl">{stats?.users.byRole.PROGRAM_MANAGER ?? 0}</h3>
                      <p className="text-muted-foreground">مديري البرامج</p>
                      <Award className="h-8 w-8 mt-2 text-primary" />
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <h3 className="font-bold text-xl">{stats?.users.byRole.MENTOR ?? 0}</h3>
                      <p className="text-muted-foreground">الموجهين</p>
                      <BookOpen className="h-8 w-8 mt-2 text-primary" />
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <h3 className="font-bold text-xl">{stats?.users.byRole.INVESTOR ?? 0}</h3>
                      <p className="text-muted-foreground">المستثمرين</p>
                      <DollarSign className="h-8 w-8 mt-2 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="programs">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات البرامج</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
                    <Building className="h-12 w-12 mb-3 text-primary" />
                    <h3 className="font-bold text-3xl">{stats?.programs.active ?? 0}</h3>
                    <p className="text-muted-foreground mt-1">برنامج نشط</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      للاطلاع على تفاصيل البرامج، يرجى زيارة صفحة إدارة البرامج
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funding">
              <Card>
                <CardHeader>
                  <CardTitle>أحدث طلبات التمويل</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentFunding && stats.recentFunding.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentFunding.map((f) => (
                        <div key={f.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <h4 className="font-medium">{f.title}</h4>
                            <p className="text-sm text-muted-foreground">{f.startupName}</p>
                            <p className="text-sm text-muted-foreground">{f.amount}</p>
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-medium ${f.status === "مكتمل" ? "text-green-500" : f.status === "مرفوض" ? "text-red-500" : "text-amber-500"}`}>
                              {f.status}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(f.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">لا توجد طلبات تمويل حديثة</p>
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
