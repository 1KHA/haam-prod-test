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
  Send,
  Users,
  Mail,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  subjectEn: string;
  htmlBody: string;
  htmlBodyEn: string;
  variables: string[];
}

export default function SendEmailPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [variables, setVariables] = useState<Record<string, string>>({
    'user.name': 'اسم المستخدم',
    'user.email': 'user@example.com',
    'platform.name': 'HAAM',
    'platform.url': 'https://haam.com',
    'date': new Date().toLocaleDateString('ar-SA'),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, templatesRes] = await Promise.all([
        fetch('/api/admin/users?limit=1000'),
        fetch('/api/admin/email/templates'),
      ]);

      const usersData = await usersRes.json();
      const templatesData = await templatesRes.json();

      if (usersData.users) {
        setUsers(usersData.users);
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

  const handleSend = async () => {
    if (selectedUsers.length === 0 && !selectedRole) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء اختيار مستلمين',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      let response;
      
      if (selectedTemplate && selectedTemplate !== 'custom') {
        // Use template
        response = await fetch('/api/admin/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: selectedUsers,
            role: selectedRole || undefined,
            templateId: selectedTemplate,
            variables,
            language,
          }),
        });
      } else {
        // Custom email
        response = await fetch('/api/admin/email/send-custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: selectedUsers,
            role: selectedRole || undefined,
            subject: customSubject,
            htmlBody: customBody,
            language,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم الإرسال',
          description: `تم إرسال ${data.sentCount || selectedUsers.length} رسالة بنجاح`,
        });
        // Reset form
        setSelectedUsers([]);
        setSelectedRole('');
        setSelectedTemplate('');
        setCustomSubject('');
        setCustomBody('');
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في إرسال الرسائل',
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
      setSending(false);
    }
  };

  const getFilteredUsers = () => {
    if (selectedRole) {
      return users.filter((u) => u.role === selectedRole);
    }
    return users;
  };

  const getSelectedTemplate = () => {
    return templates.find((t) => t.id === selectedTemplate);
  };

  const renderPreview = () => {
    const template = getSelectedTemplate();
    if (!template && !customBody) return null;

    let content = '';
    let subject = '';

    if (template) {
      content = language === 'ar' ? template.htmlBody : template.htmlBodyEn;
      subject = language === 'ar' ? template.subject : template.subjectEn;

      // Replace variables
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    } else {
      content = customBody;
      subject = customSubject;
    }

    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="border-b pb-2 mb-4">
          <strong>الموضوع:</strong> {subject}
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="prose max-w-none"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
      </div>
    );
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
      <div>
        <h1 className="text-3xl font-bold">إرسال بريد إلكتروني</h1>
        <p className="text-muted-foreground">إرسال رسائل مخصصة أو باستخدام القوالب</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المستلمون</CardTitle>
            <CardDescription>اختر المستخدمين أو الفئات المستهدفة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>التصفية حسب الدور</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المستخدمين" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع المستخدمين</SelectItem>
                  <SelectItem value="ADMIN">المسؤولون</SelectItem>
                  <SelectItem value="MANAGER">المدراء</SelectItem>
                  <SelectItem value="ADVISOR">الموجهون</SelectItem>
                  <SelectItem value="ENTREPRENEUR">أصحاب الأعمال</SelectItem>
                  <SelectItem value="MEMBER">الأعضاء</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المستخدمون ({getFilteredUsers().length})</Label>
              <ScrollArea className="h-64 border rounded-md p-2">
                <div className="space-y-2">
                  {getFilteredUsers().map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                          }
                        }}
                      />
                      <label htmlFor={user.id} className="text-sm cursor-pointer flex-1">
                        <span className="font-medium">{user.name || user.email}</span>
                        <span className="text-muted-foreground mr-2">({user.email})</span>
                      </label>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>المحدد: {selectedUsers.length} مستخدم</span>
              <div className="space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUsers(getFilteredUsers().map((u) => u.id))}
                >
                  تحديد الكل
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
                  إلغاء التحديد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>محتوى الرسالة</CardTitle>
            <CardDescription>اختر قالباً أو اكتب رسالة مخصصة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={selectedTemplate === 'custom' ? 'custom' : 'template'} 
                  onValueChange={(v) => setSelectedTemplate(v === 'custom' ? 'custom' : '')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">
                  <FileText className="h-4 w-4 ml-2" />
                  قالب
                </TabsTrigger>
                <TabsTrigger value="custom">
                  <Mail className="h-4 w-4 ml-2" />
                  مخصص
                </TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="space-y-4">
                <div className="space-y-2">
                  <Label>القالب</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر قالباً" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getSelectedTemplate() && (
                  <div className="space-y-2">
                    <Label>المتغيرات</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {getSelectedTemplate()?.variables.map((variable) => (
                        <div key={variable} className="space-y-1">
                          <Label className="text-xs">{variable}</Label>
                          <Input
                            value={variables[variable] || ''}
                            onChange={(e) =>
                              setVariables({ ...variables, [variable]: e.target.value })
                            }
                            placeholder={`قيمة ${variable}`}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-2">
                  <Label>الموضوع</Label>
                  <Input
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="أدخل موضوع الرسالة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المحتوى (HTML)</Label>
                  <Textarea
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    rows={8}
                    placeholder="<p>أدخل محتوى الرسالة هنا...</p>"
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>اللغة</Label>
              <Select value={language} onValueChange={(v: 'ar' | 'en') => setLanguage(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 ml-2" />
                {previewMode ? 'إخفاء المعاينة' : 'عرض المعاينة'}
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || (selectedUsers.length === 0 && !selectedRole)}
                className="flex-1"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 ml-2" />
                )}
                إرسال
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>معاينة الرسالة</CardTitle>
          </CardHeader>
          <CardContent>{renderPreview()}</CardContent>
        </Card>
      )}
    </div>
  );
}
