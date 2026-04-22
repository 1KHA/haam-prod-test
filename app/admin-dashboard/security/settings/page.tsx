"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { 
  Save, 
  RefreshCw, 
  Shield,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Lock,
  Key,
  UserCheck,
  Clock,
  Globe,
  FileText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Eye,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Fingerprint,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Database,
  AlertTriangle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Check,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  X
} from "lucide-react"

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

export default function SecuritySettings() {
  // State for tabs
  const [activeTab, setActiveTab] = useState("password")
  
  // State for form
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  
  // State for security settings
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [formValues, setFormValues] = useState<SecuritySettings | null>(null)
  
  // Fetch settings on initial load
  useEffect(() => {
    fetchSecuritySettings()
  }, [])
  
  // Fetch security settings from API
  const fetchSecuritySettings = async () => {
    try {
      setIsLoading(true)
      
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
        setSettings(data.settings)
        setFormValues(data.settings)
      } else {
        toast.error(data.error || 'Failed to fetch security settings')
      }
    } catch (error) {
      console.error('Error fetching security settings:', error)
      toast.error('فشل في جلب إعدادات الأمان')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle form input changes - type safe version
  const handleInputChange = <T extends keyof SecuritySettings, K extends keyof SecuritySettings[T]>(
    section: T, 
    field: K, 
    value: SecuritySettings[T][K]
  ) => {
    if (!formValues) return
    
    setFormValues({
      ...formValues,
      [section]: {
        ...formValues[section],
        [field]: value
      }
    })
  }
  
  // Handle nested form input changes (for geoRestrictions) - type safe version
  const handleNestedInputChange = <
    T extends keyof SecuritySettings,
    N extends keyof SecuritySettings[T],
    K extends keyof SecuritySettings[T][N] & string
  >(
    section: T,
    nestedSection: N,
    field: K,
    value: SecuritySettings[T][N][K]
  ) => {
    if (!formValues) return
    
    setFormValues({
      ...formValues,
      [section]: {
        ...formValues[section],
        [nestedSection]: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...formValues[section][nestedSection] as any,
          [field]: value
        }
      }
    })
  }
  
  // Save security settings
  const saveSettings = async () => {
    try {
      setIsSaving(true)
      
      // Basic validation
      if (!formValues) {
        toast.error('No settings to save')
        return
      }
      
      // Validate password minimum length
      if (formValues.passwordPolicy.minLength < 8) {
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
        body: JSON.stringify(formValues)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update security settings')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('تم حفظ إعدادات الأمان بنجاح')
        setSettings(formValues)
      } else {
        toast.error(data.error || 'Failed to update security settings')
      }
    } catch (error) {
      console.error('Error updating security settings:', error)
      toast.error('فشل في تحديث إعدادات الأمان')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Reset form to last saved values
  const resetForm = () => {
    setIsResetting(true)
    setTimeout(() => {
      setFormValues(settings)
      setIsResetting(false)
      toast.success('تم إعادة تعيين النموذج إلى القيم المحفوظة')
    }, 500)
  }
  
  // Reset form to default values (simplified for demo)
  const resetToDefaults = () => {
    if (!confirm('سيؤدي هذا إلى إعادة تعيين جميع إعدادات الأمان إلى القيم الافتراضية. هل أنت متأكد؟')) {
      return
    }
    
    setIsResetting(true)
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
      
      setFormValues(defaultSettings)
      setIsResetting(false)
      toast.success('تم إعادة تعيين الإعدادات إلى القيم الافتراضية')
    }, 1000)
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">جاري تحميل إعدادات الأمان...</p>
        </div>
      </div>
    )
  }
  
  if (!formValues) {
    return (
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
    )
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={resetForm}
            disabled={isResetting || !settings}
          >
            {isResetting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>إلغاء التغييرات</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>حفظ الإعدادات</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إعدادات الأمان</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800">تحذير: الإعدادات الحساسة</h3>
          <p className="text-amber-700 text-sm mt-1">
            تؤثر إعدادات الأمان على جميع مستخدمي المنصة. يرجى توخي الحذر عند إجراء التغييرات وضمان فهمك لتأثيرها.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                  value={formValues.passwordPolicy.minLength}
                  onChange={(e) => handleInputChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
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
                      checked={formValues.passwordPolicy.requireUppercase}
                      onChange={(e) => handleInputChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                    />
                    <label htmlFor="require-uppercase">يجب أن تحتوي على حرف كبير واحد على الأقل</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="require-lowercase" 
                      className="ml-2" 
                      checked={formValues.passwordPolicy.requireLowercase}
                      onChange={(e) => handleInputChange('passwordPolicy', 'requireLowercase', e.target.checked)}
                    />
                    <label htmlFor="require-lowercase">يجب أن تحتوي على حرف صغير واحد على الأقل</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="require-numbers" 
                      className="ml-2" 
                      checked={formValues.passwordPolicy.requireNumbers}
                      onChange={(e) => handleInputChange('passwordPolicy', 'requireNumbers', e.target.checked)}
                    />
                    <label htmlFor="require-numbers">يجب أن تحتوي على رقم واحد على الأقل</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="require-special" 
                      className="ml-2" 
                      checked={formValues.passwordPolicy.requireSpecialChars}
                      onChange={(e) => handleInputChange('passwordPolicy', 'requireSpecialChars', e.target.checked)}
                    />
                    <label htmlFor="require-special">يجب أن تحتوي على حرف خاص واحد على الأقل</label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">مدة صلاحية كلمة المرور (بالأيام)</label>
                <Input 
                  type="number" 
                  value={formValues.passwordPolicy.passwordExpiryDays}
                  onChange={(e) => handleInputChange('passwordPolicy', 'passwordExpiryDays', parseInt(e.target.value))}
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
                  value={formValues.passwordPolicy.preventReuseCount}
                  onChange={(e) => handleInputChange('passwordPolicy', 'preventReuseCount', parseInt(e.target.value))}
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
                  value={formValues.loginSecurity.maxLoginAttempts}
                  onChange={(e) => handleInputChange('loginSecurity', 'maxLoginAttempts', parseInt(e.target.value))}
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
                  value={formValues.loginSecurity.lockoutDurationMinutes}
                  onChange={(e) => handleInputChange('loginSecurity', 'lockoutDurationMinutes', parseInt(e.target.value))}
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
                    checked={formValues.loginSecurity.requireMFA}
                    onChange={(e) => handleInputChange('loginSecurity', 'requireMFA', e.target.checked)}
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
                      checked={formValues.loginSecurity.mfaMethodsAvailable.includes("email")}
                      onChange={(e) => {
                        const methods = [...formValues.loginSecurity.mfaMethodsAvailable];
                        if (e.target.checked) {
                          if (!methods.includes("email")) methods.push("email");
                        } else {
                          const index = methods.indexOf("email");
                          if (index !== -1) methods.splice(index, 1);
                        }
                        handleInputChange('loginSecurity', 'mfaMethodsAvailable', methods);
                      }}
                    />
                    <label htmlFor="mfa-email">البريد الإلكتروني</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="mfa-sms" 
                      className="ml-2" 
                      checked={formValues.loginSecurity.mfaMethodsAvailable.includes("sms")}
                      onChange={(e) => {
                        const methods = [...formValues.loginSecurity.mfaMethodsAvailable];
                        if (e.target.checked) {
                          if (!methods.includes("sms")) methods.push("sms");
                        } else {
                          const index = methods.indexOf("sms");
                          if (index !== -1) methods.splice(index, 1);
                        }
                        handleInputChange('loginSecurity', 'mfaMethodsAvailable', methods);
                      }}
                    />
                    <label htmlFor="mfa-sms">الرسائل النصية (SMS)</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="mfa-app" 
                      className="ml-2" 
                      checked={formValues.loginSecurity.mfaMethodsAvailable.includes("app")}
                      onChange={(e) => {
                        const methods = [...formValues.loginSecurity.mfaMethodsAvailable];
                        if (e.target.checked) {
                          if (!methods.includes("app")) methods.push("app");
                        } else {
                          const index = methods.indexOf("app");
                          if (index !== -1) methods.splice(index, 1);
                        }
                        handleInputChange('loginSecurity', 'mfaMethodsAvailable', methods);
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
                  value={formValues.loginSecurity.defaultMFAMethod}
                  onChange={(e) => handleInputChange('loginSecurity', 'defaultMFAMethod', e.target.value)}
                >
                  {formValues.loginSecurity.mfaMethodsAvailable.includes("email") && (
                    <option value="email">البريد الإلكتروني</option>
                  )}
                  {formValues.loginSecurity.mfaMethodsAvailable.includes("sms") && (
                    <option value="sms">الرسائل النصية (SMS)</option>
                  )}
                  {formValues.loginSecurity.mfaMethodsAvailable.includes("app") && (
                    <option value="app">تطبيق المصادقة</option>
                  )}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">مدة تذكر الجهاز (بالأيام)</label>
                <Input 
                  type="number" 
                  value={formValues.loginSecurity.rememberDeviceDays}
                  onChange={(e) => handleInputChange('loginSecurity', 'rememberDeviceDays', parseInt(e.target.value))}
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
                  value={formValues.sessionManagement.sessionTimeoutMinutes}
                  onChange={(e) => handleInputChange('sessionManagement', 'sessionTimeoutMinutes', parseInt(e.target.value))}
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
                  value={formValues.sessionManagement.maxConcurrentSessions}
                  onChange={(e) => handleInputChange('sessionManagement', 'maxConcurrentSessions', parseInt(e.target.value))}
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
                      checked={formValues.sessionManagement.enforceOneSessionPerUser}
                      onChange={(e) => handleInputChange('sessionManagement', 'enforceOneSessionPerUser', e.target.checked)}
                    />
                    <label htmlFor="enforce-one-session">فرض جلسة واحدة فقط لكل مستخدم</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="auto-logout" 
                      className="ml-2" 
                      checked={formValues.sessionManagement.automaticLogoutInactivity}
                      onChange={(e) => handleInputChange('sessionManagement', 'automaticLogoutInactivity', e.target.checked)}
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
                  value={formValues.ipSecurity.allowedIpRanges.join(', ')}
                  onChange={(e) => {
                    const value = e.target.value;
                    const ranges = value ? value.split(',').map(s => s.trim()) : [];
                    handleInputChange('ipSecurity', 'allowedIpRanges', ranges);
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
                  value={formValues.ipSecurity.blockListedIpRanges.join(', ')}
                  onChange={(e) => {
                    const value = e.target.value;
                    const ranges = value ? value.split(',').map(s => s.trim()) : [];
                    handleInputChange('ipSecurity', 'blockListedIpRanges', ranges);
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
                    checked={formValues.ipSecurity.geoRestrictions.enabled}
                    onChange={(e) => handleNestedInputChange('ipSecurity', 'geoRestrictions', 'enabled', e.target.checked)}
                  />
                  <label htmlFor="geo-restrictions">تفعيل قيود الموقع الجغرافي</label>
                </div>
              </div>
              
              {formValues.ipSecurity.geoRestrictions.enabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الدول المسموح بها</label>
                    <Input 
                      placeholder="أدخل رموز الدول المفصولة بفواصل مثل: SA, AE, KW"
                      value={formValues.ipSecurity.geoRestrictions.allowedCountries.join(', ')}
                      onChange={(e) => {
                        const value = e.target.value;
                        const countries = value ? value.split(',').map(s => s.trim()) : [];
                        handleNestedInputChange('ipSecurity', 'geoRestrictions', 'allowedCountries', countries);
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
                      value={formValues.ipSecurity.geoRestrictions.blockedCountries.join(', ')}
                      onChange={(e) => {
                        const value = e.target.value;
                        const countries = value ? value.split(',').map(s => s.trim()) : [];
                        handleNestedInputChange('ipSecurity', 'geoRestrictions', 'blockedCountries', countries);
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
                  value={formValues.auditSettings.retentionPeriodDays}
                  onChange={(e) => handleInputChange('auditSettings', 'retentionPeriodDays', parseInt(e.target.value))}
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
                      checked={formValues.auditSettings.logLoginAttempts}
                      onChange={(e) => handleInputChange('auditSettings', 'logLoginAttempts', e.target.checked)}
                    />
                    <label htmlFor="log-login">تسجيل محاولات تسجيل الدخول (ناجحة وفاشلة)</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="log-data-access" 
                      className="ml-2" 
                      checked={formValues.auditSettings.logDataAccess}
                      onChange={(e) => handleInputChange('auditSettings', 'logDataAccess', e.target.checked)}
                    />
                    <label htmlFor="log-data-access">تسجيل الوصول للبيانات الحساسة</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="log-system-changes" 
                      className="ml-2" 
                      checked={formValues.auditSettings.logSystemChanges}
                      onChange={(e) => handleInputChange('auditSettings', 'logSystemChanges', e.target.checked)}
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
                      checked={formValues.auditSettings.alertOnSensitiveActions}
                      onChange={(e) => handleInputChange('auditSettings', 'alertOnSensitiveActions', e.target.checked)}
                    />
                    <label htmlFor="alert-sensitive">إرسال تنبيهات للإجراءات الحساسة</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="alert-suspicious" 
                      className="ml-2" 
                      checked={formValues.auditSettings.alertOnSuspiciousActivity}
                      onChange={(e) => handleInputChange('auditSettings', 'alertOnSuspiciousActivity', e.target.checked)}
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
                    checked={formValues.dataProtection.encryptionEnabled}
                    onChange={(e) => handleInputChange('dataProtection', 'encryptionEnabled', e.target.checked)}
                  />
                  <label htmlFor="encryption-enabled">تفعيل تشفير البيانات الحساسة</label>
                </div>
              </div>
              
              {formValues.dataProtection.encryptionEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">خوارزمية التشفير</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formValues.dataProtection.encryptionAlgorithm}
                    onChange={(e) => handleInputChange('dataProtection', 'encryptionAlgorithm', e.target.value)}
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
                    checked={formValues.dataProtection.dataBackupEnabled}
                    onChange={(e) => handleInputChange('dataProtection', 'dataBackupEnabled', e.target.checked)}
                  />
                  <label htmlFor="backup-enabled">تفعيل النسخ الاحتياطي التلقائي للبيانات</label>
                </div>
              </div>
              
              {formValues.dataProtection.dataBackupEnabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">تكرار النسخ الاحتياطي</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={formValues.dataProtection.backupFrequency}
                      onChange={(e) => handleInputChange('dataProtection', 'backupFrequency', e.target.value)}
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
                      value={formValues.dataProtection.backupRetentionDays}
                      onChange={(e) => handleInputChange('dataProtection', 'backupRetentionDays', parseInt(e.target.value))}
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
          onClick={resetToDefaults}
          disabled={isResetting}
        >
          إعادة تعيين إلى الافتراضي
        </Button>
        <Button 
          variant="default" 
          onClick={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
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
    </div>
  );
}
