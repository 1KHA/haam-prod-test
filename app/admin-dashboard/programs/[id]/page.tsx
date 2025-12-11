"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  Trash2, 
  Users, 
  Download,
  DollarSign,
  CreditCard,
  Eye,
  Search,
  RefreshCw
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface Program {
  id: string
  name: string
  description: string
  startDate: string | null
  endDate: string | null
  location: string | null
  type: string
  status: string
  capacity: number | null
  applicationDeadline: string | null
  requirements: string | null
  benefits: string | null
  creator: {
    id: string
    name: string
    email: string
  }
  stats: {
    cohortsCount: number
    activeCohortsCount: number
    totalStartups: number
  }
  createdAt: string
  updatedAt: string
}

interface Payment {
  id: string
  referenceNumber: string
  paymentDate: string
  amount: number
  currency: string
  status: string
  type: string
  description: string
  payerName: string
  payerEmail?: string
  paymentMethod: string
  metadata?: {
    programId?: string
    startupId?: string
    invoiceId?: string
  }
}

interface PaginationInfo {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export default function ProgramDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch program details
  useEffect(() => {
    if (!token) return;
    
    const fetchProgram = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/admin/programs/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch program');
        }
        
        const data = await response.json();
        setProgram(data);
      } catch (error) {
        console.error('Error fetching program:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات البرنامج",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgram();
  }, [token, params.id]);
  
