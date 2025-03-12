"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  User, 
  Clock,
  Calendar,
  FileText,
  Database,
  Lock,
  Eye,
  RefreshCw,
  ArrowDownToLine,
  XCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function SecurityLogs() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("week")
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])

  // Sample logs data
  const logs = [
    { 
      id: "1", 
      action: "تسجيل دخول", 
      user: "أحمد محمد", 
      userRole: "مدير نظام", 
      status: "نجاح", 
      timestamp: "12 مارس 2025 10:15:22",
      ipAddress: "192.168.1.105",
      userAgent: "Chrome 120.0.0.0 / Windows",
      details: "تسجيل دخول ناجح من الرياض، المملكة العربية السعودية",
      severity: "منخفض"
    },
    { 
      id: "2", 
      action: "تغيير كلمة المرور", 
      user: "سارة العتيبي", 
      userRole: "مدير برنامج", 
      status: "نجاح", 
      timestamp: "12 مارس 2025 09:45:10",
      ipAddress: "192.168.1.110",
      userAgent: "Firefox 115.0 / macOS",
      details: "تم تغيير كلمة المرور بنجاح",
      severity: "منخفض"
    },
    { 
      id: "3", 
      action: "محاولة تسجيل دخول", 
      user: "خالد العمري", 
      userRole: "مستثمر", 
      status: "فشل", 
      timestamp: "12 مارس 2025 08:30:45",
      ipAddress: "192.168.1.120",
      userAgent: "Safari 17.0 / iOS",
      details: "فشل تسجيل الدخول: كلمة مرور غير صحيحة (المحاولة الثالثة)",
      severity: "متوسط"
    },
    { 
      id: "4", 
      action: "تعديل صلاحيات المستخدم", 
      user: "محمد القحطاني", 
      userRole: "مدير نظام", 
      status: "نجاح", 
      timestamp: "11 مارس 2025 16:20:33",
      ipAddress: "192.168.1.105",
      userAgent: "Chrome 120.0.0.0 / Windows",
      details: "تم تعديل صلاحيات المستخدم 'فاطمة الزهراء' من 'موجه' إلى 'مدير برنامج'",
      severity: "متوسط"
    },
    { 
      id: "5", 
      action: "محاولة وصول غير مصرح", 
      user: "مجهول", 
      userRole: "غير معروف", 
      status: "فشل", 
      timestamp: "11 مارس 2025 14:55:18",
      ipAddress: "203.0.113.42",
      userAgent: "Mozilla/5.0 (compatible; Bot/1.0)",
      details: "محاولة وصول غير مصرح بها إلى واجهة برمجة التطبيقات للإدارة",
      severity: "عالي"
    },
    { 
      id: "6", 
      action: "تصدير بيانات", 
      user: "نورة السعيد", 
      userRole: "مدير برنامج", 
      status: "نجاح", 
      timestamp: "11 مارس 2025 11:10:05",
      ipAddress: "192.168.1.115",
      userAgent: "Edge 120.0.0.0 / Windows",
      details: "تم تصدير بيانات الشركات الناشئة (120 سجل)",
      severity: "منخفض"
    },
    { 
      id: "7", 
      action: "تغيير إعدادات النظام", 
      user: "أحمد محمد", 
      userRole: "مدير نظام", 
      status: "نجاح", 
      timestamp: "11 مارس 2025 10:05:30",
      ipAddress: "192.168.1.105",
      userAgent: "Chrome 120.0.0.0 / Windows",
      details: "تم تغيير إعدادات البريد الإلكتروني للنظام",
      severity: "متوسط"
    },
    { 
      id: "8", 
      action: "محاولة اختراق", 
      user: "مجهول", 
      userRole: "غير معروف", 
      status: "فشل", 
      timestamp: "10 مارس 2025 23:45:12",
      ipAddress: "198.51.100.77",
      userAgent: "Mozilla/5.0 (compatible; Bot/2.0)",
      details: "محاولة هجوم حقن SQL على نموذج تسجيل الدخول",
      severity: "عالي"
    },
    { 
      id: "9", 
      action: "إنشاء مستخدم جديد", 
      user: "محمد القحطاني", 
      userRole: "مدير نظام", 
      status: "نجاح", 
      timestamp: "10 مارس 2025 15:30:22",
      ipAddress: "192.168.1.105",
      userAgent: "Chrome 120.0.0.0 / Windows",
      details: "تم إنشاء حساب مستخدم جديد: 'عبدالله الغامدي' بدور 'موجه'",
      severity: "منخفض"
    },
    { 
      id: "10", 
      action: "نسخ احتياطي للنظام", 
      user: "النظام", 
      userRole: "نظام", 
      status: "نجاح", 
      timestamp: "10 مارس 2025 03:00:00",
      ipAddress: "127.0.0.1",
      userAgent: "System Task",
      details: "تم إنشاء نسخة احتياطية مجدولة لقاعدة البيانات",
      severity: "منخفض"
    }
  ]

  // Filter logs based on active tab, search query, and date range
  const filteredLogs = logs.filter(log => {
    // Filter by tab
    if (activeTab === "success" && log.status !== "نجاح") return false
    if (activeTab === "failure" && log.status !== "فشل") return false
    if (activeTab === "high" && log.severity !== "عالي") return false
    if (activeTab === "medium" && log.severity !== "متوسط") return false
    if (activeTab === "low" && log.severity !== "منخفض") return false
    if (activeTab === "system" && log.userRole !== "نظام") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        log.action.toLowerCase().includes(query) ||
        log.user.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        log.ipAddress.toLowerCase().includes(query)
      )
    }

    // Filter by date range (simplified for demo)
    // In a real app, you would parse the timestamp and compare with actual date ranges
    if (dateRange === "today" && !log.timestamp.includes("12 مارس")) return false
    if (dateRange === "yesterday" && !log.timestamp.includes("11 مارس")) return false
    if (dateRange === "week" && !log.timestamp.includes("مارس")) return false

    return true
  })

  const toggleLogSelection = (logId: string) => {
    if (selectedLogs.includes(logId)) {
      setSelectedLogs(selectedLogs.filter(id => id !== logId))
    } else {
      setSelectedLogs([...selectedLogs, logId])
    }
  }

  const selectAllLogs = () => {
    if (selectedLogs.length === filteredLogs.length) {
      setSelectedLogs([])
    } else {
      setSelectedLogs(filteredLogs.map(log => log.id))
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowDownToLine className="h-4 w-4" />
            <span>تصدير السجلات</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>تحديث</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">سجلات النظام والأمان</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي السجلات</span>
              <FileText className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs.length}</div>
            <div className="text-sm text-muted-foreground mt-1">آخر 7 أيام</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>تنبيهات أمنية</span>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs.filter(log => log.severity === "عالي").length}</div>
            <div className="text-sm text-muted-foreground mt-1">تنبيهات عالية الخطورة</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>محاولات فاشلة</span>
              <XCircle className="h-5 w-5 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs.filter(log => log.status === "فشل").length}</div>
            <div className="text-sm text-muted-foreground mt-1">محاولات وصول فاشلة</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>عمليات ناجحة</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs.filter(log => log.status === "نجاح").length}</div>
            <div className="text-sm text-muted-foreground mt-1">عمليات تمت بنجاح</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في السجلات..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-4">
          <select 
            className="p-2 border rounded-md"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">اليوم</option>
            <option value="yesterday">الأمس</option>
            <option value="week">آخر 7 أيام</option>
            <option value="month">آخر 30 يوم</option>
          </select>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="system">النظام</TabsTrigger>
              <TabsTrigger value="low">منخفض</TabsTrigger>
              <TabsTrigger value="medium">متوسط</TabsTrigger>
              <TabsTrigger value="high">عالي</TabsTrigger>
              <TabsTrigger value="failure">فشل</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedLogs.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>تصدير المحدد</span>
                  </Button>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1">
                    <Trash2 className="h-4 w-4" />
                    <span>حذف المحدد</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>سجلات النظام ({filteredLogs.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-7 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="ml-2"
                  checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                  onChange={selectAllLogs}
                />
                <span>الخطورة</span>
              </div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">عنوان IP</div>
              <div className="col-span-1">المستخدم</div>
              <div className="col-span-1">التفاصيل</div>
              <div className="col-span-1">التوقيت</div>
              <div className="col-span-1">الإجراء</div>
            </div>
            
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedLogs.includes(log.id)}
                      onChange={() => toggleLogSelection(log.id)}
                    />
                    {log.severity === "عالي" ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : log.severity === "متوسط" ? (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="col-span-1">
                    {log.status === "نجاح" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        نجاح
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        فشل
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">{log.ipAddress}</div>
                  <div className="col-span-1">{log.user} ({log.userRole})</div>
                  <div className="col-span-1 truncate" title={log.details}>{log.details}</div>
                  <div className="col-span-1">{log.timestamp}</div>
                  <div className="col-span-1">{log.action}</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                لا توجد نتائج مطابقة لبحثك
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {activeTab === "high" && filteredLogs.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>تنبيهات أمنية عالية الخطورة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border border-red-200 rounded-md bg-red-50">
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>التفاصيل</span>
                    </Button>
                    <Button variant="default" size="sm" className="flex items-center gap-1 bg-red-600 hover:bg-red-700">
                      <Shield className="h-4 w-4" />
                      <span>اتخاذ إجراء</span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{log.action}</div>
                    <div className="text-sm text-red-700">{log.details}</div>
                    <div className="text-xs text-red-600">{log.timestamp} • {log.ipAddress}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع الإجراءات</span>
              <FileText className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "تسجيل دخول", count: logs.filter(log => log.action === "تسجيل دخول").length },
                { action: "محاولة تسجيل دخول", count: logs.filter(log => log.action === "محاولة تسجيل دخول").length },
                { action: "تغيير كلمة المرور", count: logs.filter(log => log.action === "تغيير كلمة المرور").length },
                { action: "تعديل صلاحيات المستخدم", count: logs.filter(log => log.action === "تعديل صلاحيات المستخدم").length },
                { action: "محاولة وصول غير مصرح", count: logs.filter(log => log.action === "محاولة وصول غير مصرح").length },
                { action: "محاولة اختراق", count: logs.filter(log => log.action === "محاولة اختراق").length }
              ].sort((a, b) => b.count - a.count).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-${12 - index * 2} h-3 bg-blue-${500 - index * 100} rounded-full ml-2`}></div>
                    <span className="text-lg font-bold">{item.count}</span>
                  </div>
                  <span className="text-muted-foreground">{item.action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع المستخدمين</span>
              <User className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { role: "مدير نظام", count: logs.filter(log => log.userRole === "مدير نظام").length },
                { role: "مدير برنامج", count: logs.filter(log => log.userRole === "مدير برنامج").length },
                { role: "مستثمر", count: logs.filter(log => log.userRole === "مستثمر").length },
                { role: "موجه", count: logs.filter(log => log.userRole === "موجه").length },
                { role: "نظام", count: logs.filter(log => log.userRole === "نظام").length },
                { role: "غير معروف", count: logs.filter(log => log.userRole === "غير معروف").length }
              ].sort((a, b) => b.count - a.count).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-${12 - index * 2} h-3 bg-green-${500 - index * 100} rounded-full ml-2`}></div>
                    <span className="text-lg font-bold">{item.count}</span>
                  </div>
                  <span className="text-muted-foreground">{item.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
