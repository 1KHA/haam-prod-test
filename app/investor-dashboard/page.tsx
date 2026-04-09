"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  FileText, 
  TrendingUp,
  Rocket,
  DollarSign,
  BarChart,
  Briefcase,
  PieChart,
  ArrowUp,
  ArrowDown
} from "lucide-react"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
export default function InvestorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <RouteGuard 
      requiredPermission={{ category: 'dashboard', action: 'view' }}
      requiredRole={UserRole.INVESTOR}
    >
      
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">مرحباً بك {user?.name || "المستثمر"}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="portfolio">المحفظة</TabsTrigger>
          <TabsTrigger value="opportunities">الفرص</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الاستثمارات</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1.2M</div>
                  <div className="flex items-center text-xs text-green-500">
                    <ArrowUp className="h-3 w-3 ml-1" />
                    <span>+15% من العام الماضي</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الشركات الناشئة</CardTitle>
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">شركات ناشئة في المحفظة</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العائد على الاستثمار</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">22%</div>
                  <div className="flex items-center text-xs text-green-500">
                    <ArrowUp className="h-3 w-3 ml-1" />
                    <span>+5% من الربع السابق</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الفرص الجديدة</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">فرصة استثمارية جديدة</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المحفظة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <PieChart className="h-40 w-40 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 ml-2"></div>
                      <span className="text-sm">التقنية المالية</span>
                    </div>
                    <span className="text-sm">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 ml-2"></div>
                      <span className="text-sm">التقنيات الصحية</span>
                    </div>
                    <span className="text-sm">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 ml-2"></div>
                      <span className="text-sm">التعليم التقني</span>
                    </div>
                    <span className="text-sm">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-amber-500 ml-2"></div>
                      <span className="text-sm">التجارة الإلكترونية</span>
                    </div>
                    <span className="text-sm">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 ml-2"></div>
                      <span className="text-sm">أخرى</span>
                    </div>
                    <span className="text-sm">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>أداء الاستثمارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">شركة تك سوليوشنز</div>
                      <div className="flex items-center text-green-500 text-sm">
                        <ArrowUp className="h-3 w-3 ml-1" />
                        <span>+32%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "32%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">شركة هيلث تك</div>
                      <div className="flex items-center text-green-500 text-sm">
                        <ArrowUp className="h-3 w-3 ml-1" />
                        <span>+28%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "28%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">شركة إيدو تك</div>
                      <div className="flex items-center text-green-500 text-sm">
                        <ArrowUp className="h-3 w-3 ml-1" />
                        <span>+15%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">شركة ميديكال إيه آي</div>
                      <div className="flex items-center text-amber-500 text-sm">
                        <ArrowUp className="h-3 w-3 ml-1" />
                        <span>+5%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "5%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">شركة دوكتور أونلاين</div>
                      <div className="flex items-center text-red-500 text-sm">
                        <ArrowDown className="h-3 w-3 ml-1" />
                        <span>-8%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "8%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>أحدث الفرص الاستثمارية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-r-4 border-blue-500 pr-4 py-2">
                  <h3 className="font-bold">شركة فينتك</h3>
                  <p className="text-muted-foreground">منصة للمدفوعات الرقمية والخدمات المالية</p>
                  <div className="flex justify-between mt-2">
                    <div className="text-sm">المبلغ المطلوب: $500,000</div>
                    <div className="text-sm">التقييم: $5M</div>
                  </div>
                </div>
                <div className="border-r-4 border-purple-500 pr-4 py-2">
                  <h3 className="font-bold">شركة ميديكال إيه آي</h3>
                  <p className="text-muted-foreground">تطبيقات الذكاء الاصطناعي في التشخيص الطبي</p>
                  <div className="flex justify-between mt-2">
                    <div className="text-sm">المبلغ المطلوب: $750,000</div>
                    <div className="text-sm">التقييم: $8M</div>
                  </div>
                </div>
                <div className="border-r-4 border-green-500 pr-4 py-2">
                  <h3 className="font-bold">شركة إيدو تك</h3>
                  <p className="text-muted-foreground">منصة تعليمية تفاعلية للتعلم عن بعد</p>
                  <div className="flex justify-between mt-2">
                    <div className="text-sm">المبلغ المطلوب: $300,000</div>
                    <div className="text-sm">التقييم: $3M</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات الاستثمار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">أداء المحفظة</h3>
                  <div className="h-40 w-full bg-muted rounded-lg flex items-center justify-center">
                    <BarChart className="h-24 w-24 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">22%</div>
                      <p className="text-muted-foreground">العائد السنوي</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">$1.2M</div>
                      <p className="text-muted-foreground">إجمالي الاستثمارات</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">$264K</div>
                      <p className="text-muted-foreground">الأرباح</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">توزيع المخاطر</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-center mb-2">
                        <div className="text-xl font-bold">35%</div>
                        <p className="text-muted-foreground">مخاطر منخفضة</p>
                      </div>
                      <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-center mb-2">
                        <div className="text-xl font-bold">45%</div>
                        <p className="text-muted-foreground">مخاطر متوسطة</p>
                      </div>
                      <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-center mb-2">
                        <div className="text-xl font-bold">20%</div>
                        <p className="text-muted-foreground">مخاطر عالية</p>
                      </div>
                      <div className="h-2 bg-red-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>الفرص الاستثمارية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">الفرص الموصى بها</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-blue-500 pr-4 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center ml-3">
                          <span className="font-bold">فت</span>
                        </div>
                        <div>
                          <div className="font-bold text-lg">شركة فينتك</div>
                          <div className="text-sm text-muted-foreground">منصة للمدفوعات الرقمية والخدمات المالية</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium">المبلغ المطلوب</div>
                          <div className="text-sm">$500,000</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">التقييم</div>
                          <div className="text-sm">$5M</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">المرحلة</div>
                          <div className="text-sm">التمويل الأولي</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-1">مستوى المخاطرة: متوسط</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "50%" }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-r-4 border-purple-500 pr-4 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-purple-500 text-white flex items-center justify-center ml-3">
                          <span className="font-bold">مأ</span>
                        </div>
                        <div>
                          <div className="font-bold text-lg">شركة ميديكال إيه آي</div>
                          <div className="text-sm text-muted-foreground">تطبيقات الذكاء الاصطناعي في التشخيص الطبي</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium">المبلغ المطلوب</div>
                          <div className="text-sm">$750,000</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">التقييم</div>
                          <div className="text-sm">$8M</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">المرحلة</div>
                          <div className="text-sm">التمويل الأولي</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-1">مستوى المخاطرة: عالي</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>المحفظة الاستثمارية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">الاستثمارات الحالية</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-blue-500 pr-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center ml-3">
                            <span className="font-bold">تس</span>
                          </div>
                          <div>
                            <div className="font-bold text-lg">شركة تك سوليوشنز</div>
                            <div className="text-sm text-muted-foreground">حلول تقنية مالية</div>
                          </div>
                        </div>
                        <div className="flex items-center text-green-500">
                          <ArrowUp className="h-4 w-4 ml-1" />
                          <span>+32%</span>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium">مبلغ الاستثمار</div>
                          <div className="text-sm">$250,000</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">القيمة الحالية</div>
                          <div className="text-sm">$330,000</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">تاريخ الاستثمار</div>
                          <div className="text-sm">يناير 2024</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-r-4 border-purple-500 pr-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-purple-500 text-white flex items-center justify-center ml-3">
                            <span className="font-bold">هت</span>
                          </div>
                          <div>
                            <div className="font-bold text-lg">شركة هيلث تك</div>
                            <div className="text-sm text-muted-foreground">تقنيات صحية</div>
                          </div>
                        </div>
                        <div className="flex items-center text-green-500">
                          <ArrowUp className="h-4 w-4 ml-1" />
                          <span>+28%</span>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium">مبلغ الاستثمار</div>
                          <div className="text-sm">$300,000</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">القيمة الحالية</div>
                          <div className="text-sm">$384,000</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">تاريخ الاستثمار</div>
                          <div className="text-sm">مارس 2024</div>
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
  
    </RouteGuard>
  )
}
