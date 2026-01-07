"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { useNotifications } from "@/contexts/notification-context"
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
  BarChart,
  Download,
  CalendarDays,
  Check
} from "lucide-react"

// Type definitions
interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  priority: string;
}

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  priority: string;
}

// Transform API notification to display format
function transformNotification(apiNotification: ApiNotification) {
  return {
    id: apiNotification.id,
    title: apiNotification.title,
    content: apiNotification.message,
    recipients: apiNotification.type === 'application' ? 'الشركات الناشئة' : 
                apiNotification.type === 'security' ? 'المديرون' : 
                'جميع المستخدمين',
    channels: "تطبيق، بريد إلكتروني",
    status: "مرسل",
    date: new Date(apiNotification.createdAt).toLocaleDateString('ar-SA'),
    time: new Date(apiNotification.createdAt).toLocaleTimeString('ar-SA'),
    sentBy: "النظام",
    readCount: apiNotification.isRead ? 1 : 0,
    totalCount: 1
  };
}

export default function NotificationsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationContent, setNotificationContent] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["app"])
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const [apiNotifications, setApiNotifications] = useState<ApiNotification[]>([])
  
  // Sample notifications data (will be removed/replaced with API data)
  const staticNotifications = [
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
  
  // Get notifications from context
  const { 
    notifications: contextNotifications,
    unreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead,
    refreshNotifications: refreshContextNotifications
  } = useNotifications();
  
  // Combine all notification sources
  const notifications = [
    ...staticNotifications,
    ...(apiNotifications.map(transformNotification) || []),
    ...contextNotifications.map(n => ({
      id: n.id,
      title: n.title,
      content: n.message,
      recipients: n.type === 'application' ? 'الشركات الناشئة' : 
                n.type === 'security' ? 'المديرون' : 
                'جميع المستخدمين',
      channels: "تطبيق، بريد إلكتروني",
      status: "مرسل",
      date: new Date(n.createdAt).toLocaleDateString('ar-SA'),
      time: new Date(n.createdAt).toLocaleTimeString('ar-SA'),
      sentBy: "النظام",
      readCount: n.isRead ? 1 : 0,
      totalCount: 1
    }))
  ];

  // Advanced filter state
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    priority: '',
    types: [] as string[],
    channels: [] as string[]
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Load notifications from API on initial load
  useEffect(() => {
    fetchNotifications();
    // Initialize SSE connection for real-time notifications
    const sse = new EventSource(`/api/admin/notifications/sse?token=${localStorage.getItem('token')}`);
    
    sse.addEventListener('error', (event) => {
      console.error('SSE connection error:', event);
    });
    
    // Cleanup on unmount
    return () => {
      sse.close();
    };
  }, []);

  // Fetch notifications from API with filters
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters based on filters
      let queryParams = new URLSearchParams();
      queryParams.append('limit', '100');
      
      // Add search query if present
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      // Add status based on active tab
      if (activeTab === 'sent') {
        queryParams.append('status', 'sent');
      } else if (activeTab === 'scheduled') {
        queryParams.append('status', 'scheduled');
      } else if (activeTab === 'draft') {
        queryParams.append('status', 'draft');
      }
      
      // Add date filters
      if (filters.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        queryParams.append('dateTo', filters.dateTo);
      }
      
      // Add priority filter
      if (filters.priority) {
        queryParams.append('priority', filters.priority);
      }
      
      // Add type filters
      if (filters.types.includes('system')) {
        queryParams.append('type', 'system');
      }
      
      // Add channel filters
      if (filters.channels.includes('app')) {
        queryParams.append('channel', 'app');
      } else if (filters.channels.includes('email')) {
        queryParams.append('channel', 'email');
      } else if (filters.channels.includes('sms')) {
        queryParams.append('channel', 'push');
      }
      
      // Use the filter endpoint when filters are applied
      const endpoint = (
        searchQuery || 
        activeTab !== 'all' || 
        filters.dateFrom || 
        filters.dateTo || 
        filters.priority || 
        filters.types.length > 0 || 
        filters.channels.length > 0
      ) 
        ? `/api/admin/notifications/filter?${queryParams.toString()}` 
        : '/api/admin/notifications?limit=100';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setApiNotifications(data.notifications);
      } else {
        console.error('Error fetching notifications:', data.error);
        toast.error(data.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a notification
  const sendNotification = async () => {
    // Validate inputs
    if (!notificationTitle.trim()) {
      toast.error('يرجى إدخال عنوان الإشعار');
      return;
    }
    
    if (!notificationContent.trim()) {
      toast.error('يرجى إدخال محتوى الإشعار');
      return;
    }
    
    if (selectedRecipients.length === 0) {
      toast.error('يرجى تحديد المستلمين');
      return;
    }
    
    if (selectedChannels.length === 0) {
      toast.error('يرجى تحديد قناة إرسال واحدة على الأقل');
      return;
    }
    
    try {
      console.log('Sending notification...');
      setIsSending(true);
      const token = localStorage.getItem('token');
      
      // Map selected recipients to API recipientType
      let recipientType = '';
      if (selectedRecipients.includes('جميع المستخدمين')) {
        recipientType = 'all';
      } else if (selectedRecipients.includes('الشركات الناشئة')) {
        recipientType = 'entrepreneurs';
      } else if (selectedRecipients.includes('المستثمرون')) {
        recipientType = 'investors';
      } else if (selectedRecipients.includes('الموجهون')) {
        recipientType = 'mentors';
      } else if (selectedRecipients.includes('مديرو البرامج')) {
        recipientType = 'program_managers';
      }
      
      console.log('Recipient type:', recipientType);
      
      const payload = {
        title: notificationTitle,
        message: notificationContent,
        recipientType,
        priority: 'medium',
        sendEmail: selectedChannels.includes('email'),
        sendPush: selectedChannels.includes('sms')
      };
      
      console.log('Sending payload:', payload);
      
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('تم إرسال الإشعار بنجاح');
        // Reset form
        setNotificationTitle('');
        setNotificationContent('');
        setSelectedRecipients([]);
        setSelectedChannels(['app']);
        // Refresh notifications list
        fetchNotifications();
      } else {
        console.error('Error sending notification:', data.error);
        toast.error(data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds: string[]) => {
    try {
      setIsMarking(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds,
          all: notificationIds.length === 0
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('تم تحديث حالة الإشعارات بنجاح');
        // Refresh notifications
        fetchNotifications();
      } else {
        console.error('Error marking notifications as read:', data.error);
        toast.error(data.error || 'Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsMarking(false);
    }
  };

  // Export notifications to CSV
  const exportNotifications = () => {
    const csvContent = [
      // CSV header
      ['العنوان', 'المحتوى', 'المستلمون', 'القنوات', 'الحالة', 'التاريخ', 'الوقت', 'المرسل', 'معدل القراءة'].join(','),
      // CSV rows
      ...filteredNotifications.map(n => [
        `"${n.title.replace(/"/g, '""')}"`,
        `"${n.content.replace(/"/g, '""')}"`,
        `"${n.recipients}"`,
        `"${n.channels}"`,
        `"${n.status}"`,
        `"${n.date}"`,
        `"${n.time}"`,
        `"${n.sentBy}"`,
        `"${n.status === 'مرسل' ? Math.round((n.readCount / n.totalCount) * 100) + '%' : '-'}"`
      ].join(','))
    ].join('\n');
    
    // Create a Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `notifications_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('تم تصدير الإشعارات بنجاح');
  };

  // Update filter handlers
  const updateTypeFilter = (type: string) => {
    setFilters(prev => {
      const newTypes = prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      
      return { ...prev, types: newTypes };
    });
  };
  
  const updateChannelFilter = (channel: string) => {
    setFilters(prev => {
      const newChannels = prev.channels.includes(channel) 
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel];
      
      return { ...prev, channels: newChannels };
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      priority: '',
      types: [],
      channels: []
    });
    setSearchQuery('');
  };

  // Filter notifications based on active tab and all filters
  const filteredNotifications = notifications.filter(notification => {
    // Filter by tab
    if (activeTab === "sent" && notification.status !== "مرسل") return false
    if (activeTab === "scheduled" && notification.status !== "مجدول") return false
    if (activeTab === "draft" && notification.status !== "مسودة") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!(
        notification.title.toLowerCase().includes(query) ||
        notification.content.toLowerCase().includes(query) ||
        notification.recipients.toLowerCase().includes(query)
      )) return false;
    }
    
    // Advanced filters
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      const notifDate = new Date(notification.date);
      if (notifDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      const notifDate = new Date(notification.date);
      if (notifDate > toDate) return false;
    }
    
    // Filter by type
    if (filters.types.length > 0) {
      const typeMatch = filters.types.some(type => {
        if (type === 'system' && notification.recipients.includes('جميع المستخدمين')) return true;
        if (type === 'startup' && notification.recipients.includes('الشركات الناشئة')) return true;
        if (type === 'investor' && notification.recipients.includes('المستثمرون')) return true;
        return false;
      });
      if (!typeMatch) return false;
    }
    
    // Filter by channel
    if (filters.channels.length > 0) {
      const channelMatch = filters.channels.some(channel => {
        if (channel === 'app' && notification.channels.includes('تطبيق')) return true;
        if (channel === 'email' && notification.channels.includes('بريد')) return true;
        if (channel === 'sms' && notification.channels.includes('رسائل')) return true;
        return false;
      });
      if (!channelMatch) return false;
    }
    
    // Filter by priority
    if (filters.priority) {
      // For demo, we'll assume a mapping exists or would be part of the notification object
      // In a real app, this would be based on actual priority data
      if (filters.priority === 'high' && !notification.title.includes('تحديث')) return false;
      if (filters.priority === 'medium' && !notification.title.includes('دعوة')) return false;
      if (filters.priority === 'low' && !notification.title.includes('تذكير')) return false;
    }

    return true;
  });

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
  
  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>تحديث</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => {
              // Scroll to the notification form and highlight it
              const form = document.getElementById('create-notification-form');
              if (form) {
                form.scrollIntoView({ behavior: 'smooth' });
                form.classList.add('highlight-form');
                setTimeout(() => form.classList.remove('highlight-form'), 1500);
              }
            }}
          >
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
          
          {/* Advanced Filter Button */}
          <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">تصفية متقدمة</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">التاريخ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">من</label>
                      <Input 
                        type="date" 
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs">إلى</label>
                      <Input 
                        type="date" 
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع الإشعار</label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="system" 
                        checked={filters.types.includes('system')}
                        onCheckedChange={() => updateTypeFilter('system')}
                      />
                      <label htmlFor="system" className="text-sm">إشعارات النظام</label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="startup" 
                        checked={filters.types.includes('startup')}
                        onCheckedChange={() => updateTypeFilter('startup')}
                      />
                      <label htmlFor="startup" className="text-sm">إشعارات الشركات الناشئة</label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="investor" 
                        checked={filters.types.includes('investor')}
                        onCheckedChange={() => updateTypeFilter('investor')}
                      />
                      <label htmlFor="investor" className="text-sm">إشعارات المستثمرين</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">قناة الإرسال</label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="app-filter" 
                        checked={filters.channels.includes('app')}
                        onCheckedChange={() => updateChannelFilter('app')}
                      />
                      <label htmlFor="app-filter" className="text-sm">تطبيق</label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="email-filter" 
                        checked={filters.channels.includes('email')}
                        onCheckedChange={() => updateChannelFilter('email')}
                      />
                      <label htmlFor="email-filter" className="text-sm">بريد إلكتروني</label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="sms-filter" 
                        checked={filters.channels.includes('sms')}
                        onCheckedChange={() => updateChannelFilter('sms')}
                      />
                      <label htmlFor="sms-filter" className="text-sm">رسائل نصية</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الأولوية</label>
                  <Select 
                    value={filters.priority} 
                    onValueChange={(value) => setFilters({...filters, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    إعادة ضبط
                  </Button>
                  <Button size="sm" onClick={() => setShowAdvancedFilters(false)}>
                    تطبيق
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Export Button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={exportNotifications}
            title="تصدير الإشعارات"
          >
            <Download className="h-4 w-4" />
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => markAsRead(selectedNotifications)}
                        disabled={isMarking}
                      >
                        {isMarking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span>تحديد كمقروء</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>حذف المحدد</span>
                      </Button>
                    </>
                  )}
                  
                  {/* Filter indicators */}
                  {(filters.dateFrom || filters.dateTo || filters.priority || filters.types.length > 0 || filters.channels.length > 0) && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>تصفية نشطة</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-1 ml-1"
                        onClick={resetFilters}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        مسح
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      fetchNotifications();
                      refreshContextNotifications();
                    }}
                    className="h-8 px-2 text-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                    تحديث
                  </Button>
                  <CardTitle>قائمة الإشعارات ({filteredNotifications.length})</CardTitle>
                </div>
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
                
                {isLoading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">جاري تحميل الإشعارات...</p>
                  </div>
                ) : filteredNotifications.length > 0 ? (
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
          <Card id="create-notification-form">
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
                  <Button 
                    variant="default" 
                    className="flex items-center gap-1"
                    onClick={sendNotification}
                    disabled={isSending}
                  >
                    {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
