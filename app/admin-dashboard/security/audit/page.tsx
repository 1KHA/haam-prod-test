"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { 
  RefreshCw, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  ListChecks,
  Info,
  FileText,
  User,
  Database,
  Play,
  ChevronDown,
  ExternalLink,
  Download
} from "lucide-react"

interface SecurityCheck {
  id: string;
  category: string;
  check: string;
  status: string;
  details: string;
}

interface AuditSummary {
  totalChecks?: number;
  passedChecks?: number;
  warningChecks?: number;
  failedChecks?: number;
  criticalVulnerabilities?: number;
  securityScore?: number;
  // User audit specific fields
  totalUsers?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  adminUsers?: number;
  usersWithWeakPasswords?: number;
  usersWithoutMFA?: number;
  // Data audit specific fields
  dataStoresAudited?: number;
  encryptedDataStores?: number;
  sensitiveDataExposures?: number;
  dataAccessViolations?: number;
  unauthorizedDataSharing?: number;
}

interface AuditData {
  lastAuditDate: string;
  status: string;
  summary: AuditSummary;
  findings: SecurityCheck[];
  recommendations: string[];
}

interface AuditJob {
  id: string;
  auditType: string;
  scope: string;
  status: string;
  startedBy: string;
  startedAt: string;
  estimatedCompletionTime: string;
}

