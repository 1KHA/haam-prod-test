"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  BarChart,
  ArrowRight
} from "lucide-react"

export default function MilestonesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const milestones = [
    {
      id: 1,
      title: "تطوير النموذج الأولي",
      startupName: "تك سوليوشنز",
      cohort: "دفعة الابتكار 2025",
      dueDate: "2025/04/15",
      status: "completed",
      completionDate: "2025/04/10",
      progress: 100,
      description: "تطوير نموذج أولي قابل للاستخدام للمنتج، يتضمن الميزات الأساسية المحددة في خطة المنتج",
      deliverables: [
        "نموذج أولي قابل للاستخدام",
        "وثائق تقنية",
        "خطة اختبار المستخدم"
      ]
    },
    {
      id: 2,
      title: "اختبار المستخدم",
      startupName: "تك سوليوشنز",
      cohort: "دفعة الابتكار 2025",
      dueDate: "2025/04/30",
      status: "in_progress",
      progress: 60,
      description: "إجراء اختبارات المستخدم على النموذج الأولي، وجمع الملاحظات والتعليقات لتحسين المنتج",
      deliverables: [
        "تقرير اختبار المستخدم",
        "قائمة التحسينات المقترحة",
        "خطة التنفيذ للإصدار التالي"
      ]
    },
    {
      id: 3,
      title: "تطوير خطة التسويق",
      startupName: "هيلث تك",
      cohort: "دفعة التقنيات الصحية 2024",
      dueDate: "2025/03/20",
      status: "overdue",
      progress: 80,
      description: "تطوير خطة تسويق شاملة للمنتج، تتضمن تحليل السوق، واستراتيجية التسعير، وقنوات التوزيع",
      deliverables: [
        "خطة تسويق شاملة",
        "تحليل المنافسين",
        "استراتيجية التسعير"
      ]
    },
    {
      id: 4,
      title: "جمع التمويل الأولي",
      startupName: "باي تك",
      cohort: "دفعة التقنية المالية 2024",
      dueDate: "2025/05/15",
      status: "upcoming",
      progress: 0,
      description: "جمع تمويل أولي بقيمة 500,000 ريال من المستثمرين الملائكيين أو مسرعات الأعمال",
      deliverables: [
        "عرض تقديمي للمستثمرين",
        "خطة أعمال محدثة",
        "توقعات مالية"
      ]
    },
    {
      id: 5,
      title: "إطلاق النسخة التجريبية",
      startupName: "ميديكال إيه آي",
      cohort: "دفعة التقنيات الصحية 2024",
      dueDate: "2025/04/01",
      status: "completed",
      completionDate: "2025/03/25",
      progress: 100,
      description: "إطلاق النسخة التجريبية من المنتج لمجموعة محددة من المستخدمين، وجمع الملاحظات والتعليقات",
      deliverables: [
        "نسخة تجريبية من المنتج",
        "خطة جمع الملاحظات",
        "استراتيجية دعم المستخدم"
      ]
    },
    {
      id: 6,
      title: "تطوير استراتيجية النمو",
      startupName: "فينتك",
      cohort: "دفعة التقنية المالية 2024",
      dueDate: "2025/05/30",
      status: "upcoming",
      progress: 0,
      description: "تطوير استراتيجية نمو شاملة للشركة، تتضمن خطة التوسع الجغرافي، واستراتيجية اكتساب العملاء",
      deliverables: [
        "استراتيجية النمو",
        "خطة التوسع الجغرافي",
        "استراتيجية اكتساب العملاء"
      ]
    }
  ]

  const filteredMilestones = milestones.filter(milestone => {
    const matchesSearch = milestone.title.includes(searchQuery) || 
                          milestone.startupName.includes(searchQuery) ||
                          milestone.cohort.includes(searchQuery) ||
                          milestone.description.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "completed") return matchesSearch && milestone.status === "completed"
    if (activeTab === "in_progress") return matchesSearch && milestone.status === "in_progress"
    if (activeTab === "upcoming") return matchesSearch && milestone.status === "upcoming"
    if (activeTab === "overdue") return matchesSearch && milestone.status === "overdue"
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "upcoming": return "bg-purple-100 text-purple-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "مكتمل"
      case "in_progress": return "قيد التنفيذ"
      case "upcoming": return "قادم"
      case "overdue": return "متأخر"
      default: return "غير معروف"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress": return <Clock className="h-5 w-5 text-blue-500" />
      case "upcoming": return <Calendar className="h-5 w-5 text-purple-500" />
      case "overdue": return <AlertCircle className="h-5 w-5 text-red-500" />
      default: return <ClipboardList className="h-5 w-5 text-gray-500" />
    }
  }

  const completedCount = milestones.filter(milestone => milestone.status === "completed").length
  const inProgressCount = milestones.filter(milestone => milestone.status === "in_progress").length
  const overdueCount = milestones.filter(milestone => milestone.status === "overdue").length

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة مرحلة جديدة</span>
        </Button>
        <h1 className="text-3xl font-bold">المهام والمراحل</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-muted-foreground">المراحل المكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-muted-foreground">المراحل قيد التنفيذ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{overdueCount}</div>
            <p className="text-muted-foreground">المراحل المتأخرة</p>
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
            <CardTitle>المراحل والمهام</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="overdue">متأخرة</TabsTrigger>
              <TabsTrigger value="upcoming">قادمة</TabsTrigger>
              <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
              <TabsTrigger value="completed">مكتملة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredMilestones.map((milestone) => (
              <div key={milestone.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(milestone.status)}`}>
                      {getStatusText(milestone.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      <h3 className="font-bold text-lg">{milestone.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">الشركة الناشئة</div>
                      <div className="font-medium">{milestone.startupName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">الدفعة</div>
                      <div className="font-medium">{milestone.cohort}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">تاريخ الاستحقاق</div>
                      <div className="font-medium">{milestone.dueDate}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">الوصف</div>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">التقدم</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          milestone.status === "completed" ? "bg-green-500" : 
                          milestone.status === "overdue" ? "bg-red-500" : 
                          "bg-blue-500"
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-left">{milestone.progress}%</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">المخرجات المطلوبة</div>
                    <ul className="list-disc list-inside space-y-1">
                      {milestone.deliverables.map((deliverable, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {milestone.status === "completed" && milestone.completionDate && (
                    <div className="mb-4 bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div className="text-sm font-medium">تم الإكمال بتاريخ: {milestone.completionDate}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">عرض التفاصيل الكاملة</Button>
                    
                    {milestone.status === "in_progress" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">تحديث التقدم</Button>
                        <Button variant="default" size="sm">تعديل</Button>
                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">إكمال</Button>
                      </div>
                    )}
                    
                    {milestone.status === "upcoming" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">تعديل</Button>
                        <Button variant="default" size="sm">بدء العمل</Button>
                      </div>
                    )}
                    
                    {milestone.status === "overdue" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">تمديد الموعد</Button>
                        <Button variant="default" size="sm">تحديث التقدم</Button>
                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">إكمال</Button>
                      </div>
                    )}
                    
                    {milestone.status === "completed" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">عرض التقرير</Button>
                        <Button variant="default" size="sm">المرحلة التالية</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredMilestones.length === 0 && (
              <div className="text-center p-8 border rounded-lg">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد مراحل</h3>
                <p className="text-muted-foreground mb-4">لم يتم العثور على مراحل تطابق معايير البحث</p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveTab("all")
                  }}
                >
                  <Search className="h-4 w-4" />
                  <span>عرض جميع المراحل</span>
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
