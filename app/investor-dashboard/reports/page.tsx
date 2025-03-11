"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  DollarSign, 
  FileText, 
  BarChart,
  PieChart,
  LineChart,
  TrendingUp,
  Calendar,
  Download,
  Printer,
  Share2,
  ChevronDown,
  ChevronUp
} from "lucide-react"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("financial")
  const [activeTimeframe, setActiveTimeframe] = useState("yearly")
  const [expandedReport, setExpandedReport] = useState<number | null>(null)

  const reports = [
    {
      id: 1,
      title: "تقرير الأداء المالي السنوي",
      type: "financial",
      timeframe: "yearly",
      date: "2025/03/01",
      summary: "تقرير شامل عن أداء المحفظة الاستثمارية خلال العام المالي 2024-2025، يتضمن تحليل العائد على الاستثمار، النمو، والتوزيع القطاعي.",
      metrics: [
        { name: "إجمالي الاستثمارات", value: "3,350,000 ريال" },
        { name: "القيمة الحالية", value: "3,805,000 ريال" },
        { name: "العائد على الاستثمار", value: "+13.58%" },
        { name: "عدد الاستثمارات النشطة", value: "4" }
      ],
      charts: [
        { type: "bar", title: "توزيع الاستثمارات حسب القطاع" },
        { type: "line", title: "نمو المحفظة على مدار العام" },
        { type: "pie", title: "توزيع المحفظة حسب مرحلة النمو" }
      ]
    },
    {
      id: 2,
      title: "تقرير الأداء المالي الربع سنوي",
      type: "financial",
      timeframe: "quarterly",
      date: "2025/03/01",
      summary: "تقرير عن أداء المحفظة الاستثمارية خلال الربع الأول من العام المالي 2025، يتضمن تحليل العائد على الاستثمار، النمو، والتوزيع القطاعي.",
      metrics: [
        { name: "إجمالي الاستثمارات", value: "3,350,000 ريال" },
        { name: "القيمة الحالية", value: "3,805,000 ريال" },
        { name: "العائد على الاستثمار", value: "+3.2%" },
        { name: "عدد الاستثمارات النشطة", value: "4" }
      ],
      charts: [
        { type: "bar", title: "توزيع الاستثمارات حسب القطاع" },
        { type: "line", title: "نمو المحفظة خلال الربع" }
      ]
    },
    {
      id: 3,
      title: "تقرير تحليل المخاطر",
      type: "risk",
      timeframe: "yearly",
      date: "2025/03/01",
      summary: "تحليل شامل للمخاطر المرتبطة بالمحفظة الاستثمارية، يتضمن تقييم المخاطر لكل استثمار، والتوصيات للتخفيف من المخاطر.",
      metrics: [
        { name: "متوسط درجة المخاطر", value: "متوسط (3.2/5)" },
        { name: "الاستثمارات عالية المخاطر", value: "1" },
        { name: "الاستثمارات متوسطة المخاطر", value: "2" },
        { name: "الاستثمارات منخفضة المخاطر", value: "2" }
      ],
      charts: [
        { type: "bar", title: "درجة المخاطر لكل استثمار" },
        { type: "pie", title: "توزيع المخاطر حسب القطاع" }
      ]
    },
    {
      id: 4,
      title: "تقرير أداء الشركات الناشئة",
      type: "performance",
      timeframe: "yearly",
      date: "2025/03/01",
      summary: "تقرير مفصل عن أداء الشركات الناشئة في المحفظة، يتضمن مؤشرات النمو، الإيرادات، والتقدم في تحقيق الأهداف.",
      metrics: [
        { name: "متوسط نمو الإيرادات", value: "+28%" },
        { name: "الشركات الناشئة المربحة", value: "2/5" },
        { name: "متوسط نمو المستخدمين", value: "+45%" },
        { name: "متوسط تحقيق الأهداف", value: "72%" }
      ],
      charts: [
        { type: "bar", title: "نمو الإيرادات لكل شركة" },
        { type: "line", title: "نمو المستخدمين على مدار العام" }
      ]
    },
    {
      id: 5,
      title: "تقرير التوقعات المستقبلية",
      type: "forecast",
      timeframe: "yearly",
      date: "2025/03/01",
      summary: "تحليل للتوقعات المستقبلية للمحفظة الاستثمارية، يتضمن توقعات النمو، فرص التخارج المحتملة، والتوصيات الاستراتيجية.",
      metrics: [
        { name: "النمو المتوقع للمحفظة", value: "+18%" },
        { name: "فرص التخارج المحتملة", value: "1" },
        { name: "فرص الاستثمار الإضافي", value: "2" },
        { name: "العائد المتوقع على 3 سنوات", value: "+45%" }
      ],
      charts: [
        { type: "line", title: "النمو المتوقع للمحفظة" },
        { type: "bar", title: "العائد المتوقع لكل استثمار" }
      ]
    }
  ]

  const filteredReports = reports.filter(report => {
    const matchesTab = activeTab === "all" || report.type === activeTab
    const matchesTimeframe = activeTimeframe === "all" || report.timeframe === activeTimeframe
    
    return matchesTab && matchesTimeframe
  })

  const toggleExpandReport = (id: number) => {
    if (expandedReport === id) {
      setExpandedReport(null)
    } else {
      setExpandedReport(id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "financial":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "risk":
        return <BarChart className="h-5 w-5 text-red-500" />
      case "performance":
        return <TrendingUp className="h-5 w-5 text-blue-500" />
      case "forecast":
        return <LineChart className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getChartTypeIcon = (type: string) => {
    switch (type) {
      case "bar":
        return <BarChart className="h-4 w-4 text-blue-500" />
      case "line":
        return <LineChart className="h-4 w-4 text-green-500" />
      case "pie":
        return <PieChart className="h-4 w-4 text-purple-500" />
      default:
        return <BarChart className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">التقارير المالية</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">3,805,000 ريال</div>
            <p className="text-muted-foreground">القيمة الحالية للمحفظة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">+13.58%</div>
            <p className="text-muted-foreground">العائد على الاستثمار</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">5</div>
            <p className="text-muted-foreground">عدد الاستثمارات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">2025/03/01</div>
            <p className="text-muted-foreground">آخر تحديث</p>
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
            </div>
            <CardTitle>التقارير المتاحة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="forecast">التوقعات</TabsTrigger>
              <TabsTrigger value="performance">الأداء</TabsTrigger>
              <TabsTrigger value="risk">المخاطر</TabsTrigger>
              <TabsTrigger value="financial">المالية</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            <div className="flex justify-end gap-2 mb-4">
              <Button 
                variant={activeTimeframe === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTimeframe("monthly")}
              >
                شهري
              </Button>
              <Button 
                variant={activeTimeframe === "quarterly" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTimeframe("quarterly")}
              >
                ربع سنوي
              </Button>
              <Button 
                variant={activeTimeframe === "yearly" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTimeframe("yearly")}
              >
                سنوي
              </Button>
              <Button 
                variant={activeTimeframe === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTimeframe("all")}
              >
                الكل
              </Button>
            </div>
            
            <div className="space-y-4">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <Card key={report.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => toggleExpandReport(report.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(report.date)}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div>
                                  <h3 className="font-bold text-lg">{report.title}</h3>
                                </div>
                                {getReportTypeIcon(report.type)}
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-4">{report.summary}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {report.metrics.map((metric, index) => (
                                <div key={index} className="flex items-center justify-end gap-2">
                                  <div>
                                    <div className="text-sm text-muted-foreground">{metric.name}</div>
                                    <div className="font-medium">{metric.value}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {expandedReport === report.id && (
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="font-medium mb-3 text-right">الرسوم البيانية</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {report.charts.map((chart, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                      <div className="flex items-center justify-end gap-2 mb-2">
                                        <h5 className="font-medium">{chart.title}</h5>
                                        {getChartTypeIcon(chart.type)}
                                      </div>
                                      <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                                        <span className="text-muted-foreground">الرسم البياني</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="flex justify-end gap-2 mt-4">
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Printer className="h-4 w-4" />
                                    <span>طباعة</span>
                                  </Button>
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Share2 className="h-4 w-4" />
                                    <span>مشاركة</span>
                                  </Button>
                                  <Button variant="default" size="sm" className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    <span>تحميل PDF</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                {expandedReport === report.id ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {expandedReport === report.id ? "عرض أقل" : "عرض المزيد"}
                                </span>
                              </div>
                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>عرض التقرير الكامل</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                      setActiveTab("all")
                      setActiveTimeframe("all")
                    }}
                  >
                    <Search className="h-4 w-4" />
                    <span>عرض جميع التقارير</span>
                  </Button>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
