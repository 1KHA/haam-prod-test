"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Tag,
  ChevronRight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Star,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  StarOff,
  Briefcase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MapPin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  PieChart,
  LineChart
} from "lucide-react"

export default function PerformancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [activeTimeframe, setActiveTimeframe] = useState("yearly")

  // Sample performance data
  const performanceData = {
    overview: {
      totalInvestments: 8,
      activeInvestments: 6,
      exitedInvestments: 2,
      totalInvested: "12,500,000 ريال",
      currentValue: "18,750,000 ريال",
      totalReturn: "+50%",
      avgHoldingPeriod: "24 شهر",
      successRate: "75%"
    },
    startups: [
      {
        id: 1,
        name: "تك سمارت",
        sector: "التكنولوجيا المالية",
        stage: "جولة ثانية",
        investmentDate: "يناير 2023",
        investmentAmount: "2,000,000 ريال",
        currentValue: "3,600,000 ريال",
        roi: "+80%",
        roiTrend: "up",
        status: "نشط",
        kpis: {
          revenue: "5,000,000 ريال سنويًا",
          growth: "+40% سنويًا",
          users: "50,000 مستخدم",
          burn: "200,000 ريال شهريًا",
          runway: "18 شهر"
        },
        milestones: [
          { name: "إطلاق المنتج", status: "مكتمل", date: "مارس 2023" },
          { name: "10,000 مستخدم", status: "مكتمل", date: "يوليو 2023" },
          { name: "إطلاق خدمة جديدة", status: "مكتمل", date: "نوفمبر 2023" },
          { name: "التوسع الإقليمي", status: "قيد التنفيذ", date: "يونيو 2025" },
          { name: "100,000 مستخدم", status: "قادم", date: "ديسمبر 2025" }
        ],
        image: "https://placehold.co/600x400/e9ecef/495057?text=تك+سمارت"
      },
      {
        id: 2,
        name: "هيلث تك",
        sector: "التكنولوجيا الصحية",
        stage: "جولة أولى",
        investmentDate: "مارس 2023",
        investmentAmount: "1,500,000 ريال",
        currentValue: "2,250,000 ريال",
        roi: "+50%",
        roiTrend: "up",
        status: "نشط",
        kpis: {
          revenue: "3,000,000 ريال سنويًا",
          growth: "+30% سنويًا",
          users: "20,000 مستخدم",
          burn: "150,000 ريال شهريًا",
          runway: "12 شهر"
        },
        milestones: [
          { name: "إطلاق المنتج", status: "مكتمل", date: "مايو 2023" },
          { name: "5,000 مستخدم", status: "مكتمل", date: "سبتمبر 2023" },
          { name: "شراكة مع المستشفيات", status: "قيد التنفيذ", date: "أبريل 2025" },
          { name: "50,000 مستخدم", status: "قادم", date: "ديسمبر 2025" }
        ],
        image: "https://placehold.co/600x400/e9ecef/495057?text=هيلث+تك"
      },
      {
        id: 3,
        name: "إيكو سمارت",
        sector: "التكنولوجيا الخضراء",
        stage: "جولة ثالثة",
        investmentDate: "يونيو 2022",
        investmentAmount: "3,000,000 ريال",
        currentValue: "6,000,000 ريال",
        roi: "+100%",
        roiTrend: "up",
        status: "نشط",
        kpis: {
          revenue: "10,000,000 ريال سنويًا",
          growth: "+50% سنويًا",
          clients: "30 عميل تجاري",
          burn: "300,000 ريال شهريًا",
          runway: "24 شهر"
        },
        milestones: [
          { name: "إطلاق المنتج", status: "مكتمل", date: "أغسطس 2022" },
          { name: "10 عملاء تجاريين", status: "مكتمل", date: "ديسمبر 2022" },
          { name: "توفير 1 مليون كيلوواط", status: "مكتمل", date: "يونيو 2023" },
          { name: "التوسع الإقليمي", status: "قيد التنفيذ", date: "مارس 2025" },
          { name: "50 عميل تجاري", status: "قادم", date: "ديسمبر 2025" }
        ],
        image: "https://placehold.co/600x400/e9ecef/495057?text=إيكو+سمارت"
      },
      {
        id: 4,
        name: "ديليفر ناو",
        sector: "التجارة الإلكترونية",
        stage: "تمويل أولي",
        investmentDate: "سبتمبر 2023",
        investmentAmount: "1,000,000 ريال",
        currentValue: "900,000 ريال",
        roi: "-10%",
        roiTrend: "down",
        status: "نشط",
        kpis: {
          revenue: "1,200,000 ريال سنويًا",
          growth: "+10% سنويًا",
          orders: "5,000 طلب شهريًا",
          burn: "120,000 ريال شهريًا",
          runway: "6 شهر"
        },
        milestones: [
          { name: "إطلاق المنتج", status: "مكتمل", date: "أكتوبر 2023" },
          { name: "1,000 طلب شهريًا", status: "مكتمل", date: "ديسمبر 2023" },
          { name: "التوسع لمدينة ثانية", status: "متأخر", date: "مارس 2025" },
          { name: "10,000 طلب شهريًا", status: "قادم", date: "يونيو 2025" }
        ],
        image: "https://placehold.co/600x400/e9ecef/495057?text=ديليفر+ناو"
      },
      {
        id: 5,
        name: "إيدو تك",
        sector: "تكنولوجيا التعليم",
        stage: "جولة أولى",
        investmentDate: "نوفمبر 2022",
        investmentAmount: "2,000,000 ريال",
        currentValue: "3,000,000 ريال",
        roi: "+50%",
        roiTrend: "up",
        status: "نشط",
        kpis: {
          revenue: "4,000,000 ريال سنويًا",
          growth: "+35% سنويًا",
          users: "30,000 مستخدم",
          burn: "180,000 ريال شهريًا",
          runway: "15 شهر"
        },
        milestones: [
          { name: "إطلاق المنتج", status: "مكتمل", date: "يناير 2023" },
          { name: "10,000 مستخدم", status: "مكتمل", date: "مايو 2023" },
          { name: "إطلاق منهج جديد", status: "مكتمل", date: "سبتمبر 2023" },
          { name: "50,000 مستخدم", status: "قيد التنفيذ", date: "يونيو 2025" },
          { name: "التوسع الإقليمي", status: "قادم", date: "ديسمبر 2025" }
        ],
        image: "https://placehold.co/600x400/e9ecef/495057?text=إيدو+تك"
      },
      {
        id: 6,
        name: "سمارت هوم",
        sector: "إنترنت الأشياء",
        stage: "تمويل أولي",
        investmentDate: "فبراير 2024",
        investmentAmount: "1,000,000 ريال",
        currentValue: "1,200,000 ريال",
        roi: "+20%",
        roiTrend: "up",
        status: "نشط",
        kpis: {
          revenue: "800,000 ريال سنويًا",
          growth: "+25% سنويًا",
          users: "2,000 مستخدم",
          burn: "100,000 ريال شهريًا",
          runway: "8 شهر"
        },
        milestones: [
          { name: "إطلاق المنتج", status: "مكتمل", date: "مارس 2024" },
          { name: "1,000 مستخدم", status: "مكتمل", date: "مايو 2024" },
          { name: "إطلاق منتج جديد", status: "قيد التنفيذ", date: "أبريل 2025" },
          { name: "5,000 مستخدم", status: "قادم", date: "ديسمبر 2025" }
        ],
        image: "https://placehold.co/600x400/e9ecef/495057?text=سمارت+هوم"
      },
      {
        id: 7,
        name: "فينتك",
        sector: "التكنولوجيا المالية",
        stage: "جولة أولى",
        investmentDate: "مارس 2022",
        investmentAmount: "1,500,000 ريال",
        currentValue: "0 ريال",
        roi: "-100%",
        roiTrend: "down",
        status: "متوقف",
        kpis: {
          revenue: "0 ريال سنويًا",
          growth: "0% سنويًا",
          users: "0 مستخدم",
          burn: "0 ريال شهريًا",
          runway: "0 شهر"
        },
        milestones: [
          { name: "إطلاق المنتج", status: "مكتمل", date: "مايو 2022" },
          { name: "1,000 مستخدم", status: "مكتمل", date: "يوليو 2022" },
          { name: "5,000 مستخدم", status: "غير مكتمل", date: "ديسمبر 2022" },
          { name: "التوسع الإقليمي", status: "غير مكتمل", date: "يونيو 2023" }
        ],
        image: "https://placehold.co/600x400/e9ecef/495057?text=فينتك"
      },
      {
        id: 8,
        name: "لوجيستكس",
        sector: "التكنولوجيا اللوجستية",
        stage: "جولة أولى",
        investmentDate: "يناير 2021",
        investmentAmount: "1,500,000 ريال",
        currentValue: "3,000,000 ريال",
        roi: "+100%",
        roiTrend: "up",
        status: "تم التخارج",
        exitDate: "ديسمبر 2023",
        exitMultiple: "2x",
        kpis: {
          revenue: "8,000,000 ريال سنويًا",
          growth: "+40% سنويًا",
          clients: "50 عميل تجاري",
          burn: "0 ريال شهريًا",
          runway: "غير متاح"
        },
        milestones: [
          { name: "إطلاق المنتج", status: "مكتمل", date: "مارس 2021" },
          { name: "10 عملاء تجاريين", status: "مكتمل", date: "يونيو 2021" },
          { name: "التوسع الإقليمي", status: "مكتمل", date: "يناير 2022" },
          { name: "50 عميل تجاري", status: "مكتمل", date: "يونيو 2023" },
          { name: "الاستحواذ", status: "مكتمل", date: "ديسمبر 2023" }
        ],
        image: "https://placehold.co/600x400/e9ecef/495057?text=لوجيستكس"
      }
    ]
  }

  const filteredStartups = performanceData.startups.filter(startup => 
    startup.name.includes(searchQuery) || 
    startup.sector.includes(searchQuery)
  )

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">أداء الشركات الناشئة</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن شركة ناشئة..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exits">التخارجات</TabsTrigger>
            <TabsTrigger value="startups">الشركات الناشئة</TabsTrigger>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Briefcase className="h-8 w-8 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">
                  {performanceData.overview.totalInvestments}
                </div>
                <p className="text-muted-foreground">إجمالي الاستثمارات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                <div className="text-2xl font-bold">
                  {performanceData.overview.totalInvested}
                </div>
                <p className="text-muted-foreground">إجمالي المبلغ المستثمر</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
                <div className="text-2xl font-bold">
                  {performanceData.overview.currentValue}
                </div>
                <p className="text-muted-foreground">القيمة الحالية</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Activity className="h-8 w-8 text-amber-500 mb-2" />
                <div className="text-2xl font-bold">
                  {performanceData.overview.totalReturn}
                </div>
                <p className="text-muted-foreground">العائد الإجمالي</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">توزيع المحفظة حسب القطاع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center">
                <PieChart className="h-8 w-8 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">الرسم البياني لتوزيع المحفظة حسب القطاع</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">أداء الاستثمارات حسب القطاع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">الرسم البياني لأداء الاستثمارات حسب القطاع</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-right">تطور قيمة المحفظة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center">
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">الرسم البياني لتطور قيمة المحفظة</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "startups" && (
        <div className="space-y-6">
          <div className="flex justify-end gap-2 mb-4">
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
          </div>

          <div className="space-y-6">
            {filteredStartups.filter(startup => startup.status === "نشط").length > 0 ? (
              filteredStartups.filter(startup => startup.status === "نشط").map(startup => (
                <Card key={startup.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4">
                      <img 
                        src={startup.image} 
                        alt={startup.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="w-full md:w-3/4">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {startup.sector}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                              {startup.stage}
                            </span>
                          </div>
                          <CardTitle className="text-xl">{startup.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">تاريخ الاستثمار</div>
                            <div className="text-sm font-medium">{startup.investmentDate}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">مبلغ الاستثمار</div>
                            <div className="text-sm font-medium">{startup.investmentAmount}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">القيمة الحالية</div>
                            <div className="text-sm font-medium">{startup.currentValue}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">العائد على الاستثمار</div>
                            <div className="flex items-center">
                              {startup.roiTrend === "up" ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                startup.roiTrend === "up" ? "text-green-500" : "text-red-500"
                              }`}>
                                {startup.roi}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-2">مؤشرات الأداء الرئيسية</div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>{startup.kpis.revenue}</span>
                                <span className="text-muted-foreground">الإيرادات:</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{startup.kpis.growth}</span>
                                <span className="text-muted-foreground">النمو:</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{startup.kpis.users || startup.kpis.clients}</span>
                                <span className="text-muted-foreground">{startup.kpis.users ? "المستخدمون:" : "العملاء:"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{startup.kpis.burn}</span>
                                <span className="text-muted-foreground">معدل الحرق:</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{startup.kpis.runway}</span>
                                <span className="text-muted-foreground">فترة الاستمرارية:</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">المراحل الرئيسية</div>
                            <div className="space-y-2 text-sm">
                              {startup.milestones.slice(0, 5).map((milestone, index) => (
                                <div key={index} className="flex justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{milestone.date}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      milestone.status === "مكتمل" ? "bg-green-100 text-green-800" :
                                      milestone.status === "قيد التنفيذ" ? "bg-blue-100 text-blue-800" :
                                      milestone.status === "قادم" ? "bg-gray-100 text-gray-800" :
                                      milestone.status === "متأخر" ? "bg-red-100 text-red-800" :
                                      "bg-gray-100 text-gray-800"
                                    }`}>
                                      {milestone.status}
                                    </span>
                                  </div>
                                  <span>{milestone.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                          تقرير مفصل
                        </Button>
                        <Button>
                          عرض التفاصيل
                          <ChevronRight className="h-4 w-4 mr-1" />
                        </Button>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">لا توجد شركات ناشئة نشطة مطابقة لبحثك</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "exits" && (
        <div className="space-y-6">
          {filteredStartups.filter(startup => startup.status === "تم التخارج" || startup.status === "متوقف").length > 0 ? (
            filteredStartups.filter(startup => startup.status === "تم التخارج" || startup.status === "متوقف").map(startup => (
              <Card key={startup.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/4">
                    <img 
                      src={startup.image} 
                      alt={startup.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="w-full md:w-3/4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {startup.sector}
                          </span>
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            startup.status === "تم التخارج" 
                              ? "bg-green-50 text-green-700 ring-green-700/10" 
                              : "bg-red-50 text-red-700 ring-red-700/10"
                          }`}>
                            {startup.status}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{startup.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">تاريخ الاستثمار</div>
                          <div className="text-sm font-medium">{startup.investmentDate}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">مبلغ الاستثمار</div>
                          <div className="text-sm font-medium">{startup.investmentAmount}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">القيمة الحالية</div>
                          <div className="text-sm font-medium">{startup.currentValue}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">العائد</div>
                          <div className="text-sm font-medium text-green-600">{startup.roi}</div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد شركات ناشئة خرجت</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