  // Fetch program payments when payments tab is active
  useEffect(() => {
    if (!token || activeTab !== "payments") return;
    
    const fetchPayments = async () => {
      setPaymentsLoading(true);
      
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append("page", pagination.page.toString());
        queryParams.append("pageSize", pagination.pageSize.toString());
        // Ensure programId is sent to filter payments by program
        queryParams.append("programId", params.id);
        
        if (searchQuery) {
          queryParams.append("search", searchQuery);
        }
        
        const response = await fetch(`/api/admin/payments?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setPayments(data.data.payments);
          setPagination(data.data.pagination);
        } else {
          throw new Error(data.error || 'Failed to fetch payments');
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات المدفوعات",
          variant: "destructive"
        });
      } finally {
        setPaymentsLoading(false);
      }
    };
    
    fetchPayments();
  }, [token, params.id, activeTab, pagination.page, searchQuery]);
  
  // Handle delete program
  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا البرنامج؟')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/programs/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete program');
      }
      
      showAdminToast({
        title: "تم بنجاح",
        description: "تم حذف البرنامج بنجاح"
      });
      
      router.push('/admin-dashboard/programs');
    } catch (error) {
      console.error('Error deleting program:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في حذف البرنامج",
        variant: "destructive"
      });
    }
  };
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline">مسودة</Badge>;
      case 'ACTIVE':
        return <Badge>نشط</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">مكتمل</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
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
  
  if (!program) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>لم يتم العثور على البرنامج</p>
      </div>
    );
  }
  
  // Handle page change for payments
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return `${amount.toLocaleString('ar-SA')} ${currency === 'SAR' ? 'ريال' : currency}`;
  }
  
  // Map payment type to Arabic
  const getPaymentTypeArabic = (type: string) => {
    switch(type) {
      case 'program_fee': return 'رسوم اشتراك';
      case 'mentorship_fee': return 'رسوم إرشاد';
      case 'event_registration': return 'رسوم فعالية';
      case 'service_fee': return 'رسوم خدمات';
      default: return type;
    }
  }
  
  // Map payment status to Arabic
  const getPaymentStatusArabic = (status: string) => {
    switch(status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'معلق';
      case 'failed': return 'فشل';
      case 'rejected': return 'مرفوض';
      case 'refunded': return 'مسترجع';
      default: return status;
    }
  }
  
  // Get payment status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'failed':
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Export payments
  const handleExportPayments = () => {
    if (!token) return;
    
    // Build export URL with query parameters
    let exportUrl = `/api/admin/payments/export?programId=${params.id}`;
    
    // Add search parameter if provided
    if (searchQuery) {
      exportUrl += `&search=${encodeURIComponent(searchQuery)}`;
    }
    
    // Open in new tab
    window.open(exportUrl, '_blank');
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => router.push('/admin-dashboard/programs')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>رجوع</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => router.push(`/admin-dashboard/programs/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>تعديل</span>
          </Button>
          
          <Button 
            variant="destructive" 
            className="flex items-center gap-1"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>حذف</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">
          {program?.name}
          <span className="mr-2">{getStatusBadge(program?.status || '')}</span>
        </h1>
      </div>
      
      <Tabs 
        defaultValue="details" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="details">تفاصيل البرنامج</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>{getStatusBadge(program.status)}</div>
                <CardTitle className="text-2xl">{program.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">الوصف</h3>
                  <p className="text-muted-foreground">{program.description || 'لا يوجد وصف'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">النوع</h3>
                    <p className="text-muted-foreground">{program.type}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">الموقع</h3>
                    <p className="text-muted-foreground">{program.location || 'غير محدد'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">السعة</h3>
                    <p className="text-muted-foreground">{program.capacity || 'غير محدد'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">الموعد النهائي للتقديم</h3>
                    <p className="text-muted-foreground">
                      {program.applicationDeadline 
                        ? new Date(program.applicationDeadline).toLocaleDateString('ar-SA') 
                        : 'غير محدد'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">تاريخ البدء</h3>
                    <p className="text-muted-foreground">
                      {program.startDate 
                        ? new Date(program.startDate).toLocaleDateString('ar-SA') 
                        : 'غير محدد'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">تاريخ الانتهاء</h3>
                    <p className="text-muted-foreground">
                      {program.endDate 
                        ? new Date(program.endDate).toLocaleDateString('ar-SA') 
                        : 'غير محدد'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">المتطلبات</h3>
                  <p className="text-muted-foreground">{program.requirements || 'لا توجد متطلبات محددة'}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">الفوائد</h3>
                  <p className="text-muted-foreground">{program.benefits || 'لا توجد فوائد محددة'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">إحصائيات البرنامج</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>عدد الدفعات</span>
                  </div>
                  <span className="font-bold">{program.stats.cohortsCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span>الدفعات النشطة</span>
                  </div>
                  <span className="font-bold">{program.stats.activeCohortsCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>عدد الشركات</span>
                  </div>
                  <span className="font-bold">{program.stats.totalStartups}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">تم الإنشاء بواسطة</h3>
                  <p className="text-muted-foreground">{program.creator.name}</p>
                  <p className="text-xs text-muted-foreground">{program.creator.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">تاريخ الإنشاء</h3>
                  <p className="text-muted-foreground">
                    {new Date(program.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">آخر تحديث</h3>
                  <p className="text-muted-foreground">
                    {new Date(program.updatedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button 
              className="w-full"
              onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts`)}
            >
              عرض الدفعات
            </Button>
          </div>
        </div>
      </div>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleExportPayments}
              >
                <Download className="h-4 w-4" />
                <span>تصدير</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: 1 }));
                  // Re-fetch will happen due to useEffect dependencies
                }}
                disabled={paymentsLoading}
              >
                {paymentsLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>تحديث</span>
              </Button>
            </div>
            
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="البحث عن معاملة..." 
                className="pl-3 pr-10 w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPagination(prev => ({ ...prev, page: 1 }));
                    // Re-fetch will happen due to useEffect dependencies
                  }
                }}
              />
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>المدفوعات المرتبطة بالبرنامج</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="py-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">جاري تحميل المدفوعات...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="py-8 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p>لا توجد مدفوعات مرتبطة بهذا البرنامج</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => router.push('/admin-dashboard/payments/create')}
                  >
                    إضافة دفعة جديدة
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="grid grid-cols-7 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                    <div className="col-span-1">الإجراءات</div>
                    <div className="col-span-1">الحالة</div>
                    <div className="col-span-1">المبلغ</div>
                    <div className="col-span-1">النوع</div>
                    <div className="col-span-1">الجهة</div>
                    <div className="col-span-1">التاريخ</div>
                    <div className="col-span-1">رقم المرجع</div>
                  </div>
                  
                  {/* Check payment metadata for programId to ensure we only show payments for this program */}
                  {payments.filter(p => 
                    p.metadata && 
                    p.metadata.programId && 
                    p.metadata.programId.toString() === params.id
                  ).map((payment) => (
                    <div key={payment.id} className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                      <div className="col-span-1 flex items-center gap-2">
                        <div className="flex gap-1">
                          <button 
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => router.push(`/admin-dashboard/payments/${payment.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-amber-500 hover:text-amber-700"
                            onClick={() => router.push(`/admin-dashboard/payments/${payment.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getPaymentStatusArabic(payment.status)}
                        </span>
                      </div>
                      <div className="col-span-1">{formatCurrency(payment.amount, payment.currency)}</div>
                      <div className="col-span-1">{getPaymentTypeArabic(payment.type)}</div>
                      <div className="col-span-1">{payment.payerName}</div>
                      <div className="col-span-1">{new Date(payment.paymentDate).toLocaleDateString('ar-SA')}</div>
                      <div className="col-span-1">{payment.referenceNumber}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {!paymentsLoading && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1 || paymentsLoading}
                  >
                    الأول
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || paymentsLoading}
                  >
                    السابق
                  </Button>
                  <span className="px-3 py-2 mx-1 rounded-md bg-muted">
                    صفحة {pagination.page} من {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || paymentsLoading}
                  >
                    التالي
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages || paymentsLoading}
                  >
                    الأخير
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
