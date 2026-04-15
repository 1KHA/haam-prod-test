'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Mail,
  Send,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EmailStats {
  totalEmails: number;
  sentEmails: number;
  failedEmails: number;
  pendingEmails: number;
  openedEmails: number;
  clickedEmails: number;
  todaySent: number;
  todayFailed: number;
  dailyStats: { date: string; sent: number; failed: number }[];
  templateUsage: { templateId: string; templateName: string; count: number }[];
  topRecipients: { email: string; count: number }[];
}

interface EmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  status: string;
  errorMessage: string | null;
  sentAt: string;
  openedAt: string | null;
  clickedAt: string | null;
  templateName: string | null;
}

export default function EmailAnalyticsPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/email/stats'),
        fetch('/api/admin/email/logs?limit=50'),
      ]);

      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (logsData.success) {
        setRecentLogs(logsData.logs);
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الإحصائيات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryRate = () => {
    if (!stats || stats.totalEmails === 0) return 0;
    return Math.round((stats.sentEmails / stats.totalEmails) * 100);
  };

  const getOpenRate = () => {
    if (!stats || stats.sentEmails === 0) return 0;
    return Math.round((stats.openedEmails / stats.sentEmails) * 100);
  };

  const getClickRate = () => {
    if (!stats || stats.sentEmails === 0) return 0;
    return Math.round((stats.clickedEmails / stats.sentEmails) * 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Send className="h-3 w-3 ml-1" />
            مرسل
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 ml-1" />
            فشل
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 ml-1" />
            قيد الانتظار
          </Badge>
        );
      case 'opened':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Eye className="h-3 w-3 ml-1" />
            مفتوح
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
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
      <div>
        <h1 className="text-3xl font-bold">تحليلات البريد الإلكتروني</h1>
        <p className="text-muted-foreground">إحصائيات وأداء البريد الإلكتروني</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الرسائل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats?.totalEmails || 0}</div>
              <Mail className="h-8 w-8 text-primary opacity-50" />
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {stats?.todaySent || 0} مرسلة اليوم
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل التسليم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{getDeliveryRate()}%</div>
              <Send className="h-8 w-8 text-green-500 opacity-50" />
            </div>
            <Progress value={getDeliveryRate()} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل الفتح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{getOpenRate()}%</div>
              <Eye className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
            <Progress value={getOpenRate()} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل النقر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{getClickRate()}%</div>
              <MousePointer className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
            <Progress value={getClickRate()} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Stats Chart */}
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات يومية (آخر 30 يوم)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.dailyStats && stats.dailyStats.length > 0 ? (
              <div className="space-y-2">
                {stats.dailyStats.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('ar-SA', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div
                        className="h-6 bg-green-500 rounded"
                        style={{
                          width: `${Math.max(
                            5,
                            (day.sent / Math.max(...stats.dailyStats.map((d) => d.sent))) * 100
                          )}%`,
                        }}
                        title={`مرسل: ${day.sent}`}
                      />
                      {day.failed > 0 && (
                        <div
                          className="h-6 bg-red-500 rounded"
                          style={{
                            width: `${Math.max(
                              5,
                              (day.failed / Math.max(...stats.dailyStats.map((d) => d.sent))) * 100
                            )}%`,
                          }}
                          title={`فشل: ${day.failed}`}
                        />
                      )}
                    </div>
                    <div className="w-16 text-sm text-right">
                      <span className="text-green-600">{day.sent}</span>
                      {day.failed > 0 && (
                        <span className="text-red-600 mr-1">({day.failed})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد بيانات كافية
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Usage */}
        <Card>
          <CardHeader>
            <CardTitle>القوالب الأكثر استخداماً</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.templateUsage && stats.templateUsage.length > 0 ? (
              <div className="space-y-3">
                {stats.templateUsage.slice(0, 5).map((template) => (
                  <div key={template.templateId} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium">{template.templateName}</div>
                    </div>
                    <div className="w-24">
                      <Progress
                        value={
                          (template.count / Math.max(...stats.templateUsage.map((t) => t.count))) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="w-12 text-sm text-right">{template.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد بيانات كافية
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription>آخر 50 رسالة تم إرسالها</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستلم</TableHead>
                <TableHead>الموضوع</TableHead>
                <TableHead>القالب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.recipientEmail}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                  <TableCell>{log.templateName || '-'}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    {new Date(log.sentAt).toLocaleString('ar-SA', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
