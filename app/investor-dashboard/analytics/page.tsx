"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Filter, 
  DollarSign, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BarChart,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PieChart,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LineChart,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase
} from "lucide-react"

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("performance")
  const [activeTimeframe, setActiveTimeframe] = useState("yearly")

  // Performance data
  const performanceData = {
    yearly: {
      totalInvestment: "3,350,000 ريال",
      currentValue: "3,805,000 ريال",
      roi: "+13.58%",
      investmentCount: 5,
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
      ]
    },
    quarterly: {
      totalInvestment: "3,350,000 ريال",
      currentValue: "3,805,000 ريال",
      roi: "+3.2%",
      investmentCount: 5,
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
      ]
    }
  }

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
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">أداء القطاعات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(activeTimeframe === "yearly" ? performanceData.yearly.sectorPerformance : performanceData.quarterly.sectorPerformance).map((sector, index) => (
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
                                <div className="text-green-500 font-medium">
                                  {activeTimeframe === "yearly" 
                                    ? performanceData.yearly.topPerformer.roi 
                                    : performanceData.quarterly.topPerformer.roi}
                                </div>
                              </div>
                              <div className="font-medium">
                                {activeTimeframe === "yearly" 
                                  ? performanceData.yearly.topPerformer.name 
                                  : performanceData.quarterly.topPerformer.name}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                              {activeTimeframe === "yearly" 
                                ? performanceData.yearly.topPerformer.sector 
                                : performanceData.quarterly.topPerformer.sector}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-medium text-right">أسوأ أداء</h3>
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                                <div className="text-red-500 font-medium">
                                  {activeTimeframe === "yearly" 
                                    ? performanceData.yearly.worstPerformer.roi 
                                    : performanceData.quarterly.worstPerformer.roi}
                                </div>
                              </div>
                              <div className="font-medium">
                                {activeTimeframe === "yearly" 
                                  ? performanceData.yearly.worstPerformer.name 
                                  : performanceData.quarterly.worstPerformer.name}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                              {activeTimeframe === "yearly" 
                                ? performanceData.yearly.worstPerformer.sector 
                                : performanceData.quarterly.worstPerformer.sector}
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
                </div>
              )}
              
              {activeTab === "comparison" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">مقارنة مع المؤشرات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                        <span className="text-muted-foreground">الرسم البياني للمقارنة مع المؤشرات</span>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">أداء المحفظة مقارنة بالمؤشرات العامة</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "forecast" && (
                <div className="space-y-6">
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
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-right mb-4">توقعات العائد على الاستثمار</h3>
                          <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                            <span className="text-muted-foreground">الرسم البياني لتوقعات العائد</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
