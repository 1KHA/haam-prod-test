'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Code,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Variable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FileText,
  Save,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  X,
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  subjectEn: string;
  htmlBody: string;
  htmlBodyEn: string;
  scenarioType: string;
  isActive: boolean;
  category: string;
  variables: string[];
  createdAt: string;
}

const scenarioTypes = [
  { value: 'general', label: 'عام' },
  { value: 'user_created', label: 'إنشاء مستخدم' },
  { value: 'account_approved', label: 'قبول الحساب' },
  { value: 'account_suspended', label: 'تعليق الحساب' },
  { value: 'password_reset', label: 'إعادة تعيين كلمة المرور' },
  { value: 'application_submitted', label: 'تقديم طلب' },
  { value: 'application_status_changed', label: 'تغيير حالة الطلب' },
  { value: 'startup_created', label: 'إنشاء شركة ناشئة' },
  { value: 'program_created', label: 'إنشاء برنامج' },
  { value: 'milestone_created', label: 'إنشاء معلم' },
  { value: 'milestone_due', label: 'استحقاق معلم' },
  { value: 'event_created', label: 'إنشاء فعالية' },
  { value: 'event_reminder', label: 'تذكير بالفعالية' },
  { value: 'event_cancelled', label: 'إلغاء فعالية' },
  { value: 'meeting_scheduled', label: 'جدولة اجتماع' },
  { value: 'document_uploaded', label: 'رفع مستند' },
  { value: 'announcement', label: 'إعلان' },
  { value: 'weekly_digest', label: 'ملخص أسبوعي' },
];

const commonVariables = [
  '{{user.name}}',
  '{{user.email}}',
  '{{user.role}}',
  '{{platform.name}}',
  '{{platform.url}}',
  '{{date}}',
  '{{time}}',
];

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    subjectEn: '',
    htmlBody: '',
    htmlBodyEn: '',
    scenarioType: 'general',
    category: 'general',
  });

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل القوالب',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'خطأ', description: 'اسم القالب مطلوب', variant: 'destructive' });
      return;
    }
    if (!formData.subject.trim()) {
      toast({ title: 'خطأ', description: 'موضوع الرسالة (العربي) مطلوب — افتح تبويب العربية وأدخل الموضوع', variant: 'destructive' });
      return;
    }
    if (!formData.htmlBody.trim()) {
      toast({ title: 'خطأ', description: 'محتوى الرسالة (العربي) مطلوب — افتح تبويب العربية وأدخل المحتوى', variant: 'destructive' });
      return;
    }

    try {
      const url = selectedTemplate
        ? `/api/admin/email/templates?id=${selectedTemplate.id}`
        : '/api/admin/email/templates';
      const method = selectedTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: selectedTemplate ? 'تم التحديث' : 'تم الإنشاء',
          description: selectedTemplate
            ? 'تم تحديث القالب بنجاح'
            : 'تم إنشاء القالب بنجاح',
        });
        setIsDialogOpen(false);
        resetForm();
        fetchTemplates();
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في حفظ القالب',
          variant: 'destructive',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(`/api/admin/email/templates?id=${selectedTemplate.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم الحذف',
          description: 'تم حذف القالب بنجاح',
        });
        setIsDeleteDialogOpen(false);
        setSelectedTemplate(null);
        fetchTemplates();
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في حذف القالب',
          variant: 'destructive',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الحذف',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      subject: template.subject,
      subjectEn: template.subjectEn,
      htmlBody: template.htmlBody,
      htmlBodyEn: template.htmlBodyEn,
      scenarioType: template.scenarioType,
      category: template.category,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedTemplate(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      subject: '',
      subjectEn: '',
      htmlBody: '',
      htmlBodyEn: '',
      scenarioType: 'general',
      category: 'general',
    });
  };

  const insertVariable = (variable: string, lang: 'ar' | 'en') => {
    if (lang === 'ar') {
      setFormData({ ...formData, htmlBody: formData.htmlBody + variable });
    } else {
      setFormData({ ...formData, htmlBodyEn: formData.htmlBodyEn + variable });
    }
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
          <h1 className="text-3xl font-bold">قوالب البريد الإلكتروني</h1>
          <p className="text-muted-foreground">إدارة قوالب البريد الإلكتروني والتخصيص</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 ml-2" />
          قالب جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>القوالب</CardTitle>
          <CardDescription>جميع قوالب البريد الإلكتروني المخصصة</CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">لا توجد قوالب</h3>
              <p className="text-muted-foreground mb-4">
                قم بإنشاء قالب بريد إلكتروني للبدء
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 ml-2" />
                إنشاء قالب
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>السيناريو</TableHead>
                  <TableHead>الموضوع</TableHead>
                  <TableHead>المتغيرات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="font-medium">{template.name}</div>
                      {template.description && (
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {scenarioTypes.find((s) => s.value === template.scenarioType)?.label ||
                          template.scenarioType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>{template.subject}</div>
                      <div className="text-sm text-muted-foreground">{template.subjectEn}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(template.variables || []).slice(0, 3).map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                        {(template.variables || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(template.variables || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'تعديل قالب' : 'قالب جديد'}</DialogTitle>
            <DialogDescription>
              قم بتخصيص قالب البريد الإلكتروني باللغتين العربية والإنجليزية
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم القالب</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: ترحيب بالمستخدم الجديد"
                />
              </div>
              <div className="space-y-2">
                <Label>السيناريو</Label>
                <Select
                  value={formData.scenarioType}
                  onValueChange={(value) => setFormData({ ...formData, scenarioType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarioTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف مختصر للقالب"
              />
            </div>

            <Tabs defaultValue="arabic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="arabic">العربية</TabsTrigger>
                <TabsTrigger value="english">English</TabsTrigger>
              </TabsList>

              <TabsContent value="arabic" className="space-y-4">
                <div className="space-y-2">
                  <Label>الموضوع</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="مرحباً بك في المنصة"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>المحتوى (HTML)</Label>
                    <div className="flex gap-1 flex-wrap">
                      {commonVariables.map((v) => (
                        <Button
                          key={v}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => insertVariable(v, 'ar')}
                        >
                          {v}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={formData.htmlBody}
                    onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                    rows={12}
                    className="font-mono text-sm"
                    dir="rtl"
                  />
                </div>
              </TabsContent>

              <TabsContent value="english" className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={formData.subjectEn}
                    onChange={(e) => setFormData({ ...formData, subjectEn: e.target.value })}
                    placeholder="Welcome to the platform"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Content (HTML)</Label>
                    <div className="flex gap-1 flex-wrap">
                      {commonVariables.map((v) => (
                        <Button
                          key={v}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => insertVariable(v, 'en')}
                        >
                          {v}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={formData.htmlBodyEn}
                    onChange={(e) => setFormData({ ...formData, htmlBodyEn: e.target.value })}
                    rows={12}
                    className="font-mono text-sm"
                    dir="ltr"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>معاينة القالب</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <Tabs defaultValue="arabic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="arabic">العربية</TabsTrigger>
                <TabsTrigger value="english">English</TabsTrigger>
              </TabsList>
              <TabsContent value="arabic">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="border-b pb-2 mb-4">
                    <strong>الموضوع:</strong> {previewTemplate.subject}
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: previewTemplate.htmlBody }}
                    className="prose max-w-none"
                    dir="rtl"
                  />
                </div>
              </TabsContent>
              <TabsContent value="english">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="border-b pb-2 mb-4">
                    <strong>Subject:</strong> {previewTemplate.subjectEn}
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: previewTemplate.htmlBodyEn }}
                    className="prose max-w-none"
                    dir="ltr"
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا القالب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
