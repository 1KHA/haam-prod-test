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
  Clock,
  Calendar,
  Play,
  Pause,
  X,
  Send,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users,
  CheckCircle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertCircle,
  Trash2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ScheduledEmail {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  scheduledFor: string;
  status: 'scheduled' | 'sending' | 'completed' | 'cancelled' | 'paused';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recipientFilter: any;
  sentCount: number;
  failedCount: number;
  totalCount: number;
  createdAt: string;
}

export default function ScheduledEmailsPage() {
  const { toast } = useToast();
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlBody: '',
    scheduledFor: '',
    recipientRole: 'ALL',
    recipientStatus: '',
  });

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/admin/email/scheduled');
      const data = await response.json();
      if (data.success) {
        setEmails(data.emails);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الحملات المجدولة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/admin/email/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          subject: formData.subject,
          htmlBody: formData.htmlBody,
          scheduledFor: new Date(formData.scheduledFor).toISOString(),
          recipientFilter: {
            role: formData.recipientRole === 'ALL' ? undefined : formData.recipientRole,
            status: formData.recipientStatus || undefined,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم الإنشاء',
          description: 'تم جدولة الحملة بنجاح',
        });
        setIsDialogOpen(false);
        resetForm();
        fetchEmails();
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في إنشاء الحملة',
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
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/email/scheduled', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث حالة الحملة',
        });
        fetchEmails();
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في تحديث الحالة',
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/email/scheduled?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'تم الحذف',
          description: 'تم حذف الحملة بنجاح',
        });
        fetchEmails();
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في حذف الحملة',
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

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      htmlBody: '',
      scheduledFor: '',
      recipientRole: 'ALL',
      recipientStatus: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 ml-1" />
            مجدول
          </Badge>
        );
      case 'sending':
        return (
          <Badge variant="default">
            <Send className="h-3 w-3 ml-1" />
            جاري الإرسال
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 ml-1" />
            مكتمل
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline">
            <Pause className="h-3 w-3 ml-1" />
            متوقف مؤقتاً
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 ml-1" />
            ملغي
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getProgress = (email: ScheduledEmail) => {
    if (email.totalCount === 0) return 0;
    return Math.round(((email.sentCount + email.failedCount) / email.totalCount) * 100);
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
          <h1 className="text-3xl font-bold">الحملات المجدولة</h1>
          <p className="text-muted-foreground">إدارة وجدولة حملات البريد الإلكتروني</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          حملة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الحملات</CardTitle>
          <CardDescription>جميع حملات البريد الإلكتروني المجدولة</CardDescription>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">لا توجد حملات مجدولة</h3>
              <p className="text-muted-foreground mb-4">
                قم بإنشاء حملة جديدة لجدولة إرسال البريد الإلكتروني
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إنشاء حملة
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الموضوع</TableHead>
                  <TableHead>موعد الإرسال</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التقدم</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell>
                      <div className="font-medium">{email.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(email.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </TableCell>
                    <TableCell>{email.subject}</TableCell>
                    <TableCell>
                      {new Date(email.scheduledFor).toLocaleString('ar-SA')}
                    </TableCell>
                    <TableCell>{getStatusBadge(email.status)}</TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Progress value={getProgress(email)} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {email.sentCount} / {email.totalCount}
                          {email.failedCount > 0 && (
                            <span className="text-destructive mr-1">
                              ({email.failedCount} فشل)
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {email.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(email.id, 'paused')}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {email.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(email.id, 'scheduled')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {(email.status === 'scheduled' || email.status === 'paused') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(email.id, 'cancelled')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(email.id)}
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

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>حملة بريد إلكتروني جديدة</DialogTitle>
            <DialogDescription>
              قم بجدولة حملة بريد إلكتروني لإرسالها في وقت محدد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم الحملة</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: نشرة الأخبار الشهرية"
              />
            </div>

            <div className="space-y-2">
              <Label>الموضوع</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="موضوع الرسالة"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الفئة المستهدفة</Label>
                <Select
                  value={formData.recipientRole}
                  onValueChange={(value) =>
                    setFormData({ ...formData, recipientRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الجميع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">الجميع</SelectItem>
                    <SelectItem value="ADMIN">المسؤولون</SelectItem>
                    <SelectItem value="MANAGER">المدراء</SelectItem>
                    <SelectItem value="ADVISOR">الموجهون</SelectItem>
                    <SelectItem value="ENTREPRENEUR">أصحاب الأعمال</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>تاريخ ووقت الإرسال</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledFor: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>المحتوى (HTML)</Label>
              <Textarea
                value={formData.htmlBody}
                onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                rows={10}
                placeholder="<h1>عنوان الرسالة</h1><p>محتوى الرسالة...</p>"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              جدولة الحملة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
