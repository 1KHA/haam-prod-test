"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Calendar, Users, BarChart4, CheckCircle } from "lucide-react"

export default function CohortsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("active")

  const cohorts = [
    {
      id: 1,
      name: "دفعة الابتكار 2025",
      startDate: "2025/01/15",
      endDate: "2025/06/15",
      status: "active",
      startupCount: 12,
      mentorCount: 8,
      completionRate: 45,
      description: "برنامج مكثف لمدة 6 أشهر للشركات الناشئة في مجال التكنولوجيا المالية والصحية"
    },
    {
      id: 2,
      name: "دفعة التقنية المالية 2024",
      startDate: "2024/07/01",
      endDate: "2024/12/31",
      status: "active",
      startupCount: 10,
      mentorCount: 6,
      completionRate: 80,
      description: "برنامج متخصص للشركات الناشئة في مجال التقنية المالية"
    },
    {
      id: 3,
      name: "دفعة التقنيات الصحية 2024",
      startDate: "2024/03/01",
      endDate: "2024/08/31",
      status: "completed",
      startupCount: 8,
      mentorCount: 5,
      completionRate: 100,
      description: "برنامج متخصص للشركات الناشئة في مجال التقنيات الصحية"
    },
    {
      id: 4,
      name: "دفعة الذكاء الاصطناعي 2023",
      startDate: "2023/09/01",
      endDate: "2024/02/28",
      status: "completed",
      startupCount: 15,
      mentorCount: 10,
      completionRate: 100,
      description: "برنامج متخصص للشركات الناشئة في مجال الذكاء الاصطناعي وتعلم الآلة"
    },
    {
      id: 5,
      name: "دفعة التجارة الإلكترونية 2025",
      startDate: "2025/03/01",
      endDate: "2025/08/31",
      status: "upcoming",
      startupCount: 0,
      mentorCount: 0,
      completionRate: 0,
      description: "برنامج متخصص للشركات الناشئة في مجال التجارة الإلكترونية والتسويق الرقمي"
    }
  ]

  const filteredCohorts = cohorts.filter(cohort => {
    const matchesSearch = cohort.name.includes(searchQuery) || 
                          cohort.description.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && cohort.status === "active"
    if (activeTab === "completed") return matchesSearch && cohort.status === "completed"
    if (activeTab === "upcoming") return matchesSearch && cohort.status === "upcoming"
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "upcoming": return "bg-amber-100 text-amber-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "نشطة"
      case "completed": return "مكتملة"
      case "upcoming": return "قادمة"
      default: return "غير معروف"
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إنشاء دفعة جديدة</span>
        </Button>
        <h1 className="text-3xl font-bold">إدارة الدفعات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{cohorts.filter(cohort => cohort.status === "active").length}</div>
            <p className="text-muted-foreground">دفعات نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{cohorts.filter(cohort => cohort.status === "completed").length}</div>
            <p className="text-muted-foreground">دفعات مكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">{cohorts.filter(cohort => cohort.status === "upcoming").length}</div>
            <p className="text-muted-foreground">دفعات قادمة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  className="pl-3 pr-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardTitle>الدفعات</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="upcoming">قادمة</TabsTrigger>
              <TabsTrigger value="completed">مكتملة</TabsTrigger>
              <TabsTrigger value="active">نشطة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredCohorts.map((cohort) => (
              <div key={cohort.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(cohort.status)}`}>
                      {getStatusText(cohort.status)}
                    </div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg">{cohort.name}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-muted-foreground">{cohort.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">تاريخ البداية</div>
                      <div className="font-medium">{cohort.startDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">تاريخ النهاية</div>
                      <div className="font-medium">{cohort.endDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">عدد الشركات الناشئة</div>
                      <div className="font-medium">{cohort.startupCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">عدد الموجهين</div>
                      <div className="font-medium">{cohort.mentorCount}</div>
                    </div>
                  </div>
                  
                  {cohort.status !== "upcoming" && (
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-1">نسبة الإكمال</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${cohort.completionRate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-right mt-1">{cohort.completionRate}%</div>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    
                    {cohort.status === "active" && (
                      <div className="flex gap-2">
                        <Button variant="default" size="sm">إدارة الشركات</Button>
                        <Button variant="default" size="sm">إدارة الموجهين</Button>
                      </div>
                    )}
                    
                    {cohort.status === "upcoming" && (
                      <div className="flex gap-2">
                        <Button variant="default" size="sm">تعديل</Button>
                        <Button variant="destructive" size="sm">حذف</Button>
                      </div>
                    )}
                    
                    {cohort.status === "completed" && (
                      <Button variant="default" size="sm">تصدير التقرير</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
