"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Rocket
} from "lucide-react"

export default function ProgramManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">لوحة تحكم مدير البرنامج</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="events">الفعاليات</TabsTrigger>
          <TabsTrigger value="startups">الشركات الناشئة</TabsTrigger>
          <TabsTrigger value="mentors">الموجهون</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الشركات الناشئة النشطة</CardTitle>
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">في 3 برامج</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الموجهون النشطون</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">متوسط 4.8/5 تقييم</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الفعاليات القادمة</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">خلال الأسبوع القادم</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المهام المعلقة</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">5 منها عالية الأولوية</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>تقدم الدفعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">مسرع التقنية المالية</div>
                      <div className="text-sm text-muted-foreground">75%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">مسرع التقنيات الصحية</div>
                      <div className="text-sm text-muted-foreground">60%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">حاضنة التقنيات الناشئة</div>
                      <div className="text-sm text-muted-foreground">40%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>المهام القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 ml-2 text-red-500" />
                      <div>
                        <div className="font-medium">مراجعة تقارير التقدم</div>
                        <div className="text-sm text-muted-foreground">اليوم، 2:00 م</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-red-500">عالية</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 ml-2 text-amber-500" />
                      <div>
                        <div className="font-medium">جلسة إرشادية جماعية</div>
                        <div className="text-sm text-muted-foreground">غداً، 10:00 ص</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-amber-500">متوسطة</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                      <div>
                        <div className="font-medium">تعيين موجهين جدد</div>
                        <div className="text-sm text-muted-foreground">الخميس، 1:00 م</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-500">منخفضة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>أحدث الأنشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-r-4 border-blue-500 pr-4 py-2">
                  <h3 className="font-bold">تم تعيين موجه جديد</h3>
                  <p className="text-muted-foreground">تم تعيين د. سارة الأحمد كموجهة لشركة تك سوليوشنز</p>
                  <p className="text-xs text-muted-foreground">منذ ساعة واحدة</p>
                </div>
                <div className="border-r-4 border-green-500 pr-4 py-2">
                  <h3 className="font-bold">تم إكمال مرحلة رئيسية</h3>
                  <p className="text-muted-foreground">أكملت شركة هيلث تك مرحلة تطوير النموذج الأولي</p>
                  <p className="text-xs text-muted-foreground">منذ 3 ساعات</p>
                </div>
                <div className="border-r-4 border-amber-500 pr-4 py-2">
                  <h3 className="font-bold">تمت إضافة فعالية جديدة</h3>
                  <p className="text-muted-foreground">ورشة عمل حول استراتيجيات التسويق الرقمي يوم الأربعاء</p>
                  <p className="text-xs text-muted-foreground">منذ 5 ساعات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mentors">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الموجهين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">الموجهون النشطون</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="font-bold">د. خالد العمري</div>
                      <div className="text-sm text-muted-foreground">تقنيات صحية</div>
                      <div className="flex items-center mt-2">
                        <div className="text-amber-500 text-sm">★★★★★</div>
                        <span className="text-sm mr-1">5.0</span>
                      </div>
                      <div className="text-sm mt-2">يشرف على 4 شركات ناشئة</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="font-bold">م. سارة الأحمد</div>
                      <div className="text-sm text-muted-foreground">تقنية مالية</div>
                      <div className="flex items-center mt-2">
                        <div className="text-amber-500 text-sm">★★★★☆</div>
                        <span className="text-sm mr-1">4.8</span>
                      </div>
                      <div className="text-sm mt-2">تشرف على 3 شركات ناشئة</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="font-bold">أ. محمد السالم</div>
                      <div className="text-sm text-muted-foreground">تسويق رقمي</div>
                      <div className="flex items-center mt-2">
                        <div className="text-amber-500 text-sm">★★★★☆</div>
                        <span className="text-sm mr-1">4.7</span>
                      </div>
                      <div className="text-sm mt-2">يشرف على 5 شركات ناشئة</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">جلسات الإرشاد القادمة</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">جلسة إرشادية: تك سوليوشنز</h4>
                        <p className="text-sm text-muted-foreground">د. سارة الأحمد</p>
                      </div>
                      <p className="text-sm">اليوم، 3:00 م</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">جلسة إرشادية: هيلث تك</h4>
                        <p className="text-sm text-muted-foreground">د. خالد العمري</p>
                      </div>
                      <p className="text-sm">غداً، 11:00 ص</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">جلسة إرشادية جماعية</h4>
                        <p className="text-sm text-muted-foreground">أ. محمد السالم</p>
                      </div>
                      <p className="text-sm">الأربعاء، 2:00 م</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="startups">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الشركات الناشئة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">الشركات الناشئة حسب البرنامج</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-blue-500 pr-4 py-2">
                      <h4 className="font-bold">مسرع التقنية المالية</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="font-medium">تك سوليوشنز</div>
                          <div className="text-sm text-green-500">متقدم</div>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="font-medium">باي تك</div>
                          <div className="text-sm text-amber-500">متوسط</div>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="font-medium">فينتك</div>
                          <div className="text-sm text-amber-500">متوسط</div>
                        </div>
                      </div>
                    </div>
                    <div className="border-r-4 border-purple-500 pr-4 py-2">
                      <h4 className="font-bold">مسرع التقنيات الصحية</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="font-medium">هيلث تك</div>
                          <div className="text-sm text-green-500">متقدم</div>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="font-medium">ميديكال إيه آي</div>
                          <div className="text-sm text-amber-500">متوسط</div>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="font-medium">دوكتور أونلاين</div>
                          <div className="text-sm text-red-500">متأخر</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">المراحل الرئيسية القادمة</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">عرض النموذج الأولي</h4>
                        <p className="text-sm text-muted-foreground">شركة باي تك</p>
                      </div>
                      <p className="text-sm">خلال 3 أيام</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">اختبار المستخدمين</h4>
                        <p className="text-sm text-muted-foreground">شركة ميديكال إيه آي</p>
                      </div>
                      <p className="text-sm">خلال 5 أيام</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">عرض خطة التسويق</h4>
                        <p className="text-sm text-muted-foreground">شركة تك سوليوشنز</p>
                      </div>
                      <p className="text-sm">خلال أسبوع</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الفعاليات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">الفعاليات القادمة</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-blue-500 pr-4 py-2">
                      <h4 className="font-bold">ورشة عمل: استراتيجيات التسويق الرقمي</h4>
                      <p className="text-muted-foreground">الأربعاء، 10:00 ص - 12:00 م</p>
                      <p className="text-sm">المكان: قاعة الاجتماعات الرئيسية</p>
                      <p className="text-sm">المتحدث: أ. محمد السالم</p>
                      <p className="text-sm text-muted-foreground mt-1">15 مشارك مسجل</p>
                    </div>
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <h4 className="font-bold">جلسة عصف ذهني: حلول التقنية المالية</h4>
                      <p className="text-muted-foreground">الخميس، 1:00 م - 3:00 م</p>
                      <p className="text-sm">المكان: قاعة الابتكار</p>
                      <p className="text-sm">الميسر: د. سارة الأحمد</p>
                      <p className="text-sm text-muted-foreground mt-1">12 مشارك مسجل</p>
                    </div>
                    <div className="border-r-4 border-amber-500 pr-4 py-2">
                      <h4 className="font-bold">لقاء مع المستثمرين</h4>
                      <p className="text-muted-foreground">الأحد، 4:00 م - 6:00 م</p>
                      <p className="text-sm">المكان: قاعة المؤتمرات</p>
                      <p className="text-sm">المنسق: أ. فهد العتيبي</p>
                      <p className="text-sm text-muted-foreground mt-1">20 مشارك مسجل</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">إحصائيات الفعاليات</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">24</div>
                      <p className="text-muted-foreground">فعالية منظمة</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">85%</div>
                      <p className="text-muted-foreground">متوسط الحضور</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">4.7/5</div>
                      <p className="text-muted-foreground">متوسط التقييم</p>
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
