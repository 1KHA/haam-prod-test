"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Save, 
  RefreshCw, 
  Database, 
  Server, 
  Globe, 
  Mail, 
  Bell, 
  Shield,
  FileText,
  Upload,
  Download,
  Check,
  X
} from "lucide-react"

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSave = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>حفظ الإعدادات</span>
        </Button>
        <h1 className="text-3xl font-bold">إعدادات النظام</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="integrations">التكاملات</TabsTrigger>
          <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
          <TabsTrigger value="general">عام</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات المنصة</CardTitle>
                <CardDescription>الإعدادات العامة للمنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم المنصة</label>
                  <Input defaultValue="منصة المسرعات والحاضنات" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">وصف المنصة</label>
                  <Input defaultValue="منصة متكاملة لإدارة المسرعات والحاضنات والشركات الناشئة" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني للدعم</label>
                  <Input defaultValue="support@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف للدعم</label>
                  <Input defaultValue="+966 12 345 6789" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الواجهة</CardTitle>
                <CardDescription>تخصيص واجهة المستخدم</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اللغة الافتراضية</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="ar">العربية</option>
                    <option value="en">الإنجليزية</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">السمة الافتراضية</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="light">فاتح</option>
                    <option value="dark">داكن</option>
                    <option value="system">حسب النظام</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">عناصر في الصفحة</label>
                  <Input type="number" defaultValue="10" min="5" max="100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">تمكين الوضع المبسط للمستخدمين الجدد</label>
                  <div className="flex items-center">
                    <input type="checkbox" id="simple-mode" className="ml-2" defaultChecked />
                    <label htmlFor="simple-mode">تفعيل</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="database">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات قاعدة البيانات</CardTitle>
                <CardDescription>إدارة قاعدة البيانات والنسخ الاحتياطي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">حالة قاعدة البيانات:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="h-3 w-3 ml-1" />
                      متصلة
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">إصدار قاعدة البيانات:</span>
                    <span>PostgreSQL 14.5</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">حجم قاعدة البيانات:</span>
                    <span>1.2 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">آخر نسخة احتياطية:</span>
                    <span>12 مارس 2025، 10:30 صباحًا</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-1 flex-1">
                    <Download className="h-4 w-4" />
                    <span>تنزيل نسخة احتياطية</span>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-1 flex-1">
                    <Upload className="h-4 w-4" />
                    <span>استعادة من نسخة احتياطية</span>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">جدولة النسخ الاحتياطي التلقائي</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="daily">يوميًا</option>
                    <option value="weekly">أسبوعيًا</option>
                    <option value="monthly">شهريًا</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاحتفاظ بالنسخ الاحتياطية لمدة</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="7">7 أيام</option>
                    <option value="30">30 يومًا</option>
                    <option value="90">90 يومًا</option>
                    <option value="365">سنة</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>إدارة البيانات</CardTitle>
                <CardDescription>تنظيف وصيانة البيانات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">تنظيف البيانات القديمة</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="clean-logs" className="ml-2" defaultChecked />
                      <label htmlFor="clean-logs">سجلات النظام الأقدم من 90 يومًا</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="clean-temp" className="ml-2" defaultChecked />
                      <label htmlFor="clean-temp">الملفات المؤقتة الأقدم من 30 يومًا</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="clean-deleted" className="ml-2" defaultChecked />
                      <label htmlFor="clean-deleted">العناصر المحذوفة الأقدم من 30 يومًا</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">جدولة تنظيف البيانات</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="weekly">أسبوعيًا</option>
                    <option value="monthly">شهريًا</option>
                    <option value="quarterly">ربع سنوي</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <Button variant="destructive" className="w-full">
                    تنظيف البيانات الآن
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    إعادة بناء الفهارس
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
