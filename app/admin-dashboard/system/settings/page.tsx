"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  AlertCircle
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
  
  const handleSave = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast.success("تم حفظ الإعدادات بنجاح")
    }, 1500)
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
