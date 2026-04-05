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
  Printer,
  RefreshCw,
  MapPin
} from "lucide-react"

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState("month")

  // Sample analytics data
  const analyticsData = {
    totalUsers: 1250,
    totalStartups: 320,
    totalInvestors: 85,
    totalMentors: 120,
    totalFunding: "25,000,000",
    totalPrograms: 15,
    activePrograms: 8,
    completedPrograms: 7,
    userGrowth: 12.5,
    startupGrowth: 8.3,
    fundingGrowth: 15.2,
    topSectors: [
      { name: "التقنية المالية", count: 65, percentage: 20 },
      { name: "الذكاء الاصطناعي", count: 58, percentage: 18 },
      { name: "التقنيات الصحية", count: 45, percentage: 14 },
      { name: "التجارة الإلكترونية", count: 42, percentage: 13 },
      { name: "التعليم التقني", count: 35, percentage: 11 }
    ],
    topCities: [
      { name: "الرياض", count: 180, percentage: 56 },
      { name: "جدة", count: 75, percentage: 23 },
      { name: "الدمام", count: 35, percentage: 11 },
      { name: "مكة", count: 20, percentage: 6 },
      { name: "المدينة", count: 10, percentage: 3 }
    ],
    monthlyUsers: [120, 145, 160, 185, 210, 250, 280, 310, 350, 390, 420, 450],
    monthlyStartups: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
    monthlyFunding: [1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.2, 3.5, 3.8, 4.0],
    userTypes: [
      { type: "شركات ناشئة", count: 320, percentage: 25.6 },
      { type: "مشاركون", count: 450, percentage: 36 },
      { type: "مستثمرون", count: 85, percentage: 6.8 },
      { type: "موجهون", count: 120, percentage: 9.6 },
      { type: "مديرو برامج", count: 45, percentage: 3.6 },
      { type: "مسرعات", count: 15, percentage: 1.2 },
      { type: "حاضنات", count: 10, percentage: 0.8 },
      { type: "آخرون", count: 205, percentage: 16.4 }
    ],
    fundingTypes: [
      { type: "تمويل أولي", count: 85, amount: "4,250,000", percentage: 17 },
      { type: "جولة أ", count: 45, amount: "9,000,000", percentage: 36 },
      { type: "جولة ب", count: 20, amount: "8,000,000", percentage: 32 },
      { type: "جولة ج", count: 5, amount: "3,750,000", percentage: 15 }
    ],
    fundingBySector: [
      { sector: "التقنية المالية", amount: "8,500,000", percentage: 34 },
      { sector: "الذكاء الاصطناعي", amount: "6,250,000", percentage: 25 },
      { sector: "التقنيات الصحية", amount: "4,500,000", percentage: 18 },
      { sector: "التجارة الإلكترونية", amount: "3,250,000", percentage: 13 },
      { sector: "التعليم التقني", amount: "2,500,000", percentage: 10 }
    ],
    programSuccess: [
      { program: "مسرع التقنية المالية", startups: 25, graduated: 22, funded: 18, success: 88 },
      { program: "مسرع الذكاء الاصطناعي", startups: 20, graduated: 18, funded: 15, success: 90 },
      { program: "حاضنة التقنيات الناشئة", startups: 30, graduated: 25, funded: 20, success: 83 },
      { program: "مسرع التقنيات الصحية", startups: 15, graduated: 12, funded: 10, success: 80 },
      { program: "حاضنة التعليم التقني", startups: 18, graduated: 15, funded: 12, success: 83 }
    ]
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>تصدير التقرير</span>
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
        <h1 className="text-3xl font-bold">لوحة التحليلات</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
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
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="funding">التمويل</TabsTrigger>
            <TabsTrigger value="programs">البرامج</TabsTrigger>
            <TabsTrigger value="startups">الشركات الناشئة</TabsTrigger>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>إجمالي المستخدمين</span>
                  <Users className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+{analyticsData.userGrowth}% من الشهر السابق</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>الشركات الناشئة</span>
                  <Building className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalStartups.toLocaleString()}</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+{analyticsData.startupGrowth}% من الشهر السابق</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>إجمالي التمويل</span>
                  <DollarSign className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalFunding} ريال</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+{analyticsData.fundingGrowth}% من الشهر السابق</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>البرامج النشطة</span>
                  <Layers className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.activePrograms}/{analyticsData.totalPrograms}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {analyticsData.completedPrograms} برامج مكتملة
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>نمو المستخدمين</span>
                  <LineChart className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-end justify-between gap-2 pt-10 pb-5">
                  {analyticsData.monthlyUsers.map((value, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-8 bg-primary rounded-t-md" 
                        style={{ height: `${(value / Math.max(...analyticsData.monthlyUsers)) * 100}%` }}
                      ></div>
                      <span className="text-xs">{['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][index]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>توزيع المستخدمين حسب النوع</span>
                  <PieChart className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.userTypes.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className={`w-${12 - index} h-3 rounded-full ml-2`}
                          style={{ 
                            backgroundColor: [
                              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                              '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'
                            ][index % 8]
                          }}
                        ></div>
                        <span className="text-lg font-bold">{item.count}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">{item.type}</span>
                        <span className="text-xs text-muted-foreground mr-2">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>توزيع الشركات الناشئة حسب القطاع</span>
                  <PieChart className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topSectors.map((sector, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="h-3 rounded-full ml-2"
                          style={{ 
                            width: `${sector.percentage / 2}rem`,
                            backgroundColor: [
                              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                            ][index % 5]
                          }}
                        ></div>
                        <span className="text-lg font-bold">{sector.count}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">{sector.name}</span>
                        <span className="text-xs text-muted-foreground mr-2">({sector.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>توزيع الشركات الناشئة حسب المدينة</span>
                  <MapPin className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topCities.map((city, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="h-3 rounded-full ml-2"
                          style={{ 
                            width: `${city.percentage / 5}rem`,
                            backgroundColor: [
                              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                            ][index % 5]
                          }}
                        ></div>
                        <span className="text-lg font-bold">{city.count}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">{city.name}</span>
                        <span className="text-xs text-muted-foreground mr-2">({city.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "startups" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>إجمالي الشركات الناشئة</span>
                  <Building className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalStartups.toLocaleString()}</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+{analyticsData.startupGrowth}% من الشهر السابق</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>الشركات الممولة</span>
                  <DollarSign className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">155</div>
                <div className="text-sm text-muted-foreground mt-1">
                  48.4% من إجمالي الشركات
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>متوسط التقييم</span>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.2 مليون ريال</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+12% من العام السابق</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>نمو الشركات الناشئة</span>
                <LineChart className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 flex items-end justify-between gap-2 pt-10 pb-5">
                {analyticsData.monthlyStartups.map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 bg-primary rounded-t-md" 
                      style={{ height: `${(value / Math.max(...analyticsData.monthlyStartups)) * 100}%` }}
                    ></div>
                    <span className="text-xs">{['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][index]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>توزيع الشركات الناشئة حسب القطاع</span>
                  <PieChart className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topSectors.map((sector, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="h-3 rounded-full ml-2"
                          style={{ 
                            width: `${sector.percentage / 2}rem`,
                            backgroundColor: [
                              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                            ][index % 5]
                          }}
                        ></div>
                        <span className="text-lg font-bold">{sector.count}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">{sector.name}</span>
                        <span className="text-xs text-muted-foreground mr-2">({sector.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>توزيع الشركات الناشئة حسب المرحلة</span>
                  <Target className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-3 bg-blue-500 rounded-full ml-2"></div>
                      <span className="text-lg font-bold">128</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground">مرحلة الفكرة</span>
                      <span className="text-xs text-muted-foreground mr-2">(40%)</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-3 bg-green-500 rounded-full ml-2"></div>
                      <span className="text-lg font-bold">96</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground">نموذج أولي</span>
                      <span className="text-xs text-muted-foreground mr-2">(30%)</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-6 h-3 bg-amber-500 rounded-full ml-2"></div>
                      <span className="text-lg font-bold">64</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground">نمو مبكر</span>
                      <span className="text-xs text-muted-foreground mr-2">(20%)</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full ml-2"></div>
                      <span className="text-lg font-bold">32</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground">توسع</span>
                      <span className="text-xs text-muted-foreground mr-2">(10%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "funding" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>إجمالي التمويل</span>
                  <DollarSign className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalFunding} ريال</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+{analyticsData.fundingGrowth}% من الشهر السابق</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>عدد صفقات التمويل</span>
                  <Layers className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">155</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+8% من الشهر السابق</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>متوسط التمويل</span>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">161,290 ريال</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+5% من الشهر السابق</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>نمو التمويل الشهري (بالمليون ريال)</span>
                <LineChart className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 flex items-end justify-between gap-2 pt-10 pb-5">
                {analyticsData.monthlyFunding.map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 bg-primary rounded-t-md" 
                      style={{ height: `${(value / Math.max(...analyticsData.monthlyFunding)) * 100}%` }}
                    ></div>
                    <span className="text-xs">{['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][index]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>توزيع التمويل حسب النوع</span>
                  <PieChart className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.fundingTypes.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="h-3 rounded-full ml-2"
                          style={{ 
                            width: `${item.percentage / 3}rem`,
                            backgroundColor: [
                              '#3b82f6', '#10b981', '#f59e0b', '#ef4444'
                            ][index % 4]
                          }}
                        ></div>
                        <span className="text-lg font-bold">{item.amount} ريال</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">{item.type} ({item.count} صفقة)</span>
                        <span className="text-xs text-muted-foreground mr-2">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>توزيع التمويل حسب القطاع</span>
                  <PieChart className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.fundingBySector.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.sector}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">{item.amount} ريال</span>
                        <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
