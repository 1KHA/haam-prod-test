'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Mail,
  Server,
  Shield,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Send,
  AlertTriangle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SmtpConfig {
  id: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  testMode: boolean;
  updatedAt: string;
}

export default function EmailSettingsPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    isActive: true,
    testMode: true,
  });

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/email/smtp');
      const data = await response.json();
      if (data.success) {
        setConfigs(data.configs);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل إعدادات SMTP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/email/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم الحفظ',
          description: 'تم حفظ إعدادات SMTP بنجاح',
        });
        setIsDialogOpen(false);
        resetForm();
        fetchConfigs();
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
      setSaving(false);
    }
  };

  const handleTest = async (configId: string) => {
    setTesting(configId);
    try {
      const response = await fetch('/api/admin/email/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم الاتصال بنجاح',
          description: 'تم اختبار الاتصال بـ SMTP بنجاح',
        });
      } else {
        toast({
          title: 'فشل الاتصال',
          description: data.error || 'تعذر الاتصال بخادم SMTP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاختبار',
        variant: 'destructive',
      });
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email/smtp?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم الحذف',
          description: 'تم حذف الإعدادات بنجاح',
        });
        fetchConfigs();
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في حذف الإعدادات',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الحذف',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      isActive: true,
      testMode: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات البريد الإلكتروني</h1>
          <p className="text-muted-foreground">إعدادات SMTP وقوالب البريد</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة إعدادات SMTP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إعدادات SMTP جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات خادم SMTP لإرسال البريد الإلكتروني
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الخادم (Host)</Label>
                  <Input
                    placeholder="smtp.gmail.com"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المنفذ (Port)</Label>
                  <Input
                    type="number"
                    placeholder="587"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 587 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>اسم المستخدم</Label>
                <Input
                  placeholder="email@example.com"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>البريد المرسل (From)</Label>
                  <Input
                    placeholder="noreply@example.com"
                    value={formData.fromEmail}
                    onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم المرسل</Label>
                  <Input
                    placeholder="HAAM Platform"
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={formData.secure}
                    onCheckedChange={(checked) => setFormData({ ...formData, secure: checked })}
                  />
                  <Label>اتصال آمن (SSL/TLS)</Label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={formData.testMode}
                    onCheckedChange={(checked) => setFormData({ ...formData, testMode: checked })}
                  />
                  <div className="flex items-center gap-2">
                    <Label>وضع الاختبار</Label>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                في وضع الاختبار، لن يتم إرسال رسائل فعلية - سيتم تسجيلها فقط
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="smtp" className="space-y-4">
        <TabsList>
          <TabsTrigger value="smtp">
            <Server className="h-4 w-4 ml-2" />
            إعدادات SMTP
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Mail className="h-4 w-4 ml-2" />
            القوالب
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <Shield className="h-4 w-4 ml-2" />
            السيناريوهات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>خوادم SMTP</CardTitle>
              <CardDescription>
                إعدادات خوادم البريد الإلكتروني المستخدمة لإرسال الرسائل
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configs.length === 0 ? (
                <div className="text-center py-12">
                  <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">لا توجد إعدادات SMTP</h3>
                  <p className="text-muted-foreground mb-4">
                    قم بإضافة إعدادات SMTP لبدء إرسال البريد الإلكتروني
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة إعدادات
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الخادم</TableHead>
                      <TableHead>اسم المستخدم</TableHead>
                      <TableHead>البريد المرسل</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>وضع الاختبار</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <div className="font-medium">{config.host}</div>
                          <div className="text-sm text-muted-foreground">:{config.port}</div>
                        </TableCell>
                        <TableCell>{config.username}</TableCell>
                        <TableCell>
                          <div className="font-medium">{config.fromName}</div>
                          <div className="text-sm text-muted-foreground">{config.fromEmail}</div>
                        </TableCell>
                        <TableCell>
                          {config.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              نشط
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <XCircle className="h-3 w-3 ml-1" />
                              غير نشط
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {config.testMode ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="h-3 w-3 ml-1" />
                              الاختبار
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Send className="h-3 w-3 ml-1" />
                              الإنتاج
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTest(config.id)}
                              disabled={testing === config.id}
                            >
                              {testing === config.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-4 w-4 ml-1" />
                                  اختبار
                                </>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف إعدادات SMTP هذه؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(config.id)}>
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>قوالب البريد الإلكتروني</CardTitle>
              <CardDescription>
                <a href="/admin-dashboard/email/templates" className="text-primary hover:underline">
                  انتقل إلى صفحة إدارة القوالب ←
                </a>
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle>سيناريوهات الإشعارات</CardTitle>
              <CardDescription>
                <a href="/admin-dashboard/email/scenarios" className="text-primary hover:underline">
                  انتقل إلى صفحة إدارة السيناريوهات ←
                </a>
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
