"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import {
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
  syncIntegration,
  copyWebhookUrl,
  renewApiKey,
  Integration
} from "@/lib/services/integration-service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { 
  Search, 
  Filter, 
  Plus, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Download, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Trash2, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Edit, 
  Eye, 
  CheckCircle, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle,
  Link,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ExternalLink,
  Settings,
  RefreshCw,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Lock,
  Key,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertTriangle,
  Code,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Database,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FileJson,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Webhook,
  Mail,
  MessageSquare,
  Calendar,
  CreditCard,
  BarChart,
  FileText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowUpRight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowDownRight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Share2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ToggleLeft,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ToggleRight,
  Users,
  Copy,
  Save
} from "lucide-react"

export default function IntegrationsManagement() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState("")

  // Fetch integrations from API
  useEffect(() => {
    async function fetchIntegrations() {
      try {
        setLoading(true)
        const response = await getIntegrations()
        setIntegrations(response.integrations || [])
        
        // Find the most recent sync time
        const connectedIntegrations = response.integrations?.filter((i: Integration) => i.status === "متصل") || []
        if (connectedIntegrations.length > 0) {
          const syncTimes = connectedIntegrations
            .filter((i: Integration) => i.lastSync)
            .map((i: Integration) => new Date(i.lastSync).getTime())
          
          if (syncTimes.length > 0) {
            const latestSync = new Date(Math.max(...syncTimes))
            setLastSyncTime(latestSync.toISOString())
          }
        }
      } catch (error) {
        console.error("Failed to fetch integrations:", error)
        toast.error("فشل في تحميل التكاملات")
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrations()
  }, [])

  // Fallback to sample data if API fails
  const fallbackIntegrations = [
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
  const filteredIntegrations = (integrations.length > 0 ? integrations : fallbackIntegrations).filter(integration => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleIntegrationSelection = (integrationId: string) => {
    if (selectedIntegrations.includes(integrationId)) {
      setSelectedIntegrations(selectedIntegrations.filter(id => id !== integrationId))
    } else {
      setSelectedIntegrations([...selectedIntegrations, integrationId])
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectAllIntegrations = () => {
    if (selectedIntegrations.length === filteredIntegrations.length) {
      setSelectedIntegrations([])
    } else {
      setSelectedIntegrations(filteredIntegrations.map(integration => integration.id))
    }
  }

  // Calculate statistics
  const allIntegrations = integrations.length > 0 ? integrations : fallbackIntegrations
  const connectedIntegrations = allIntegrations.filter((i: Integration) => i.status === "متصل").length
  const disconnectedIntegrations = allIntegrations.filter((i: Integration) => i.status === "غير متصل").length
  const totalIntegrations = allIntegrations.length

  // Handle sync action
  const handleSync = async (integrationId: string) => {
    try {
      toast.loading("جاري مزامنة التكامل...")
      const result = await syncIntegration(integrationId)
      toast.dismiss()
      toast.success(`تمت المزامنة بنجاح. ${result.syncResults.itemsProcessed} عناصر تمت معالجتها.`)
      
      // Update the integration in the state
      setIntegrations(integrations.map((i: Integration) => 
        i.id === integrationId 
          ? { ...i, lastSync: result.integration.lastSync } 
          : i
      ))
      
    } catch (error) {
      toast.dismiss()
      toast.error("فشلت عملية المزامنة. يرجى المحاولة مرة أخرى.")
      console.error("Sync error:", error)
    }
  }
  
  // Handle connect action
  const handleConnect = async (integrationId: string) => {
    try {
      const apiKey = prompt("يرجى إدخال مفتاح API:")
      if (!apiKey) return

      toast.loading("جاري الاتصال...")
      const result = await connectIntegration(integrationId, { apiKey })
      toast.dismiss()
      toast.success("تم الاتصال بنجاح.")
      
      // Update the integration in the state
      setIntegrations(integrations.map((i: Integration) => 
        i.id === integrationId 
          ? { 
              ...i, 
              status: "متصل",
              lastSync: result.lastSync,
              connectedBy: result.connectedBy,
              connectedDate: result.connectedDate
            } 
          : i
      ))
      
    } catch (error) {
      toast.dismiss()
      toast.error("فشل الاتصال. يرجى التأكد من صحة المفتاح والمحاولة مرة أخرى.")
      console.error("Connect error:", error)
    }
  }
  
  // Handle disconnect action
  const handleDisconnect = async (integrationId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في قطع الاتصال بهذا التكامل؟")) {
      return
    }
    
    try {
      toast.loading("جاري قطع الاتصال...")
      await disconnectIntegration(integrationId)
      toast.dismiss()
      toast.success("تم قطع الاتصال بنجاح.")
      
      // Update the integration in the state
      setIntegrations(integrations.map((i: Integration) => 
        i.id === integrationId 
          ? { 
              ...i, 
              status: "غير متصل",
              lastSync: "",
              connectedBy: "",
              connectedDate: ""
            } 
          : i
      ))
      
    } catch (error) {
      toast.dismiss()
      toast.error("فشل قطع الاتصال. يرجى المحاولة مرة أخرى.")
      console.error("Disconnect error:", error)
    }
  }
  
  // Handle copy webhook URL
  const handleCopyWebhook = (webhookUrl: string) => {
    if (copyWebhookUrl(webhookUrl)) {
      toast.success("تم نسخ رابط Webhook.")
    } else {
      toast.error("فشل نسخ الرابط.")
    }
  }
  
  // Handle renew API key
  const handleRenewApiKey = async (integrationId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في تجديد مفتاح API؟ سيتم إبطال المفتاح الحالي.")) {
      return
    }
    
    try {
      toast.loading("جاري تجديد المفتاح...")
      const result = await renewApiKey(integrationId)
      toast.dismiss()
      toast.success("تم تجديد مفتاح API بنجاح.")
      
      // Update the integration in the state
      setIntegrations(integrations.map((i: Integration) => 
        i.id === integrationId 
          ? { ...i, apiKey: result.apiKey } 
          : i
      ))
      
    } catch (error) {
      toast.dismiss()
      toast.error("فشل تجديد المفتاح. يرجى المحاولة مرة أخرى.")
      console.error("Renew API key error:", error)
    }
  }

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
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة التكاملات</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.refresh()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'جاري التحديث...' : 'تحديث'}</span>
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>إضافة تكامل جديد</span>
          </Button>
        </div>
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
            <div className="text-lg font-bold">
              {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "لا توجد مزامنات"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {lastSyncTime ? "جميع التكاملات متزامنة" : "قم بمزامنة التكاملات"}
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

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="mr-2 text-lg">جاري تحميل التكاملات...</span>
        </div>
      ) : (
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
                    <Button variant="outline" size="sm" className="flex items-center gap-1"
                      onClick={() => handleDisconnect(integration.id)}>
                      <Settings className="h-4 w-4" />
                      <span>قطع الإتصال</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1"
                      onClick={() => handleSync(integration.id)}>
                      <RefreshCw className="h-4 w-4" />
                      <span>مزامنة</span>
                    </Button>
                  </>
                ) : (
                  <Button variant="default" size="sm" className="flex items-center gap-1 w-full"
                    onClick={() => handleConnect(integration.id)}>
                    <Link className="h-4 w-4" />
                    <span>اتصال</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
                <Button variant="outline" size="sm" className="flex items-center gap-1"
                  onClick={() => handleRenewApiKey("1")}>
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
                <Button variant="outline" size="sm" className="flex items-center gap-1"
                  onClick={() => handleRenewApiKey("2")}>
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
              <Button variant="outline" size="sm" className="flex items-center gap-1"
                onClick={() => handleCopyWebhook("https://api.example.com/webhooks/incoming")}>
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
