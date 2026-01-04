"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast" // Assuming you're using react-hot-toast for notifications
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
  X,
  AlertCircle,
  Send,
  Smartphone,
  Lock,
  Key,
  UserCheck,
  Clock,
  Fingerprint,
  Eye,
  Filter,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Link,
  ExternalLink,
  Settings,
  Code,
  FileJson,
  Webhook,
  MessageSquare,
  Calendar,
  CreditCard,
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  ToggleLeft,
  ToggleRight,
  Users,
  Copy,
  Search,
  AlertTriangle
} from "lucide-react"

// Type definitions for API responses
interface Backup {
  id: string;
  filename: string;
  size: string;
  createdAt: string;
  description: string;
}

interface CleanupOption {
  id: string;
  name: string;
  description: string;
  currentSize: string;
  estimatedSavings: string;
  lastCleanup: string;
}

interface CleanupSchedule {
  enabled: boolean;
  frequency: string;
  day: string;
  time: string;
  options: {
    cleanLogs: boolean;
    cleanTempFiles: boolean;
    cleanDeletedItems: boolean;
    olderThan: number;
  };
  nextScheduledRun: string;
  lastRun: string;
}

// Security Settings Type definitions
interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiryDays: number;
    preventReuseCount: number;
  };
  loginSecurity: {
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    requireMFA: boolean;
    mfaMethodsAvailable: string[];
    defaultMFAMethod: string;
    rememberDeviceDays: number;
  };
  sessionManagement: {
    sessionTimeoutMinutes: number;
    maxConcurrentSessions: number;
    enforceOneSessionPerUser: boolean;
    automaticLogoutInactivity: boolean;
  };
  ipSecurity: {
    allowedIpRanges: string[];
    blockListedIpRanges: string[];
    geoRestrictions: {
      enabled: boolean;
      allowedCountries: string[];
      blockedCountries: string[];
    };
  };
  auditSettings: {
    retentionPeriodDays: number;
    logLoginAttempts: boolean;
    logDataAccess: boolean;
    logSystemChanges: boolean;
    alertOnSensitiveActions: boolean;
    alertOnSuspiciousActivity: boolean;
  };
  dataProtection: {
    encryptionEnabled: boolean;
    encryptionAlgorithm: string;
    dataBackupEnabled: boolean;
    backupFrequency: string;
    backupRetentionDays: number;
  };
}

// Notification Type definitions
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

