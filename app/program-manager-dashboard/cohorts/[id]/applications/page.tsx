"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, User, Building, Calendar, Briefcase, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Application {
  id: string
  status: string
  joinDate: string
  createdAt: string
  updatedAt: string
  startup: {
    id: string
    name: string
    industry: string
    stage: string
    description: string
    problem: string
    solution: string
    targetMarket: string | null
    businessModel: string | null
    competitiveAdvantage: string | null
    teamSize: number
    fundingNeeds: string | null
    pitchDeckUrl: string | null
    creator: {
      id: string
      name: string
      email: string
    }
  }
}

interface Stats {
  total: number
  pending: number
  active: number
  rejected: number
  dropped: number
}

export default function CohortApplicationsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    active: 0,
    rejected: 0,
    dropped: 0
  })
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [currentTab, setCurrentTab] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | "drop" | null>(null)
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch applications
  useEffect(() => {
    if (!token) return;
    
    const fetchApplications = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/program-manager/cohorts/${params.id}/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data.applications || []);
        setStats(data.stats || {
          total: 0,
          pending: 0,
          active: 0,
          rejected: 0,
          dropped: 0
        });
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "خطأ",
          description: "فشل في جلب طلبات الانضمام",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [token, params.id, toast]);
  
  // Handle application action (approve, reject, drop)
  const handleApplicationAction = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/program-manager/cohorts/${params.id}/applications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId,
          status
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update application status');
      }
      
      // Update the application in the local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
      
      // Update stats
      const newStats = { ...stats };
      
      // Decrement the previous status count
      const prevStatus = applications.find(app => app.id === applicationId)?.status.toUpperCase();
      if (prevStatus === 'PENDING') newStats.pending--;
      else if (prevStatus === 'ACTIVE') newStats.active--;
      else if (prevStatus === 'REJECTED') newStats.rejected--;
      else if (prevStatus === 'DROPPED') newStats.dropped--;
      
      // Increment the new status count
      if (status === 'PENDING') newStats.pending++;
      else if (status === 'ACTIVE') newStats.active++;
      else if (status === 'REJECTED') newStats.rejected++;
      else if (status === 'DROPPED') newStats.dropped++;
      
      setStats(newStats);
      
      toast({
        title: "تم بنجاح",
        description: `تم تحديث حالة الطلب إلى ${getStatusLabel(status)}`,
      });
      
      setActionDialogOpen(false);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في تحديث حالة الطلب",
        variant: "destructive"
      });
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> قيد المراجعة</Badge>;
      case 'ACTIVE':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> مقبول</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> مرفوض</Badge>;
      case 'DROPPED':
        return <Badge variant="secondary" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> منسحب</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'قيد المراجعة';
      case 'ACTIVE':
        return 'مقبول';
      case 'REJECTED':
        return 'مرفوض';
      case 'DROPPED':
        return 'منسحب';
      default:
        return status;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };
  
  // Filter applications based on current tab
  const filteredApplications = applications.filter(app => {
    if (currentTab === 'all') return true;
    if (currentTab === 'pending') return app.status.toUpperCase() === 'PENDING';
    if (currentTab === 'active') return app.status.toUpperCase() === 'ACTIVE';
    if (currentTab === 'rejected') return app.status.toUpperCase() === 'REJECTED';
    if (currentTab === 'dropped') return app.status.toUpperCase() === 'DROPPED';
    return true;
  });
  
  if (!token) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>يجب تسجيل الدخول أولاً</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>جاري التحميل...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">طلبات الانضمام للدفعة</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => router.push(`/program-manager-dashboard/cohorts/${params.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>العودة للدفعة</span>
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">إجمالي الطلبات</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">قيد المراجعة</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">مقبول</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">مرفوض</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">منسحب</p>
              <p className="text-3xl font-bold text-gray-600">{stats.dropped}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Applications Tabs */}
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">الكل ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">قيد المراجعة ({stats.pending})</TabsTrigger>
          <TabsTrigger value="active">مقبول ({stats.active})</TabsTrigger>
          <TabsTrigger value="rejected">مرفوض ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="dropped">منسحب ({stats.dropped})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab} className="mt-0">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">لا توجد طلبات {currentTab !== 'all' ? `بحالة ${getStatusLabel(currentTab)}` : ''}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map(application => (
                <Card key={application.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      {getStatusBadge(application.status)}
                      <CardTitle className="text-lg">{application.startup.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {application.startup.industry} - {application.startup.stage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{application.startup.creator.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">فريق من {application.startup.teamSize} أشخاص</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">تاريخ التقديم: {formatDate(application.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {application.startup.description.substring(0, 60)}...
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-0">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedApplication(application);
                        setDialogOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 ml-2" />
                      <span>التفاصيل</span>
                    </Button>
                    
                    {application.status.toUpperCase() === 'PENDING' && (
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedApplication(application);
                          setActionType('approve');
                          setActionDialogOpen(true);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        <span>قبول</span>
                      </Button>
                    )}
                    
                    {application.status.toUpperCase() === 'PENDING' && (
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedApplication(application);
                          setActionType('reject');
                          setActionDialogOpen(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 ml-2" />
                        <span>رفض</span>
                      </Button>
                    )}
                    
                    {application.status.toUpperCase() === 'ACTIVE' && (
                      <Button 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedApplication(application);
                          setActionType('drop');
                          setActionDialogOpen(true);
                        }}
                      >
                        <AlertCircle className="h-4 w-4 ml-2" />
                        <span>إسقاط</span>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Application Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl text-right">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              تفاصيل طلب الانضمام: {selectedApplication?.startup.name}
            </DialogTitle>
            <DialogDescription>
              {getStatusBadge(selectedApplication?.status || '')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Startup Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">معلومات الشركة الناشئة</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">اسم الشركة</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication?.startup.name}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">المجال</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication?.startup.industry}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">المرحلة</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication?.startup.stage}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">حجم الفريق</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication?.startup.teamSize} أشخاص
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">الوصف</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication?.startup.description}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">المشكلة</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication?.startup.problem}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">الحل</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication?.startup.solution}
                </p>
              </div>
              
              {selectedApplication?.startup.targetMarket && (
                <div>
                  <h4 className="text-sm font-medium">السوق المستهدف</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.startup.targetMarket}
                  </p>
                </div>
              )}
              
              {selectedApplication?.startup.businessModel && (
                <div>
                  <h4 className="text-sm font-medium">نموذج العمل</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.startup.businessModel}
                  </p>
                </div>
              )}
              
              {selectedApplication?.startup.competitiveAdvantage && (
                <div>
                  <h4 className="text-sm font-medium">الميزة التنافسية</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.startup.competitiveAdvantage}
                  </p>
                </div>
              )}
              
              {selectedApplication?.startup.fundingNeeds && (
                <div>
                  <h4 className="text-sm font-medium">احتياجات التمويل</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.startup.fundingNeeds}
                  </p>
                </div>
              )}
              
              {selectedApplication?.startup.pitchDeckUrl && (
                <div>
                  <h4 className="text-sm font-medium">رابط العرض التقديمي</h4>
                  <a 
                    href={selectedApplication.startup.pitchDeckUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedApplication.startup.pitchDeckUrl}
                  </a>
                </div>
              )}
            </div>
            
            {/* Founder Information */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">معلومات المؤسس</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">الاسم</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication?.startup.creator.name}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">البريد الإلكتروني</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication?.startup.creator.email}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Application Information */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">معلومات الطلب</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">تاريخ التقديم</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication && formatDate(selectedApplication.createdAt)}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">الحالة</h4>
                  <div className="mt-1">
                    {getStatusBadge(selectedApplication?.status || '')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            {selectedApplication?.status.toUpperCase() === 'PENDING' && (
              <>
                <Button 
                  variant="default"
                  onClick={() => {
                    setActionType('approve');
                    setDialogOpen(false);
                    setActionDialogOpen(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 ml-2" />
                  <span>قبول الطلب</span>
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setActionType('reject');
                    setDialogOpen(false);
                    setActionDialogOpen(true);
                  }}
                >
                  <XCircle className="h-4 w-4 ml-2" />
                  <span>رفض الطلب</span>
                </Button>
              </>
            )}
            
            {selectedApplication?.status.toUpperCase() === 'ACTIVE' && (
              <Button 
                variant="secondary"
                onClick={() => {
                  setActionType('drop');
                  setDialogOpen(false);
                  setActionDialogOpen(true);
                }}
              >
                <AlertCircle className="h-4 w-4 ml-2" />
                <span>إسقاط العضوية</span>
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="text-right">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'تأكيد قبول الطلب'}
              {actionType === 'reject' && 'تأكيد رفض الطلب'}
              {actionType === 'drop' && 'تأكيد إسقاط العضوية'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'هل أنت متأكد من قبول طلب الانضمام للشركة الناشئة؟'}
              {actionType === 'reject' && 'هل أنت متأكد من رفض طلب الانضمام للشركة الناشئة؟'}
              {actionType === 'drop' && 'هل أنت متأكد من إسقاط عضوية الشركة الناشئة من الدفعة؟'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant={actionType === 'approve' ? 'default' : actionType === 'reject' ? 'destructive' : 'secondary'}
              onClick={() => {
                if (selectedApplication) {
                  const newStatus = 
                    actionType === 'approve' ? 'ACTIVE' : 
                    actionType === 'reject' ? 'REJECTED' : 
                    'DROPPED';
                  
                  handleApplicationAction(selectedApplication.id, newStatus);
                }
              }}
            >
              {actionType === 'approve' && 'قبول'}
              {actionType === 'reject' && 'رفض'}
              {actionType === 'drop' && 'إسقاط'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
