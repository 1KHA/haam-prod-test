"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  Filter, 
  Plus, 
  Send, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle,
  Bell,
  Users,
  Building,
  Calendar,
  Clock,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MessageSquare,
  Mail,
  Smartphone,
  Globe,
  AlertTriangle,
  BarChart
} from "lucide-react"

export default function NotificationsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationContent, setNotificationContent] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["app"])

  // Sample notifications data
  const notifications = [
    { 
      id: "1", 
      title: "إطلاق برنامج مسرع التقنية المالية", 
      content: "نود إعلامكم بإطلاق برنامج مسرع التقنية المالية للدفعة الرابعة. يمكن للشركات الناشئة التقديم من خلال المنصة حتى تاريخ 30 أبريل 2025.", 
      recipients: "الشركات الناشئة", 
      channels: "تطبيق، بريد إلكتروني",
      status: "مرسل", 
      date: "12 مارس 2025",
      time: "10:15:22",
      sentBy: "أحمد محمد",
      readCount: 85,
      totalCount: 120
    },
    { 
      id: "2", 
      title: "تحديث شروط الخدمة", 
      content: "تم تحديث شروط الخدمة للمنصة. يرجى الاطلاع على الشروط الجديدة وقبولها للاستمرار في استخدام المنصة.", 
      recipients: "جميع المستخدمين", 
      channels: "تطبيق، بريد إلكتروني، رسائل نصية",
      status: "مرسل", 
      date: "10 مارس 2025",
      time: "14:30:45",
      sentBy: "محمد القحطاني",
      readCount: 450,
      totalCount: 1250
    },
    { 
      id: "3", 
      title: "دعوة لحضور يوم المستثمر", 
      content: "ندعوكم لحضور يوم المستثمر الذي سيقام في فندق الفيصلية بالرياض يوم 20 أبريل 2025 من الساعة 2 مساءً حتى 6 مساءً. سيتم عرض مشاريع الشركات الناشئة المشاركة في برامج المسرعات.", 
      recipients: "المستثمرون", 
      channels: "تطبيق، بريد إلكتروني",
      status: "مرسل", 
      date: "9 مارس 2025",
      time: "09:20:15",
      sentBy: "سارة العتيبي",
      readCount: 45,
      totalCount: 85
    },
    { 
      id: "4", 
      title: "تذكير: موعد تسليم التقارير الشهرية", 
      content: "نذكركم بضرورة تسليم التقارير الشهرية قبل نهاية يوم 15 مارس 2025. يرجى استخدام النموذج المتاح على المنصة لتقديم التقرير.", 
      recipients: "الشركات الناشئة", 
      channels: "تطبيق، بريد إلكتروني",
      status: "مرسل", 
      date: "8 مارس 2025",
      time: "16:45:30",
      sentBy: "نورة السعيد",
      readCount: 95,
      totalCount: 320
    },
    { 
      id: "5", 
      title: "إطلاق ميزة جديدة: التقارير التحليلية", 
      content: "يسرنا الإعلان عن إطلاق ميزة جديدة على المنصة وهي التقارير التحليلية. يمكنكم الآن الاطلاع على تحليلات مفصلة عن أداء شركتكم ومقارنتها بالشركات الأخرى في نفس القطاع.", 
      recipients: "جميع المستخدمين", 
      channels: "تطبيق",
      status: "مجدول", 
      date: "15 مارس 2025",
      time: "09:00:00",
      sentBy: "النظام",
      readCount: 0,
      totalCount: 1250
    },
    { 
      id: "6", 
      title: "صيانة مجدولة للمنصة", 
      content: "نود إعلامكم بأنه سيتم إجراء صيانة مجدولة للمنصة يوم الجمعة 20 مارس 2025 من الساعة 2 صباحًا حتى 5 صباحًا. قد تكون المنصة غير متاحة خلال هذه الفترة.", 
      recipients: "جميع المستخدمين", 
      channels: "تطبيق، بريد إلكتروني",
      status: "مسودة", 
      date: "",
      time: "",
      sentBy: "",
      readCount: 0,
      totalCount: 1250
    },
    { 
      id: "7", 
      title: "دعوة للمشاركة في استبيان تطوير المنصة", 
      content: "ندعوكم للمشاركة في استبيان تطوير المنصة. سيساعدنا رأيكم في تحسين خدماتنا وتطوير ميزات جديدة تلبي احتياجاتكم.", 
      recipients: "جميع المستخدمين", 
      channels: "تطبيق، بريد إلكتروني",
      status: "مسودة", 
      date: "",
      time: "",
      sentBy: "",
      readCount: 0,
      totalCount: 1250
    }
  ]

  // Filter notifications based on active tab and search query
  const filteredNotifications = notifications.filter(notification => {
    // Filter by tab
    if (activeTab === "sent" && notification.status !== "مرسل") return false
    if (activeTab === "scheduled" && notification.status !== "مجدول") return false
    if (activeTab === "draft" && notification.status !== "مسودة") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.content.toLowerCase().includes(query) ||
        notification.recipients.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleNotificationSelection = (notificationId: string) => {
    if (selectedNotifications.includes(notificationId)) {
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId))
    } else {
      setSelectedNotifications([...selectedNotifications, notificationId])
    }
  }

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(notification => notification.id))
    }
  }

  const toggleRecipient = (recipient: string) => {
    if (selectedRecipients.includes(recipient)) {
      setSelectedRecipients(selectedRecipients.filter(r => r !== recipient))
    } else {
      setSelectedRecipients([...selectedRecipients, recipient])
    }
  }

  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel))
    } else {
      setSelectedChannels([...selectedChannels, channel])
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>تحديث</span>
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>إنشاء إشعار جديد</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة الإشعارات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي الإشعارات</span>
              <Bell className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {notifications.filter(n => n.status === "مرسل").length} مرسلة • {notifications.filter(n => n.status === "مجدول").length} مجدولة • {notifications.filter(n => n.status === "مسودة").length} مسودة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>معدل القراءة</span>
              <Eye className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(
                (notifications
                  .filter(n => n.status === "مرسل")
                  .reduce((sum, n) => sum + n.readCount, 0) /
                  notifications
                    .filter(n => n.status === "مرسل")
                    .reduce((sum, n) => sum + n.totalCount, 0)) *
                  100
              )}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {notifications
                .filter(n => n.status === "مرسل")
                .reduce((sum, n) => sum + n.readCount, 0)} قراءة من أصل {notifications
                .filter(n => n.status === "مرسل")
                .reduce((sum, n) => sum + n.totalCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>الإشعارات المجدولة</span>
              <Calendar className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.filter(n => n.status === "مجدول").length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              الإشعار التالي: {notifications.find(n => n.status === "مجدول")?.date || "لا يوجد"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>المسودات</span>
              <FileText className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notifications.filter(n => n.status === "مسودة").length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              بانتظار المراجعة والإرسال
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في الإشعارات..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="draft">مسودة</TabsTrigger>
            <TabsTrigger value="scheduled">مجدول</TabsTrigger>
            <TabsTrigger value="sent">مرسل</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {selectedNotifications.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Send className="h-4 w-4" />
                        <span>إرسال المحدد</span>
                      </Button>
                      <Button variant="destructive" size="sm" className="flex items-center gap-1">
                        <Trash2 className="h-4 w-4" />
                        <span>حذف المحدد</span>
                      </Button>
                    </>
                  )}
                </div>
                <CardTitle>قائمة الإشعارات ({filteredNotifications.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="grid grid-cols-7 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                  <div className="col-span-1 flex items-center">
                    <input 
                      type="checkbox" 
                      className="ml-2"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={selectAllNotifications}
                    />
                    <span>الإجراءات</span>
                  </div>
                  <div className="col-span-1">الحالة</div>
                  <div className="col-span-1">القنوات</div>
                  <div className="col-span-1">المستلمون</div>
                  <div className="col-span-1">معدل القراءة</div>
                  <div className="col-span-1">التاريخ</div>
                  <div className="col-span-2">العنوان</div>
                </div>
                
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div key={notification.id} className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                      <div className="col-span-1 flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleNotificationSelection(notification.id)}
                        />
                        <div className="flex gap-1">
                          <button className="text-blue-500 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-amber-500 hover:text-amber-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="col-span-1">
                        {notification.status === "مرسل" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            مرسل
                          </span>
                        ) : notification.status === "مجدول" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            مجدول
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            مسودة
                          </span>
                        )}
                      </div>
                      <div className="col-span-1">
                        <div className="flex gap-1">
                          {notification.channels.includes("تطبيق") && (
                            <Bell className="h-4 w-4 text-primary" />
                          )}
                          {notification.channels.includes("بريد إلكتروني") && (
                            <Mail className="h-4 w-4 text-blue-500" />
                          )}
                          {notification.channels.includes("رسائل نصية") && (
                            <Smartphone className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div className="col-span-1">{notification.recipients}</div>
                      <div className="col-span-1">
                        {notification.status === "مرسل" ? (
                          <span>{Math.round((notification.readCount / notification.totalCount) * 100)}%</span>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                      <div className="col-span-1">{notification.date || "-"}</div>
                      <div className="col-span-2 truncate" title={notification.title}>{notification.title}</div>
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
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>إنشاء إشعار جديد</span>
                <Bell className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">عنوان الإشعار</label>
                  <Input 
                    placeholder="أدخل عنوان الإشعار" 
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">محتوى الإشعار</label>
                  <Textarea 
                    placeholder="أدخل محتوى الإشعار" 
                    rows={5}
                    value={notificationContent}
                    onChange={(e) => setNotificationContent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">المستلمون</label>
                  <div className="flex flex-wrap gap-2">
                    {["جميع المستخدمين", "الشركات الناشئة", "المستثمرون", "الموجهون", "مديرو البرامج"].map((recipient) => (
                      <Button
                        key={recipient}
                        variant={selectedRecipients.includes(recipient) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleRecipient(recipient)}
                      >
                        {recipient}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">قنوات الإرسال</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedChannels.includes("app") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleChannel("app")}
                      className="flex items-center gap-1"
                    >
                      <Bell className="h-4 w-4" />
                      <span>تطبيق</span>
                    </Button>
                    <Button
                      variant={selectedChannels.includes("email") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleChannel("email")}
                      className="flex items-center gap-1"
                    >
                      <Mail className="h-4 w-4" />
                      <span>بريد إلكتروني</span>
                    </Button>
                    <Button
                      variant={selectedChannels.includes("sms") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleChannel("sms")}
                      className="flex items-center gap-1"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span>رسائل نصية</span>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">حفظ كمسودة</Button>
                  <Button variant="outline">جدولة</Button>
                  <Button variant="default" className="flex items-center gap-1">
                    <Send className="h-4 w-4" />
                    <span>إرسال</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>إحصائيات الإشعارات</span>
                <BarChart className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">معدل القراءة حسب نوع الإشعار</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                      <span className="text-sm font-medium mr-2">85% - تحديثات النظام</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                      <span className="text-sm font-medium mr-2">75% - الفعاليات</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                      <span className="text-sm font-medium mr-2">60% - التذكيرات</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-red-600 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm font-medium mr-2">45% - الإعلانات</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">معدل القراءة حسب القناة</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "90%" }}></div>
                      </div>
                      <span className="text-sm font-medium mr-2">90% - تطبيق</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <span className="text-sm font-medium mr-2">65% - بريد إلكتروني</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                      <span className="text-sm font-medium mr-2">80% - رسائل نصية</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
