"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle,
  Link,
  ExternalLink,
  Settings,
  RefreshCw,
  Lock,
  Key,
  AlertTriangle,
  Code,
  Database,
  FileJson,
  Webhook,
  Mail,
  MessageSquare,
  Calendar,
  CreditCard,
  BarChart,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  ToggleLeft,
  ToggleRight,
  Users,
  Copy,
  Save
} from "lucide-react"

export default function IntegrationsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])

  // Sample integrations data
  const integrations = [
    { 
      id: "1", 
      name: "Stripe", 
      category: "المدفوعات", 
      description: "معالجة المدفوعات وإدارة الاشتراكات",
      status: "متصل", 
      lastSync: "12 مارس 2025 10:15:22",
      icon: "credit-card",
      apiKey: "sk_test_*****************************",
      webhookUrl: "https://api.example.com/webhooks/stripe",
      syncFrequency: "كل ساعة",
      dataAccess: ["المدفوعات", "الاشتراكات", "العملاء"],
      connectedBy: "أحمد محمد",
      connectedDate: "15 يناير 2025"
    },
    { 
      id: "2", 
      name: "Google Calendar", 
      category: "الجدولة", 
      description: "مزامنة الفعاليات والمواعيد مع تقويم Google",
      status: "متصل", 
      lastSync: "12 مارس 2025 09:30:15",
      icon: "calendar",
      apiKey: "AIza*****************************",
      webhookUrl: "https://api.example.com/webhooks/google-calendar",
      syncFrequency: "كل 15 دقيقة",
      dataAccess: ["الفعاليات", "المواعيد", "الجلسات"],
      connectedBy: "محمد القحطاني",
      connectedDate: "20 يناير 2025"
    },
    { 
      id: "3", 
      name: "Slack", 
      category: "التواصل", 
      description: "إرسال إشعارات وتنبيهات إلى قنوات Slack",
      status: "متصل", 
      lastSync: "12 مارس 2025 08:45:30",
      icon: "message-square",
      apiKey: "xoxb-*****************************",
      webhookUrl: "https://api.example.com/webhooks/slack",
      syncFrequency: "فوري",
      dataAccess: ["الإشعارات", "التنبيهات"],
      connectedBy: "سارة العتيبي",
      connectedDate: "5 فبراير 2025"
    },
    { 
      id: "4", 
      name: "Mailchimp", 
      category: "التسويق", 
      description: "إدارة القوائم البريدية وحملات البريد الإلكتروني",
      status: "متصل", 
      lastSync: "11 مارس 2025 14:20:10",
      icon: "mail",
      apiKey: "mc-*****************************",
      webhookUrl: "https://api.example.com/webhooks/mailchimp",
      syncFrequency: "يومي",
      dataAccess: ["المستخدمين", "القوائم البريدية", "الحملات"],
      connectedBy: "نورة السعيد",
      connectedDate: "10 فبراير 2025"
    },
    { 
      id: "5", 
      name: "HubSpot", 
      category: "إدارة العلاقات", 
      description: "إدارة العلاقات مع العملاء وتتبع المبيعات",
      status: "غير متصل", 
      lastSync: "",
      icon: "users",
      apiKey: "",
      webhookUrl: "",
      syncFrequency: "",
      dataAccess: [],
      connectedBy: "",
      connectedDate: ""
    },
    { 
      id: "6", 
      name: "Zapier", 
      category: "أتمتة", 
      description: "ربط التطبيقات وأتمتة سير العمل",
      status: "غير متصل", 
      lastSync: "",
      icon: "link",
      apiKey: "",
      webhookUrl: "",
      syncFrequency: "",
      dataAccess: [],
      connectedBy: "",
      connectedDate: ""
    },
    { 
      id: "7", 
      name: "Microsoft Power BI", 
      category: "تحليلات", 
      description: "تحليلات البيانات وإنشاء لوحات المعلومات",
      status: "غير متصل", 
      lastSync: "",
      icon: "bar-chart",
      apiKey: "",
      webhookUrl: "",
      syncFrequency: "",
      dataAccess: [],
      connectedBy: "",
      connectedDate: ""
    },
    { 
      id: "8", 
      name: "GitHub", 
      category: "تطوير", 
      description: "إدارة الكود المصدري والمشاريع",
      status: "متصل", 
      lastSync: "10 مارس 2025 16:40:55",
      icon: "code",
      apiKey: "ghp_*****************************",
      webhookUrl: "https://api.example.com/webhooks/github",
      syncFrequency: "كل 30 دقيقة",
      dataAccess: ["المستودعات", "المشكلات", "طلبات السحب"],
      connectedBy: "فهد العنزي",
      connectedDate: "1 مارس 2025"
    }
  ]

  // Filter integrations based on active tab and search query
  const filteredIntegrations = integrations.filter(integration => {
    // Filter by tab
    if (activeTab === "connected" && integration.status !== "متصل") return false
    if (activeTab === "disconnected" && integration.status !== "غير متصل") return false
    if (activeTab === "payments" && integration.category !== "المدفوعات") return false
    if (activeTab === "communication" && integration.category !== "التواصل" && integration.category !== "التسويق") return false
    if (activeTab === "analytics" && integration.category !== "تحليلات") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        integration.name.toLowerCase().includes(query) ||
        integration.category.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleIntegrationSelection = (integrationId: string) => {
    if (selectedIntegrations.includes(integrationId)) {
      setSelectedIntegrations(selectedIntegrations.filter(id => id !== integrationId))
    } else {
      setSelectedIntegrations([...selectedIntegrations, integrationId])
    }
  }

  const selectAllIntegrations = () => {
    if (selectedIntegrations.length === filteredIntegrations.length) {
      setSelectedIntegrations([])
    } else {
      setSelectedIntegrations(filteredIntegrations.map(integration => integration.id))
    }
  }

  // Calculate statistics
  const connectedIntegrations = integrations.filter(i => i.status === "متصل").length
  const disconnectedIntegrations = integrations.filter(i => i.status === "غير متصل").length
  const totalIntegrations = integrations.length

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "credit-card": return <CreditCard className="h-6 w-6" />;
      case "calendar": return <Calendar className="h-6 w-6" />;
      case "message-square": return <MessageSquare className="h-6 w-6" />;
      case "mail": return <Mail className="h-6 w-6" />;
      case "users": return <Users className="h-6 w-6" />;
      case "link": return <Link className="h-6 w-6" />;
      case "bar-chart": return <BarChart className="h-6 w-6" />;
      case "code": return <Code className="h-6 w-6" />;
      default: return <Link className="h-6 w-6" />;
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
            <span>إضافة تكامل جديد</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة التكاملات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التكاملات المتصلة</span>
              <Link className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{connectedIntegrations}</div>
            <div className="text-sm text-muted-foreground mt-1">
              من أصل {totalIntegrations} تكامل متاح
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التكاملات غير المتصلة</span>
              <Link className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{disconnectedIntegrations}</div>
            <div className="text-sm text-muted-foreground mt-1">
              تكاملات متاحة للاتصال
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>آخر مزامنة</span>
              <RefreshCw className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">12 مارس 2025 10:15:22</div>
            <div className="text-sm text-muted-foreground mt-1">
              جميع التكاملات متزامنة
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في التكاملات..." 
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
          <TabsList className="grid grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="analytics">تحليلات</TabsTrigger>
            <TabsTrigger value="communication">تواصل</TabsTrigger>
            <TabsTrigger value="payments">مدفوعات</TabsTrigger>
            <TabsTrigger value="disconnected">غير متصل</TabsTrigger>
            <TabsTrigger value="connected">متصل</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className={integration.status === "متصل" ? "border-primary/50" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {getIconComponent(integration.icon)}
                </div>
                <div className="text-right">
                  <CardTitle className="flex items-center justify-end gap-2">
                    <span>{integration.name}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">{integration.category}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-right mb-4">{integration.description}</p>
              
              <div className="flex justify-between items-center mb-2">
                <span className={integration.status === "متصل" ? "text-green-600 font-medium" : "text-gray-500 font-medium"}>
                  {integration.status}
                </span>
                <span className="text-sm text-muted-foreground">الحالة:</span>
              </div>
              
              {integration.status === "متصل" && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{integration.lastSync}</span>
                    <span className="text-sm text-muted-foreground">آخر مزامنة:</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{integration.syncFrequency}</span>
                    <span className="text-sm text-muted-foreground">تكرار المزامنة:</span>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2 border-t">
              {integration.status === "متصل" ? (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span>إعدادات</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    <span>مزامنة</span>
                  </Button>
                </>
              ) : (
                <Button variant="default" size="sm" className="flex items-center gap-1 w-full">
                  <Link className="h-4 w-4" />
                  <span>اتصال</span>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-end gap-2">
            <span>إعدادات API</span>
            <Key className="h-5 w-5 text-primary" />
          </CardTitle>
          <CardDescription className="text-right">
            إعدادات واجهة برمجة التطبيقات (API) ومفاتيح الوصول
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-md">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span>تجديد</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>عرض</span>
                </Button>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-medium">مفتاح API الرئيسي</div>
                <div className="text-sm text-muted-foreground">sk_live_************************</div>
                <div className="text-xs text-muted-foreground">تم الإنشاء: 15 يناير 2025</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-md">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span>تجديد</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>عرض</span>
                </Button>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-medium">مفتاح API للاختبار</div>
                <div className="text-sm text-muted-foreground">sk_test_************************</div>
                <div className="text-xs text-muted-foreground">تم الإنشاء: 15 يناير 2025</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-md">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Copy className="h-4 w-4" />
                <span>نسخ</span>
              </Button>
              <div className="flex flex-col items-end">
                <div className="font-medium">رابط Webhook</div>
                <div className="text-sm text-muted-foreground">https://api.example.com/webhooks/incoming</div>
                <div className="text-xs text-muted-foreground">لاستقبال الأحداث من الخدمات الخارجية</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>سجل الأحداث</span>
              <FileText className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-b">
                <span className="text-xs text-muted-foreground">12 مارس 2025 10:15:22</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">مزامنة ناجحة مع Stripe</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <span className="text-xs text-muted-foreground">12 مارس 2025 09:30:15</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">مزامنة ناجحة مع Google Calendar</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <span className="text-xs text-muted-foreground">12 مارس 2025 08:45:30</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">مزامنة ناجحة مع Slack</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <span className="text-xs text-muted-foreground">11 مارس 2025 14:20:10</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">مزامنة ناجحة مع Mailchimp</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3">
                <span className="text-xs text-muted-foreground">10 مارس 2025 16:40:55</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">مزامنة ناجحة مع GitHub</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إعدادات المزامنة</span>
              <Settings className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-b">
                <Switch id="auto-sync" checked={true} />
                <div className="flex flex-col items-end">
                  <span className="font-medium">المزامنة التلقائية</span>
                  <span className="text-sm text-muted-foreground">تمكين المزامنة التلقائية للتكاملات</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <div className="flex items-center gap-2">
                  <select className="p-1 border rounded-md text-sm">
                    <option value="15">كل 15 دقيقة</option>
                    <option value="30">كل 30 دقيقة</option>
                    <option value="60" selected>كل ساعة</option>
                    <option value="360">كل 6 ساعات</option>
                    <option value="720">كل 12 ساعة</option>
                    <option value="1440">يومياً</option>
                  </select>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium">تكرار المزامنة الافتراضي</span>
                  <span className="text-sm text-muted-foreground">تعيين تكرار المزامنة الافتراضي للتكاملات الجديدة</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <Switch id="error-notifications" checked={true} />
                <div className="flex flex-col items-end">
                  <span className="font-medium">إشعارات الخطأ</span>
                  <span className="text-sm text-muted-foreground">إرسال إشعارات عند فشل المزامنة</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <Switch id="detailed-logs" checked={false} />
                <div className="flex flex-col items-end">
                  <span className="font-medium">سجل المزامنة المفصل</span>
                  <span className="text-sm text-muted-foreground">تسجيل تفاصيل إضافية عن عمليات المزامنة</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3">
                <Switch id="sync-on-change" checked={true} />
                <div className="flex flex-col items-end">
                  <span className="font-medium">المزامنة عند التغييرات</span>
                  <span className="text-sm text-muted-foreground">مزامنة البيانات تلقائياً عند حدوث تغييرات</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-2 border-t">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Save className="h-4 w-4" />
              <span>حفظ الإعدادات</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
