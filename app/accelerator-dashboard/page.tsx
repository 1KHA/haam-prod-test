"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AcceleratorDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  // Mock data for the dashboard
  const stats = [
    { title: "حالة الطلب", value: "جديد", icon: "📝" },
    { title: "الموجهون المتاحون", value: 15, icon: "👨‍🏫" },
    { title: "البرامج المفتوحة", value: 3, icon: "🚀" },
    { title: "الفعاليات القادمة", value: 4, icon: "📅" },
  ]

  const upcomingEvents = [
    { id: 1, name: "ورشة عمل: كيفية بناء نموذج أعمال", date: "15 مارس 2025", time: "10:00 صباحاً", type: "ورشة عمل" },
    { id: 2, name: "جلسة تعريفية: برنامج مسرع الأعمال", date: "20 مارس 2025", time: "2:00 مساءً", type: "جلسة تعريفية" },
    { id: 3, name: "لقاء مع المستثمرين", date: "25 مارس 2025", time: "4:00 مساءً", type: "شبكات" },
  ]

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.push("/accelerator-dashboard/startup/new")}>
          إنشاء شركة ناشئة
        </Button>
        <h1 className="text-3xl font-bold">مرحباً، {user?.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الفعاليات القادمة</CardTitle>
            <CardDescription>فعاليات وورش عمل لمساعدتك في رحلة الشركة الناشئة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-4">
                  <div className="space-y-1 flex-grow">
                    <p className="text-sm font-medium">
                      <span className="font-bold">{event.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    {event.type === "ورشة عمل" && "🔧"}
                    {event.type === "جلسة تعريفية" && "📢"}
                    {event.type === "شبكات" && "🤝"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>ابدأ رحلة شركتك الناشئة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/profile")}>
                إكمال الملف الشخصي <span className="ml-2">👤</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/team")}>
                إضافة أعضاء الفريق <span className="ml-2">👥</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/apply")}>
                التقديم للبرامج <span className="ml-2">🚀</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/mentors")}>
                البحث عن موجهين <span className="ml-2">👨‍🏫</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/resources")}>
                استكشاف الموارد <span className="ml-2">📚</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/events")}>
                التسجيل في الفعاليات <span className="ml-2">📅</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
