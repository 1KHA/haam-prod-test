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
  BookOpen,
  DollarSign,
  Target,
  Rocket
} from "lucide-react"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@prisma/client"
export default function StartupDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <RouteGuard 
      requiredPermission={{ category: 'dashboard', action: 'view' }}
      requiredRole={UserRole.STARTUP}
    >
      
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">مرحباً بكم في تك سوليوشنز</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="funding">التمويل</TabsTrigger>
          <TabsTrigger value="mentors">الموجهون</TabsTrigger>
          <TabsTrigger value="milestones">المراحل</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card className="rounded-xl border bg-card text-card-foreground shadow">
                <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">تقدم المشروع</CardTitle>
                  <Rocket className="h-4 w-4 text-muted-foreground ml-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">75%</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card className="rounded-xl border bg-card text-card-foreground shadow">
                <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المراحل المكتملة</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground ml-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6/8</div>
                  <p className="text-xs text-muted-foreground">المرحلة القادمة: اختبار المستخدمين</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card className="rounded-xl border bg-card text-card-foreground shadow">
                <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">جلسات الإرشاد</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground ml-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">الجلسة القادمة: اليوم، 3:00 م</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card className="rounded-xl border bg-card text-card-foreground shadow">
                <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">التمويل المستلم</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground ml-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$50,000</div>
                  <p className="text-xs text-muted-foreground">من أصل $75,000 مخصص</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="rounded-xl border bg-card text-card-foreground shadow">
              <CardHeader>
                <CardTitle>المهام القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 ml-2 text-red-500" />
                      <div>
                        <div className="font-medium">إكمال اختبارات المستخدمين</div>
                        <div className="text-sm text-muted-foreground">خلال 3 أيام</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-red-500">عالية</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 ml-2 text-amber-500" />
                      <div>
                        <div className="font-medium">تحضير عرض تقديمي للمستثمرين</div>
                        <div className="text-sm text-muted-foreground">خلال أسبوع</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-amber-500">متوسطة</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                      <div>
                        <div className="font-medium">تحديث خطة التسويق</div>
                        <div className="text-sm text-muted-foreground">خلال أسبوعين</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-500">منخفضة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl border bg-card text-card-foreground shadow">
              <CardHeader>
                <CardTitle>فريق العمل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center ml-3">
                        <span className="font-bold">أح</span>
                      </div>
                      <div>
                        <div className="font-medium">أحمد محمد</div>
                        <div className="text-sm text-muted-foreground">المؤسس والرئيس التنفيذي</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center ml-3">
                        <span className="font-bold">سخ</span>
                      </div>
                      <div>
                        <div className="font-medium">سارة خالد</div>
                        <div className="text-sm text-muted-foreground">مطورة واجهات المستخدم</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center ml-3">
                        <span className="font-bold">مع</span>
                      </div>
                      <div>
                        <div className="font-medium">محمد علي</div>
                        <div className="text-sm text-muted-foreground">مطور خلفية</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6 rounded-xl border bg-card text-card-foreground shadow">
            <CardHeader>
              <CardTitle>أحدث الأنشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-r-4 border-blue-500 pr-4 py-2">
                  <h3 className="font-bold">تم إكمال مرحلة تطوير النموذج الأولي</h3>
                  <p className="text-muted-foreground">تم الانتهاء من تطوير النموذج الأولي للمنتج وجاهز للاختبار</p>
                  <p className="text-xs text-muted-foreground">منذ يومين</p>
                </div>
                <div className="border-r-4 border-green-500 pr-4 py-2">
                  <h3 className="font-bold">تم استلام دفعة التمويل الثانية</h3>
                  <p className="text-muted-foreground">تمت الموافقة على طلب التمويل وتم استلام $25,000</p>
                  <p className="text-xs text-muted-foreground">منذ 3 أيام</p>
                </div>
                <div className="border-r-4 border-amber-500 pr-4 py-2">
                  <h3 className="font-bold">جلسة إرشادية مع د. سارة الأحمد</h3>
                  <p className="text-muted-foreground">تمت مناقشة استراتيجية التسويق وخطة النمو</p>
                  <p className="text-xs text-muted-foreground">منذ أسبوع</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="milestones">
          <Card className="rounded-xl border bg-card text-card-foreground shadow">
            <CardHeader>
              <CardTitle>المراحل والأهداف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">تقدم المشروع</h3>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-muted-foreground">0%</span>
                    <span className="text-sm text-muted-foreground">100%</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">المراحل المكتملة</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                        <h4 className="font-bold">تحديد الفكرة والدراسة الأولية</h4>
                      </div>
                      <p className="text-muted-foreground">تم تحديد الفكرة وإجراء دراسة السوق الأولية</p>
                      <p className="text-xs text-muted-foreground">تم الإكمال في: 15 يناير 2025</p>
                    </div>
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                        <h4 className="font-bold">تطوير خطة العمل</h4>
                      </div>
                      <p className="text-muted-foreground">تم تطوير خطة عمل مفصلة ونموذج أعمال</p>
                      <p className="text-xs text-muted-foreground">تم الإكمال في: 1 فبراير 2025</p>
                    </div>
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                        <h4 className="font-bold">تصميم واجهات المستخدم</h4>
                      </div>
                      <p className="text-muted-foreground">تم تصميم واجهات المستخدم وتجربة المستخدم</p>
                      <p className="text-xs text-muted-foreground">تم الإكمال في: 20 فبراير 2025</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">المراحل القادمة</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-amber-500 pr-4 py-2">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 ml-2 text-amber-500" />
                        <h4 className="font-bold">اختبار المستخدمين</h4>
                      </div>
                      <p className="text-muted-foreground">إجراء اختبارات المستخدمين وجمع الملاحظات</p>
                      <p className="text-xs text-muted-foreground">الموعد النهائي: 15 مارس 2025</p>
                    </div>
                    <div className="border-r-4 border-blue-500 pr-4 py-2">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 ml-2 text-blue-500" />
                        <h4 className="font-bold">تطوير النسخة النهائية</h4>
                      </div>
                      <p className="text-muted-foreground">تطوير النسخة النهائية من المنتج بناءً على ملاحظات المستخدمين</p>
                      <p className="text-xs text-muted-foreground">الموعد النهائي: 1 أبريل 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mentors">
          <Card className="rounded-xl border bg-card text-card-foreground shadow">
            <CardHeader>
              <CardTitle>الموجهون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">الموجهون المخصصون</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center ml-3">
                          <span className="font-bold">س</span>
                        </div>
                        <div>
                          <div className="font-bold">د. سارة الأحمد</div>
                          <div className="text-sm text-muted-foreground">خبيرة في التقنية المالية</div>
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="text-amber-500 text-sm">★★★★★</div>
                        <span className="text-sm mr-1">5.0</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium">مجالات الخبرة:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">التقنية المالية</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">نماذج الأعمال</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">التسويق</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center ml-3">
                          <span className="font-bold">م</span>
                        </div>
                        <div>
                          <div className="font-bold">م. محمد العلي</div>
                          <div className="text-sm text-muted-foreground">خبير تقني</div>
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="text-amber-500 text-sm">★★★★☆</div>
                        <span className="text-sm mr-1">4.8</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium">مجالات الخبرة:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">تطوير البرمجيات</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">الذكاء الاصطناعي</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">البنية التحتية</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">جلسات الإرشاد القادمة</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">جلسة إرشادية: استراتيجية التسويق</h4>
                        <p className="text-sm text-muted-foreground">د. سارة الأحمد</p>
                      </div>
                      <p className="text-sm">اليوم، 3:00 م</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">جلسة إرشادية: تحسين البنية التقنية</h4>
                        <p className="text-sm text-muted-foreground">م. محمد العلي</p>
                      </div>
                      <p className="text-sm">الخميس، 11:00 ص</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">سجل الجلسات السابقة</h3>
                  <div className="space-y-3">
                    <div className="border-r-4 border-gray-300 pr-4 py-2">
                      <h4 className="font-bold">جلسة إرشادية: خطة النمو</h4>
                      <p className="text-muted-foreground">د. سارة الأحمد</p>
                      <p className="text-xs text-muted-foreground">25 فبراير 2025</p>
                    </div>
                    <div className="border-r-4 border-gray-300 pr-4 py-2">
                      <h4 className="font-bold">جلسة إرشادية: تحسين تجربة المستخدم</h4>
                      <p className="text-muted-foreground">م. محمد العلي</p>
                      <p className="text-xs text-muted-foreground">18 فبراير 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="funding">
          <Card className="rounded-xl border bg-card text-card-foreground shadow">
            <CardHeader>
              <CardTitle>التمويل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">ملخص التمويل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">$75,000</div>
                      <p className="text-muted-foreground">إجمالي التمويل المخصص</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">$50,000</div>
                      <p className="text-muted-foreground">التمويل المستلم</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">$25,000</div>
                      <p className="text-muted-foreground">التمويل المتبقي</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "66.7%" }}></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">دفعات التمويل</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                        <h4 className="font-bold">الدفعة الأولى</h4>
                      </div>
                      <p className="text-muted-foreground">$25,000 - تم استلامها بعد قبول المشروع في البرنامج</p>
                      <p className="text-xs text-muted-foreground">تاريخ الاستلام: 15 يناير 2025</p>
                    </div>
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                        <h4 className="font-bold">الدفعة الثانية</h4>
                      </div>
                      <p className="text-muted-foreground">$25,000 - تم استلامها بعد إكمال مرحلة تطوير النموذج الأولي</p>
                      <p className="text-xs text-muted-foreground">تاريخ الاستلام: 28 فبراير 2025</p>
                    </div>
                    <div className="border-r-4 border-blue-500 pr-4 py-2">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 ml-2 text-blue-500" />
                        <h4 className="font-bold">الدفعة الثالثة</h4>
                      </div>
                      <p className="text-muted-foreground">$25,000 - سيتم استلامها بعد إطلاق المنتج</p>
                      <p className="text-xs text-muted-foreground">التاريخ المتوقع: 15 أبريل 2025</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">طلبات التمويل</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">طلب تمويل إضافي</h4>
                        <p className="text-sm text-muted-foreground">$15,000 لتطوير ميزات إضافية</p>
                      </div>
                      <p className="text-sm text-amber-500">قيد المراجعة</p>
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
