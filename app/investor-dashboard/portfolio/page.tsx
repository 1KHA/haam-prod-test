"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  DollarSign, 
  FileText, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CheckCircle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertCircle,
  Briefcase,
  TrendingUp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
  Users,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PieChart,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ExternalLink,
  Download
} from "lucide-react"

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")

  const investments = [
    {
      id: 1,
      startupName: "تك سمارت",
      logo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      industry: "التكنولوجيا المالية",
      stage: "جولة أولى",
      amount: "500,000 ريال",
      equity: "5%",
      valuation: "10,000,000 ريال",
      status: "active",
      investmentDate: "2025/02/15",
      currentValue: "550,000 ريال",
      roi: "+10%",
      performance: "up",
      lastUpdate: "2025/03/01"
    },
    {
      id: 2,
      startupName: "هيلث تك",
      logo: "https://placehold.co/100x100/10B981/FFFFFF?text=HT",
      industry: "التكنولوجيا الصحية",
      stage: "تمويل أولي",
      amount: "300,000 ريال",
      equity: "7.5%",
      valuation: "4,000,000 ريال",
      status: "active",
      investmentDate: "2025/03/01",
      currentValue: "315,000 ريال",
      roi: "+5%",
      performance: "up",
      lastUpdate: "2025/03/10"
    },
    {
      id: 3,
      startupName: "إيكو سمارت",
      logo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=ES",
      industry: "التكنولوجيا الخضراء",
      stage: "جولة أولى",
      amount: "750,000 ريال",
      equity: "6%",
      valuation: "12,500,000 ريال",
      status: "active",
      investmentDate: "2024/10/15",
      currentValue: "900,000 ريال",
      roi: "+20%",
      performance: "up",
      lastUpdate: "2025/03/01"
    },
    {
      id: 4,
      startupName: "ديليفر ناو",
      logo: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=DN",
      industry: "التجارة الإلكترونية",
      stage: "جولة ثانية",
      amount: "1,200,000 ريال",
      equity: "4%",
      valuation: "30,000,000 ريال",
      status: "active",
      investmentDate: "2024/08/10",
      currentValue: "1,140,000 ريال",
      roi: "-5%",
      performance: "down",
      lastUpdate: "2025/03/01"
    },
    {
      id: 5,
      startupName: "سمارت هوم",
      logo: "https://placehold.co/100x100/EC4899/FFFFFF?text=SH",
      industry: "إنترنت الأشياء",
      stage: "جولة أولى",
      amount: "600,000 ريال",
      equity: "8%",
      valuation: "7,500,000 ريال",
      status: "exited",
      investmentDate: "2023/05/20",
      exitDate: "2024/11/15",
      currentValue: "900,000 ريال",
      roi: "+50%",
      performance: "up",
      lastUpdate: "2024/11/15"
    }
  ]

  const categories = [
    { id: "all", name: "جميع القطاعات" },
    { id: "fintech", name: "التكنولوجيا المالية" },
    { id: "healthtech", name: "التكنولوجيا الصحية" },
    { id: "greentech", name: "التكنولوجيا الخضراء" },
    { id: "ecommerce", name: "التجارة الإلكترونية" },
    { id: "iot", name: "إنترنت الأشياء" }
  ]

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.startupName.includes(searchQuery) || 
                          investment.industry.includes(searchQuery)
    
    const matchesCategory = activeCategory === "all" || 
                           (activeCategory === "fintech" && investment.industry === "التكنولوجيا المالية") ||
                           (activeCategory === "healthtech" && investment.industry === "التكنولوجيا الصحية") ||
                           (activeCategory === "greentech" && investment.industry === "التكنولوجيا الخضراء") ||
                           (activeCategory === "ecommerce" && investment.industry === "التجارة الإلكترونية") ||
                           (activeCategory === "iot" && investment.industry === "إنترنت الأشياء")
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && investment.status === "active") ||
                      (activeTab === "exited" && investment.status === "exited")
    
    return matchesSearch && matchesCategory && matchesTab
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "غير محدد"
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const totalInvestment = investments.reduce((acc, investment) => acc + parseInt(investment.amount.replace(/[^0-9]/g, '')), 0)
  const totalCurrentValue = investments.reduce((acc, investment) => acc + parseInt(investment.currentValue.replace(/[^0-9]/g, '')), 0)
  const totalROI = ((totalCurrentValue - totalInvestment) / totalInvestment * 100).toFixed(2)

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">المحفظة الاستثمارية</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">
              {totalInvestment.toLocaleString()} ريال
            </div>
            <p className="text-muted-foreground">إجمالي الاستثمارات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Briefcase className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {totalCurrentValue.toLocaleString()} ريال
            </div>
            <p className="text-muted-foreground">القيمة الحالية</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {totalROI}%
            </div>
            <p className="text-muted-foreground">العائد على الاستثمار</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
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
              <CardTitle>استثماراتي</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="justify-end">
                <TabsTrigger value="exited">المخارج</TabsTrigger>
                <TabsTrigger value="active">النشطة</TabsTrigger>
                <TabsTrigger value="all">الكل</TabsTrigger>
              </TabsList>
              
              <div className="flex justify-end gap-2 mb-4">
                {categories.map(category => (
                  <Button 
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-4">
                {filteredInvestments.length > 0 ? (
                  filteredInvestments.map((investment) => (
                    <Card key={investment.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                  {investment.industry}
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {investment.stage}
                                </div>
                                {investment.status === "exited" && (
                                  <div className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    تم التخارج
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div>
                                  <h3 className="font-bold text-lg">{investment.startupName}</h3>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(investment.investmentDate)}
                                    {investment.exitDate && ` - ${formatDate(investment.exitDate)}`}
                                  </div>
                                </div>
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                  <img 
                                    src={investment.logo} 
                                    alt={`شعار ${investment.startupName}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div className="flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">مبلغ الاستثمار</div>
                                  <div className="font-medium">{investment.amount}</div>
                                </div>
                                <DollarSign className="h-5 w-5 text-green-500" />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">نسبة الملكية</div>
                                  <div className="font-medium">{investment.equity}</div>
                                </div>
                                <Users className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">القيمة الحالية</div>
                                  <div className="font-medium">{investment.currentValue}</div>
                                </div>
                                <Briefcase className="h-5 w-5 text-purple-500" />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">العائد</div>
                                  <div className={`font-medium flex items-center gap-1 ${
                                    investment.performance === "up" ? "text-green-500" : "text-red-500"
                                  }`}>
                                    {investment.roi}
                                    {investment.performance === "up" ? 
                                      <ArrowUpRight className="h-4 w-4" /> : 
                                      <ArrowDownRight className="h-4 w-4" />
                                    }
                                  </div>
                                </div>
                                <TrendingUp className={`h-5 w-5 ${
                                  investment.performance === "up" ? "text-green-500" : "text-red-500"
                                }`} />
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>عرض التفاصيل</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد استثمارات</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على استثمارات تطابق معايير البحث</p>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 mx-auto"
                      onClick={() => {
                        setSearchQuery("")
                        setActiveCategory("all")
                        setActiveTab("all")
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span>عرض جميع الاستثمارات</span>
                    </Button>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-right">توزيع المحفظة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium text-right">حسب القطاع</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-sm font-medium min-w-[100px] text-right">التكنولوجيا المالية</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm font-medium min-w-[100px] text-right">التكنولوجيا الصحية</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-medium min-w-[100px] text-right">التكنولوجيا الخضراء</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm font-medium min-w-[100px] text-right">التجارة الإلكترونية</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full" style={{ width: '5%' }}></div>
                    </div>
                    <span className="text-sm font-medium min-w-[100px] text-right">إنترنت الأشياء</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-right">حسب مرحلة النمو</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium min-w-[100px] text-right">جولة أولى</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full" style={{ width: '30%' }}></div>
                    </div>
                    <span className="text-sm font-medium min-w-[100px] text-right">تمويل أولي</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full max-w-[180px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm font-medium min-w-[100px] text-right">جولة ثانية</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>تحميل تقرير المحفظة</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
