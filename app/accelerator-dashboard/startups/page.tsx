"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AcceleratorStartups() {
  const { user } = useAuth()
  const router = useRouter()

  // Mock data for startups
  const startups = [
    {
      id: "1",
      name: "تك إنوفيت",
      logo: "🚀",
      industry: "برمجيات كخدمة",
      stage: "تمويل أولي",
      program: "دفعة صيف 2025",
      description: "منصة إدارة مشاريع مدعومة بالذكاء الاصطناعي للفرق عن بعد",
      founders: "سارة الأحمد، محمد الخالد",
      progress: 75,
    },
    {
      id: "2",
      name: "هيلث تراك",
      logo: "🏥",
      industry: "الرعاية الصحية",
      stage: "ما قبل التمويل",
      program: "ابتكار الرعاية الصحية",
      description: "تطبيق جوال لتتبع المؤشرات الصحية والالتزام بالأدوية",
      founders: "د. جميل الوليد، إيمان الرشيد",
      progress: 60,
    },
    {
      id: "3",
      name: "فين فلو",
      logo: "💰",
      industry: "التقنية المالية",
      stage: "تمويل أولي",
      program: "مسرع التقنية المالية",
      description: "منصة آلية للتخطيط المالي والاستثمار لجيل الألفية",
      founders: "أحمد التميمي، بريا باتيل",
      progress: 80,
    },
    {
      id: "4",
      name: "جرين جرو",
      logo: "🌱",
      industry: "التقنية الزراعية",
      stage: "سلسلة أ",
      program: "دفعة صيف 2025",
      description: "حلول زراعية ذكية باستخدام إنترنت الأشياء وتحليل البيانات",
      founders: "روبرت جارسيا، ليلى الوهيبي",
      progress: 90,
    },
    {
      id: "5",
      name: "إدو سبارك",
      logo: "📚",
      industry: "تقنية التعليم",
      stage: "تمويل أولي",
      program: "دفعة شتاء 2024",
      description: "منصة تعليمية مخصصة تستخدم الذكاء الاصطناعي للتكيف مع احتياجات الطلاب",
      founders: "داود الكريم، صفية المرزوقي",
      progress: 65,
    },
    {
      id: "6",
      name: "ريتيل أي",
      logo: "🛒",
      industry: "تجارة التجزئة",
      stage: "ما قبل التمويل",
      program: "دفعة صيف 2025",
      description: "إدارة المخزون والتنبؤ بالطلب لتجار التجزئة باستخدام الذكاء الاصطناعي",
      founders: "جنى اللحيدان، عمر حسن",
      progress: 40,
    },
  ]

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={() => router.push("/accelerator-dashboard/startups/applications")}>
            عرض الطلبات
          </Button>
          <Button variant="outline" onClick={() => router.push("/accelerator-dashboard/startups/invite")}>
            دعوة شركة ناشئة
          </Button>
        </div>
        <h1 className="text-3xl font-bold">الشركات الناشئة</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startups.map((startup) => (
          <Card key={startup.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{startup.name}</CardTitle>
                  <CardDescription>{startup.industry} • {startup.stage}</CardDescription>
                </div>
                <div className="text-3xl">{startup.logo}</div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <p className="text-sm">{startup.description}</p>
                <div className="text-sm">
                  <span className="text-muted-foreground">المؤسسون:</span> {startup.founders}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">البرنامج:</span> {startup.program}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{startup.progress}%</span>
                    <span className="text-muted-foreground">التقدم:</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${startup.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => router.push(`/accelerator-dashboard/startups/${startup.id}/mentor`)}>
                تعيين موجه
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/accelerator-dashboard/startups/${startup.id}`)}>
                عرض التفاصيل
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
