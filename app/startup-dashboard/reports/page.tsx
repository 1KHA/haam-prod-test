"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart, 
  PieChart, 
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  ChevronDown,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

// Mock reports data
const reports = [
  {
    id: 1,
    title: "تقرير الأداء الشهري - أبريل 2025",
    description: "تقرير شامل عن أداء الشركة خلال شهر أبريل 2025",
    date: "30 أبريل 2025",
    type: "شهري",
    category: "أداء",
    status: "مقدم",
    downloadUrl: "#"
  },
  {
    id: 2,
    title: "تقرير الإنفاق - الربع الأول 2025",
    description: "تقرير مفصل عن الإنفاق خلال الربع الأول من عام 2025",
    date: "31 مارس 2025",
    type: "ربع سنوي",
    category: "مالي",
    status: "مقدم",
    downloadUrl: "#"
  },
  {
    id: 3,
    title: "تقرير المستخدمين - أبريل 2025",
    description: "تحليل لنمو المستخدمين وسلوكهم خلال شهر أبريل 2025",
    date: "30 أبريل 2025",
    type: "شهري",
    category: "مستخدمين",
    status: "مقدم",
    downloadUrl: "#"
  },
  {
    id: 4,
    title: "تقرير الإنفاق - مايو 2025",
    description: "تقرير مفصل عن الإنفاق خلال شهر مايو 2025",
    date: "31 مايو 2025",
    type: "شهري",
    category: "مالي",
    status: "مطلوب",
    dueDate: "31 مايو 2025"
  },
  {
    id: 5,
    title: "تقرير الإنفاق - الربع الثاني 2025",
    description: "تقرير مفصل عن الإنفاق خلال الربع الثاني من عام 2025",
    date: "30 يونيو 2025",
    type: "ربع سنوي",
    category: "مالي",
    status: "مطلوب",
    dueDate: "30 يونيو 2025"
  }
]

// Mock analytics data
const analyticsData = {
  userGrowth: {
    current: 1250,
    previous: 1000,
    change: "+25%",
    trend: "up"
  },
  retention: {
    current: 65,
    previous: 60,
    change: "+5%",
    trend: "up"
  },
  revenue: {
    current: 15000,
    previous: 12000,
    change: "+25%",
    trend: "up"
  },
  cac: {
    current: 200,
    previous: 220,
    change: "-9%",
    trend: "down"
  },
  monthlyData: [
    { month: "يناير", users: 500, revenue: 5000 },
    { month: "فبراير", users: 700, revenue: 7000 },
    { month: "مارس", users: 900, revenue: 10000 },
    { month: "أبريل", users: 1250, revenue: 15000 }
  ]
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("analytics")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.includes(searchQuery) || 
                          report.description.includes(searchQuery)
    
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">التقارير والتحليلات</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="reports">التقارير</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">عدد المستخدمين</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.userGrowth.current}</div>
                    <div className="flex items-center mt-1">
                      {analyticsData.userGrowth.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                      )}
                      <span className={`text-sm ${
                        analyticsData.userGrowth.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}>
                        {analyticsData.userGrowth.change}
                      </span>
                      <span className="text-xs text-muted-foreground mr-1">مقارنة بالشهر السابق</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">معدل الاحتفاظ</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.retention.current}%</div>
                    <div className="flex items-center mt-1">
                      {analyticsData.retention.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                      )}
                      <span className={`text-sm ${
                        analyticsData.retention.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}>
                        {analyticsData.retention.change}
                      </span>
                      <span className="text-xs text-muted-foreground mr-1">مقارنة بالشهر السابق</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.revenue.current} ريال</div>
                    <div className="flex items-center mt-1">
                      {analyticsData.revenue.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                      )}
                      <span className={`text-sm ${
                        analyticsData.revenue.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}>
                        {analyticsData.revenue.change}
                      </span>
                      <span className="text-xs text-muted-foreground mr-1">مقارنة بالشهر السابق</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">تكلفة اكتساب العميل</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.cac.current} ريال</div>
                    <div className="flex items-center mt-1">
                      {analyticsData.cac.trend === "down" ? (
                        <ArrowDownRight className="h-4 w-4 text-green-500 ml-1" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-500 ml-1" />
                      )}
                      <span className={`text-sm ${
                        analyticsData.cac.trend === "down" ? "text-green-500" : "text-red-500"
                      }`}>
                        {analyticsData.cac.change}
                      </span>
                      <span className="text-xs text-muted-foreground mr-1">مقارنة بالشهر السابق</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>نمو المستخدمين</CardTitle>
                  <CardDescription>عدد المستخدمين النشطين شهريًا</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart className="h-16 w-16 mx-auto mb-4" />
                      <p>سيتم عرض رسم بياني هنا في التطبيق الفعلي</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>الإيرادات الشهرية</CardTitle>
                  <CardDescription>إجمالي الإيرادات الشهرية</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4" />
                      <p>سيتم عرض رسم بياني هنا في التطبيق الفعلي</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>تحليل البيانات الشهرية</CardTitle>
                <CardDescription>مقارنة البيانات الرئيسية على مدار الأشهر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">الشهر</th>
                        <th className="text-right py-3 px-4">عدد المستخدمين</th>
                        <th className="text-right py-3 px-4">الإيرادات (ريال)</th>
                        <th className="text-right py-3 px-4">النمو</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.monthlyData.map((month, index) => {
                        const prevMonth = index > 0 ? analyticsData.monthlyData[index - 1] : null;
                        const userGrowth = prevMonth ? ((month.users - prevMonth.users) / prevMonth.users * 100).toFixed(1) : "-";
                        const revenueGrowth = prevMonth ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1) : "-";
                        
                        return (
                          <tr key={month.month} className="border-b">
                            <td className="py-3 px-4">{month.month}</td>
                            <td className="py-3 px-4">{month.users}</td>
                            <td className="py-3 px-4">{month.revenue}</td>
                            <td className="py-3 px-4">
                              {index > 0 && (
                                <div className="flex items-center">
                                  {parseFloat(userGrowth) > 0 ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                                  ) : (
                                    <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                                  )}
                                  <span className={parseFloat(userGrowth) > 0 ? "text-green-500" : "text-red-500"}>
                                    {userGrowth}%
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن تقارير..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>التصنيف</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {/* Dropdown would go here in a real implementation */}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">التقارير المطلوبة</h2>
              <div className="space-y-4">
                {filteredReports.filter(r => r.status === "مطلوب").map((report, index) => (
                  <motion.div
                    key={report.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col items-end">
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                              {report.status}
                            </span>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">الموعد النهائي: {report.dueDate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <CardTitle>{report.title}</CardTitle>
                            <CardDescription className="mt-1">{report.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{report.type}</span>
                          <span>{report.category}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">
                          <FileText className="h-4 w-4 ml-2" />
                          تقديم التقرير
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
                
                {filteredReports.filter(r => r.status === "مطلوب").length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">لا توجد تقارير مطلوبة حاليًا</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">التقارير المقدمة</h2>
              <div className="space-y-4">
                {filteredReports.filter(r => r.status === "مقدم").map((report, index) => (
                  <motion.div
                    key={report.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col items-end">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {report.status}
                            </span>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{report.date}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <CardTitle>{report.title}</CardTitle>
                            <CardDescription className="mt-1">{report.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{report.type}</span>
                          <span>{report.category}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 ml-2" />
                          تنزيل التقرير
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
                
                {filteredReports.filter(r => r.status === "مقدم").length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">لا توجد تقارير مقدمة حاليًا</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
