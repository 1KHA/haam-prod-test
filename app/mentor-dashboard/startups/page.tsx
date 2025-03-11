"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart, 
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  FileText,
  TrendingUp
} from "lucide-react"

export default function StartupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const startups = [
    {
      id: 1,
      name: "تك سوليوشنز",
      logo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      industry: "تقنية المعلومات",
      stage: "نمو",
      cohort: "دفعة الابتكار 2025",
      description: "منصة لإدارة المشاريع وتتبع الإنتاجية للشركات الصغيرة والمتوسطة",
      progress: 75,
      nextSession: "2025/03/15",
      lastSession: "2025/03/01",
      team: [
        { name: "محمد العمري", role: "المؤسس والرئيس التنفيذي" },
        { name: "سارة الخالدي", role: "مدير المنتج" },
        { name: "أحمد الزهراني", role: "مدير التقنية" }
      ],
      milestones: [
        { title: "إطلاق النسخة التجريبية", status: "completed", date: "2025/02/15" },
        { title: "اكتساب 100 مستخدم", status: "completed", date: "2025/02/28" },
        { title: "إطلاق النسخة النهائية", status: "in_progress", date: "2025/03/30" },
        { title: "جمع التمويل الأولي", status: "upcoming", date: "2025/04/15" }
      ],
      challenges: [
        "تحسين معدل الاحتفاظ بالمستخدمين",
        "تطوير استراتيجية تسويق فعالة",
        "تحسين تجربة المستخدم"
      ],
      kpis: [
        { name: "عدد المستخدمين", value: "120", trend: "up" },
        { name: "معدل الاحتفاظ", value: "65%", trend: "stable" },
        { name: "الإيرادات الشهرية", value: "15,000 ريال", trend: "up" }
      ]
    },
    {
      id: 2,
      name: "هيلث تك",
      logo: "https://placehold.co/100x100/10B981/FFFFFF?text=HT",
      industry: "الرعاية الصحية",
      stage: "بداية",
      cohort: "دفعة التقنيات الصحية 2024",
      description: "تطبيق للهواتف الذكية يساعد المرضى على إدارة أدويتهم ومواعيدهم الطبية",
      progress: 40,
      nextSession: "2025/03/18",
      lastSession: "2025/03/04",
      team: [
        { name: "خالد السعيد", role: "المؤسس والرئيس التنفيذي" },
        { name: "نورة العتيبي", role: "مدير التسويق" },
        { name: "فهد الدوسري", role: "مطور تطبيقات" }
      ],
      milestones: [
        { title: "تطوير النموذج الأولي", status: "completed", date: "2025/01/30" },
        { title: "اختبار المستخدم", status: "in_progress", date: "2025/03/15" },
        { title: "إطلاق النسخة التجريبية", status: "upcoming", date: "2025/04/01" },
        { title: "الحصول على موافقة الجهات التنظيمية", status: "upcoming", date: "2025/05/15" }
      ],
      challenges: [
        "الامتثال للوائح الرعاية الصحية",
        "بناء الثقة مع المستخدمين",
        "تكامل البيانات مع أنظمة المستشفيات"
      ],
      kpis: [
        { name: "عدد المستخدمين التجريبيين", value: "45", trend: "up" },
        { name: "معدل إكمال الاختبار", value: "80%", trend: "up" },
        { name: "تقييم المستخدمين", value: "4.2/5", trend: "stable" }
      ]
    },
    {
      id: 3,
      name: "فينتك",
      logo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=FT",
      industry: "التقنية المالية",
      stage: "توسع",
      cohort: "دفعة التقنية المالية 2024",
      description: "منصة للمدفوعات الإلكترونية تستهدف الشركات الصغيرة والمتوسطة في المنطقة",
      progress: 85,
      nextSession: "2025/03/22",
      lastSession: "2025/03/08",
      team: [
        { name: "عبدالله المالكي", role: "المؤسس والرئيس التنفيذي" },
        { name: "ريم القحطاني", role: "مدير العمليات" },
        { name: "سلطان العنزي", role: "مدير التقنية" },
        { name: "لمى الشمري", role: "مدير التسويق" }
      ],
      milestones: [
        { title: "إطلاق المنتج", status: "completed", date: "2024/10/15" },
        { title: "اكتساب 500 عميل", status: "completed", date: "2025/01/30" },
        { title: "التوسع في دول الخليج", status: "in_progress", date: "2025/04/01" },
        { title: "جمع الجولة الاستثمارية A", status: "upcoming", date: "2025/05/30" }
      ],
      challenges: [
        "المنافسة الشديدة في السوق",
        "الامتثال للوائح المالية المختلفة في كل دولة",
        "تحسين معدلات التحويل"
      ],
      kpis: [
        { name: "عدد العملاء", value: "580", trend: "up" },
        { name: "حجم المعاملات الشهرية", value: "2.5 مليون ريال", trend: "up" },
        { name: "معدل النمو الشهري", value: "15%", trend: "stable" }
      ]
    }
  ]

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.includes(searchQuery) || 
                          startup.industry.includes(searchQuery) ||
                          startup.description.includes(searchQuery) ||
                          startup.cohort.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "early") return matchesSearch && startup.stage === "بداية"
    if (activeTab === "growth") return matchesSearch && startup.stage === "نمو"
    if (activeTab === "expansion") return matchesSearch && startup.stage === "توسع"
    
    return matchesSearch
  })

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "بداية": return "bg-blue-100 text-blue-800"
      case "نمو": return "bg-green-100 text-green-800"
      case "توسع": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "upcoming": return "bg-purple-100 text-purple-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getMilestoneStatusText = (status: string) => {
    switch (status) {
      case "completed": return "مكتمل"
      case "in_progress": return "قيد التنفيذ"
      case "upcoming": return "قادم"
      case "overdue": return "متأخر"
      default: return "غير معروف"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down": return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
      case "stable": return <ChevronRight className="h-4 w-4 text-yellow-500" />
      default: return null
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">الشركات الناشئة</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{startups.length}</div>
            <p className="text-muted-foreground">إجمالي الشركات الناشئة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{startups.filter(s => s.nextSession).length}</div>
            <p className="text-muted-foreground">جلسات قادمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {Math.round(startups.reduce((acc, s) => acc + s.progress, 0) / startups.length)}%
            </div>
            <p className="text-muted-foreground">متوسط التقدم</p>
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
            <CardTitle>الشركات الناشئة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="expansion">مرحلة التوسع</TabsTrigger>
              <TabsTrigger value="growth">مرحلة النمو</TabsTrigger>
              <TabsTrigger value="early">مرحلة البداية</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredStartups.map((startup) => (
              <div key={startup.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs ${getStageColor(startup.stage)}`}>
                      {startup.stage}
                    </div>
                    <div className="flex items-center gap-4">
                      <h3 className="font-bold text-lg">{startup.name}</h3>
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src={startup.logo} 
                          alt={`شعار ${startup.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">المجال</div>
                      <div className="font-medium">{startup.industry}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">الدفعة</div>
                      <div className="font-medium">{startup.cohort}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">الجلسة القادمة</div>
                      <div className="font-medium">{startup.nextSession}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">الوصف</div>
                    <p className="text-muted-foreground">{startup.description}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">التقدم</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full bg-blue-500"
                        style={{ width: `${startup.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-left">{startup.progress}%</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="text-sm font-medium mb-2">فريق العمل</div>
                      <div className="space-y-2">
                        {startup.team.map((member, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">{member.role}</div>
                            <div className="font-medium">{member.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">المراحل الرئيسية</div>
                      <div className="space-y-2">
                        {startup.milestones.map((milestone, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className={`px-2 py-0.5 rounded text-xs ${getMilestoneStatusColor(milestone.status)}`}>
                              {getMilestoneStatusText(milestone.status)}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-muted-foreground">{milestone.date}</div>
                              <div className="font-medium text-sm">{milestone.title}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="text-sm font-medium mb-2">التحديات الرئيسية</div>
                      <ul className="list-disc list-inside space-y-1">
                        {startup.challenges.map((challenge, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{challenge}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">مؤشرات الأداء الرئيسية</div>
                      <div className="space-y-2">
                        {startup.kpis.map((kpi, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <div className="font-medium">{kpi.value}</div>
                              {getTrendIcon(kpi.trend)}
                            </div>
                            <div className="text-sm text-muted-foreground">{kpi.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>عرض التقارير</span>
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>مراسلة</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>جدولة جلسة</span>
                      </Button>
                      <Button variant="default" size="sm" className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        <span>عرض الملف الكامل</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredStartups.length === 0 && (
              <div className="text-center p-8 border rounded-lg">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد شركات ناشئة</h3>
                <p className="text-muted-foreground mb-4">لم يتم العثور على شركات ناشئة تطابق معايير البحث</p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveTab("all")
                  }}
                >
                  <Search className="h-4 w-4" />
                  <span>عرض جميع الشركات الناشئة</span>
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
