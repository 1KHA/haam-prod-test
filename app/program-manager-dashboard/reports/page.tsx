"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Download, 
  BarChart, 
  PieChart, 
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Share,
  Printer,
  FileText
} from "lucide-react"

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const reports = [
    {
      id: 1,
      title: "تقرير أداء الشركات الناشئة - الربع الأول 2025",
      type: "performance",
      date: "2025/04/01",
      author: "أحمد المالكي",
      cohort: "دفعة الابتكار 2025",
      description: "تقرير شامل عن أداء الشركات الناشئة في الربع الأول من عام 2025، يتضمن مؤشرات النمو، التقدم في المراحل، والتحديات الرئيسية",
      metrics: [
        "معدل نمو الإيرادات: 25%",
        "نسبة إكمال المراحل: 80%",
        "متوسط تقييم الموجهين: 4.2/5"
      ],
      charts: ["نمو الإيرادات", "إكمال المراحل", "تقييمات الموجهين"]
    },
    {
      id: 2,
      title: "تقرير التمويل والاستثمار - مارس 2025",
      type: "financial",
      date: "2025/03/31",
      author: "سارة العتيبي",
      description: "تقرير مالي شهري عن التمويل والاستثمار في الشركات الناشئة، يتضمن إجمالي التمويل، مصادر التمويل، والتوقعات المستقبلية",
      metrics: [
        "إجمالي التمويل: 5,000,000 ريال",
        "عدد جولات التمويل: 3",
        "متوسط حجم الاستثمار: 1,666,667 ريال"
      ],
      charts: ["توزيع التمويل حسب الشركة", "مصادر التمويل", "اتجاهات التمويل"]
    },
    {
      id: 3,
      title: "تقرير الإرشاد والتوجيه - الربع الأول 2025",
      type: "mentorship",
      date: "2025/04/02",
      author: "خالد الدوسري",
      cohort: "جميع الدفعات",
      description: "تقرير عن برنامج الإرشاد والتوجيه في الربع الأول من عام 2025، يتضمن إحصائيات الجلسات، تقييمات الموجهين، وتأثير البرنامج على الشركات الناشئة",
      metrics: [
        "عدد جلسات الإرشاد: 120",
        "متوسط تقييم الجلسات: 4.5/5",
        "نسبة حضور الجلسات: 90%"
      ],
      charts: ["توزيع الجلسات حسب المجال", "تقييمات الجلسات", "تأثير الإرشاد على الأداء"]
    },
    {
      id: 4,
      title: "تقرير الفعاليات والأحداث - الربع الأول 2025",
      type: "events",
      date: "2025/04/03",
      author: "نورة القحطاني",
      cohort: "جميع الدفعات",
      description: "تقرير عن الفعاليات والأحداث في الربع الأول من عام 2025، يتضمن إحصائيات الحضور، تقييمات المشاركين، وتأثير الفعاليات على الشركات الناشئة",
      metrics: [
        "عدد الفعاليات: 15",
        "إجمالي عدد الحضور: 750",
        "متوسط تقييم الفعاليات: 4.3/5"
      ],
      charts: ["توزيع الفعاليات حسب النوع", "حضور الفعاليات", "تقييمات الفعاليات"]
    },
    {
      id: 5,
      title: "تقرير تحليل السوق - قطاع التقنية المالية 2025",
      type: "market",
      date: "2025/03/15",
      author: "فهد العنزي",
      description: "تقرير تحليلي عن سوق التقنية المالية في عام 2025، يتضمن اتجاهات السوق، الفرص والتحديات، والتوقعات المستقبلية",
      metrics: [
        "حجم السوق: 15 مليار ريال",
        "معدل النمو السنوي: 18%",
        "عدد الشركات الناشئة في القطاع: 45"
      ],
      charts: ["حجم السوق حسب القطاع", "اتجاهات النمو", "توزيع الاستثمارات"]
    }
  ]

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.includes(searchQuery) || 
                          report.description.includes(searchQuery) ||
                          (report.cohort && report.cohort.includes(searchQuery)) ||
                          report.author.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "performance") return matchesSearch && report.type === "performance"
    if (activeTab === "financial") return matchesSearch && report.type === "financial"
    if (activeTab === "mentorship") return matchesSearch && report.type === "mentorship"
    if (activeTab === "events") return matchesSearch && report.type === "events"
    if (activeTab === "market") return matchesSearch && report.type === "market"
    
    return matchesSearch
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "performance": return "bg-blue-100 text-blue-800"
      case "financial": return "bg-green-100 text-green-800"
      case "mentorship": return "bg-purple-100 text-purple-800"
      case "events": return "bg-amber-100 text-amber-800"
      case "market": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "performance": return "تقرير أداء"
      case "financial": return "تقرير مالي"
      case "mentorship": return "تقرير إرشاد"
      case "events": return "تقرير فعاليات"
      case "market": return "تقرير سوق"
      default: return "غير معروف"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance": return <BarChart className="h-5 w-5 text-blue-500" />
      case "financial": return <DollarSign className="h-5 w-5 text-green-500" />
      case "mentorship": return <Users className="h-5 w-5 text-purple-500" />
      case "events": return <Calendar className="h-5 w-5 text-amber-500" />
      case "market": return <TrendingUp className="h-5 w-5 text-indigo-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const performanceCount = reports.filter(report => report.type === "performance").length
  const financialCount = reports.filter(report => report.type === "financial").length
  const mentorshipCount = reports.filter(report => report.type === "mentorship").length

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          <span>إنشاء تقرير جديد</span>
        </Button>
        <h1 className="text-3xl font-bold">التقارير والتحليلات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{performanceCount}</div>
            <p className="text-muted-foreground">تقارير الأداء</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{financialCount}</div>
            <p className="text-muted-foreground">التقارير المالية</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{mentorshipCount}</div>
            <p className="text-muted-foreground">تقارير الإرشاد</p>
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
            <CardTitle>التقارير</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="market">تقارير السوق</TabsTrigger>
              <TabsTrigger value="events">تقارير الفعاليات</TabsTrigger>
              <TabsTrigger value="mentorship">تقارير الإرشاد</TabsTrigger>
              <TabsTrigger value="financial">تقارير مالية</TabsTrigger>
              <TabsTrigger value="performance">تقارير الأداء</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredReports.map((report) => (
              <div key={report.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs ${getTypeColor(report.type)}`}>
                      {getTypeText(report.type)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      <h3 className="font-bold text-lg">{report.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">تاريخ التقرير</div>
                      <div className="font-medium">{report.date}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">المؤلف</div>
                      <div className="font-medium">{report.author}</div>
                    </div>
                    {report.cohort && (
                      <div>
                        <div className="text-sm text-muted-foreground">الدفعة</div>
                        <div className="font-medium">{report.cohort}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">الوصف</div>
                    <p className="text-muted-foreground">{report.description}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">المؤشرات الرئيسية</div>
                    <ul className="list-disc list-inside space-y-1">
                      {report.metrics.map((metric, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{metric}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">الرسوم البيانية</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {report.charts.map((chart, index) => (
                        <div key={index} className="border rounded-lg p-4 flex flex-col items-center justify-center text-center h-32">
                          {index % 3 === 0 ? (
                            <BarChart className="h-12 w-12 text-blue-500 mb-2" />
                          ) : index % 3 === 1 ? (
                            <PieChart className="h-12 w-12 text-green-500 mb-2" />
                          ) : (
                            <TrendingUp className="h-12 w-12 text-purple-500 mb-2" />
                          )}
                          <div className="text-sm">{chart}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">عرض التقرير الكامل</Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Share className="h-4 w-4" />
                        <span>مشاركة</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Printer className="h-4 w-4" />
                        <span>طباعة</span>
                      </Button>
                      <Button variant="default" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>تنزيل</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredReports.length === 0 && (
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
