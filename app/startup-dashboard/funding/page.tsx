"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Upload,
  BarChart,
  TrendingUp,
  ArrowUpRight,
  Plus
} from "lucide-react"

// Mock funding data
const fundingRounds = [
  {
    id: 1,
    name: "تمويل المرحلة الأولى",
    status: "مكتمل",
    amount: "250,000 ريال",
    disbursed: "250,000 ريال",
    remaining: "0 ريال",
    date: "15 يناير 2025",
    purpose: "تطوير النموذج الأولي وإطلاق المنتج"
  },
  {
    id: 2,
    name: "تمويل المرحلة الثانية",
    status: "جاري",
    amount: "500,000 ريال",
    disbursed: "250,000 ريال",
    remaining: "250,000 ريال",
    date: "1 أبريل 2025",
    purpose: "توسيع قاعدة المستخدمين وتطوير ميزات جديدة"
  }
]

// Mock financial data
const financialData = {
  totalFunding: "750,000 ريال",
  disbursed: "500,000 ريال",
  remaining: "250,000 ريال",
  expenses: [
    { category: "رواتب الفريق", amount: "200,000 ريال", percentage: 40 },
    { category: "تطوير المنتج", amount: "150,000 ريال", percentage: 30 },
    { category: "التسويق", amount: "75,000 ريال", percentage: 15 },
    { category: "البنية التحتية", amount: "50,000 ريال", percentage: 10 },
    { category: "أخرى", amount: "25,000 ريال", percentage: 5 }
  ],
  monthlyBurn: "100,000 ريال",
  runway: "5 أشهر",
  revenueLastMonth: "30,000 ريال",
  revenueGrowth: "+20%"
}

