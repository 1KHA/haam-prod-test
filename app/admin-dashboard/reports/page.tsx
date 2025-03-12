"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Download, 
  Printer,
  FileText,
  BarChart, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Layers,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  RefreshCw,
  ChevronDown,
  Mail,
  FileSpreadsheet
} from "lucide-react"

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("month")
  const [selectedReports, setSelectedReports] = useState<string[]>([])

  // Sample reports data
  const reports = [
    { 
      id: "1", 
      title: "تقرير أداء المسرعات - الربع الأول 2025", 
      category: "أداء البرامج", 
      format: "PDF",
      status: "منشور", 
      date: "12 مارس 2025",
      time: "10:15:22",
      createdBy: "أحمد محمد",
      downloadCount: 85,
      size: "2.4 MB",
      description: "تقرير شامل عن أداء برامج المسرعات خلال الربع الأول من عام 2025، يتضمن مؤشرات الأداء الرئيسية والإنجازات والتحديات."
    },
    { 
      id: "2", 
      title: "تقرير التمويل الاستثماري - فبراير 2025", 
      category: "التمويل", 
      format: "XLSX",
      status: "منشور", 
      date: "5 مارس 2025",
      time: "14:30:45",
      createdBy: "محمد القحطاني",
      downloadCount: 120,
      size: "1.8 MB",
      description: "تحليل مفصل لصفقات التمويل الاستثماري خلال شهر فبراير 2025، يشمل توزيع الاستثمارات حسب القطاع والمرحلة وحجم الصفقات."
    },
    { 
      id: "3", 
      title: "تقرير نمو الشركات الناشئة - الربع الرابع 2024", 
      category: "الشركات الناشئة", 
      format: "PDF",
      status: "منشور", 
      date: "28 فبراير 2025",
      time: "09:20:15",
      createdBy: "سارة العتيبي",
      downloadCount: 95,
      size: "3.2 MB",
      description: "تقرير تحليلي عن نمو الشركات الناشئة خلال الربع الرابع من عام 2024، يتضمن مؤشرات النمو والتوظيف والإيرادات والتحديات."
    },
    { 
      id: "4", 
      title: "تقرير المستخدمين النشطين - يناير 2025", 
      category: "المستخدمين", 
      format: "PDF",
      status: "منشور", 
      date: "15 فبراير 2025",
      time: "16:45:30",
      createdBy: "نورة السعيد",
      downloadCount: 65,
      size: "1.5 MB",
      description: "تحليل لنشاط المستخدمين على المنصة خلال شهر يناير 2025، يشمل معدلات الاستخدام والتفاعل والمشاركة حسب نوع المستخدم."
    },
    { 
      id: "5", 
      title: "تقرير الفعاليات والورش - الربع الأول 2025", 
      category: "الفعاليات", 
      format: "PPTX",
      status: "مسودة", 
      date: "15 مارس 2025",
      time: "09:00:00",
      createdBy: "فهد العنزي",
      downloadCount: 0,
      size: "4.7 MB",
      description: "تقرير عن الفعاليات وورش العمل المنفذة خلال الربع الأول من عام 2025، يتضمن إحصائيات المشاركة والتقييمات والتوصيات."
    },
    { 
      id: "6", 
      title: "تقرير أداء المنصة - فبراير 2025", 
      category: "تقني", 
      format: "PDF",
      status: "مسودة", 
      date: "20 مارس 2025",
      time: "11:30:00",
      createdBy: "عبدالله الشمري",
      downloadCount: 0,
      size: "2.1 MB",
      description: "تقرير فني عن أداء المنصة خلال شهر فبراير 2025، يشمل معدلات الاستجابة وأوقات التحميل والأعطال والتحسينات المقترحة."
    },
    { 
      id: "7", 
      title: "تقرير التوجيه والإرشاد - الربع الأول 2025", 
      category: "التوجيه", 
      format: "PDF",
      status: "مجدول", 
      date: "31 مارس 2025",
      time: "08:00:00",
      createdBy: "النظام",
      downloadCount: 0,
      size: "0 KB",
      description: "تقرير عن برامج التوجيه والإرشاد خلال الربع الأول من عام 2025، يتضمن إحصائيات الجلسات والتقييمات والنتائج."
    },
    { 
      id: "8", 
      title: "تقرير الأداء المالي - الربع الأول 2025", 
      category: "مالي", 
      format: "XLSX",
      status: "مجدول", 
      date: "5 أبريل 2025",
      time: "09:00:00",
      createdBy: "النظام",
      downloadCount: 0,
      size: "0 KB",
      description: "تقرير مالي شامل عن الربع الأول من عام 2025، يتضمن الإيرادات والمصروفات والميزانية والتوقعات المالية."
    }
  ]

  // Filter reports based on active tab, search query, and date range
  const filteredReports = reports.filter(report => {
    // Filter by tab
    if (activeTab === "published" && report.status !== "منشور") return false
    if (activeTab === "draft" && report.status !== "مسودة") return false
    if (activeTab === "scheduled" && report.status !== "مجدول") return false
    if (activeTab === "financial" && report.category !== "مالي" && report.category !== "التمويل") return false
    if (activeTab === "programs" && report.category !== "أداء البرامج" && report.category !== "التوجيه") return false
    if (activeTab === "startups" && report.category !== "الشركات الناشئة") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        report.title.toLowerCase().includes(query) ||
        report.category.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleReportSelection = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId))
    } else {
      setSelectedReports([...selectedReports, reportId])
    }
  }

  const selectAllReports = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(filteredReports.map(report => report.id))
    }
  }

  // Calculate statistics
  const totalReports = reports.length
  const publishedReports = reports.filter(r => r.status === "منشور").length
  const totalDownloads = reports.reduce((sum, r) => sum + r.downloadCount, 0)
  const mostDownloadedReport = reports.reduce((prev, current) => 
    (prev.downloadCount > current.downloadCount) ? prev : current
  )

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            <span>طباعة</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span>مشاركة</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>تحديث</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة التقارير</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي التقارير</span>
              <FileText className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReports}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {publishedReports} منشور • {reports.filter(r => r.status === "مسودة").length} مسودة • {reports.filter(r => r.status === "مجدول").length} مجدول
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي التنزيلات</span>
              <Download className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDownloads}</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+15% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التقارير المجدولة</span>
              <Calendar className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.filter(r => r.status === "مجدول").length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              التقرير التالي: {reports.find(r => r.status === "مجدول")?.date || "لا يوجد"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>الأكثر تنزيلاً</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={mostDownloadedReport.title}>
              {mostDownloadedReport.title}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {mostDownloadedReport.downloadCount} تنزيل
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في التقارير..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-4">
          <select 
            className="p-2 border rounded-md"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">آخر 7 أيام</option>
            <option value="month">آخر 30 يوم</option>
            <option value="quarter">آخر 3 أشهر</option>
            <option value="year">آخر سنة</option>
          </select>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 md:grid-cols-7">
              <TabsTrigger value="startups">الشركات</TabsTrigger>
              <TabsTrigger value="programs">البرامج</TabsTrigger>
              <TabsTrigger value="financial">مالي</TabsTrigger>
              <TabsTrigger value="scheduled">مجدول</TabsTrigger>
              <TabsTrigger value="draft">مسودة</TabsTrigger>
              <TabsTrigger value="published">منشور</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedReports.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>تنزيل المحدد</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>إرسال بالبريد</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>قائمة التقارير ({filteredReports.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="ml-2"
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onChange={selectAllReports}
                />
                <span>الإجراءات</span>
              </div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">التنسيق</div>
              <div className="col-span-1">التصنيف</div>
              <div className="col-span-1">التنزيلات</div>
              <div className="col-span-1">التاريخ</div>
              <div className="col-span-2">العنوان</div>
            </div>
            
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div key={report.id} className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedReports.includes(report.id)}
                      onChange={() => toggleReportSelection(report.id)}
                    />
                    <div className="flex gap-1">
                      <button className="text-blue-500 hover:text-blue-700">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-amber-500 hover:text-amber-700">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {report.status === "منشور" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        منشور
                      </span>
                    ) : report.status === "مجدول" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        مجدول
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        مسودة
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      {report.format === "PDF" ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : report.format === "XLSX" ? (
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-500" />
                      )}
                      <span>{report.format}</span>
                    </div>
                  </div>
                  <div className="col-span-1">{report.category}</div>
                  <div className="col-span-1">{report.downloadCount}</div>
                  <div className="col-span-1">{report.date}</div>
                  <div className="col-span-2 truncate" title={report.title}>{report.title}</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                لا توجد نتائج مطابقة لبحثك
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع التقارير حسب التصنيف</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "أداء البرامج", count: reports.filter(r => r.category === "أداء البرامج").length, color: "#3b82f6" },
                { category: "التمويل", count: reports.filter(r => r.category === "التمويل").length, color: "#10b981" },
                { category: "الشركات الناشئة", count: reports.filter(r => r.category === "الشركات الناشئة").length, color: "#f59e0b" },
                { category: "المستخدمين", count: reports.filter(r => r.category === "المستخدمين").length, color: "#ef4444" },
                { category: "الفعاليات", count: reports.filter(r => r.category === "الفعاليات").length, color: "#8b5cf6" },
                { category: "تقني", count: reports.filter(r => r.category === "تقني").length, color: "#ec4899" },
                { category: "التوجيه", count: reports.filter(r => r.category === "التوجيه").length, color: "#06b6d4" },
                { category: "مالي", count: reports.filter(r => r.category === "مالي").length, color: "#6b7280" }
              ].filter(item => item.count > 0).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="h-3 rounded-full ml-2"
                      style={{ 
                        width: `${(item.count / totalReports) * 100 / 3}rem`,
                        backgroundColor: item.color
                      }}
                    ></div>
                    <span className="text-lg font-bold">{item.count}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="text-xs text-muted-foreground mr-2">({Math.round((item.count / totalReports) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>تنزيلات التقارير الشهرية</span>
              <BarChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60 flex items-end justify-between gap-2 pt-10 pb-5">
              {[45, 60, 75, 90, 120, 150, 180, 210, 240, 270, 300, 365].map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-8 bg-primary rounded-t-md" 
                    style={{ height: `${(value / 365) * 100}%` }}
                  ></div>
                  <span className="text-xs">{['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][index]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-end gap-2">
            <span>التقارير المجدولة القادمة</span>
            <Calendar className="h-5 w-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.filter(r => r.status === "مجدول").map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>تعديل الجدولة</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>معاينة</span>
                  </Button>
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-medium">{report.title}</div>
                  <div className="text-sm text-muted-foreground">{report.category} • {report.format}</div>
                  <div className="text-xs text-muted-foreground">تاريخ النشر: {report.date} {report.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
