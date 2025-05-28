"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@prisma/client"
export default function ParticipantDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <RouteGuard 
      requiredPermission={{ category: 'dashboard', action: 'view' }}
      requiredRole={UserRole.PARTICIPANT}
    >
      
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">مرحباً بك في الهاكاثون</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="schedule">الجدول الزمني</TabsTrigger>
          <TabsTrigger value="team">فريقي</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>حالة المشروع</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-amber-500">قيد التطوير</p>
                  <p className="text-muted-foreground mt-2">آخر تحديث: منذ 3 ساعات</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>الفعاليات القادمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">جلسة إرشادية</p>
                  <p className="text-muted-foreground mt-2">اليوم، 4:00 مساءً</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>الوقت المتبقي</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-red-500">3 أيام، 8 ساعات</p>
                  <p className="text-muted-foreground mt-2">حتى موعد التسليم النهائي</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>إعلانات مهمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-r-4 border-blue-500 pr-4 py-2">
                  <h3 className="font-bold">تم تحديث جدول الجلسات الإرشادية</h3>
                  <p className="text-muted-foreground">تم إضافة جلسات إرشادية جديدة يوم الخميس. يرجى الاطلاع على الجدول.</p>
                </div>
                <div className="border-r-4 border-green-500 pr-4 py-2">
                  <h3 className="font-bold">تم فتح باب التسجيل في ورشة العمل</h3>
                  <p className="text-muted-foreground">ورشة عمل حول تقنيات الذكاء الاصطناعي يوم الأربعاء.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الفريق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">اسم الفريق</h3>
                  <p>فريق المبتكرون</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">أعضاء الفريق</h3>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>أحمد محمد (قائد الفريق)</li>
                    <li>سارة خالد (مطور واجهات)</li>
                    <li>محمد علي (مطور خلفية)</li>
                    <li>نورة سعد (مصممة)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg">المشروع</h3>
                  <p>تطبيق ذكي لإدارة النفايات وتعزيز إعادة التدوير</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>الجدول الزمني للهاكاثون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-r-4 border-green-500 pr-4 py-2">
                  <h3 className="font-bold">اليوم الأول - الثلاثاء</h3>
                  <ul className="mt-2 space-y-1">
                    <li>9:00 ص - 10:00 ص: حفل الافتتاح</li>
                    <li>10:30 ص - 12:00 م: ورشة عمل تقنية</li>
                    <li>1:00 م - 5:00 م: بدء العمل على المشاريع</li>
                  </ul>
                </div>
                <div className="border-r-4 border-blue-500 pr-4 py-2">
                  <h3 className="font-bold">اليوم الثاني - الأربعاء</h3>
                  <ul className="mt-2 space-y-1">
                    <li>9:00 ص - 10:00 ص: جلسة متابعة</li>
                    <li>10:30 ص - 4:00 م: العمل على المشاريع</li>
                    <li>4:00 م - 5:00 م: جلسات إرشادية</li>
                  </ul>
                </div>
                <div className="border-r-4 border-purple-500 pr-4 py-2">
                  <h3 className="font-bold">اليوم الثالث - الخميس</h3>
                  <ul className="mt-2 space-y-1">
                    <li>9:00 ص - 12:00 م: العمل على المشاريع</li>
                    <li>1:00 م - 3:00 م: التحضير للعروض</li>
                    <li>4:00 م - 6:00 م: عرض المشاريع والتقييم</li>
                    <li>7:00 م - 8:00 م: حفل الختام وإعلان الفائزين</li>
                  </ul>
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
