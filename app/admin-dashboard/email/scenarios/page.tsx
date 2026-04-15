'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Bell,
  User,
  FileText,
  Calendar,
  Building,
  GraduationCap,
  CheckCircle,
  XCircle,
  Save,
  Mail,
  Clock,
  Shield,
  Users,
  Target,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Upload,
  FileUp,
  Megaphone,
  BarChart3,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface EmailTemplate {
  id: string;
  name: string;
  scenarioType: string;
}

interface ScenarioSettings {
  id?: string;
  scenarioType: string;
  isEnabled: boolean;
  templateId?: string;
  sendToRoles: string[];
  delayMinutes: number;
  digestMode: 'immediate' | 'hourly' | 'daily';
  requireApproval: boolean;
}

const scenarios = [
  {
    type: 'user_created',
    label: 'إنشاء مستخدم جديد',
    description: 'عند إنشاء حساب مستخدم جديد في النظام',
    icon: User,
    category: 'المستخدمون',
  },
  {
    type: 'account_approved',
    label: 'قبول الحساب',
    description: 'عند الموافقة على حساب مستخدم',
    icon: CheckCircle,
    category: 'المستخدمون',
  },
  {
    type: 'account_suspended',
    label: 'تعليق الحساب',
    description: 'عند تعليق حساب مستخدم',
    icon: XCircle,
    category: 'المستخدمون',
  },
  {
    type: 'password_reset',
    label: 'إعادة تعيين كلمة المرور',
    description: 'عند طلب إعادة تعيين كلمة المرور',
    icon: Lock,
    category: 'المستخدمون',
  },
  {
    type: 'login_failed',
    label: 'فشل تسجيل الدخول',
    description: 'عند تكرار فشل محاولات تسجيل الدخول',
    icon: AlertTriangle,
    category: 'المستخدمون',
  },
  {
    type: 'application_submitted',
    label: 'تقديم طلب',
    description: 'عند تقديم طلب انضمام لبرنامج',
    icon: FileText,
    category: 'الطلبات',
  },
  {
    type: 'application_status_changed',
    label: 'تغيير حالة الطلب',
    description: 'عند تغيير حالة طلب الانضمام',
    icon: RefreshCw,
    category: 'الطلبات',
  },
  {
    type: 'startup_created',
    label: 'إنشاء شركة ناشئة',
    description: 'عند إنشاء شركة ناشئة جديدة',
    icon: Building,
    category: 'الشركات الناشئة',
  },
  {
    type: 'program_created',
    label: 'إنشاء برنامج',
    description: 'عند إنشاء برنامج جديد',
    icon: GraduationCap,
    category: 'البرامج',
  },
  {
    type: 'milestone_created',
    label: 'إنشاء معلم',
    description: 'عند إنشاء معلم جديد لشركة ناشئة',
    icon: Target,
    category: 'المعالم',
  },
  {
    type: 'milestone_due',
    label: 'استحقاق معلم',
    description: 'تذكير باقتراب موعد استحقاق معلم',
    icon: Clock,
    category: 'المعالم',
  },
  {
    type: 'milestone_completed',
    label: 'إكمال معلم',
    description: 'عند إكمال معلم من قبل الشركة الناشئة',
    icon: CheckCircle,
    category: 'المعالم',
  },
  {
    type: 'event_created',
    label: 'إنشاء فعالية',
    description: 'عند إنشاء فعالية جديدة',
    icon: Calendar,
    category: 'الفعاليات',
  },
  {
    type: 'event_reminder',
    label: 'تذكير بالفعالية',
    description: 'تذكير بفعالية قادمة',
    icon: Bell,
    category: 'الفعاليات',
  },
  {
    type: 'event_cancelled',
    label: 'إلغاء فعالية',
    description: 'عند إلغاء فعالية',
    icon: XCircle,
    category: 'الفعاليات',
  },
  {
    type: 'meeting_scheduled',
    label: 'جدولة اجتماع',
    description: 'عند جدولة اجتماع جديد',
    icon: Calendar,
    category: 'الاجتماعات',
  },
  {
    type: 'document_uploaded',
    label: 'رفع مستند',
    description: 'عند رفع مستند جديد',
    icon: Upload,
    category: 'المستندات',
  },
  {
    type: 'document_approved',
    label: 'الموافقة على مستند',
    description: 'عند الموافقة على مستند مرفوع',
    icon: FileUp,
    category: 'المستندات',
  },
  {
    type: 'announcement',
    label: 'إعلان عام',
    description: 'عند نشر إعلان عام',
    icon: Megaphone,
    category: 'الإعلانات',
  },
  {
    type: 'weekly_digest',
    label: 'الملخص الأسبوعي',
    description: 'ملخص أسبوعي بالأنشطة والتحديثات',
    icon: BarChart3,
    category: 'التقارير',
  },
];

