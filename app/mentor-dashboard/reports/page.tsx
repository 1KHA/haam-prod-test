"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  FileText, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download,
  Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users,
  ArrowUp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowDown,
  Rocket,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  Share2
} from "lucide-react"

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("performance")
  const [dateRange, setDateRange] = useState("month")

  const performanceData = {
    sessions: {
      total: 48,
      completed: 42,
      cancelled: 6,
      satisfaction: 4.8,
      trend: "+12%"
    },
    startups: {
      total: 15,
      active: 12,
      inactive: 3,
      progress: 78
    },
    feedback: {
      received: 38,
      given: 42,
      averageRating: 4.6
    },
    impact: {
      fundingRaised: "2.5M ريال",
      jobsCreated: 34,
      revenueGrowth: "28%"
    }
  }

  const recentReports = [
    {
      id: 1,
      title: "تقرير أداء الإرشاد الشهري",
      description: "تقرير شامل عن جلسات الإرشاد، التقييمات، والتأثير على الشركات الناشئة",
      type: "performance",
      date: "2025/03/01",
      downloads: 12
    },
    {
      id: 2,
      title: "تحليل تقدم الشركات الناشئة",
      description: "تحليل تفصيلي لتقدم الشركات الناشئة تحت الإشراف ومقارنة بالأهداف",
      type: "startups",
      date: "2025/02/15",
      downloads: 8
    },
    {
      id: 3,
      title: "تقرير التقييمات والملاحظات",
      description: "ملخص للتقييمات والملاحظات المقدمة والمستلمة خلال الربع الأول",
      type: "feedback",
      date: "2025/02/01",
      downloads: 15
    }
  ]

  const filteredReports = recentReports.filter(report => {
    const matchesSearch = report.title.includes(searchQuery) || 
                          report.description.includes(searchQuery)
    
    const matchesType = activeTab === "all" || report.type === activeTab
    
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case "performance": return <BarChart3 className="h-10 w-10 text-blue-500" />
      case "startups": return <Rocket className="h-10 w-10 text-purple-500" />
      case "feedback": return <FileText className="h-10 w-10 text-green-500" />
      default: return <FileText className="h-10 w-10 text-gray-500" />
    }
  }

  const getReportTypeText = (type: string) => {
    switch (type) {
      case "performance": return "تقرير أداء"
      case "startups": return "تقرير الشركات الناشئة"
      case "feedback": return "تقرير التقييمات"
      default: return "تقرير"
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>تصدير التقرير</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span>مشاركة</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">التقارير</h1>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button 
          variant={dateRange === "year" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("year")}
        >
          سنوي
        </Button>
        <Button 
          variant={dateRange === "quarter" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("quarter")}
        >
          ربع سنوي
        </Button>
        <Button 
          variant={dateRange === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("month")}
        >
          شهري
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm text-muted-foreground">جلسات الإرشاد</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>{performanceData.sessions.trend}</span>
              </div>
              <div className="text-2xl font-bold">{performanceData.sessions.total}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {performanceData.sessions.completed} مكتملة • {performanceData.sessions.cancelled} ملغاة
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Rocket className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-sm text-muted-foreground">الشركات الناشئة</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>+3</span>
              </div>
              <div className="text-2xl font-bold">{performanceData.startups.total}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {performanceData.startups.active} نشطة • {performanceData.startups.inactive} غير نشطة
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-full">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm text-muted-foreground">التقييمات</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>+8</span>
              </div>
              <div className="text-2xl font-bold">{performanceData.feedback.given}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              متوسط التقييم: {performanceData.feedback.averageRating}/5
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-sm text-muted-foreground">التأثير</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>{performanceData.impact.revenueGrowth}</span>
              </div>
              <div className="text-2xl font-bold">{performanceData.impact.fundingRaised}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {performanceData.impact.jobsCreated} وظيفة جديدة
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع جلسات الإرشاد</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-32 w-32 mx-auto text-muted-foreground mb-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>تطوير المنتج (35%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>التسويق (25%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>التمويل (20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>الإدارة (20%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>تقدم الشركات الناشئة</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center w-full">
              <LineChart className="h-32 w-32 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-4 w-full">
                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>تك سوليوشنز</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>هيلث تك</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>فينتك</span>
                    <span>60%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
              </div>
            </div>
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
            <CardTitle>التقارير الأخيرة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="feedback">التقييمات</TabsTrigger>
              <TabsTrigger value="startups">الشركات الناشئة</TabsTrigger>
              <TabsTrigger value="performance">الأداء</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <div key={report.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                {getReportTypeText(report.type)}
                              </div>
                              <h3 className="font-bold text-lg">{report.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">{report.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">تاريخ الإنشاء</div>
                                <div>{formatDate(report.date)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">التنزيلات</div>
                                <div>{report.downloads}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            {getReportIcon(report.type)}
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              <span>تنزيل</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد تقارير</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على تقارير تطابق معايير البحث</p>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 mx-auto"
                      onClick={() => {
                        setSearchQuery("")
                        setActiveTab("all")
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span>عرض جميع التقارير</span>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
