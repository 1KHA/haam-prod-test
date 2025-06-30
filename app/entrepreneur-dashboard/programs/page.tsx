"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function EntrepreneurPrograms() {
  const { user } = useAuth()
  const router = useRouter()

  // Mock data for programs
  const programs = [
    {
      id: "1",
      name: "دفعة صيف 2025",
      description: "برنامج مكثف لمدة 3 أشهر للشركات الناشئة في مراحلها الأولى",
      startDate: "1 يونيو 2025",
      endDate: "31 أغسطس 2025",
      status: "قادم",
      startups: 12,
      mentors: 8,
    },
    {
      id: "2",
      name: "مسرع التقنية المالية",
      description: "برنامج متخصص للشركات الناشئة في مجال التكنولوجيا المالية",
      startDate: "15 أبريل 2025",
      endDate: "15 أكتوبر 2025",
      status: "نشط",
      startups: 8,
      mentors: 6,
    },
    {
      id: "3",
      name: "ابتكار الرعاية الصحية",
      description: "دعم الشركات الناشئة في قطاع الرعاية الصحية والعافية",
      startDate: "1 مارس 2025",
      endDate: "1 سبتمبر 2025",
      status: "نشط",
      startups: 10,
      mentors: 7,
    },
    {
      id: "4",
      name: "دفعة شتاء 2024",
      description: "برنامج مكثف لمدة 3 أشهر للشركات الناشئة في مراحلها الأولى",
      startDate: "1 يناير 2025",
      endDate: "31 مارس 2025",
      status: "مكتمل",
      startups: 15,
      mentors: 9,
    },
  ]

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.push("/entrepreneur-dashboard/programs/new")}>
          إنشاء برنامج جديد
        </Button>
        <h1 className="text-3xl font-bold">البرامج</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programs.map((program) => (
          <Card key={program.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  program.status === "نشط" ? "bg-green-100 text-green-800" :
                  program.status === "قادم" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {program.status}
                </div>
                <div>
                  <CardTitle>{program.name}</CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{program.startDate} - {program.endDate}</span>
                  <span className="text-muted-foreground">المدة:</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{program.startups}</span>
                  <span className="text-muted-foreground">الشركات الناشئة:</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{program.mentors}</span>
                  <span className="text-muted-foreground">الموجهون:</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => router.push(`/entrepreneur-dashboard/programs/${program.id}/edit`)}>
                تعديل البرنامج
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/entrepreneur-dashboard/programs/${program.id}`)}>
                عرض التفاصيل
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