export default function SystemSettings() {
  // State for tabs
  const [activeTab, setActiveTab] = useState("general")
  
  // State for general settings
  const [isLoading, setIsLoading] = useState(false)
  
  // State for backups
  const [backups, setBackups] = useState<Backup[]>([])
  const [isLoadingBackups, setIsLoadingBackups] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoringBackup, setIsRestoringBackup] = useState(false)
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null)
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [showRestoreConfirmation, setShowRestoreConfirmation] = useState(false)
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [backupRetention, setBackupRetention] = useState("30")
  
  // State for cleanup
  const [cleanupOptions, setCleanupOptions] = useState<CleanupOption[]>([])
  const [cleanupSchedule, setCleanupSchedule] = useState<CleanupSchedule | null>(null)
  const [isLoadingCleanup, setIsLoadingCleanup] = useState(false)
  const [isPerformingCleanup, setIsPerformingCleanup] = useState(false)
  const [cleanLogs, setCleanLogs] = useState(true)
  const [cleanTempFiles, setCleanTempFiles] = useState(true)
  const [cleanDeletedItems, setCleanDeletedItems] = useState(true)
  const [cleanupFrequency, setCleanupFrequency] = useState("weekly")
  
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [securityFormValues, setSecurityFormValues] = useState<SecuritySettings | null>(null)
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false)
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)
  const [isResettingSecurity, setIsResettingSecurity] = useState(false)
  const [securityActiveTab, setSecurityActiveTab] = useState("password")
  
  // Notifications state
  const [notificationsActiveTab, setNotificationsActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationContent, setNotificationContent] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["app"])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [isMarkingNotifications, setIsMarkingNotifications] = useState(false)
  const [apiNotifications, setApiNotifications] = useState<ApiNotification[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [notificationFilters, setNotificationFilters] = useState({
    dateFrom: '',
    dateTo: '',
    priority: '',
    types: [] as string[],
    channels: [] as string[]
  })
  
  // Integrations state
  const [integrationsActiveTab, setIntegrationsActiveTab] = useState("all")
  const [integrationsSearchQuery, setIntegrationsSearchQuery] = useState("")
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  
  // Sample notifications data for demonstration
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
    }
  ]
  
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
  
  // Fetch backups on initial load
  useEffect(() => {
    if (activeTab === "database") {
      fetchBackups();
    }
  }, [activeTab]);
  
  // Fetch cleanup options on initial load
  useEffect(() => {
    if (activeTab === "database") {
      fetchCleanupOptions();
    }
  }, [activeTab]);
  
  // Fetch security settings on initial load
  useEffect(() => {
    if (activeTab === "security") {
      fetchSecuritySettings();
    }
  }, [activeTab]);
  
  // Fetch notifications on initial load
  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab]);
  
  const handleSave = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast.success("تم حفظ الإعدادات بنجاح")
    }, 1500)
  }
  
  // Security Settings Functions
  
  // Fetch security settings from API
  const fetchSecuritySettings = async () => {
    try {
      setIsLoadingSecurity(true)
      
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/security/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch security settings')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSecuritySettings(data.settings)
        setSecurityFormValues(data.settings)
      } else {
        toast.error(data.error || 'Failed to fetch security settings')
      }
    } catch (error) {
      console.error('Error fetching security settings:', error)
      toast.error('فشل في جلب إعدادات الأمان')
    } finally {
      setIsLoadingSecurity(false)
    }
  }
  
  // Handle form input changes for security settings - type safe version
  const handleSecurityInputChange = <T extends keyof SecuritySettings, K extends keyof SecuritySettings[T]>(
    section: T, 
    field: K, 
    value: SecuritySettings[T][K]
  ) => {
    if (!securityFormValues) return
    
    setSecurityFormValues({
      ...securityFormValues,
      [section]: {
        ...securityFormValues[section],
        [field]: value
      }
    })
  }
  
  // Handle nested form input changes (for geoRestrictions) - type safe version
  const handleSecurityNestedInputChange = <
    T extends keyof SecuritySettings,
    N extends keyof SecuritySettings[T],
    K extends keyof SecuritySettings[T][N] & string
  >(
    section: T,
    nestedSection: N,
    field: K,
    value: SecuritySettings[T][N][K]
  ) => {
    if (!securityFormValues) return
    
    setSecurityFormValues({
      ...securityFormValues,
      [section]: {
        ...securityFormValues[section],
        [nestedSection]: {
          ...securityFormValues[section][nestedSection] as any,
          [field]: value
        }
      }
    })
  }
  
  // Save security settings
  const saveSecuritySettings = async () => {
    try {
      setIsSavingSecurity(true)
      
      // Basic validation
      if (!securityFormValues) {
        toast.error('No settings to save')
        return
      }
      
      // Validate password minimum length
      if (securityFormValues.passwordPolicy.minLength < 8) {
        toast.error('يجب أن يكون الحد الأدنى لطول كلمة المرور 8 أحرف على الأقل')
        return
      }
      
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/security/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securityFormValues)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update security settings')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('تم حفظ إعدادات الأمان بنجاح')
        setSecuritySettings(securityFormValues)
      } else {
        toast.error(data.error || 'Failed to update security settings')
      }
    } catch (error) {
      console.error('Error updating security settings:', error)
      toast.error('فشل في تحديث إعدادات الأمان')
    } finally {
      setIsSavingSecurity(false)
    }
  }
  
  // Reset security form to last saved values
  const resetSecurityForm = () => {
    setIsResettingSecurity(true)
    setTimeout(() => {
      setSecurityFormValues(securitySettings)
      setIsResettingSecurity(false)
      toast.success('تم إعادة تعيين النموذج إلى القيم المحفوظة')
    }, 500)
  }
  
  // Reset security form to default values (simplified for demo)
  const resetSecurityToDefaults = () => {
    if (!confirm('سيؤدي هذا إلى إعادة تعيين جميع إعدادات الأمان إلى القيم الافتراضية. هل أنت متأكد؟')) {
      return
    }
    
    setIsResettingSecurity(true)
    // In a real implementation, you would fetch default values from the API
    // For now, we'll just set some reasonable defaults
    setTimeout(() => {
        const defaultSettings: SecuritySettings = {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            passwordExpiryDays: 90,
            preventReuseCount: 5
          },
          loginSecurity: {
            maxLoginAttempts: 5,
            lockoutDurationMinutes: 30,
            requireMFA: false,
            mfaMethodsAvailable: ["email", "sms", "app"],
            defaultMFAMethod: "email",
            rememberDeviceDays: 30
          },
        sessionManagement: {
          sessionTimeoutMinutes: 60,
          maxConcurrentSessions: 3,
          enforceOneSessionPerUser: false,
          automaticLogoutInactivity: true
        },
        ipSecurity: {
          allowedIpRanges: [],
          blockListedIpRanges: [],
          geoRestrictions: {
            enabled: false,
            allowedCountries: ["SA"],
            blockedCountries: []
          }
        },
        auditSettings: {
          retentionPeriodDays: 90,
          logLoginAttempts: true,
          logDataAccess: true,
          logSystemChanges: true,
          alertOnSensitiveActions: true,
          alertOnSuspiciousActivity: true
        },
        dataProtection: {
          encryptionEnabled: true,
          encryptionAlgorithm: "AES-256",
          dataBackupEnabled: true,
          backupFrequency: "daily",
          backupRetentionDays: 30
        }
      }
      
      setSecurityFormValues(defaultSettings)
      setIsResettingSecurity(false)
      toast.success('تم إعادة تعيين الإعدادات إلى القيم الافتراضية')
    }, 1000)
  }
  
  // Notifications Functions
  
  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/notifications?limit=100', {
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
      setIsLoadingNotifications(false);
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
      setIsSendingNotification(true);
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
      
      const payload = {
        title: notificationTitle,
        message: notificationContent,
        recipientType,
        priority: 'medium',
        sendEmail: selectedChannels.includes('email'),
        sendPush: selectedChannels.includes('sms')
      };
      
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
      setIsSendingNotification(false);
    }
  };
  
  // Mark notifications as read
  const markAsRead = async (notificationIds: string[]) => {
    try {
      setIsMarkingNotifications(true);
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
      setIsMarkingNotifications(false);
    }
  };
  
  // Toggle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    if (selectedNotifications.includes(notificationId)) {
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId))
    } else {
      setSelectedNotifications([...selectedNotifications, notificationId])
    }
  }

  // Select all notifications
  const selectAllNotifications = (notifications: any[]) => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(notifications.map(notification => notification.id))
    }
  }

  // Toggle recipient
  const toggleRecipient = (recipient: string) => {
    if (selectedRecipients.includes(recipient)) {
      setSelectedRecipients(selectedRecipients.filter(r => r !== recipient))
    } else {
      setSelectedRecipients([...selectedRecipients, recipient])
    }
  }

  // Toggle channel
  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel))
    } else {
      setSelectedChannels([...selectedChannels, channel])
    }
  }
  
  // Update notification type filter
  const updateNotificationTypeFilter = (type: string) => {
    setNotificationFilters(prev => {
      const newTypes = prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      
      return { ...prev, types: newTypes };
    });
  };
  
  // Update notification channel filter
  const updateNotificationChannelFilter = (channel: string) => {
    setNotificationFilters(prev => {
      const newChannels = prev.channels.includes(channel) 
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel];
      
      return { ...prev, channels: newChannels };
    });
  };
  
  // Reset notification filters
  const resetNotificationFilters = () => {
    setNotificationFilters({
      dateFrom: '',
      dateTo: '',
      priority: '',
      types: [],
      channels: []
    });
    setSearchQuery('');
  };
  
  // Export notifications to CSV
  const exportNotifications = (filteredNotifications: any[]) => {
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
  
  // Integrations Functions
  
  // Toggle integration selection
  const toggleIntegrationSelection = (integrationId: string) => {
    if (selectedIntegrations.includes(integrationId)) {
      setSelectedIntegrations(selectedIntegrations.filter(id => id !== integrationId));
    } else {
      setSelectedIntegrations([...selectedIntegrations, integrationId]);
    }
  }

  // Select all integrations
  const selectAllIntegrations = (filteredIntegrations: any[]) => {
    if (selectedIntegrations.length === filteredIntegrations.length) {
      setSelectedIntegrations([]);
    } else {
      setSelectedIntegrations(filteredIntegrations.map(integration => integration.id));
    }
  }
  
  // Get icon component for integrations
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
  
  // Fetch backups from API
  const fetchBackups = async () => {
    try {
      setIsLoadingBackups(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/system/backup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setBackups(data.backups);
      } else {
        toast.error(data.error || 'Failed to fetch backups');
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Failed to fetch backups');
    } finally {
      setIsLoadingBackups(false);
    }
  };
  
  // Create a new backup
  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/system/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('تم إنشاء نسخة احتياطية بنجاح');
        // Refresh the backup list
        fetchBackups();
      } else {
        toast.error(data.error || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };
  
  // Confirm restore operation
  const confirmRestore = () => {
    if (!selectedBackupId) {
      toast.error('الرجاء اختيار نسخة احتياطية للاستعادة');
      return;
    }
    
    // Find the selected backup details
    const backup = backups.find(b => b.id === selectedBackupId);
    setSelectedBackup(backup || null);
    setShowRestoreConfirmation(true);
  };
  
  // Cancel restore operation
  const cancelRestore = () => {
    setShowRestoreConfirmation(false);
  };
  
  // Restore from a backup after confirmation
  const handleRestoreBackup = async () => {
    setShowRestoreConfirmation(false);
    
    try {
      setIsRestoringBackup(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/system/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupId: selectedBackupId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore from backup');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('تمت استعادة النظام بنجاح');
      } else {
        toast.error(data.error || 'Failed to restore from backup');
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      toast.error('Failed to restore from backup');
    } finally {
      setIsRestoringBackup(false);
    }
  };
  
  // Fetch cleanup options from API
  const fetchCleanupOptions = async () => {
    try {
      setIsLoadingCleanup(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/system/cleanup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cleanup options');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCleanupOptions(data.options);
        setCleanupSchedule(data.schedule);
        
        // Update checkbox state based on the schedule
        if (data.schedule) {
          setCleanLogs(data.schedule.options.cleanLogs);
          setCleanTempFiles(data.schedule.options.cleanTempFiles);
          setCleanDeletedItems(data.schedule.options.cleanDeletedItems);
          setCleanupFrequency(data.schedule.frequency);
        }
      } else {
        toast.error(data.error || 'Failed to fetch cleanup options');
      }
    } catch (error) {
      console.error('Error fetching cleanup options:', error);
      toast.error('Failed to fetch cleanup options');
    } finally {
      setIsLoadingCleanup(false);
    }
  };
  
  // State for cleanup confirmation modal
  const [showCleanupConfirmation, setShowCleanupConfirmation] = useState(false);
  
  // Open confirmation dialog for cleanup
  const confirmCleanup = () => {
    // Validate that at least one option is selected
    if (!cleanLogs && !cleanTempFiles && !cleanDeletedItems) {
      toast.error('الرجاء تحديد نوع واحد على الأقل من البيانات للتنظيف');
      return;
    }
    
    setShowCleanupConfirmation(true);
  };
  
  // Cancel cleanup operation
  const cancelCleanup = () => {
    setShowCleanupConfirmation(false);
  };
  
  // Perform cleanup operation after confirmation
  const handleCleanup = async () => {
    setShowCleanupConfirmation(false);
    
    try {
      setIsPerformingCleanup(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/system/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cleanLogs,
          cleanTempFiles,
          cleanDeletedItems,
          olderThan: 30 // Default to 30 days
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform cleanup');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('تم تنظيف البيانات بنجاح');
        // Show details about what was cleaned up
        if (data.results.logs) {
          toast.success(data.results.logs.message);
        }
        if (data.results.tempFiles) {
          toast.success(data.results.tempFiles.message);
        }
        if (data.results.deletedItems) {
          toast.success(data.results.deletedItems.message);
        }
      } else {
        toast.error(data.error || 'Failed to perform cleanup');
      }
    } catch (error) {
      console.error('Error performing cleanup:', error);
      toast.error('Failed to perform cleanup');
    } finally {
      setIsPerformingCleanup(false);
    }
  };

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
        
        {/* Security Tab Content */}
        <TabsContent value="security">
          {isLoadingSecurity ? (
            <div className="flex justify-center items-center h-[50vh]">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg text-muted-foreground">جاري تحميل إعدادات الأمان...</p>
              </div>
            </div>
          ) : !securityFormValues ? (
            <div className="flex justify-center items-center h-[50vh]">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                <p className="text-lg text-muted-foreground">فشل في تحميل إعدادات الأمان</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={fetchSecuritySettings}
                >
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={resetSecurityForm}
                    disabled={isResettingSecurity || !securitySettings}
                  >
                    {isResettingSecurity ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span>إلغاء التغييرات</span>
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={saveSecuritySettings}
                    disabled={isSavingSecurity}
                  >
                    {isSavingSecurity ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>حفظ الإعدادات</span>
                  </Button>
                </div>
                <h2 className="text-2xl font-bold">إعدادات الأمان</h2>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">تحذير: الإعدادات الحساسة</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    تؤثر إعدادات الأمان على جميع مستخدمي المنصة. يرجى توخي الحذر عند إجراء التغييرات وضمان فهمك لتأثيرها.
                  </p>
                </div>
              </div>

              <Tabs value={securityActiveTab} onValueChange={setSecurityActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
                  <TabsTrigger value="password">كلمات المرور</TabsTrigger>
                  <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="session">الجلسات</TabsTrigger>
                  <TabsTrigger value="network">الشبكة</TabsTrigger>
                  <TabsTrigger value="audit">التدقيق</TabsTrigger>
                  <TabsTrigger value="encryption">التشفير</TabsTrigger>
                </TabsList>
                
                {/* Password Policy Tab */}
                <TabsContent value="password">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-end gap-2">
                        <span>سياسة كلمات المرور</span>
                        <Key className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        إعدادات تحديد قوة وأمان كلمات المرور للمستخدمين
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الحد الأدنى لطول كلمة المرور</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.passwordPolicy.minLength}
                          onChange={(e) => handleSecurityInputChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                          min={8}
                          max={30}
                        />
                        <p className="text-xs text-muted-foreground">
                          يوصى بـ 10 أحرف أو أكثر لتعزيز الأمان.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">متطلبات التعقيد</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="require-uppercase" 
                              className="ml-2" 
                              checked={securityFormValues.passwordPolicy.requireUppercase}
                              onChange={(e) => handleSecurityInputChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                            />
                            <label htmlFor="require-uppercase">يجب أن تحتوي على حرف كبير واحد على الأقل</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="require-lowercase" 
                              className="ml-2" 
                              checked={securityFormValues.passwordPolicy.requireLowercase}
                              onChange={(e) => handleSecurityInputChange('passwordPolicy', 'requireLowercase', e.target.checked)}
                            />
                            <label htmlFor="require-lowercase">يجب أن تحتوي على حرف صغير واحد على الأقل</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="require-numbers" 
                              className="ml-2" 
                              checked={securityFormValues.passwordPolicy.requireNumbers}
                              onChange={(e) => handleSecurityInputChange('passwordPolicy', 'requireNumbers', e.target.checked)}
                            />
                            <label htmlFor="require-numbers">يجب أن تحتوي على رقم واحد على الأقل</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="require-special" 
                              className="ml-2" 
                              checked={securityFormValues.passwordPolicy.requireSpecialChars}
                              onChange={(e) => handleSecurityInputChange('passwordPolicy', 'requireSpecialChars', e.target.checked)}
                            />
                            <label htmlFor="require-special">يجب أن تحتوي على حرف خاص واحد على الأقل</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">مدة صلاحية كلمة المرور (بالأيام)</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.passwordPolicy.passwordExpiryDays}
                          onChange={(e) => handleSecurityInputChange('passwordPolicy', 'passwordExpiryDays', parseInt(e.target.value))}
                          min={0}
                          max={365}
                        />
                        <p className="text-xs text-muted-foreground">
                          استخدم 0 لتعطيل انتهاء صلاحية كلمة المرور.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">منع إعادة استخدام كلمات المرور السابقة</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.passwordPolicy.preventReuseCount}
                          onChange={(e) => handleSecurityInputChange('passwordPolicy', 'preventReuseCount', parseInt(e.target.value))}
                          min={0}
                          max={20}
                        />
                        <p className="text-xs text-muted-foreground">
                          عدد كلمات المرور السابقة التي لا يمكن إعادة استخدامها. استخدم 0 لتعطيل هذه الميزة.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Login Security Tab */}
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-end gap-2">
                        <span>أمان تسجيل الدخول</span>
                        <UserCheck className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        إعدادات المصادقة وتأمين تسجيل الدخول للمستخدمين
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الحد الأقصى لمحاولات تسجيل الدخول الفاشلة</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.loginSecurity.maxLoginAttempts}
                          onChange={(e) => handleSecurityInputChange('loginSecurity', 'maxLoginAttempts', parseInt(e.target.value))}
                          min={1}
                          max={20}
                        />
                        <p className="text-xs text-muted-foreground">
                          بعد تجاوز هذا العدد، سيتم قفل الحساب مؤقتًا.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">مدة قفل الحساب (بالدقائق)</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.loginSecurity.lockoutDurationMinutes}
                          onChange={(e) => handleSecurityInputChange('loginSecurity', 'lockoutDurationMinutes', parseInt(e.target.value))}
                          min={1}
                          max={1440}
                        />
                        <p className="text-xs text-muted-foreground">
                          المدة التي يتم فيها قفل الحساب بعد تجاوز الحد الأقصى لمحاولات تسجيل الدخول الفاشلة.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">المصادقة متعددة العوامل (MFA)</label>
                        <div className="flex items-center mb-3">
                          <input 
                            type="checkbox" 
                            id="require-mfa" 
                            className="ml-2" 
                            checked={securityFormValues.loginSecurity.requireMFA}
                            onChange={(e) => handleSecurityInputChange('loginSecurity', 'requireMFA', e.target.checked)}
                          />
                          <label htmlFor="require-mfa">تفعيل المصادقة متعددة العوامل إلزامياً لجميع المستخدمين</label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">طرق المصادقة متعددة العوامل المتاحة</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="mfa-email" 
                              className="ml-2" 
                              checked={securityFormValues.loginSecurity.mfaMethodsAvailable.includes("email")}
                              onChange={(e) => {
                                const methods = [...securityFormValues.loginSecurity.mfaMethodsAvailable];
                                if (e.target.checked) {
                                  if (!methods.includes("email")) methods.push("email");
                                } else {
                                  const index = methods.indexOf("email");
                                  if (index !== -1) methods.splice(index, 1);
                                }
                                handleSecurityInputChange('loginSecurity', 'mfaMethodsAvailable', methods);
                              }}
                            />
                            <label htmlFor="mfa-email">البريد الإلكتروني</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="mfa-sms" 
                              className="ml-2" 
                              checked={securityFormValues.loginSecurity.mfaMethodsAvailable.includes("sms")}
                              onChange={(e) => {
                                const methods = [...securityFormValues.loginSecurity.mfaMethodsAvailable];
                                if (e.target.checked) {
                                  if (!methods.includes("sms")) methods.push("sms");
                                } else {
                                  const index = methods.indexOf("sms");
                                  if (index !== -1) methods.splice(index, 1);
                                }
                                handleSecurityInputChange('loginSecurity', 'mfaMethodsAvailable', methods);
                              }}
                            />
                            <label htmlFor="mfa-sms">الرسائل النصية (SMS)</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="mfa-app" 
                              className="ml-2" 
                              checked={securityFormValues.loginSecurity.mfaMethodsAvailable.includes("app")}
                              onChange={(e) => {
                                const methods = [...securityFormValues.loginSecurity.mfaMethodsAvailable];
                                if (e.target.checked) {
                                  if (!methods.includes("app")) methods.push("app");
                                } else {
                                  const index = methods.indexOf("app");
                                  if (index !== -1) methods.splice(index, 1);
                                }
                                handleSecurityInputChange('loginSecurity', 'mfaMethodsAvailable', methods);
                              }}
                            />
                            <label htmlFor="mfa-app">تطبيق المصادقة</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">طريقة المصادقة متعددة العوامل الافتراضية</label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={securityFormValues.loginSecurity.defaultMFAMethod}
                          onChange={(e) => handleSecurityInputChange('loginSecurity', 'defaultMFAMethod', e.target.value)}
                        >
                          {securityFormValues.loginSecurity.mfaMethodsAvailable.includes("email") && (
                            <option value="email">البريد الإلكتروني</option>
                          )}
                          {securityFormValues.loginSecurity.mfaMethodsAvailable.includes("sms") && (
                            <option value="sms">الرسائل النصية (SMS)</option>
                          )}
                          {securityFormValues.loginSecurity.mfaMethodsAvailable.includes("app") && (
                            <option value="app">تطبيق المصادقة</option>
                          )}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">مدة تذكر الجهاز (بالأيام)</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.loginSecurity.rememberDeviceDays}
                          onChange={(e) => handleSecurityInputChange('loginSecurity', 'rememberDeviceDays', parseInt(e.target.value))}
                          min={0}
                          max={365}
                        />
                        <p className="text-xs text-muted-foreground">
                          المدة التي يتم فيها تذكر الأجهزة الموثوقة قبل طلب إعادة المصادقة متعددة العوامل. استخدم 0 لطلب المصادقة في كل مرة.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Session Management Tab */}
                <TabsContent value="session">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-end gap-2">
                        <span>إدارة الجلسات</span>
                        <Clock className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        إعدادات جلسات المستخدمين ومدة الاتصال
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">مدة انتهاء الجلسة (بالدقائق)</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.sessionManagement.sessionTimeoutMinutes}
                          onChange={(e) => handleSecurityInputChange('sessionManagement', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                          min={5}
                          max={1440}
                        />
                        <p className="text-xs text-muted-foreground">
                          مدة الخمول قبل تسجيل خروج المستخدم تلقائيًا.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الحد الأقصى للجلسات المتزامنة</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.sessionManagement.maxConcurrentSessions}
                          onChange={(e) => handleSecurityInputChange('sessionManagement', 'maxConcurrentSessions', parseInt(e.target.value))}
                          min={1}
                          max={10}
                        />
                        <p className="text-xs text-muted-foreground">
                          العدد الأقصى للجلسات النشطة المسموح بها للمستخدم الواحد في وقت واحد.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">قيود الجلسات</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="enforce-one-session" 
                              className="ml-2" 
                              checked={securityFormValues.sessionManagement.enforceOneSessionPerUser}
                              onChange={(e) => handleSecurityInputChange('sessionManagement', 'enforceOneSessionPerUser', e.target.checked)}
                            />
                            <label htmlFor="enforce-one-session">فرض جلسة واحدة فقط لكل مستخدم</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="auto-logout" 
                              className="ml-2" 
                              checked={securityFormValues.sessionManagement.automaticLogoutInactivity}
                              onChange={(e) => handleSecurityInputChange('sessionManagement', 'automaticLogoutInactivity', e.target.checked)}
                            />
                            <label htmlFor="auto-logout">تسجيل الخروج التلقائي عند الخمول</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-md mt-4">
                        <h3 className="font-medium mb-2">نصائح أمان:</h3>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>لزيادة الأمان، قم بتقليل مدة انتهاء الجلسة للمستخدمين ذوي الصلاحيات العالية.</li>
                          <li>تمكين الحد الأقصى للجلسات المتزامنة يساعد في منع مشاركة الحسابات غير المصرح بها.</li>
                          <li>تفعيل خيار تسجيل الخروج التلقائي يمنع الوصول غير المصرح به عندما يترك المستخدم جهازه دون مراقبة.</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* IP Security Tab */}
                <TabsContent value="network">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-end gap-2">
                        <span>أمان الشبكة والوصول</span>
                        <Globe className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        إعدادات تقييد الوصول للنظام بناءً على IP والموقع الجغرافي
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">قائمة العناوين المسموح بها (IP Allowlist)</label>
                        <Input 
                          placeholder="أدخل نطاقات IP المفصولة بفواصل مثل: 192.168.1.0/24, 10.0.0.5"
                          value={securityFormValues.ipSecurity.allowedIpRanges.join(', ')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const ranges = value ? value.split(',').map(s => s.trim()) : [];
                            handleSecurityInputChange('ipSecurity', 'allowedIpRanges', ranges);
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          إذا تم تحديد قائمة العناوين المسموح بها، سيتم حظر جميع عناوين IP الأخرى. اتركها فارغة للسماح لجميع عناوين IP.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">قائمة العناوين المحظورة (IP Blocklist)</label>
                        <Input 
                          placeholder="أدخل نطاقات IP المفصولة بفواصل مثل: 198.51.100.0/24, 203.0.113.5"
                          value={securityFormValues.ipSecurity.blockListedIpRanges.join(', ')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const ranges = value ? value.split(',').map(s => s.trim()) : [];
                            handleSecurityInputChange('ipSecurity', 'blockListedIpRanges', ranges);
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          سيتم حظر عناوين IP المحددة هنا، حتى لو كانت موجودة في قائمة العناوين المسموح بها.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">قيود الموقع الجغرافي</label>
                        <div className="flex items-center mb-3">
                          <input 
                            type="checkbox" 
                            id="geo-restrictions" 
                            className="ml-2" 
                            checked={securityFormValues.ipSecurity.geoRestrictions.enabled}
                            onChange={(e) => handleSecurityNestedInputChange('ipSecurity', 'geoRestrictions', 'enabled', e.target.checked)}
                          />
                          <label htmlFor="geo-restrictions">تفعيل قيود الموقع الجغرافي</label>
                        </div>
                      </div>
                      
                      {securityFormValues.ipSecurity.geoRestrictions.enabled && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">الدول المسموح بها</label>
                            <Input 
                              placeholder="أدخل رموز الدول المفصولة بفواصل مثل: SA, AE, KW"
                              value={securityFormValues.ipSecurity.geoRestrictions.allowedCountries.join(', ')}
                              onChange={(e) => {
                                const value = e.target.value;
                                const countries = value ? value.split(',').map(s => s.trim()) : [];
                                handleSecurityNestedInputChange('ipSecurity', 'geoRestrictions', 'allowedCountries', countries);
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              استخدم رموز ISO الثنائية للدول (مثل SA للسعودية، AE للإمارات). إذا تم تحديد قائمة الدول المسموح بها، سيتم حظر جميع الدول الأخرى.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">الدول المحظورة</label>
                            <Input 
                              placeholder="أدخل رموز الدول المفصولة بفواصل مثل: XX, YY, ZZ"
                              value={securityFormValues.ipSecurity.geoRestrictions.blockedCountries.join(', ')}
                              onChange={(e) => {
                                const value = e.target.value;
                                const countries = value ? value.split(',').map(s => s.trim()) : [];
                                handleSecurityNestedInputChange('ipSecurity', 'geoRestrictions', 'blockedCountries', countries);
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              سيتم حظر الدول المحددة هنا، حتى لو كانت موجودة في قائمة الدول المسموح بها.
                            </p>
                          </div>
                        </>
                      )}
                      
                      <div className="p-4 bg-amber-50 rounded-md border border-amber-200 mt-4">
                        <h3 className="font-medium text-amber-800 mb-2">تحذير:</h3>
                        <p className="text-amber-700 text-sm">
                          كن حذرًا عند تكوين قيود IP. تأكد من أن عنوان IP الخاص بك مضمن في القائمة المسموح بها إذا كنت تستخدمها، وإلا فقد تفقد الوصول إلى النظام.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Audit Settings Tab */}
                <TabsContent value="audit">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-end gap-2">
                        <span>إعدادات التدقيق والسجلات</span>
                        <FileText className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        إعدادات تسجيل الأحداث والتدقيق في النظام
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">مدة الاحتفاظ بسجلات التدقيق (بالأيام)</label>
                        <Input 
                          type="number" 
                          value={securityFormValues.auditSettings.retentionPeriodDays}
                          onChange={(e) => handleSecurityInputChange('auditSettings', 'retentionPeriodDays', parseInt(e.target.value))}
                          min={30}
                          max={3650}
                        />
                        <p className="text-xs text-muted-foreground">
                          المدة التي يتم الاحتفاظ بسجلات التدقيق قبل حذفها تلقائيًا.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">أنواع السجلات</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="log-login" 
                              className="ml-2" 
                              checked={securityFormValues.auditSettings.logLoginAttempts}
                              onChange={(e) => handleSecurityInputChange('auditSettings', 'logLoginAttempts', e.target.checked)}
                            />
                            <label htmlFor="log-login">تسجيل محاولات تسجيل الدخول (ناجحة وفاشلة)</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="log-data-access" 
                              className="ml-2" 
                              checked={securityFormValues.auditSettings.logDataAccess}
                              onChange={(e) => handleSecurityInputChange('auditSettings', 'logDataAccess', e.target.checked)}
                            />
                            <label htmlFor="log-data-access">تسجيل الوصول للبيانات الحساسة</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="log-system-changes" 
                              className="ml-2" 
                              checked={securityFormValues.auditSettings.logSystemChanges}
                              onChange={(e) => handleSecurityInputChange('auditSettings', 'logSystemChanges', e.target.checked)}
                            />
                            <label htmlFor="log-system-changes">تسجيل تغييرات النظام والإعدادات</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">إشعارات وتنبيهات</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="alert-sensitive" 
                              className="ml-2" 
                              checked={securityFormValues.auditSettings.alertOnSensitiveActions}
                              onChange={(e) => handleSecurityInputChange('auditSettings', 'alertOnSensitiveActions', e.target.checked)}
                            />
                            <label htmlFor="alert-sensitive">إرسال تنبيهات للإجراءات الحساسة</label>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="alert-suspicious" 
                              className="ml-2" 
                              checked={securityFormValues.auditSettings.alertOnSuspiciousActivity}
                              onChange={(e) => handleSecurityInputChange('auditSettings', 'alertOnSuspiciousActivity', e.target.checked)}
                            />
                            <label htmlFor="alert-suspicious">إرسال تنبيهات للأنشطة المشبوهة</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-md border border-blue-200 mt-4">
                        <h3 className="font-medium text-blue-800 mb-2">معلومات:</h3>
                        <p className="text-blue-700 text-sm">
                          الاحتفاظ بسجلات التدقيق لمدة طويلة (365 يومًا أو أكثر) يعزز قدرات التحقيق والامتثال، ولكنه قد يزيد من استهلاك موارد التخزين. قم بموازنة الاحتياجات الأمنية مع متطلبات الموارد.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Data Protection Tab */}
                <TabsContent value="encryption">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-end gap-2">
                        <span>حماية البيانات والتشفير</span>
                        <Shield className="h-5 w-5 text-primary" />
                      </CardTitle>
                      <CardDescription>
                        إعدادات تشفير البيانات وحمايتها من الوصول غير المصرح به
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">تشفير البيانات</label>
                        <div className="flex items-center mb-3">
                          <input 
                            type="checkbox" 
                            id="encryption-enabled" 
                            className="ml-2" 
                            checked={securityFormValues.dataProtection.encryptionEnabled}
                            onChange={(e) => handleSecurityInputChange('dataProtection', 'encryptionEnabled', e.target.checked)}
                          />
                          <label htmlFor="encryption-enabled">تفعيل تشفير البيانات الحساسة</label>
                        </div>
                      </div>
                      
                      {securityFormValues.dataProtection.encryptionEnabled && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">خوارزمية التشفير</label>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={securityFormValues.dataProtection.encryptionAlgorithm}
                            onChange={(e) => handleSecurityInputChange('dataProtection', 'encryptionAlgorithm', e.target.value)}
                          >
                            <option value="AES-256">AES-256 (موصى به)</option>
                            <option value="AES-128">AES-128</option>
                            <option value="ChaCha20">ChaCha20-Poly1305</option>
                          </select>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">النسخ الاحتياطي للبيانات</label>
                        <div className="flex items-center mb-3">
                          <input 
                            type="checkbox" 
                            id="backup-enabled" 
                            className="ml-2" 
                            checked={securityFormValues.dataProtection.dataBackupEnabled}
                            onChange={(e) => handleSecurityInputChange('dataProtection', 'dataBackupEnabled', e.target.checked)}
                          />
                          <label htmlFor="backup-enabled">تفعيل النسخ الاحتياطي التلقائي للبيانات</label>
                        </div>
                      </div>
                      
                      {securityFormValues.dataProtection.dataBackupEnabled && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">تكرار النسخ الاحتياطي</label>
                            <select
                              className="w-full p-2 border rounded-md"
                              value={securityFormValues.dataProtection.backupFrequency}
                              onChange={(e) => handleSecurityInputChange('dataProtection', 'backupFrequency', e.target.value)}
                            >
                              <option value="hourly">كل ساعة</option>
                              <option value="daily">يومي</option>
                              <option value="weekly">أسبوعي</option>
                              <option value="monthly">شهري</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">مدة الاحتفاظ بالنسخ الاحتياطية (بالأيام)</label>
                            <Input 
                              type="number" 
                              value={securityFormValues.dataProtection.backupRetentionDays}
                              onChange={(e) => handleSecurityInputChange('dataProtection', 'backupRetentionDays', parseInt(e.target.value))}
                              min={1}
                              max={3650}
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="p-4 bg-green-50 rounded-md border border-green-200 mt-4">
                        <h3 className="font-medium text-green-800 mb-2">أفضل الممارسات:</h3>
                        <ul className="text-sm space-y-1 list-disc list-inside text-green-700">
                          <li>استخدم تشفير AES-256 لأعلى مستوى من الأمان للبيانات الحساسة.</li>
                          <li>قم بعمل نسخ احتياطية يومية للبيانات المهمة للحماية من فقدان البيانات.</li>
                          <li>احتفظ بالنسخ الاحتياطية في مواقع متعددة لتجنب نقاط الفشل الفردية.</li>
                          <li>قم بتشفير النسخ الاحتياطية لمنع الوصول غير المصرح به في حالة الوصول الفعلي.</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={resetSecurityToDefaults}
                  disabled={isResettingSecurity}
                >
                  إعادة تعيين إلى الافتراضي
                </Button>
                <Button 
                  variant="default" 
                  onClick={saveSecuritySettings}
                  disabled={isSavingSecurity}
                >
                  {isSavingSecurity ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      <span>حفظ جميع الإعدادات</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Notifications Tab Content */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-end gap-2">
                    <span>إجمالي الإشعارات</span>
                    <Bell className="h-5 w-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{apiNotifications.length + staticNotifications.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {staticNotifications.filter(n => n.status === "مرسل").length} مرسلة • {staticNotifications.filter(n => n.status === "مجدول").length} مجدولة
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
                      (staticNotifications
                        .filter(n => n.status === "مرسل")
                        .reduce((sum, n) => sum + n.readCount, 0) /
                        staticNotifications
                          .filter(n => n.status === "مرسل")
                          .reduce((sum, n) => sum + n.totalCount, 0)) *
                        100
                    )}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {staticNotifications
                      .filter(n => n.status === "مرسل")
                      .reduce((sum, n) => sum + n.readCount, 0)} قراءة من أصل {staticNotifications
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
                  <div className="text-3xl font-bold">{staticNotifications.filter(n => n.status === "مجدول").length}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    الإشعار التالي: {staticNotifications.find(n => n.status === "مجدول")?.date || "لا يوجد"}
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
                  <div className="text-3xl font-bold">{staticNotifications.filter(n => n.status === "مسودة").length}</div>
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
                <div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  {showAdvancedFilters && (
                    <div className="absolute z-10 mt-2 p-4 bg-white border rounded-md shadow-lg w-80 left-auto right-auto">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">تصفية متقدمة</h3>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">التاريخ</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs">من</label>
                              <Input 
                                type="date" 
                                value={notificationFilters.dateFrom}
                                onChange={(e) => setNotificationFilters({...notificationFilters, dateFrom: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="text-xs">إلى</label>
                              <Input 
                                type="date" 
                                value={notificationFilters.dateTo}
                                onChange={(e) => setNotificationFilters({...notificationFilters, dateTo: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">نوع الإشعار</label>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox" 
                                id="system" 
                                className="ml-2"
                                checked={notificationFilters.types.includes('system')}
                                onChange={() => updateNotificationTypeFilter('system')}
                              />
                              <label htmlFor="system" className="text-sm">إشعارات النظام</label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox" 
                                id="startup" 
                                className="ml-2"
                                checked={notificationFilters.types.includes('startup')}
                                onChange={() => updateNotificationTypeFilter('startup')}
                              />
                              <label htmlFor="startup" className="text-sm">إشعارات الشركات الناشئة</label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox" 
                                id="investor" 
                                className="ml-2"
                                checked={notificationFilters.types.includes('investor')}
                                onChange={() => updateNotificationTypeFilter('investor')}
                              />
                              <label htmlFor="investor" className="text-sm">إشعارات المستثمرين</label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">قناة الإرسال</label>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox" 
                                id="app-filter" 
                                className="ml-2"
                                checked={notificationFilters.channels.includes('app')}
                                onChange={() => updateNotificationChannelFilter('app')}
                              />
                              <label htmlFor="app-filter" className="text-sm">تطبيق</label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox" 
                                id="email-filter" 
                                className="ml-2"
                                checked={notificationFilters.channels.includes('email')}
                                onChange={() => updateNotificationChannelFilter('email')}
                              />
                              <label htmlFor="email-filter" className="text-sm">بريد إلكتروني</label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="checkbox" 
                                id="sms-filter" 
                                className="ml-2"
                                checked={notificationFilters.channels.includes('sms')}
                                onChange={() => updateNotificationChannelFilter('sms')}
                              />
                              <label htmlFor="sms-filter" className="text-sm">رسائل نصية</label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">الأولوية</label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={notificationFilters.priority}
                            onChange={(e) => setNotificationFilters({...notificationFilters, priority: e.target.value})}
                          >
                            <option value="">الكل</option>
                            <option value="high">عالية</option>
                            <option value="medium">متوسطة</option>
                            <option value="low">منخفضة</option>
                          </select>
                        </div>
                        
                        <div className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" onClick={resetNotificationFilters}>
                            إعادة ضبط
                          </Button>
                          <Button size="sm" onClick={() => setShowAdvancedFilters(false)}>
                            تطبيق
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Export Button */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => exportNotifications(staticNotifications)}
                  title="تصدير الإشعارات"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs value={notificationsActiveTab} onValueChange={setNotificationsActiveTab} className="w-full md:w-auto">
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
                              disabled={isMarkingNotifications}
                            >
                              {isMarkingNotifications ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
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
                        {(notificationFilters.dateFrom || notificationFilters.dateTo || notificationFilters.priority || notificationFilters.types.length > 0 || notificationFilters.channels.length > 0) && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>تصفية نشطة</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-1 ml-1"
                              onClick={resetNotificationFilters}
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
                          onClick={fetchNotifications}
                          className="h-8 px-2 text-xs"
                          disabled={isLoadingNotifications}
                        >
                          {isLoadingNotifications ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                          تحديث
                        </Button>
                        <CardTitle>قائمة الإشعارات ({staticNotifications.length})</CardTitle>
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
                            checked={selectedNotifications.length === staticNotifications.length && staticNotifications.length > 0}
                            onChange={() => selectAllNotifications(staticNotifications)}
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
                      
                      {isLoadingNotifications ? (
                        <div className="p-8 text-center">
                          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                          <p className="text-muted-foreground">جاري تحميل الإشعارات...</p>
                        </div>
                      ) : staticNotifications.length > 0 ? (
                        staticNotifications
                          .filter(n => {
                            // Filter by tab
                            if (notificationsActiveTab === "sent" && n.status !== "مرسل") return false;
                            if (notificationsActiveTab === "scheduled" && n.status !== "مجدول") return false;
                            if (notificationsActiveTab === "draft" && n.status !== "مسودة") return false;

                            // Filter by search query
                            if (searchQuery) {
                              const query = searchQuery.toLowerCase();
                              if (!(
                                n.title.toLowerCase().includes(query) ||
                                n.content.toLowerCase().includes(query) ||
                                n.recipients.toLowerCase().includes(query)
                              )) return false;
                            }
                            
                            // Filter by date range
                            if (notificationFilters.dateFrom && n.date) {
                              const fromDate = new Date(notificationFilters.dateFrom);
                              const notifDate = new Date(n.date);
                              if (notifDate < fromDate) return false;
                            }
                            
                            if (notificationFilters.dateTo && n.date) {
                              const toDate = new Date(notificationFilters.dateTo);
                              const notifDate = new Date(n.date);
                              if (notifDate > toDate) return false;
                            }
                            
                            // Filter by type
                            if (notificationFilters.types.length > 0) {
                              const typeMatch = notificationFilters.types.some(type => {
                                if (type === 'system' && n.recipients.includes('جميع المستخدمين')) return true;
                                if (type === 'startup' && n.recipients.includes('الشركات الناشئة')) return true;
                                if (type === 'investor' && n.recipients.includes('المستثمرون')) return true;
                                return false;
                              });
                              if (!typeMatch) return false;
                            }
                            
                            // Filter by channel
                            if (notificationFilters.channels.length > 0) {
                              const channelMatch = notificationFilters.channels.some(channel => {
                                if (channel === 'app' && n.channels.includes('تطبيق')) return true;
                                if (channel === 'email' && n.channels.includes('بريد')) return true;
                                if (channel === 'sms' && n.channels.includes('رسائل')) return true;
                                return false;
                              });
                              if (!channelMatch) return false;
                            }
                            
                            // Filter by priority
                            if (notificationFilters.priority) {
                              if (notificationFilters.priority === 'high' && !n.title.includes('تحديث')) return false;
                              if (notificationFilters.priority === 'medium' && !n.title.includes('دعوة')) return false;
                              if (notificationFilters.priority === 'low' && !n.title.includes('تذكير')) return false;
                            }

                            return true;
                          })
                          .map((notification) => (
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
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotificationContent(e.target.value)}
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
                          disabled={isSendingNotification}
                        >
                          {isSendingNotification ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
        </TabsContent>
        
        {/* Integrations Tab Content */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-end gap-2">
                    <span>التكاملات المتصلة</span>
                    <Link className="h-5 w-5 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{integrations.filter(i => i.status === "متصل").length}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    من أصل {integrations.length} تكامل متاح
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
                  <div className="text-3xl font-bold">{integrations.filter(i => i.status !== "متصل").length}</div>
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
                    value={integrationsSearchQuery}
                    onChange={(e) => setIntegrationsSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs value={integrationsActiveTab} onValueChange={setIntegrationsActiveTab} className="w-full md:w-auto">
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
              {integrations
                .filter(integration => {
                  // Filter by tab
                  if (integrationsActiveTab === "connected" && integration.status !== "متصل") return false;
                  if (integrationsActiveTab === "disconnected" && integration.status === "متصل") return false;
                  if (integrationsActiveTab === "payments" && integration.category !== "المدفوعات") return false;
                  if (integrationsActiveTab === "communication" && integration.category !== "التواصل" && integration.category !== "التسويق") return false;
                  if (integrationsActiveTab === "analytics" && integration.category !== "تحليلات") return false;

                  // Filter by search query
                  if (integrationsSearchQuery) {
                    const query = integrationsSearchQuery.toLowerCase();
                    return (
                      integration.name.toLowerCase().includes(query) ||
                      integration.category.toLowerCase().includes(query) ||
                      integration.description.toLowerCase().includes(query)
                    );
                  }

                  return true;
                })
                .map((integration) => (
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
                ))
              }
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
                    {integrations.filter(i => i.status === "متصل").map((integration, index) => (
                      <div key={integration.id} className="flex justify-between items-center p-3 border-b">
                        <span className="text-xs text-muted-foreground">{integration.lastSync}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">مزامنة ناجحة مع {integration.name}</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    ))}
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
                      <input 
                        type="checkbox" 
                        id="auto-sync" 
                        className="ml-2" 
                        defaultChecked={true}
                      />
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
                      <input 
                        type="checkbox" 
                        id="error-notifications" 
                        className="ml-2" 
                        defaultChecked={true}
                      />
                      <div className="flex flex-col items-end">
                        <span className="font-medium">إشعارات الخطأ</span>
                        <span className="text-sm text-muted-foreground">إرسال إشعارات عند فشل المزامنة</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3">
                      <input 
                        type="checkbox" 
                        id="sync-on-change" 
                        className="ml-2" 
                        defaultChecked={true}
                      />
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
        </TabsContent>
        
        <TabsContent value="database">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات قاعدة البيانات</CardTitle>
                <CardDescription>إدارة قاعدة البيانات والنسخ الاحتياطي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingBackups ? (
                  <div className="flex justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
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
                        <span>
                          {backups.length > 0 
                            ? new Date(backups[0].createdAt).toLocaleString('ar-SA') 
                            : 'لا توجد نسخ احتياطية'}
                        </span>
                      </div>
                    </div>
                    
                    {backups.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">النسخ الاحتياطية المتاحة</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={selectedBackupId || ''}
                          onChange={(e) => setSelectedBackupId(e.target.value)}
                        >
                          <option value="">اختر نسخة احتياطية...</option>
                          {backups.map(backup => (
                            <option key={backup.id} value={backup.id}>
                              {backup.filename} ({backup.size}) - {new Date(backup.createdAt).toLocaleString('ar-SA')}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1 flex-1"
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                      >
                        {isCreatingBackup ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span>إنشاء نسخة احتياطية</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1 flex-1"
                        onClick={confirmRestore}
                        disabled={isRestoringBackup || !selectedBackupId}
                      >
                        {isRestoringBackup ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span>استعادة من نسخة احتياطية</span>
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">جدولة النسخ الاحتياطي التلقائي</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                      >
                        <option value="daily">يوميًا</option>
                        <option value="weekly">أسبوعيًا</option>
                        <option value="monthly">شهريًا</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الاحتفاظ بالنسخ الاحتياطية لمدة</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={backupRetention}
                        onChange={(e) => setBackupRetention(e.target.value)}
                      >
                        <option value="7">7 أيام</option>
                        <option value="30">30 يومًا</option>
                        <option value="90">90 يومًا</option>
                        <option value="365">سنة</option>
                      </select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>إدارة البيانات</CardTitle>
                <CardDescription>تنظيف وصيانة البيانات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingCleanup ? (
                  <div className="flex justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">تنظيف البيانات القديمة</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="clean-logs" 
                            className="ml-2" 
                            checked={cleanLogs}
                            onChange={(e) => setCleanLogs(e.target.checked)}
                          />
                          <label htmlFor="clean-logs">سجلات النظام الأقدم من 30 يومًا</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="clean-temp" 
                            className="ml-2" 
                            checked={cleanTempFiles}
                            onChange={(e) => setCleanTempFiles(e.target.checked)}
                          />
                          <label htmlFor="clean-temp">الملفات المؤقتة الأقدم من 30 يومًا</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="clean-deleted" 
                            className="ml-2" 
                            checked={cleanDeletedItems}
                            onChange={(e) => setCleanDeletedItems(e.target.checked)}
                          />
                          <label htmlFor="clean-deleted">العناصر المحذوفة الأقدم من 30 يومًا</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">جدولة تنظيف البيانات</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={cleanupFrequency}
                        onChange={(e) => setCleanupFrequency(e.target.value)}
                      >
                        <option value="weekly">أسبوعيًا</option>
                        <option value="monthly">شهريًا</option>
                        <option value="quarterly">ربع سنوي</option>
                      </select>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={confirmCleanup}
                        disabled={isPerformingCleanup || (!cleanLogs && !cleanTempFiles && !cleanDeletedItems)}
                      >
                        {isPerformingCleanup ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            <span>جاري التنظيف...</span>
                          </>
                        ) : (
                          <span>تنظيف البيانات الآن</span>
                        )}
                      </Button>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => toast.success('تم إعادة بناء الفهارس بنجاح')}
                      >
                        إعادة بناء الفهارس
                      </Button>
                    </div>
                    
                    {/* Show cleanup statistics if available */}
                    {cleanupOptions.length > 0 && (
                      <div className="mt-4 p-3 border rounded-md bg-muted text-xs">
                        <h4 className="font-medium mb-2">إحصائيات البيانات:</h4>
                        {cleanupOptions.map(option => (
                          <div key={option.id} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{option.name}:</span>
                              <span>{option.currentSize}</span>
                            </div>
                            <div className="text-muted-foreground">
                              التوفير المقدر: {option.estimatedSavings}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Restore Confirmation Modal */}
      {showRestoreConfirmation && selectedBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-right">
            <h3 className="text-lg font-bold mb-2">تأكيد استعادة النظام</h3>
            <p className="text-muted-foreground mb-4">
              سيؤدي هذا إلى استعادة النظام من النسخة الاحتياطية المحددة. سيتم استبدال البيانات الحالية بالبيانات من النسخة الاحتياطية.
            </p>
            <div className="p-3 border rounded-md mb-4 bg-amber-50 border-amber-200">
              <div className="flex justify-between items-center">
                <span className="font-bold">{selectedBackup.filename}</span>
              </div>
              <div className="text-sm text-amber-700 mt-1">
                <div>الحجم: {selectedBackup.size}</div>
                <div>تاريخ الإنشاء: {new Date(selectedBackup.createdAt).toLocaleString('ar-SA')}</div>
                {selectedBackup.description && (
                  <div>الوصف: {selectedBackup.description}</div>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={cancelRestore}
              >
                إلغاء
              </Button>
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleRestoreBackup}
                disabled={isRestoringBackup}
              >
                {isRestoringBackup ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                    <span>جاري الاستعادة...</span>
                  </>
                ) : (
                  <span>تأكيد الاستعادة</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cleanup Confirmation Modal */}
      {showCleanupConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-right">
            <h3 className="text-lg font-bold mb-2">تأكيد تنظيف البيانات</h3>
            <p className="text-muted-foreground mb-4">
              سيؤدي هذا إلى حذف البيانات القديمة نهائياً من النظام. هذه العملية لا يمكن التراجع عنها.
            </p>
            <div className="space-y-2 mb-4">
              {cleanLogs && (
                <div className="flex items-center justify-end gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>سجلات النظام الأقدم من 30 يومًا</span>
                </div>
              )}
              {cleanTempFiles && (
                <div className="flex items-center justify-end gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>الملفات المؤقتة الأقدم من 30 يومًا</span>
                </div>
              )}
              {cleanDeletedItems && (
                <div className="flex items-center justify-end gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>العناصر المحذوفة الأقدم من 30 يومًا</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={cancelCleanup}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleCleanup}
                disabled={isPerformingCleanup}
              >
                {isPerformingCleanup ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                    <span>جاري التنظيف...</span>
                  </>
                ) : (
                  <span>تأكيد التنظيف</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
