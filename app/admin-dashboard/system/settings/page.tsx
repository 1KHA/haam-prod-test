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
        
        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>خدمات البريد الإلكتروني</CardTitle>
                <CardDescription>إعدادات خدمة إرسال البريد الإلكتروني</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">مزود خدمة البريد</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailchimp">Mailchimp</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">خادم SMTP</label>
                  <Input defaultValue="smtp.example.com" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">منفذ SMTP</label>
                  <Input defaultValue="587" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم المستخدم</label>
                  <Input defaultValue="noreply@example.com" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <Input type="password" defaultValue="********" />
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    اختبار الاتصال
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>واجهات برمجة التطبيقات</CardTitle>
                <CardDescription>إدارة تكاملات API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      تكوين
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium">خدمة المدفوعات</h3>
                    <p className="text-sm text-muted-foreground">Stripe</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      تكوين
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium">تحليلات البيانات</h3>
                    <p className="text-sm text-muted-foreground">Google Analytics</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      تكوين
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium">التخزين السحابي</h3>
                    <p className="text-sm text-muted-foreground">Amazon S3</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      تكوين
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium">المصادقة الاجتماعية</h3>
                    <p className="text-sm text-muted-foreground">Google, LinkedIn, Twitter</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="default" className="w-full">
                    إضافة تكامل جديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>تكوين إشعارات النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">إشعارات البريد الإلكتروني</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input type="checkbox" id="email-user-reg" className="ml-2" defaultChecked />
                        <label htmlFor="email-user-reg">تسجيل مستخدم جديد</label>
                      </div>
                      <select className="p-1 border rounded-md text-xs">
                        <option value="instant">فوري</option>
                        <option value="daily">يومي</option>
                        <option value="weekly">أسبوعي</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input type="checkbox" id="email-funding" className="ml-2" defaultChecked />
                        <label htmlFor="email-funding">طلبات التمويل</label>
                      </div>
                      <select className="p-1 border rounded-md text-xs">
                        <option value="instant">فوري</option>
                        <option value="daily">يومي</option>
                        <option value="weekly">أسبوعي</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input type="checkbox" id="email-program" className="ml-2" defaultChecked />
                        <label htmlFor="email-program">تحديثات البرامج</label>
                      </div>
                      <select className="p-1 border rounded-md text-xs">
                        <option value="instant">فوري</option>
                        <option value="daily">يومي</option>
                        <option value="weekly">أسبوعي</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input type="checkbox" id="email-system" className="ml-2" defaultChecked />
                        <label htmlFor="email-system">تنبيهات النظام</label>
                      </div>
                      <select className="p-1 border rounded-md text-xs">
                        <option value="instant">فوري</option>
                        <option value="daily">يومي</option>
                        <option value="weekly">أسبوعي</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">إشعارات داخل النظام</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="in-app-user-reg" className="ml-2" defaultChecked />
                      <label htmlFor="in-app-user-reg">تسجيل مستخدم جديد</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="in-app-funding" className="ml-2" defaultChecked />
                      <label htmlFor="in-app-funding">طلبات التمويل</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="in-app-program" className="ml-2" defaultChecked />
                      <label htmlFor="in-app-program">تحديثات البرامج</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="in-app-system" className="ml-2" defaultChecked />
                      <label htmlFor="in-app-system">تنبيهات النظام</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاحتفاظ بالإشعارات</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="30">30 يومًا</option>
                    <option value="60">60 يومًا</option>
                    <option value="90">90 يومًا</option>
                    <option value="180">180 يومًا</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>قوالب الإشعارات</CardTitle>
                <CardDescription>تخصيص قوالب الإشعارات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">قالب تسجيل مستخدم جديد</label>
                  <textarea 
                    className="w-full p-2 border rounded-md h-24 resize-none" 
                    defaultValue="مرحبًا {name}،

نرحب بك في منصة المسرعات والحاضنات! تم إنشاء حسابك بنجاح.

فريق المنصة"
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">قالب طلب التمويل</label>
                  <textarea 
                    className="w-full p-2 border rounded-md h-24 resize-none" 
                    defaultValue="مرحبًا {name}،

تم استلام طلب تمويل جديد من {startup_name} بقيمة {amount}.

فريق المنصة"
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">قالب تنبيه النظام</label>
                  <textarea 
                    className="w-full p-2 border rounded-md h-24 resize-none" 
                    defaultValue="تنبيه نظام: {alert_message}

الوقت: {time}
الإجراء المطلوب: {action_required}

فريق المنصة"
                  ></textarea>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    استعادة القوالب الافتراضية
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
                <CardDescription>تكوين سياسات الأمان</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">سياسة كلمة المرور</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="pwd-length" className="ml-2" defaultChecked />
                      <label htmlFor="pwd-length">الحد الأدنى 8 أحرف</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="pwd-uppercase" className="ml-2" defaultChecked />
                      <label htmlFor="pwd-uppercase">تتطلب حرف كبير</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="pwd-number" className="ml-2" defaultChecked />
                      <label htmlFor="pwd-number">تتطلب رقم</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="pwd-special" className="ml-2" defaultChecked />
                      <label htmlFor="pwd-special">تتطلب حرف خاص</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">انتهاء صلاحية كلمة المرور</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="never">لا تنتهي أبدًا</option>
                    <option value="30">كل 30 يومًا</option>
                    <option value="60">كل 60 يومًا</option>
                    <option value="90">كل 90 يومًا</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">المصادقة الثنائية</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="2fa-admin" className="ml-2" defaultChecked />
                      <label htmlFor="2fa-admin">إلزامية للمسؤولين</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="2fa-managers" className="ml-2" defaultChecked />
                      <label htmlFor="2fa-managers">إلزامية لمديري البرامج</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="2fa-users" className="ml-2" />
                      <label htmlFor="2fa-users">إلزامية لجميع المستخدمين</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">قفل الحساب</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="lock-attempts" className="ml-2" defaultChecked />
                      <label htmlFor="lock-attempts">قفل بعد 5 محاولات فاشلة</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="lock-inactive" className="ml-2" defaultChecked />
                      <label htmlFor="lock-inactive">قفل الحسابات غير النشطة بعد 90 يومًا</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>سجلات الأمان</CardTitle>
                <CardDescription>إعدادات تسجيل الأحداث الأمنية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">تسجيل الأحداث</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="log-login" className="ml-2" defaultChecked />
                      <label htmlFor="log-login">تسجيل الدخول والخروج</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="log-failed" className="ml-2" defaultChecked />
                      <label htmlFor="log-failed">محاولات تسجيل الدخول الفاشلة</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="log-pwd-change" className="ml-2" defaultChecked />
                      <label htmlFor="log-pwd-change">تغييرات كلمة المرور</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="log-role-change" className="ml-2" defaultChecked />
                      <label htmlFor="log-role-change">تغييرات الأدوار والصلاحيات</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="log-data-access" className="ml-2" defaultChecked />
                      <label htmlFor="log-data-access">الوصول إلى البيانات الحساسة</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="log-admin" className="ml-2" defaultChecked />
                      <label htmlFor="log-admin">إجراءات المسؤول</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاحتفاظ بالسجلات</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="90">90 يومًا</option>
                    <option value="180">180 يومًا</option>
                    <option value="365">سنة</option>
                    <option value="730">سنتان</option>
                  </select>
                </div>
                
                <div className="pt-4">
