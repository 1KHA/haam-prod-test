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
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Users
} from "lucide-react"

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("performance")
  const [activeTimeframe, setActiveTimeframe] = useState("yearly")

  const performanceData = {
    yearly: {
      totalInvestment: "3,350,000 ريال",
      currentValue: "3,805,000 ريال",
      roi: "+13.58%",
      roiTrend: "up",
      investmentCount: 5,
      activeInvestments: 4,
      exitedInvestments: 1,
      avgHoldingPeriod: "18 شهر",
      topPerformer: {
        name: "إيكو سمارت",
        roi: "+20%",
        sector: "التكنولوجيا الخضراء"
      },
      worstPerformer: {
        name: "ديليفر ناو",
        roi: "-5%",
        sector: "التجارة الإلكترونية"
      },
      sectorPerformance: [
        { name: "التكنولوجيا المالية", roi: "+10%", allocation: "40%" },
        { name: "التكنولوجيا الصحية", roi: "+5%", allocation: "25%" },
        { name: "التكنولوجيا الخضراء", roi: "+20%", allocation: "20%" },
        { name: "التجارة الإلكترونية", roi: "-5%", allocation: "10%" },
        { name: "إنترنت الأشياء", roi: "+50%", allocation: "5%" }
      ],
      stagePerformance: [
        { name: "تمويل أولي", roi: "+5%", allocation: "30%" },
        { name: "جولة أولى", roi: "+18%", allocation: "60%" },
        { name: "جولة ثانية", roi: "-5%", allocation: "10%" }
      ],
      monthlyPerformance: [
        { month: "يناير", value: 3400000 },
        { month: "فبراير", value: 3450000 },
        { month: "مارس", value: 3500000 },
        { month: "أبريل", value: 3520000 },
        { month: "مايو", value: 3550000 },
        { month: "يونيو", value: 3600000 },
        { month: "يوليو", value: 3650000 },
        { month: "أغسطس", value: 3680000 },
        { month: "سبتمبر", value: 3700000 },
        { month: "أكتوبر", value: 3720000 },
        { month: "نوفمبر", value: 3750000 },
        { month: "ديسمبر", value: 3805000 }
      ]
    },
    quarterly: {
      totalInvestment: "3,350,000 ريال",
      currentValue: "3,805,000 ريال",
      roi: "+3.2%",
      roiTrend: "up",
      investmentCount: 5,
      activeInvestments: 4,
      exitedInvestments: 1,
      avgHoldingPeriod: "18 شهر",
      topPerformer: {
        name: "إيكو سمارت",
        roi: "+5%",
        sector: "التكنولوجيا الخضراء"
      },
      worstPerformer: {
        name: "ديليفر ناو",
        roi: "-2%",
        sector: "التجارة الإلكترونية"
      },
      sectorPerformance: [
        { name: "التكنولوجيا المالية", roi: "+3%", allocation: "40%" },
        { name: "التكنولوجيا الصحية", roi: "+2%", allocation: "25%" },
        { name: "التكنولوجيا الخضراء", roi: "+5%", allocation: "20%" },
        { name: "التجارة الإلكترونية", roi: "-2%", allocation: "10%" },
        { name: "إنترنت الأشياء", roi: "+4%", allocation: "5%" }
      ],
      stagePerformance: [
        { name: "تمويل أولي", roi: "+2%", allocation: "30%" },
        { name: "جولة أولى", roi: "+4%", allocation: "60%" },
        { name: "جولة ثانية", roi: "-2%", allocation: "10%" }
      ],
      monthlyPerformance: [
        { month: "يناير", value: 3680000 },
        { month: "فبراير", value: 3720000 },
        { month: "مارس", value: 3805000 }
      ]
    }
  }

  const comparisonData = {
    yearly: {
      benchmarks: [
        { name: "مؤشر الشركات الناشئة", performance: "+8.5%", portfolioPerformance: "+13.58%", difference: "+5.08%" },
        { name: "مؤشر التكنولوجيا", performance: "+12%", portfolioPerformance: "+13.58%", difference: "+1.58%" },
        { name: "مؤشر السوق العام", performance: "+6%", portfolioPerformance: "+13.58%", difference: "+7.58%" }
      ],
      peerComparison: [
        { name: "متوسط المستثمرين الملاك", performance: "+7%", portfolioPerformance: "+13.58%", difference: "+6.58%" },
        { name: "صناديق رأس المال الجريء", performance: "+15%", portfolioPerformance: "+13.58%", difference: "-1.42%" },
        { name: "مسرعات الأعمال", performance: "+10%", portfolioPerformance: "+13.58%", difference: "+3.58%" }
      ],
      historicalComparison: [
        { year: "2022", performance: "+5%" },
        { year: "2023", performance: "+8%" },
        { year: "2024", performance: "+10%" },
        { year: "2025", performance: "+13.58%" }
      ]
    },
    quarterly: {
      benchmarks: [
        { name: "مؤشر الشركات الناشئة", performance: "+2.1%", portfolioPerformance: "+3.2%", difference: "+1.1%" },
        { name: "مؤشر التكنولوجيا", performance: "+3.5%", portfolioPerformance: "+3.2%", difference: "-0.3%" },
        { name: "مؤشر السوق العام", performance: "+1.5%", portfolioPerformance: "+3.2%", difference: "+1.7%" }
      ],
      peerComparison: [
        { name: "متوسط المستثمرين الملاك", performance: "+1.8%", portfolioPerformance: "+3.2%", difference: "+1.4%" },
        { name: "صناديق رأس المال الجريء", performance: "+4%", portfolioPerformance: "+3.2%", difference: "-0.8%" },
        { name: "مسرعات الأعمال", performance: "+2.5%", portfolioPerformance: "+3.2%", difference: "+0.7%" }
      ],
      historicalComparison: [
        { quarter: "Q2 2024", performance: "+2.5%" },
        { quarter: "Q3 2024", performance: "+2.8%" },
        { quarter: "Q4 2024", performance: "+3%" },
        { quarter: "Q1 2025", performance: "+3.2%" }
      ]
    }
  }

  const forecastData = {
    yearly: {
      portfolioForecast: [
        { year: "2025", value: 3805000 },
        { year: "2026", value: 4300000 },
        { year: "2027", value: 4900000 },
        { year: "2028", value: 5600000 }
      ],
      expectedReturns: [
        { year: "2025", value: "+13.58%" },
        { year: "2026", value: "+13%" },
        { year: "2027", value: "+14%" },
        { year: "2028", value: "+14.5%" }
      ],
      exitOpportunities: [
        { name: "إيكو سمارت", expectedYear: "2026", expectedMultiple: "2.5x" },
        { name: "تك سمارت", expectedYear: "2027", expectedMultiple: "3x" }
      ],
      marketTrends: [
        { sector: "التكنولوجيا المالية", trend: "+15%", recommendation: "زيادة التخصيص" },
        { sector: "التكنولوجيا الصحية", trend: "+20%", recommendation: "زيادة التخصيص" },
        { sector: "التكنولوجيا الخضراء", trend: "+25%", recommendation: "الحفاظ على التخصيص" },
        { sector: "التجارة الإلكترونية", trend: "+8%", recommendation: "تقليل التخصيص" },
        { sector: "إنترنت الأشياء", trend: "+18%", recommendation: "زيادة التخصيص" }
      ]
    },
    quarterly: {
      portfolioForecast: [
        { quarter: "Q1 2025", value: 3805000 },
        { quarter: "Q2 2025", value: 3900000 },
        { quarter: "Q3 2025", value: 4000000 },
        { quarter: "Q4 2025", value: 4100000 }
      ],
      expectedReturns: [
        { quarter: "Q1 2025", value: "+3.2%" },
        { quarter: "Q2 2025", value: "+2.5%" },
        { quarter: "Q3 2025", value: "+2.8%" },
        { quarter: "Q4 2025", value: "+2.5%" }
      ],
      exitOpportunities: [],
      marketTrends: [
        { sector: "التكنولوجيا المالية", trend: "+4%", recommendation: "زيادة التخصيص" },
        { sector: "التكنولوجيا الصحية", trend: "+5%", recommendation: "زيادة التخصيص" },
        { sector: "التكنولوجيا الخضراء", trend: "+6%", recommendation: "الحفاظ على التخصيص" },
        { sector: "التجارة الإلكترونية", trend: "+2%", recommendation: "تقليل التخصيص" },
        { sector: "إنترنت الأشياء", trend: "+4.5%", recommendation: "زيادة التخصيص" }
      ]
    }
  }

  const getActiveData = () => {
    if (activeTab === "performance") {
      return performanceData[activeTimeframe]
    } else if (activeTab === "comparison") {
      return comparisonData[activeTimeframe]
    } else if (activeTab === "forecast") {
      return forecastData[activeTimeframe]
    }
    return performanceData[activeTimeframe]
  }

  const data = getActiveData()

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">تحليلات الاستثمارات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">
              {activeTimeframe === "yearly" ? performanceData.yearly.currentValue : performanceData.quarterly.currentValue}
            </div>
            <p className="text-muted-foreground">القيمة الحالية للمحفظة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {activeTimeframe === "yearly" ? performanceData.yearly.roi : performanceData.quarterly.roi}
            </div>
            <p className="text-muted-foreground">العائد على الاستثمار</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Briefcase className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {activeTimeframe === "yearly" ? performanceData.yearly.investmentCount : performanceData.quarterly.investmentCount}
            </div>
            <p className="text-muted-foreground">عدد الاستثمارات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">
              {activeTimeframe === "yearly" ? performanceData.yearly.avgHoldingPeriod : performanceData.quarterly.avgHoldingPeriod}
            </div>
            <p className="text-muted-foreground">متوسط فترة الاحتفاظ</p>
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
            <CardTitle>تحليلات المحفظة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="forecast">التوقعات</TabsTrigger>
              <TabsTrigger value="comparison">المقارنات</TabsTrigger>
              <TabsTrigger value="performance">الأداء</TabsTrigger>
            </TabsList>
            
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
              {activeTab === "performance" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-right">أداء القطاعات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {data.sectorPerformance.map((sector, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`text-sm font-medium ${
                                    sector.roi.startsWith("+") ? "text-green-500" : "text-red-500"
                                  }`}>
                                    {sector.roi}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    ({sector.allocation})
                                  </div>
                                </div>
                                <span className="text-sm font-medium">{sector.name}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    sector.roi.startsWith("+") ? "bg-green-500" : "bg-red-500"
                                  }`} 
                                  style={{ width: sector.allocation }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-right">أداء مراحل النمو</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {data.stagePerformance.map((stage, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`text-sm font-medium ${
                                    stage.roi.startsWith("+") ? "text-green-500" : "text-red-500"
                                  }`}>
                                    {stage.roi}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    ({stage.allocation})
                                  </div>
                                </div>
                                <span className="text-sm font-medium">{stage.name}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    stage.roi.startsWith("+") ? "bg-green-500" : "bg-red-500"
                                  }`} 
                                  style={{ width: stage.allocation }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">أداء الاستثمارات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-medium text-right">أفضل أداء</h3>
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <div className="text-green-500 font-medium">{data.topPerformer.roi}</div>
                              </div>
                              <div className="font-medium">{data.topPerformer.name}</div>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                              {data.topPerformer.sector}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-medium text-right">أسوأ أداء</h3>
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                                <div className="text-red-500 font-medium">{data.worstPerformer.roi}</div>
                              </div>
                              <div className="font-medium">{data.worstPerformer.name}</div>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                              {data.worstPerformer.sector}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium text-right mb-4">تطور قيمة المحفظة</h3>
                        <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-muted-foreground">الرسم البياني لتطور قيمة المحفظة</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {activeTab === "comparison" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">مقارنة مع المؤشرات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data.benchmarks.map((benchmark, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`text-sm font-medium ${
                                  benchmark.difference.startsWith("+") ? "text-green-500" : "text-red-500"
                                }`}>
                                  {benchmark.difference}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  الفرق
                                </div>
                              </div>
                              <div className="font-medium">{benchmark.name}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">{benchmark.performance}</div>
                                <div className="text-sm text-muted-foreground">
                                  أداء المؤشر
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">{benchmark.portfolioPerformance}</div>
                                <div className="text-sm text-muted-foreground">
                                  أداء المحفظة
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium text-right mb-4">مقارنة مع النظراء</h3>
                        <div className="space-y-4">
                          {data.peerComparison.map((peer, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`text-sm font-medium ${
                                    peer.difference.startsWith("+") ? "text-green-500" : "text-red-500"
                                  }`}>
                                    {peer.difference}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    الفرق
                                  </div>
                                </div>
                                <div className="font-medium">{peer.name}</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium">{peer.performance}</div>
                                  <div className="text-sm text-muted-foreground">
                                    أداء النظراء
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium">{peer.portfolioPerformance}</div>
                                  <div className="text-sm text-muted-foreground">
                                    أداء المحفظة
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium text-right mb-4">المقارنة التاريخية</h3>
                        <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-muted-foreground">الرسم البياني للمقارنة التاريخية</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {activeTab === "forecast" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">التوقعات المستقبلية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-right mb-4">توقعات قيمة المحفظة</h3>
                          <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                            <span className="text-muted-foreground">الرسم البياني لتوقعات قيمة المحفظة</span>
                          </div>
                          <div className="space-y-2">
                            {data.portfolioForecast.map((forecast, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="text-sm font-medium">
                                  {forecast.value.toLocaleString()} ريال
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {activeTimeframe === "yearly" ? forecast.year : forecast.quarter}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-right mb-4">توقعات العائد على الاستثمار</h3>
                          <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                            <span className="text-muted-foreground">الرسم البياني لتوقعات العائد</span>
                          </div>
                          <div className="space-y-2">
                            {data.expectedReturns.map((forecast, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="text-sm font-medium text-green-500">
                                  {forecast.value}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {activeTimeframe === "yearly" ? forecast.year : forecast.quarter}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {activeTimeframe === "yearly" && data.exitOpportunities.length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-medium text-right mb-4">فرص التخارج المحتملة</h3>
                          <div className="space-y-4">
                            {data.exitOpportunities.map((exit, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-green-500">
                                      {exit.expectedMultiple}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      المضاعف المتوقع
                                    </div>
                                  </div>
                                  <div className="font-medium">{exit.name}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium">{exit.expectedYear}</div>
                                    <div className="text-sm text-muted-foreground">
                                      السنة المتوقعة
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <h3 className="font-medium text-right mb-4">اتجاهات السوق والتوصيات</h3>
                        <div className="space-y-4">
                          {data.marketTrends.map((trend, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify
