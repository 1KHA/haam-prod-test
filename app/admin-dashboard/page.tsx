"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Building, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Award,
  BookOpen,
  Rocket
} from "lucide-react"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <RouteGuard 
      requiredPermission={{ category: 'dashboard', action: 'view' }}
      requiredRole={UserRole.ADMIN}
    >
      
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="funding">التمويل</TabsTrigger>
          <TabsTrigger value="programs">البرامج</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">البرامج النشطة</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">4 مسرعات و 8 حاضنات</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي التمويل</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2.4M</div>
                  <p className="text-xs text-muted-foreground">تم توزيع $1.8M</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الفعاليات القادمة</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">خلال الأسبوعين القادمين</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء البرامج</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Rocket className="h-5 w-5 ml-2 text-blue-500" />
                      <div>
                        <div className="font-medium">مسرع التقنية المالية</div>
                        <div className="text-sm text-muted-foreground">12 شركة ناشئة</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                      <span className="text-green-500">+24%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Rocket className="h-5 w-5 ml-2 text-purple-500" />
                      <div>
                        <div className="font-medium">مسرع التقنيات الصحية</div>
                        <div className="text-sm text-muted-foreground">8 شركات ناشئة</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                      <span className="text-green-500">+18%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 ml-2 text-amber-500" />
                      <div>
                        <div className="font-medium">حاضنة التقنيات الناشئة</div>
                        <div className="text-sm text-muted-foreground">15 شركة ناشئة</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                      <span className="text-green-500">+12%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>أحدث الأنشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-r-4 border-blue-500 pr-4 py-2">
                    <h3 className="font-bold">تم إضافة برنامج جديد</h3>
                    <p className="text-muted-foreground">تم إضافة مسرع الذكاء الاصطناعي بواسطة أحمد محمد</p>
                    <p className="text-xs text-muted-foreground">منذ ساعتين</p>
                  </div>
                  <div className="border-r-4 border-green-500 pr-4 py-2">
                    <h3 className="font-bold">تم الموافقة على طلب تمويل</h3>
                    <p className="text-muted-foreground">تمت الموافقة على تمويل بقيمة $50,000 لشركة تك سوليوشنز</p>
                    <p className="text-xs text-muted-foreground">منذ 5 ساعات</p>
                  </div>
                  <div className="border-r-4 border-amber-500 pr-4 py-2">
                    <h3 className="font-bold">تم إضافة موجه جديد</h3>
                    <p className="text-muted-foreground">انضم د. خالد العمري كموجه في مجال التقنيات الصحية</p>
                    <p className="text-xs text-muted-foreground">منذ يوم واحد</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-bold text-xl">850</h3>
                  <p className="text-muted-foreground">مؤسسي الشركات الناشئة</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Award className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-bold text-xl">120</h3>
                  <p className="text-muted-foreground">مديري البرامج</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <BookOpen className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-bold text-xl">215</h3>
                  <p className="text-muted-foreground">الموجهين</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <DollarSign className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-bold text-xl">49</h3>
                  <p className="text-muted-foreground">المستثمرين</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-bold mb-4">أحدث المستخدمين المسجلين</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">سارة أحمد</h4>
                      <p className="text-sm text-muted-foreground">مؤسس شركة ناشئة</p>
                    </div>
                    <p className="text-sm">منذ 3 ساعات</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">محمد العلي</h4>
                      <p className="text-sm text-muted-foreground">موجه</p>
                    </div>
                    <p className="text-sm">منذ 5 ساعات</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">فاطمة الزهراء</h4>
                      <p className="text-sm text-muted-foreground">مؤسس شركة ناشئة</p>
                    </div>
                    <p className="text-sm">منذ 8 ساعات</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات البرامج</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-4">برامج المسرعات</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-blue-500 pr-4 py-2">
                      <h4 className="font-bold">مسرع التقنية المالية</h4>
                      <p className="text-muted-foreground">12 شركة ناشئة، 8 موجهين</p>
                      <p className="text-sm">تاريخ البدء: 15 يناير 2025</p>
                    </div>
                    <div className="border-r-4 border-purple-500 pr-4 py-2">
                      <h4 className="font-bold">مسرع التقنيات الصحية</h4>
                      <p className="text-muted-foreground">8 شركات ناشئة، 6 موجهين</p>
                      <p className="text-sm">تاريخ البدء: 1 فبراير 2025</p>
                    </div>
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <h4 className="font-bold">مسرع الذكاء الاصطناعي</h4>
                      <p className="text-muted-foreground">10 شركات ناشئة، 7 موجهين</p>
                      <p className="text-sm">تاريخ البدء: 10 مارس 2025</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-4">برامج الحاضنات</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-amber-500 pr-4 py-2">
                      <h4 className="font-bold">حاضنة التقنيات الناشئة</h4>
                      <p className="text-muted-foreground">15 شركة ناشئة، 10 موجهين</p>
                      <p className="text-sm">تاريخ البدء: 5 يناير 2025</p>
                    </div>
                    <div className="border-r-4 border-red-500 pr-4 py-2">
                      <h4 className="font-bold">حاضنة التجارة الإلكترونية</h4>
                      <p className="text-muted-foreground">12 شركة ناشئة، 8 موجهين</p>
                      <p className="text-sm">تاريخ البدء: 20 فبراير 2025</p>
                    </div>
                    <div className="border-r-4 border-indigo-500 pr-4 py-2">
                      <h4 className="font-bold">حاضنة التعليم التقني</h4>
                      <p className="text-muted-foreground">9 شركات ناشئة، 6 موجهين</p>
                      <p className="text-sm">تاريخ البدء: 15 مارس 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="funding">
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات التمويل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-xl">$2.4M</h3>
                  <p className="text-muted-foreground">إجمالي التمويل المتاح</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-xl">$1.8M</h3>
                  <p className="text-muted-foreground">التمويل الموزع</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-xl">$600K</h3>
                  <p className="text-muted-foreground">التمويل المتبقي</p>
                </div>
              </div>
              
              <h3 className="font-bold mb-4">أحدث طلبات التمويل</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">شركة تك سوليوشنز</h4>
                    <p className="text-sm text-muted-foreground">$50,000 - تمت الموافقة</p>
                  </div>
                  <p className="text-sm text-green-500">تمت الموافقة</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">شركة هيلث تك</h4>
                    <p className="text-sm text-muted-foreground">$75,000 - قيد المراجعة</p>
                  </div>
                  <p className="text-sm text-amber-500">قيد المراجعة</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">شركة إيدو تك</h4>
                    <p className="text-sm text-muted-foreground">$40,000 - قيد المراجعة</p>
                  </div>
                  <p className="text-sm text-amber-500">قيد المراجعة</p>
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