export default function SecurityAudit() {
  // State for tabs
  const [activeTab, setActiveTab] = useState("system")
  
  // State for audit data
  const [isLoading, setIsLoading] = useState(false)
  const [isStartingAudit, setIsStartingAudit] = useState(false)
  const [auditData, setAuditData] = useState<AuditData | null>(null)
  const [auditJob, setAuditJob] = useState<AuditJob | null>(null)
  const [expandedFindings, setExpandedFindings] = useState<string[]>([])
  
  // Fetch audit data on initial load and when tab changes
  useEffect(() => {
    fetchAuditData(activeTab);
  }, [activeTab]);
  
  // Fetch security audit data from API
  const fetchAuditData = async (type: string) => {
    try {
      setIsLoading(true)
      
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/admin/security/audit?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch security audit data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAuditData(data.data)
        setAuditJob(null) // Clear any previous audit job
      } else {
        toast.error(data.error || 'Failed to fetch security audit data')
      }
    } catch (error) {
      console.error('Error fetching security audit data:', error)
      toast.error('فشل في جلب بيانات التدقيق الأمني')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Start a new security audit
  const startAudit = async (type: string) => {
    if (!confirm(`هل أنت متأكد من بدء تدقيق أمان جديد لـ ${getAuditTypeLabel(type)}؟`)) {
      return
    }
    
    try {
      setIsStartingAudit(true)
      
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/security/audit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auditType: type,
          scope: 'full'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start security audit')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAuditJob(data.audit)
        toast.success('تم بدء تدقيق الأمان بنجاح')
        
        // In a real app, you'd poll the API to check the status of the audit job
        // For demo purposes, we'll just simulate a completed audit after 3 seconds
        setTimeout(() => {
          fetchAuditData(type)
        }, 3000)
      } else {
        toast.error(data.error || 'Failed to start security audit')
      }
    } catch (error) {
      console.error('Error starting security audit:', error)
      toast.error('فشل في بدء تدقيق الأمان')
    } finally {
      setIsStartingAudit(false)
    }
  }
  
  const getAuditTypeLabel = (type: string) => {
    switch (type) {
      case 'system': return 'النظام';
      case 'user': return 'المستخدمين';
      case 'data': return 'البيانات';
      default: return 'النظام';
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return 'text-green-600';
      case 'warning':
        return 'text-amber-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  }
  
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  }

  const toggleFindingExpansion = (id: string) => {
    if (expandedFindings.includes(id)) {
      setExpandedFindings(expandedFindings.filter(item => item !== id));
    } else {
      setExpandedFindings([...expandedFindings, id]);
    }
  }

  const getActiveTabIcon = () => {
    switch (activeTab) {
      case 'system': return <Shield className="h-5 w-5 text-primary" />;
      case 'user': return <User className="h-5 w-5 text-primary" />;
      case 'data': return <Database className="h-5 w-5 text-primary" />;
      default: return <Shield className="h-5 w-5 text-primary" />;
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">جاري تحميل بيانات التدقيق الأمني...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">التدقيق الأمني</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => fetchAuditData(activeTab)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>تصدير التقرير</span>
          </Button>
        </div>
      </div>

      {auditJob && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-blue-800">جاري تنفيذ عملية تدقيق...</h3>
                <p className="text-blue-700 mt-1">
                  تم بدء تدقيق {getAuditTypeLabel(auditJob.auditType)} في {new Date(auditJob.startedAt).toLocaleString('ar-SA')}. 
                  الوقت المتوقع للانتهاء: {new Date(auditJob.estimatedCompletionTime).toLocaleTimeString('ar-SA')}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="system">تدقيق النظام</TabsTrigger>
          <TabsTrigger value="user">تدقيق المستخدمين</TabsTrigger>
          <TabsTrigger value="data">تدقيق البيانات</TabsTrigger>
        </TabsList>
        
        {auditData && (
          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-end gap-2">
                    <span>ملخص التدقيق</span>
                    {getActiveTabIcon()}
                  </CardTitle>
                  <CardDescription>
                    نتائج تدقيق {getAuditTypeLabel(activeTab)} الأخير
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {auditData.status === 'completed' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          مكتمل
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <RefreshCw className="h-3 w-3 ml-1 animate-spin" />
                          قيد التقدم
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{new Date(auditData.lastAuditDate).toLocaleString('ar-SA')}</span>
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                  
                  {auditData.summary.securityScore !== undefined && (
                    <div className="border rounded-lg p-4 text-center">
                      <h3 className="text-sm font-medium mb-2">درجة الأمان</h3>
                      <div className={`text-4xl font-bold ${getScoreColorClass(auditData.summary.securityScore)}`}>
                        {auditData.summary.securityScore}%
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {activeTab === 'system' && (
                      <>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span>{auditData.summary.totalChecks}</span>
                          <span className="text-muted-foreground">إجمالي الفحوصات</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-green-600">{auditData.summary.passedChecks}</span>
                          <span className="text-muted-foreground">الفحوصات الناجحة</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-amber-600">{auditData.summary.warningChecks}</span>
                          <span className="text-muted-foreground">الفحوصات ذات التحذيرات</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-red-600">{auditData.summary.failedChecks}</span>
                          <span className="text-muted-foreground">الفحوصات الفاشلة</span>
                        </div>
                        {auditData.summary.criticalVulnerabilities !== undefined && (
                          <div className="flex justify-between items-center p-2">
                            <span className="text-red-600">{auditData.summary.criticalVulnerabilities}</span>
                            <span className="text-muted-foreground">الثغرات الحرجة</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {activeTab === 'user' && (
                      <>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span>{auditData.summary.totalUsers}</span>
                          <span className="text-muted-foreground">إجمالي المستخدمين</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-green-600">{auditData.summary.activeUsers}</span>
                          <span className="text-muted-foreground">المستخدمين النشطين</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-amber-600">{auditData.summary.inactiveUsers}</span>
                          <span className="text-muted-foreground">المستخدمين غير النشطين</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span>{auditData.summary.adminUsers}</span>
                          <span className="text-muted-foreground">مستخدمي الإدارة</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-red-600">{auditData.summary.usersWithWeakPasswords}</span>
                          <span className="text-muted-foreground">مستخدمين بكلمات مرور ضعيفة</span>
                        </div>
                        <div className="flex justify-between items-center p-2">
                          <span className="text-red-600">{auditData.summary.usersWithoutMFA}</span>
                          <span className="text-muted-foreground">مستخدمين بدون المصادقة متعددة العوامل</span>
                        </div>
                      </>
                    )}
                    
                    {activeTab === 'data' && (
                      <>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span>{auditData.summary.dataStoresAudited}</span>
                          <span className="text-muted-foreground">مستودعات البيانات التي تم فحصها</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-green-600">{auditData.summary.encryptedDataStores}</span>
                          <span className="text-muted-foreground">مستودعات البيانات المشفرة</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-red-600">{auditData.summary.sensitiveDataExposures}</span>
                          <span className="text-muted-foreground">حالات كشف البيانات الحساسة</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border-b">
                          <span className="text-red-600">{auditData.summary.dataAccessViolations}</span>
                          <span className="text-muted-foreground">انتهاكات الوصول للبيانات</span>
                        </div>
                        <div className="flex justify-between items-center p-2">
                          <span className="text-amber-600">{auditData.summary.unauthorizedDataSharing}</span>
                          <span className="text-muted-foreground">حالات مشاركة بيانات غير مصرح بها</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="default" 
                    className="flex items-center gap-1"
                    onClick={() => startAudit(activeTab)}
                    disabled={isStartingAudit || !!auditJob}
                  >
                    {isStartingAudit ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    <span>بدء تدقيق جديد</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-end gap-2">
                    <span>التوصيات</span>
                    <FileText className="h-5 w-5 text-primary" />
                  </CardTitle>
                  <CardDescription>
                    إجراءات مقترحة لتحسين مستوى الأمان
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditData.recommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {auditData.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      لا توجد توصيات في الوقت الحالي
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <span>نتائج التدقيق</span>
                  <ListChecks className="h-5 w-5 text-primary" />
                </CardTitle>
                <CardDescription>
                  تفاصيل فحوصات التدقيق والنتائج
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-3 text-sm font-medium bg-muted/50 border-b">
                    <div className="col-span-2 text-right">الحالة</div>
                    <div className="col-span-2">الفئة</div>
                    <div className="col-span-8">الفحص</div>
                  </div>
                  
                  {auditData.findings.length > 0 ? (
                    <div className="divide-y">
                      {auditData.findings.map((finding) => (
                        <div key={finding.id} className="text-sm">
                          <div 
                            className="grid grid-cols-12 p-3 cursor-pointer hover:bg-muted/20"
                            onClick={() => toggleFindingExpansion(finding.id)}
                          >
                            <div className="col-span-2 flex items-center justify-end gap-1">
                              {getStatusIcon(finding.status)}
                              <span className={getStatusColor(finding.status)}>
                                {finding.status === 'passed' ? 'ناجح' : 
                                 finding.status === 'warning' ? 'تحذير' : 
                                 finding.status === 'failed' ? 'فشل' : 
                                 finding.status}
                              </span>
                            </div>
                            <div className="col-span-2">{finding.category}</div>
                            <div className="col-span-7">{finding.check}</div>
                            <div className="col-span-1 flex justify-end">
                              <ChevronDown className={`h-5 w-5 transition-transform ${expandedFindings.includes(finding.id) ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          
                          {expandedFindings.includes(finding.id) && (
                            <div className="p-3 bg-muted/20 border-t">
                              <div className="flex flex-col space-y-2">
                                <div>
                                  <span className="font-medium">التفاصيل:</span>
                                  <p className="mt-1 text-muted-foreground">{finding.details}</p>
                                </div>
                                <Button variant="link" className="self-end" size="sm">
                                  <span>مزيد من المعلومات</span>
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      لا توجد نتائج للعرض
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {(activeTab === 'system' || activeTab === 'user') && auditData.findings.some(f => f.status === 'failed') && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>مشكلات حرجة</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {auditData.findings
                      .filter(f => f.status === 'failed')
                      .map((finding) => (
                        <div key={finding.id} className="flex items-start justify-between p-4 border border-red-200 rounded-md bg-red-50">
                          <div className="flex flex-col gap-1">
                            <h4 className="font-medium">{finding.check}</h4>
                            <p className="text-sm text-red-700">{finding.details}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-red-800 hover:bg-red-100">
                              عرض التفاصيل
                            </Button>
                            <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
                              إصلاح الآن
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
      
      <div className="bg-muted rounded-md p-4">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span>حول التدقيق الأمني</span>
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          تقوم عمليات التدقيق الأمني بفحص النظام للكشف عن نقاط الضعف المحتملة والمشكلات الأمنية. يوصى بإجراء عمليات تدقيق منتظمة لضمان أعلى مستويات الأمان للنظام والبيانات.
        </p>
        <div className="text-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium flex items-center gap-1 mb-1">
              <Shield className="h-4 w-4" />
              <span>تدقيق النظام</span>
            </h4>
            <p className="text-muted-foreground">
              يفحص تكوين النظام والخدمات والتشفير والإعدادات الأمنية.
            </p>
          </div>
          <div>
            <h4 className="font-medium flex items-center gap-1 mb-1">
              <User className="h-4 w-4" />
              <span>تدقيق المستخدمين</span>
            </h4>
            <p className="text-muted-foreground">
              يفحص حسابات المستخدمين وكلمات المرور والصلاحيات والأذونات.
            </p>
          </div>
          <div>
            <h4 className="font-medium flex items-center gap-1 mb-1">
              <Database className="h-4 w-4" />
              <span>تدقيق البيانات</span>
            </h4>
            <p className="text-muted-foreground">
              يفحص تخزين البيانات والتشفير والوصول وحماية المعلومات الحساسة.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
