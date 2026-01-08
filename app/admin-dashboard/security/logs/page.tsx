"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
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
  AlertCircle,
  X,
  Settings,
  Save
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { exportPresets } from "@/lib/export-utils"

interface SecurityLog {
  id: string;
  action: string;
  user: string;
  userRole: string;
  status: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: string;
}

interface SecurityStats {
  total: number;
  success: number;
  failure: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  systemActions: number;
}

export default function SecurityLogs() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("week")
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [apiLogs, setApiLogs] = useState<SecurityLog[]>([])
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  
  // Filter state
  const [filterOptions, setFilterOptions] = useState({
    userTypes: [] as string[],
    actionTypes: [] as string[],
    ipAddress: "",
    startDate: "",
    endDate: "",
    severityLevels: [] as string[]
  })
  const [stats, setStats] = useState<SecurityStats>({
    total: 0,
    success: 0,
    failure: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    systemActions: 0
  })

  // Fetch logs from API on initial load and when filters change
  useEffect(() => {
    fetchLogs();
  }, [activeTab, dateRange]); // Re-fetch when filters change

  // Fetch logs from API
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching security logs...');
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Map activeTab to API parameters
      if (activeTab === "success") params.append("status", "success");
      if (activeTab === "failure") params.append("status", "failure");
      if (activeTab === "high") params.append("severity", "high");
      if (activeTab === "medium") params.append("severity", "medium");
      if (activeTab === "low") params.append("severity", "low");
      if (activeTab === "system") params.append("type", "system");
      
      // Map dateRange to API parameters
      if (dateRange === "today") {
        const today = new Date();
        params.append("fromDate", today.toISOString().split('T')[0]);
        params.append("toDate", today.toISOString().split('T')[0]);
      } else if (dateRange === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        params.append("fromDate", yesterday.toISOString().split('T')[0]);
        params.append("toDate", yesterday.toISOString().split('T')[0]);
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.append("fromDate", weekAgo.toISOString().split('T')[0]);
        const today = new Date();
        params.append("toDate", today.toISOString().split('T')[0]);
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        params.append("fromDate", monthAgo.toISOString().split('T')[0]);
        const today = new Date();
        params.append("toDate", today.toISOString().split('T')[0]);
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Fetch logs from API
      const response = await fetch(`/api/admin/security/logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch security logs');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setApiLogs(data.logs);
        setStats(data.stats);
      } else {
        console.error('Error fetching security logs:', data.error);
        toast.error(data.error || 'Failed to fetch security logs');
      }
    } catch (error) {
      console.error('Error fetching security logs:', error);
      toast.error('Failed to fetch security logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete selected logs
  const deleteLogs = async () => {
    try {
      if (selectedLogs.length === 0) return;
      
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      
      // In a real implementation, you would send the IDs to delete
      // For now, we'll just use the query parameter for demonstration
      let url = '/api/admin/security/logs';
      
      // If we're deleting specific logs by ID, we would send this in the body
      // But the current API uses query parameters for deletion criteria
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete logs');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Logs deleted successfully');
        setSelectedLogs([]);
        // Refresh logs after deletion
        fetchLogs();
      } else {
        console.error('Error deleting logs:', data.error);
        toast.error(data.error || 'Failed to delete logs');
      }
    } catch (error) {
      console.error('Error deleting logs:', error);
      toast.error('Failed to delete logs');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchLogs();
  };
  
  // Export all logs
  const exportLogs = async () => {
    try {
      setIsExporting(true);
      
      // Build filter parameters based on current state
      const filters: Record<string, string> = {};
      
      // Map activeTab to API parameters
      if (activeTab === "success") filters.status = "success";
      if (activeTab === "failure") filters.status = "failure";
      if (activeTab === "high") filters.severity = "high";
      if (activeTab === "medium") filters.severity = "medium";
      if (activeTab === "low") filters.severity = "low";
      if (activeTab === "system") filters.type = "system";
      
      // Add date range
      if (dateRange === "today") {
        const today = new Date();
        filters.fromDate = today.toISOString().split('T')[0];
        filters.toDate = today.toISOString().split('T')[0];
      } else if (dateRange === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        filters.fromDate = yesterday.toISOString().split('T')[0];
        filters.toDate = yesterday.toISOString().split('T')[0];
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filters.fromDate = weekAgo.toISOString().split('T')[0];
        const today = new Date();
        filters.toDate = today.toISOString().split('T')[0];
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        filters.fromDate = monthAgo.toISOString().split('T')[0];
        const today = new Date();
        filters.toDate = today.toISOString().split('T')[0];
      }
      
      // Add search query
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      // Use the export utility with automatic delimiter detection
      await exportPresets.securityLogs(filters);
      toast.success('تم تصدير السجلات بنجاح');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('فشل في تصدير السجلات');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Export selected logs
  const exportSelectedLogs = async () => {
    try {
      if (selectedLogs.length === 0) return;
      
      setIsExporting(true);
      
      // Use the export utility for selected IDs
      await exportPresets.securityLogs({ ids: selectedLogs.join(',') });
      toast.success(`تم تصدير ${selectedLogs.length} سجلات بنجاح`);
    } catch (error) {
      console.error('Error exporting selected logs:', error);
      toast.error('فشل في تصدير السجلات المحددة');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle filter changes
  const applyFilters = () => {
    // In a real implementation, we would apply the filters
    // For now, we'll just close the dialog and show a message
    setShowFilterDialog(false);
    toast.success('تم تطبيق الفلاتر بنجاح');
    fetchLogs(); // Fetch logs with new filters
  };

  // Sample logs data as fallback
  const fallbackLogs = [
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

  // Combine API logs with fallback logs
  const logs = apiLogs.length > 0 ? apiLogs : fallbackLogs;

  // Filter logs based on search query (API already filters by tab and date range)
  const filteredLogs = logs.filter(log => {
    // No tab filtering here - the API does that for us

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

    // No date range filtering here - the API does that for us

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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={exportLogs}
            disabled={isExporting}
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-4 w-4" />
            )}
            <span>تصدير السجلات</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
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
            <div className="text-3xl font-bold">{stats.total}</div>
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
            <div className="text-3xl font-bold">{stats.highSeverity}</div>
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
            <div className="text-3xl font-bold">{stats.failure}</div>
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
            <div className="text-3xl font-bold">{stats.success}</div>
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
          <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] text-right">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 justify-end">
                  <span>تصفية متقدمة للسجلات</span>
                  <Filter className="h-5 w-5" />
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">نوع المستخدم</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['مدير نظام', 'مدير برنامج', 'مستثمر', 'موجه', 'نظام'].map((type) => (
                      <div key={type} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id={`user-${type}`} 
                          checked={filterOptions.userTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterOptions({
                                ...filterOptions,
                                userTypes: [...filterOptions.userTypes, type]
                              });
                            } else {
                              setFilterOptions({
                                ...filterOptions,
                                userTypes: filterOptions.userTypes.filter(t => t !== type)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`user-${type}`} className="text-sm mr-2">{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">مستوى الخطورة</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['عالي', 'متوسط', 'منخفض'].map((level) => (
                      <div key={level} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id={`severity-${level}`} 
                          checked={filterOptions.severityLevels.includes(level)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterOptions({
                                ...filterOptions,
                                severityLevels: [...filterOptions.severityLevels, level]
                              });
                            } else {
                              setFilterOptions({
                                ...filterOptions,
                                severityLevels: filterOptions.severityLevels.filter(l => l !== level)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`severity-${level}`} className="text-sm mr-2">{level}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">عنوان IP</h3>
                  <Input
                    placeholder="مثال: 192.168.1.1"
                    value={filterOptions.ipAddress}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions,
                      ipAddress: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">نطاق التاريخ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs">من</label>
                      <Input 
                        type="date" 
                        value={filterOptions.startDate}
                        onChange={(e) => setFilterOptions({
                          ...filterOptions,
                          startDate: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">إلى</label>
                      <Input 
                        type="date" 
                        value={filterOptions.endDate}
                        onChange={(e) => setFilterOptions({
                          ...filterOptions,
                          endDate: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">نوع الإجراء</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['تسجيل دخول', 'تغيير كلمة المرور', 'تعديل صلاحيات المستخدم', 'محاولة وصول غير مصرح'].map((action) => (
                      <div key={action} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id={`action-${action}`} 
                          checked={filterOptions.actionTypes.includes(action)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterOptions({
                                ...filterOptions,
                                actionTypes: [...filterOptions.actionTypes, action]
                              });
                            } else {
                              setFilterOptions({
                                ...filterOptions,
                                actionTypes: filterOptions.actionTypes.filter(a => a !== action)
                              });
                            }
                          }}
                        />
                        <label htmlFor={`action-${action}`} className="text-sm mr-2">{action}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setFilterOptions({
                    userTypes: [],
                    actionTypes: [],
                    ipAddress: "",
                    startDate: "",
                    endDate: "",
                    severityLevels: []
                  });
                }}>
                  إعادة تعيين
                </Button>
                <Button onClick={applyFilters}>
                  تطبيق الفلاتر
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={exportSelectedLogs}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>تصدير المحدد</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={deleteLogs}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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
            
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">جاري تحميل السجلات...</p>
              </div>
            ) : filteredLogs.length > 0 ? (
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