export default function FundingPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [newRequest, setNewRequest] = useState({
    name: "",
    amount: "",
    purpose: "",
    milestones: "",
    timeline: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewRequest(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitRequest = () => {
    console.log("Submitting funding request:", newRequest)
    setNewRequest({
      name: "",
      amount: "",
      purpose: "",
      milestones: "",
      timeline: ""
    })
    setShowNewRequest(false)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setShowNewRequest(!showNewRequest)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>{showNewRequest ? "إلغاء" : "طلب تمويل جديد"}</span>
        </Button>
        <h1 className="text-3xl font-bold">التمويل</h1>
      </div>

      {showNewRequest && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>طلب تمويل جديد</CardTitle>
              <CardDescription>أدخل تفاصيل طلب التمويل الجديد</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">اسم جولة التمويل</label>
                  <Input
                    id="name"
                    name="name"
                    value={newRequest.name}
                    onChange={handleInputChange}
                    placeholder="مثال: تمويل المرحلة الثالثة، تمويل التوسع"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">المبلغ المطلوب</label>
                  <Input
                    id="amount"
                    name="amount"
                    value={newRequest.amount}
                    onChange={handleInputChange}
                    placeholder="مثال: 500,000 ريال"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="purpose" className="text-sm font-medium">الغرض من التمويل</label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    value={newRequest.purpose}
                    onChange={handleInputChange}
                    placeholder="اشرح كيف ستستخدم التمويل لتطوير شركتك"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="milestones" className="text-sm font-medium">المراحل الرئيسية</label>
                  <Textarea
                    id="milestones"
                    name="milestones"
                    value={newRequest.milestones}
                    onChange={handleInputChange}
                    placeholder="حدد المراحل الرئيسية التي ستحققها باستخدام هذا التمويل"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="timeline" className="text-sm font-medium">الجدول الزمني</label>
                  <Textarea
                    id="timeline"
                    name="timeline"
                    value={newRequest.timeline}
                    onChange={handleInputChange}
                    placeholder="حدد الإطار الزمني المتوقع لتحقيق المراحل الرئيسية"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSubmitRequest}>
                    <FileText className="h-4 w-4 ml-2" />
                    تقديم الطلب
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="reports">التقارير المالية</TabsTrigger>
          <TabsTrigger value="rounds">جولات التمويل</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي التمويل</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialData.totalFunding}</div>
                  <p className="text-xs text-muted-foreground">من جميع جولات التمويل</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">التمويل المستلم</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialData.disbursed}</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "66.7%" }}></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل الحرق الشهري</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialData.monthlyBurn}</div>
                  <p className="text-xs text-muted-foreground">مدة البقاء: {financialData.runway}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الإيرادات (الشهر الماضي)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{financialData.revenueLastMonth}</div>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                    <span className="text-sm text-green-500">{financialData.revenueGrowth}</span>
                    <span className="text-xs text-muted-foreground mr-1">مقارنة بالشهر السابق</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع النفقات</CardTitle>
                <CardDescription>كيفية إنفاق التمويل المستلم حتى الآن</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.expenses.map((expense, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{expense.amount}</span>
                        <span className="text-sm font-medium">{expense.category}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${expense.percentage}%`,
                            backgroundColor: index === 0 ? '#3b82f6' : 
                                            index === 1 ? '#10b981' : 
                                            index === 2 ? '#f59e0b' : 
                                            index === 3 ? '#6366f1' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>حالة التمويل الحالي</CardTitle>
                <CardDescription>ملخص جولات التمويل الحالية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fundingRounds.map((round) => (
                    <div key={round.id} className="border-r-4 pr-4 py-2" style={{
                      borderColor: round.status === "مكتمل" ? "#10b981" : "#3b82f6"
                    }}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          round.status === "مكتمل" ? "bg-green-100 text-green-800" : 
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {round.status}
                        </span>
                        <h3 className="font-bold">{round.name}</h3>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">{round.disbursed} من {round.amount}</span>
                        <span className="text-sm text-muted-foreground">{round.date}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: round.status === "مكتمل" ? "100%" : "50%",
                            backgroundColor: round.status === "مكتمل" ? "#10b981" : "#3b82f6"
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rounds">
          <div className="space-y-6">
            {fundingRounds.map((round, index) => (
              <motion.div
                key={round.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col items-end">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          round.status === "مكتمل" ? "bg-green-100 text-green-800" : 
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {round.status}
                        </span>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{round.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <CardTitle>{round.name}</CardTitle>
                        <CardDescription>{round.purpose}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">التمويل</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-muted p-3 rounded-lg text-center">
                            <div className="text-lg font-bold">{round.amount}</div>
                            <p className="text-xs text-muted-foreground">إجمالي التمويل</p>
                          </div>
                          <div className="bg-muted p-3 rounded-lg text-center">
                            <div className="text-lg font-bold">{round.disbursed}</div>
                            <p className="text-xs text-muted-foreground">التمويل المستلم</p>
                          </div>
                          <div className="bg-muted p-3 rounded-lg text-center">
                            <div className="text-lg font-bold">{round.remaining}</div>
                            <p className="text-xs text-muted-foreground">التمويل المتبقي</p>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden mt-4">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: round.status === "مكتمل" ? "100%" : "50%",
                              backgroundColor: round.status === "مكتمل" ? "#10b981" : "#3b82f6"
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>التقارير المالية</CardTitle>
              <CardDescription>إدارة وتقديم التقارير المالية المطلوبة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">التقارير المطلوبة</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Button>
                        <Upload className="h-4 w-4 ml-1" />
                        تقديم التقرير
                      </Button>
                      <div className="text-right">
                        <div className="font-medium">تقرير الإنفاق - مايو 2025</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 ml-1" />
                          الموعد النهائي: 31 مايو 2025
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <Button>
                        <Upload className="h-4 w-4 ml-1" />
                        تقديم التقرير
                      </Button>
                      <div className="text-right">
                        <div className="font-medium">تقرير الإنفاق - الربع الثاني 2025</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 ml-1" />
                          الموعد النهائي: 30 يونيو 2025
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
