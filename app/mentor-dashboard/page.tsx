"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Rocket,
  Star,
  Award
} from "lucide-react"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <RouteGuard 
      requiredPermission={{ category: 'dashboard', action: 'view' }}
      requiredRole={UserRole.MENTOR}
    >
      
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">مرحباً بك د. خالد العمري</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="feedback">التقييمات</TabsTrigger>
          <TabsTrigger value="sessions">الجلسات</TabsTrigger>
          <TabsTrigger value="startups">الشركات الناشئة</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الشركات الناشئة</CardTitle>
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">شركات ناشئة تحت إشرافك</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">جلسات الإرشاد</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">3 جلسات قادمة هذا الأسبوع</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">التقييم</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.9/5</div>
                  <p className="text-xs text-muted-foreground">متوسط تقييم الشركات الناشئة</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ساعات الإرشاد</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32</div>
                  <p className="text-xs text-muted-foreground">ساعة إرشاد هذا الشهر</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الجلسات القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 ml-2 text-red-500" />
                      <div>
                        <div className="font-medium">جلسة إرشادية: شركة هيلث تك</div>
                        <div className="text-sm text-muted-foreground">اليوم، 3:00 م</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">تقنيات صحية</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 ml-2 text-amber-500" />
                      <div>
                        <div className="font-medium">جلسة إرشادية: شركة ميديكال إيه آي</div>
                        <div className="text-sm text-muted-foreground">غداً، 11:00 ص</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">ذكاء اصطناعي</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 ml-2 text-amber-500" />
                      <div>
                        <div className="font-medium">جلسة إرشادية جماعية</div>
                        <div className="text-sm text-muted-foreground">الخميس، 2:00 م</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">جميع الشركات</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>الشركات الناشئة تحت إشرافك</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center ml-3">
                        <span className="font-bold">هت</span>
                      </div>
                      <div>
                        <div className="font-medium">هيلث تك</div>
                        <div className="text-sm text-muted-foreground">تقنيات صحية</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 ml-1" />
                      <span>5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center ml-3">
                        <span className="font-bold">مأ</span>
                      </div>
                      <div>
                        <div className="font-medium">ميديكال إيه آي</div>
                        <div className="text-sm text-muted-foreground">ذكاء اصطناعي في الصحة</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 ml-1" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center ml-3">
                        <span className="font-bold">دأ</span>
                      </div>
                      <div>
                        <div className="font-medium">دوكتور أونلاين</div>
                        <div className="text-sm text-muted-foreground">استشارات طبية عن بعد</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 ml-1" />
                      <span>4.7</span>
                    </div>
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
                  <h3 className="font-bold">تم إكمال جلسة إرشادية</h3>
                  <p className="text-muted-foreground">جلسة إرشادية مع شركة هيلث تك حول تطوير النموذج الأولي</p>
                  <p className="text-xs text-muted-foreground">منذ يومين</p>
                </div>
                <div className="border-r-4 border-green-500 pr-4 py-2">
                  <h3 className="font-bold">تم تقديم ملاحظات</h3>
                  <p className="text-muted-foreground">تم تقديم ملاحظات على خطة عمل شركة ميديكال إيه آي</p>
                  <p className="text-xs text-muted-foreground">منذ 3 أيام</p>
                </div>
                <div className="border-r-4 border-amber-500 pr-4 py-2">
                  <h3 className="font-bold">تم تعيينك كموجه</h3>
                  <p className="text-muted-foreground">تم تعيينك كموجه لشركة دوكتور أونلاين</p>
                  <p className="text-xs text-muted-foreground">منذ أسبوع</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="startups">
          <Card>
            <CardHeader>
              <CardTitle>الشركات الناشئة تحت إشرافك</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-r-4 border-blue-500 pr-4 py-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center ml-3">
                      <span className="font-bold">هت</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">هيلث تك</div>
                      <div className="text-sm text-muted-foreground">تقنيات صحية</div>
                    </div>
                    <div className="flex items-center mr-auto">
                      <Star className="h-4 w-4 text-amber-500 ml-1" />
                      <span>5.0</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-1">تقدم المشروع: 75%</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">المرحلة الحالية</div>
                      <div className="text-sm">تطوير النموذج الأولي</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">الجلسة القادمة</div>
                      <div className="text-sm">اليوم، 3:00 م</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">عدد الجلسات</div>
                      <div className="text-sm">8 جلسات</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-r-4 border-purple-500 pr-4 py-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-purple-500 text-white flex items-center justify-center ml-3">
                      <span className="font-bold">مأ</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">ميديكال إيه آي</div>
                      <div className="text-sm text-muted-foreground">ذكاء اصطناعي في الصحة</div>
                    </div>
                    <div className="flex items-center mr-auto">
                      <Star className="h-4 w-4 text-amber-500 ml-1" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-1">تقدم المشروع: 60%</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">المرحلة الحالية</div>
                      <div className="text-sm">تطوير الخوارزميات</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">الجلسة القادمة</div>
                      <div className="text-sm">غداً، 11:00 ص</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">عدد الجلسات</div>
                      <div className="text-sm">6 جلسات</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>جلسات الإرشاد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">الجلسات القادمة</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-red-500 pr-4 py-2">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 ml-2 text-red-500" />
                        <h4 className="font-bold">جلسة إرشادية: شركة هيلث تك</h4>
                      </div>
                      <p className="text-muted-foreground">مراجعة النموذج الأولي وتقديم ملاحظات</p>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm">المدة: ساعة واحدة</div>
                        <div className="text-sm">اليوم، 3:00 م</div>
                      </div>
                    </div>
                    <div className="border-r-4 border-amber-500 pr-4 py-2">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 ml-2 text-amber-500" />
                        <h4 className="font-bold">جلسة إرشادية: شركة ميديكال إيه آي</h4>
                      </div>
                      <p className="text-muted-foreground">مناقشة تحديات تطوير الخوارزميات</p>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm">المدة: ساعة واحدة</div>
                        <div className="text-sm">غداً، 11:00 ص</div>
                      </div>
                    </div>
                    <div className="border-r-4 border-amber-500 pr-4 py-2">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 ml-2 text-amber-500" />
                        <h4 className="font-bold">جلسة إرشادية جماعية</h4>
                      </div>
                      <p className="text-muted-foreground">مناقشة تحديات التسويق في مجال التقنيات الصحية</p>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm">المدة: ساعتان</div>
                        <div className="text-sm">الخميس، 2:00 م</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">الجلسات السابقة</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-gray-300 pr-4 py-2">
                      <h4 className="font-bold">جلسة إرشادية: شركة هيلث تك</h4>
                      <p className="text-muted-foreground">مناقشة خطة تطوير المنتج</p>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm">المدة: ساعة واحدة</div>
                        <div className="text-sm">25 فبراير 2025</div>
                      </div>
                    </div>
                    <div className="border-r-4 border-gray-300 pr-4 py-2">
                      <h4 className="font-bold">جلسة إرشادية: شركة ميديكال إيه آي</h4>
                      <p className="text-muted-foreground">مراجعة خطة العمل</p>
                      <div className="flex justify-between mt-2">
                        <div className="text-sm">المدة: ساعة واحدة</div>
                        <div className="text-sm">20 فبراير 2025</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>التقييمات والملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">تقييمات الشركات الناشئة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">4.9</div>
                      <div className="text-amber-500 text-sm">★★★★★</div>
                      <p className="text-muted-foreground">متوسط التقييم</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">18</div>
                      <p className="text-muted-foreground">تقييم</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold">100%</div>
                      <p className="text-muted-foreground">معدل الرضا</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-4">أحدث التقييمات</h3>
                  <div className="space-y-4">
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center ml-3">
                            <span className="font-bold">هت</span>
                          </div>
                          <div>
                            <div className="font-medium">هيلث تك</div>
                            <div className="text-sm text-muted-foreground">25 فبراير 2025</div>
                          </div>
                        </div>
                        <div className="text-amber-500">★★★★★</div>
                      </div>
                      <p className="mt-2 text-muted-foreground">"د. خالد قدم لنا ملاحظات قيمة جداً ساعدتنا في تحسين النموذج الأولي للمنتج. نقدر خبرته العميقة في مجال التقنيات الصحية."</p>
                    </div>
                    <div className="border-r-4 border-green-500 pr-4 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center ml-3">
                            <span className="font-bold">مأ</span>
                          </div>
                          <div>
                            <div className="font-medium">ميديكال إيه آي</div>
                            <div className="text-sm text-muted-foreground">20 فبراير 2025</div>
                          </div>
                        </div>
                        <div className="text-amber-500">★★★★★</div>
                      </div>
                      <p className="mt-2 text-muted-foreground">"جلسة إرشادية ممتازة مع د. خالد. ساعدنا في تحديد التحديات الرئيسية في تطوير الخوارزميات واقترح حلولاً عملية."</p>
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
