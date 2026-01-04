"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle,
  CreditCard,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  PieChart,
  RefreshCw,
  Receipt,
  Grid
} from "lucide-react"

interface Payment {
  id: string;
  referenceNumber: string;
  paymentDate: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description: string;
  payerName: string;
  payerEmail?: string;
  paymentMethod: string;
  metadata?: {
    programId?: string;
    startupId?: string;
    invoiceId?: string;
  };
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export default function PaymentsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("month")
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingRevenue: 0,
    completedCount: 0,
    rejectedCount: 0
  })

  // Fetch payments on component mount and when filters change
  useEffect(() => {
    fetchPayments();
  }, [activeTab, dateRange, pagination.page]); // Re-fetch when filters or page changes

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("pageSize", pagination.pageSize.toString());
      
      // Map activeTab to API parameters
      if (activeTab === "completed") params.append("status", "completed");
      if (activeTab === "pending") params.append("status", "pending");
      if (activeTab === "rejected") params.append("status", "failed");
      if (activeTab === "subscription") params.append("type", "program_fee");
      if (activeTab === "services") params.append("type", "service_fee");
      if (activeTab === "events") params.append("type", "event_registration");
      
      // Map dateRange to API parameters
      if (dateRange === "today") {
        const today = new Date();
        params.append("startDate", today.toISOString().split('T')[0]);
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.append("startDate", weekAgo.toISOString().split('T')[0]);
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        params.append("startDate", monthAgo.toISOString().split('T')[0]);
      } else if (dateRange === "quarter") {
        const quarterAgo = new Date();
        quarterAgo.setDate(quarterAgo.getDate() - 90);
        params.append("startDate", quarterAgo.toISOString().split('T')[0]);
      }
      
      // Add search parameter if provided
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Fetch payments from API
      const response = await fetch(`/api/admin/payments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data.payments);
        setPagination(data.data.pagination);
        
        // Calculate stats
        const totalRevenue = data.data.payments
          .filter((p: Payment) => p.status === 'completed')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);
          
        const pendingRevenue = data.data.payments
          .filter((p: Payment) => p.status === 'pending')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);
          
        setStats({
          totalRevenue,
          pendingRevenue,
          completedCount: data.data.payments.filter((p: Payment) => p.status === 'completed').length,
          rejectedCount: data.data.payments.filter((p: Payment) => p.status === 'failed' || p.status === 'rejected').length
        });
      } else {
        console.error('Error fetching payments:', data.error);
        toast.error(data.error || 'Failed to fetch payments');
        
        // Use empty array as fallback
        setPayments([]);
        setPagination({
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
      
      // Use empty array as fallback
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payments based on search query (server handles status and date filtering)
  const filteredPayments = searchQuery 
    ? payments.filter(payment => {
        const query = searchQuery.toLowerCase();
        return (
          payment.referenceNumber.toLowerCase().includes(query) ||
          payment.payerName.toLowerCase().includes(query) ||
          payment.description.toLowerCase().includes(query) ||
          (payment.payerEmail && payment.payerEmail.toLowerCase().includes(query))
        );
      })
    : payments;

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  }
  
  // Format time from ISO string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }).format(date);
  }
  
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
  
  // Map payment method to Arabic
  const getPaymentMethodArabic = (method: string) => {
    switch(method) {
      case 'credit_card': return 'بطاقة ائتمان';
      case 'bank_transfer': return 'تحويل بنكي';
      default: return method;
    }
  }

  const togglePaymentSelection = (paymentId: string) => {
    if (selectedPayments.includes(paymentId)) {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId))
    } else {
      setSelectedPayments([...selectedPayments, paymentId])
    }
  }

  const selectAllPayments = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(filteredPayments.map(payment => payment.id))
    }
  }
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchPayments();
  }
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }
  
  // Navigate to payment details
  const navigateToPaymentDetails = (id: string) => {
    window.location.href = `/admin-dashboard/payments/${id}`;
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => {
              // Build export URL with current filters
              const params = new URLSearchParams();
              
              // Map activeTab to API parameters
              if (activeTab === "completed") params.append("status", "completed");
              if (activeTab === "pending") params.append("status", "pending");
              if (activeTab === "rejected") params.append("status", "failed");
              if (activeTab === "subscription") params.append("type", "program_fee");
              if (activeTab === "services") params.append("type", "service_fee");
              if (activeTab === "events") params.append("type", "event_registration");
              
              // Map dateRange to API parameters
              if (dateRange === "today") {
                const today = new Date();
                params.append("startDate", today.toISOString().split('T')[0]);
              } else if (dateRange === "week") {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                params.append("startDate", weekAgo.toISOString().split('T')[0]);
              } else if (dateRange === "month") {
                const monthAgo = new Date();
                monthAgo.setDate(monthAgo.getDate() - 30);
                params.append("startDate", monthAgo.toISOString().split('T')[0]);
              } else if (dateRange === "quarter") {
                const quarterAgo = new Date();
                quarterAgo.setDate(quarterAgo.getDate() - 90);
                params.append("startDate", quarterAgo.toISOString().split('T')[0]);
              }
              
              // Add search parameter if provided
              if (searchQuery) {
                params.append("search", searchQuery);
              }
              
              // Get token from localStorage
              const token = localStorage.getItem('token');
              
              if (!token) {
                toast.error('لم يتم العثور على بيانات المستخدم - الرجاء تسجيل الدخول مرة أخرى');
                return;
              }
              
              // Create a temporary form to submit the export request with token
              const form = document.createElement('form');
              form.method = 'GET';
              form.action = `/api/admin/payments/export?${params.toString()}`;
              form.target = '_blank';
              
              // Add token as a hidden field
              const tokenField = document.createElement('input');
              tokenField.type = 'hidden';
              tokenField.name = 'token';
              tokenField.value = token;
              form.appendChild(tokenField);
              
              // Submit the form
              document.body.appendChild(form);
              form.submit();
              document.body.removeChild(form);
            }}
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>تحديث</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => window.location.href = '/admin-dashboard/payments/gallery'}
          >
            <Grid className="h-4 w-4" />
            <span>عرض البطاقات</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => window.location.href = '/admin-dashboard/payments/create'}
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء فاتورة</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة المدفوعات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي الإيرادات</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+12% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>المدفوعات المعلقة</span>
              <Clock className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.pendingRevenue)}</div>
            <div className="text-sm text-muted-foreground mt-1">{payments.filter(p => p.status === 'pending').length} معاملات</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>المعاملات المكتملة</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedCount}</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+8% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>المعاملات المرفوضة</span>
              <XCircle className="h-5 w-5 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.rejectedCount}</div>
            <div className="flex items-center mt-2 text-amber-600">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>-5% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن معاملة..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchPayments();
                }
              }}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => fetchPayments()}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-4">
          <select 
            className="p-2 border rounded-md"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">اليوم</option>
            <option value="week">آخر 7 أيام</option>
            <option value="month">آخر 30 يوم</option>
            <option value="quarter">آخر 3 أشهر</option>
          </select>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="events">فعاليات</TabsTrigger>
              <TabsTrigger value="services">خدمات</TabsTrigger>
              <TabsTrigger value="subscription">اشتراكات</TabsTrigger>
              <TabsTrigger value="rejected">مرفوض</TabsTrigger>
              <TabsTrigger value="pending">معلق</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedPayments.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    <span>إعادة إرسال الإيصال</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => {
                      // Get token from localStorage
                      const token = localStorage.getItem('token');
                      if (!token) return;
                      
                      // Export only selected payments
                      const params = new URLSearchParams();
                      
                      // Join selected payment IDs with commas
                      if (selectedPayments.length > 0) {
                        params.append("ids", selectedPayments.join(','));
                      }
                      
                      if (!token) {
                        toast.error('لم يتم العثور على بيانات المستخدم - الرجاء تسجيل الدخول مرة أخرى');
                        return;
                      }
                      
                      // Create a temporary form to submit the export request with token
                      const form = document.createElement('form');
                      form.method = 'GET';
                      form.action = `/api/admin/payments/export?${params.toString()}`;
                      form.target = '_blank';
                      
                      // Add token as a hidden field
                      const tokenField = document.createElement('input');
                      tokenField.type = 'hidden';
                      tokenField.name = 'token';
                      tokenField.value = token;
                      form.appendChild(tokenField);
                      
                      // Submit the form
                      document.body.appendChild(form);
                      form.submit();
                      document.body.removeChild(form);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span>تصدير المحدد</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>سجل المدفوعات ({pagination.totalItems})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="ml-2"
                  checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                  onChange={selectAllPayments}
                />
                <span>الإجراءات</span>
              </div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">طريقة الدفع</div>
              <div className="col-span-1">المبلغ</div>
              <div className="col-span-1">النوع</div>
              <div className="col-span-1">الجهة</div>
              <div className="col-span-1">التاريخ</div>
              <div className="col-span-1">رقم المرجع</div>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">جاري تحميل المدفوعات...</p>
              </div>
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => togglePaymentSelection(payment.id)}
                    />
                    <div className="flex gap-1">
                      <button 
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => navigateToPaymentDetails(payment.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-amber-500 hover:text-amber-700"
                        onClick={() => window.location.href = `/admin-dashboard/payments/${payment.id}/edit`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {payment.status === 'completed' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {getPaymentStatusArabic(payment.status)}
                      </span>
                    ) : payment.status === 'pending' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {getPaymentStatusArabic(payment.status)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {getPaymentStatusArabic(payment.status)}
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">{getPaymentMethodArabic(payment.paymentMethod)}</div>
                  <div className="col-span-1">{formatCurrency(payment.amount, payment.currency)}</div>
                  <div className="col-span-1">{getPaymentTypeArabic(payment.type)}</div>
                  <div className="col-span-1">{payment.payerName}</div>
                  <div className="col-span-1">{formatDate(payment.paymentDate)}</div>
                  <div className="col-span-1">{payment.referenceNumber}</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                لا توجد نتائج مطابقة لبحثك
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {activeTab === "pending" && filteredPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المدفوعات المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>إلغاء</span>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => window.location.href = `/admin-dashboard/payments/${payment.id}/process`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>معالجة الدفع</span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{payment.referenceNumber} - {formatCurrency(payment.amount, payment.currency)}</div>
                    <div className="text-sm text-muted-foreground">{payment.payerName} • {getPaymentTypeArabic(payment.type)}</div>
                    <div className="text-xs text-muted-foreground">
                      تاريخ الطلب: {formatDate(payment.paymentDate)} {formatTime(payment.paymentDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1 || isLoading}
          >
            الأول
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
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
            disabled={pagination.page === pagination.totalPages || isLoading}
          >
            التالي
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages || isLoading}
          >
            الأخير
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع المدفوعات حسب النوع</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.type === "رسوم اشتراك").length}
                  </span>
                </div>
                <span className="text-muted-foreground">رسوم اشتراك</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.type === "رسوم خدمات").length}
                  </span>
                </div>
                <span className="text-muted-foreground">رسوم خدمات</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-3 bg-amber-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.type === "رسوم فعالية").length}
                  </span>
                </div>
                <span className="text-muted-foreground">رسوم فعالية</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع المدفوعات حسب طريقة الدفع</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.paymentMethod === "بطاقة ائتمان").length}
                  </span>
                </div>
                <span className="text-muted-foreground">بطاقة ائتمان</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.paymentMethod === "تحويل بنكي").length}
                  </span>
                </div>
                <span className="text-muted-foreground">تحويل بنكي</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-end gap-2">
            <span>تقرير الإيرادات الشهرية</span>
            <BarChart className="h-5 w-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-end justify-between gap-2 pt-10 pb-5">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary rounded-t-md" style={{ height: '30%' }}></div>
              <span className="text-xs">يناير</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary rounded-t-md" style={{ height: '45%' }}></div>
              <span className="text-xs">فبراير</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary rounded-t-md" style={{ height: '60%' }}></div>
              <span className="text-xs">مارس</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '70%' }}></div>
              <span className="text-xs">أبريل</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '80%' }}></div>
              <span className="text-xs">مايو</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '90%' }}></div>
              <span className="text-xs">يونيو</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