const digestOptions = [
  { value: 'immediate', label: 'فوري' },
  { value: 'hourly', label: 'كل ساعة' },
  { value: 'daily', label: 'يومي' },
];

const roleOptions = [
  { value: 'all', label: 'الجميع' },
  { value: 'admin', label: 'المسؤولون' },
  { value: 'manager', label: 'المدراء' },
  { value: 'advisor', label: 'الموجهون' },
  { value: 'entrepreneur', label: 'أصحاب الأعمال' },
  { value: 'member', label: 'الأعضاء' },
];

export default function EmailScenariosPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, ScenarioSettings>>({});
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, templatesRes] = await Promise.all([
        fetch('/api/admin/email/scenarios'),
        fetch('/api/admin/email/templates'),
      ]);

      const settingsData = await settingsRes.json();
      const templatesData = await templatesRes.json();

      if (settingsData.success) {
        const settingsMap: Record<string, ScenarioSettings> = {};
        settingsData.scenarios.forEach((s: ScenarioSettings) => {
          settingsMap[s.scenarioType] = s;
        });
        setSettings(settingsMap);
      }

      if (templatesData.success) {
        setTemplates(templatesData.templates);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (scenarioType: string) => {
    setSaving(scenarioType);
    const setting = settings[scenarioType];

    try {
      // Remove scenarioType from setting to avoid duplication
      const { scenarioType: _, ...settingWithoutType } = setting;
      
      const response = await fetch('/api/admin/email/scenarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioType,
          ...settingWithoutType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم الحفظ',
          description: 'تم تحديث الإعدادات بنجاح',
        });
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في حفظ الإعدادات',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const updateSetting = (scenarioType: string, updates: Partial<ScenarioSettings>) => {
    setSettings((prev) => ({
      ...prev,
      [scenarioType]: {
        ...prev[scenarioType],
        scenarioType,
        ...updates,
      },
    }));
  };

  const getScenarioTemplates = (scenarioType: string) => {
    return templates.filter(
      (t) => t.scenarioType === scenarioType || t.scenarioType === 'general'
    );
  };

  // Group scenarios by category
  const groupedScenarios = scenarios.reduce((acc, scenario) => {
    if (!acc[scenario.category]) {
      acc[scenario.category] = [];
    }
    acc[scenario.category].push(scenario);
    return acc;
  }, {} as Record<string, typeof scenarios>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">سيناريوهات الإشعارات</h1>
        <p className="text-muted-foreground">
          إعدادات البريد الإلكتروني لكل نوع من الإشعارات
        </p>
      </div>

      {Object.entries(groupedScenarios).map(([category, categoryScenarios]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {categoryScenarios.map((scenario) => {
              const setting = settings[scenario.type] || {
                scenarioType: scenario.type,
                isEnabled: false,
                sendToRoles: ['all'],
                delayMinutes: 0,
                digestMode: 'immediate',
                requireApproval: false,
              };
              const Icon = scenario.icon;

              return (
                <div key={scenario.type} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{scenario.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {scenario.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={setting.isEnabled}
                        onCheckedChange={(checked) =>
                          updateSetting(scenario.type, { isEnabled: checked })
                        }
                      />
                      <span className="text-sm">
                        {setting.isEnabled ? 'مفعل' : 'معطل'}
                      </span>
                    </div>
                  </div>

                  {setting.isEnabled && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>القالب</Label>
                          <Select
                            value={setting.templateId || ''}
                            onValueChange={(value) =>
                              updateSetting(scenario.type, { templateId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر قالباً" />
                            </SelectTrigger>
                            <SelectContent>
                              {getScenarioTemplates(scenario.type).map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>المرسل إليهم</Label>
                          <Select
                            value={setting.sendToRoles[0] || 'all'}
                            onValueChange={(value) =>
                              updateSetting(scenario.type, { sendToRoles: [value] })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>وضع الإرسال</Label>
                          <Select
                            value={setting.digestMode}
                            onValueChange={(value: any) =>
                              updateSetting(scenario.type, { digestMode: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {digestOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>التأخير (دقائق)</Label>
                          <input
                            type="number"
                            min={0}
                            value={setting.delayMinutes}
                            onChange={(e) =>
                              updateSetting(scenario.type, {
                                delayMinutes: parseInt(e.target.value) || 0,
                              })
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={setting.requireApproval}
                            onCheckedChange={(checked) =>
                              updateSetting(scenario.type, { requireApproval: checked })
                            }
                          />
                          <span className="text-sm">يتطلب موافقة قبل الإرسال</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSave(scenario.type)}
                          disabled={saving === scenario.type}
                        >
                          {saving === scenario.type ? (
                            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 ml-2" />
                          )}
                          حفظ
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
