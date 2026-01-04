"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  RefreshCw, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Clock, 
  ArrowUpRight, 
  Eye,
  Edit,
  Receipt
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
}

export default function PaymentsGallery() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("month")
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, [dateRange]); // Re-fetch when date range changes

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("pageSize", "100"); // Show more payments in gallery view
      
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
        setFilteredPayments(data.data.payments);
      } else {
        toast.error(data.error || 'Failed to fetch payments');
        setPayments([]);
        setFilteredPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    // Filter payments based on search query
    if (query) {
      const filtered = payments.filter(payment => 
        payment.referenceNumber.toLowerCase().includes(query) ||
        payment.payerName.toLowerCase().includes(query) ||
        payment.description.toLowerCase().includes(query) ||
        (payment.payerEmail && payment.payerEmail.toLowerCase().includes(query))
      );
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  }
  
  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return `${amount.toLocaleString('ar-SA')} ${currency === 'SAR' ? 'ريال' : currency}`;
  }
  
  // Map payment type to Arabic
  const getPaymentTypeArabic = (type: string) => {
    const typeMap: Record<string, string> = {
      'PROGRAM_FEE': 'رسوم اشتراك',
      'program_fee': 'رسوم اشتراك',
      'MENTORSHIP_FEE': 'رسوم إرشاد',
      'mentorship_fee': 'رسوم إرشاد',
      'EVENT_REGISTRATION': 'رسوم فعالية',
      'event_registration': 'رسوم فعالية',
      'SERVICE_FEE': 'رسوم خدمات',
      'service_fee': 'رسوم خدمات'
    };
    return typeMap[type] || type;
  }
  
  // Map payment status to Arabic
  const getPaymentStatusArabic = (status: string) => {
    const statusMap: Record<string, string> = {
      'COMPLETED': 'مكتمل',
      'completed': 'مكتمل',
      'PENDING': 'معلق',
      'pending': 'معلق',
      'FAILED': 'فشل',
      'failed': 'فشل',
      'REJECTED': 'مرفوض',
      'rejected': 'مرفوض',
      'REFUNDED': 'مسترجع',
      'refunded': 'مسترجع'
    };
    return statusMap[status] || status;
  }

  // Get status color class
  const getStatusColorClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    if (statusLower === 'pending') return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  }

  // Get payment type icon
  const getPaymentTypeIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('program') || typeLower === 'program_fee') 
      return <Receipt className="h-6 w-6 text-indigo-500" />;
    if (typeLower.includes('event') || typeLower === 'event_registration') 
      return <Calendar className="h-6 w-6 text-purple-500" />;
    if (typeLower.includes('mentor') || typeLower === 'mentorship_fee') 
      return <Users className="h-6 w-6 text-blue-500" />;
    return <CreditCard className="h-6 w-6 text-amber-500" />;
  };

  // Navigate to payment details
  const navigateToPaymentDetails = (id: string) => {
    router.push(`/admin-dashboard/payments/${id}`);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchPayments();
  };

  // Group payments by status for visual organization
  const completedPayments = filteredPayments.filter(p => p.status.toLowerCase() === 'completed');
  const pendingPayments = filteredPayments.filter(p => p.status.toLowerCase() === 'pending');
  const otherPayments = filteredPayments.filter(p => 
    !['completed', 'pending'].includes(p.status.toLowerCase())
  );

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.push('/admin-dashboard/payments')}
          >
            <Eye className="h-4 w-4" />
            <span>العرض الجدولي</span>
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
            onClick={() => {
              // Open export URL in new tab
              window.open('/api/admin/payments/export', '_blank');
            }}
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.push('/admin-dashboard/payments/create')}
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء دفعة</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">معرض المدفوعات</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="البحث عن معاملة..." 
            className="pl-3 pr-10 w-full" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
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
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل المدفوعات...</p>
        </div>
      )}

      {/* No results */}
      {!isLoading && filteredPayments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <CreditCard className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-2xl font-semibold">لا توجد مدفوعات</h3>
              <p className="text-muted-foreground">
                لم يتم العثور على أي معاملات ضمن المعايير المحددة.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setFilteredPayments(payments);
                }}
              >
                مسح البحث
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Payments */}
      {!isLoading && completedPayments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">المدفوعات المكتملة</h2>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-muted-foreground">({completedPayments.length})</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedPayments.map((payment) => (
              <Card 
                key={payment.id} 
                className="cursor-pointer hover:border-primary transition-all" 
                onClick={() => navigateToPaymentDetails(payment.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(payment.status)}`}>
                      {getPaymentStatusArabic(payment.status)}
                    </span>
                    <div className="flex flex-col items-end">
                      <CardTitle className="text-lg">{payment.payerName}</CardTitle>
                      <CardDescription>{payment.referenceNumber}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(payment.paymentDate)}
                    </div>
                    <div className="font-bold text-lg">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm bg-primary/10 px-2 py-1 rounded text-primary">
                      {getPaymentTypeArabic(payment.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'بطاقة ائتمان'}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <div className="w-full flex justify-between items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/api/admin/payments/export?ids=${payment.id}`, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin-dashboard/payments/${payment.id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success('تم إرسال الإيصال بنجاح');
                        }}
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Payments */}
      {!isLoading && pendingPayments.length > 0 && (
        <div className="space-y-4 mt-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">المدفوعات المعلقة</h2>
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="text-muted-foreground">({pendingPayments.length})</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingPayments.map((payment) => (
              <Card 
                key={payment.id} 
                className="cursor-pointer hover:border-primary transition-all border-amber-200"
                onClick={() => navigateToPaymentDetails(payment.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(payment.status)}`}>
                      {getPaymentStatusArabic(payment.status)}
                    </span>
                    <div className="flex flex-col items-end">
                      <CardTitle className="text-lg">{payment.payerName}</CardTitle>
                      <CardDescription>{payment.referenceNumber}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(payment.paymentDate)}
                    </div>
                    <div className="font-bold text-lg">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm bg-primary/10 px-2 py-1 rounded text-primary">
                      {getPaymentTypeArabic(payment.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'بطاقة ائتمان'}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <div className="w-full flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 border-red-200 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success('تم إلغاء الدفعة');
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>إلغاء</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-500 border-green-200 hover:text-green-700 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin-dashboard/payments/${payment.id}/process`);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>تأكيد</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Payments */}
      {!isLoading && otherPayments.length > 0 && (
        <div className="space-y-4 mt-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">المدفوعات الأخرى</h2>
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-muted-foreground">({otherPayments.length})</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherPayments.map((payment) => (
              <Card 
                key={payment.id} 
                className="cursor-pointer hover:border-primary transition-all border-red-100"
                onClick={() => navigateToPaymentDetails(payment.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(payment.status)}`}>
                      {getPaymentStatusArabic(payment.status)}
                    </span>
                    <div className="flex flex-col items-end">
                      <CardTitle className="text-lg">{payment.payerName}</CardTitle>
                      <CardDescription>{payment.referenceNumber}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(payment.paymentDate)}
                    </div>
                    <div className="font-bold text-lg">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm bg-primary/10 px-2 py-1 rounded text-primary">
                      {getPaymentTypeArabic(payment.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'بطاقة ائتمان'}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <div className="w-full flex justify-between items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/api/admin/payments/export?ids=${payment.id}`, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin-dashboard/payments/${payment.id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-500 border-green-200 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin-dashboard/payments/${payment.id}/process`);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        <span>إعادة</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// Import missing icons
function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
