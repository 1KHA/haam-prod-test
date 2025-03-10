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
    { title: "البرامج النشطة", value: 3, icon: "🚀" },
    { title: "الشركات الناشئة", value: 24, icon: "💼" },
    { title: "الموجهون", value: 18, icon: "👨‍🏫" },
    { title: "الفعاليات القادمة", value: 5, icon: "📅" },
  ]

  const recentActivities = [
    { id: 1, type: "شركة ناشئة", name: "تك إنوفيت", action: "انضمت إلى برنامجك", time: "منذ ساعتين" },
    { id: 2, type: "فعالية", name: "يوم العرض", action: "تم جدولتها", time: "منذ يوم واحد" },
    { id: 3, type: "موجه", name: "أحمد محمد", action: "أضاف ملاحظات", time: "منذ يومين" },
    { id: 4, type: "برنامج", name: "دفعة الصيف", action: "سيتم إغلاق التقديم قريباً", time: "منذ 3 أيام" },
  ]

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.push("/accelerator-dashboard/programs/new")}>
          إنشاء برنامج جديد
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
            <CardTitle>النشاطات الأخيرة</CardTitle>
            <CardDescription>آخر التحديثات من مسرع الأعمال الخاص بك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="space-y-1 flex-grow">
                    <p className="text-sm font-medium">
                      <span className="font-bold">{activity.name}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    {activity.type === "شركة ناشئة" && "💼"}
                    {activity.type === "فعالية" && "📅"}
                    {activity.type === "موجه" && "👨‍🏫"}
                    {activity.type === "برنامج" && "🚀"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>المهام الشائعة لمديري مسرعات الأعمال</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/programs")}>
                إدارة البرامج <span className="ml-2">🚀</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/startups")}>
                عرض الشركات الناشئة <span className="ml-2">💼</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/events/new")}>
                جدولة فعالية <span className="ml-2">📅</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/mentors")}>
                تعيين موجهين <span className="ml-2">👨‍🏫</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/resources/new")}>
                إضافة مورد <span className="ml-2">📚</span>
              </Button>
              <Button variant="outline" className="justify-end" onClick={() => router.push("/accelerator-dashboard/reports")}>
                إنشاء تقارير <span className="ml-2">📈</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
