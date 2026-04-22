"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  CreditCard,
  ArrowUpRight,
  PieChart,
  RefreshCw,
  CheckCircle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "react-hot-toast"

// Define payment item interface
interface PaymentItem {
  id: string
  invoiceNumber: string
  amount: string
  entity?: string
  startupId: string
  startupName: string
  category: string
  status: string
  date: string
  dueDate: string
  paymentMethod: string | null
  description: string
  paidDate?: string | null
}

// Define payments summary interface
interface PaymentsSummary {
  totalPayments: number
  completedPayments: number
  pendingPayments: number
  overduePayments: number
  avgPaymentAmount: number
  collectionRate: number
}

export default function PaymentsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [paymentsData, setPaymentsData] = useState<PaymentItem[]>([])
  const [paymentsSummary, setPaymentsSummary] = useState<PaymentsSummary>({
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    overduePayments: 0,
    avgPaymentAmount: 0,
    collectionRate: 0
  })

  // Fetch payments data on component mount
  useEffect(() => {
    const fetchPaymentsData = async () => {
      setIsLoading(true)
      try {
        // Build query string based on filters
        const queryParams = new URLSearchParams()
        if (statusFilter !== 'all') {
          queryParams.append('status', statusFilter)
        }
        if (searchQuery) {
          queryParams.append('search', searchQuery)
        }
        
        // Get token from localStorage
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        
        const response = await fetch(`/api/admin/financing/payments?${queryParams.toString()}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch payments data')
        }
        
        const data = await response.json()
        setPaymentsData(data.data || [])
        setPaymentsSummary(data.summary || {
          totalPayments: 0,
          completedPayments: 0,
          pendingPayments: 0,
          overduePayments: 0,
          avgPaymentAmount: 0,
          collectionRate: 0
        })
      } catch (error) {
        console.error('Error fetching payments data:', error)
        toast.error('حدث خطأ أثناء تحميل بيانات المدفوعات')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPaymentsData()
  }, [searchQuery, statusFilter])

  // No need to filter here as we're doing server-side filtering
  const filteredPayments = paymentsData

  // Handle payment deletion
  const deletePayment = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      return
    }
    
    try {
      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      
      const response = await fetch(`/api/admin/financing/payments/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete payment')
      }
      
      // Update the payments list after successful deletion
      setPaymentsData(prevData => prevData.filter(item => item.id !== id))
      toast.success('تم حذف الفاتورة بنجاح')
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error('حدث خطأ أثناء حذف الفاتورة')
    }
  }

  // Handle marking a payment as paid
  const markAsPaid = async (id: string) => {
    try {
      // Find the payment to update
      const paymentToUpdate = paymentsData.find(p => p.id === id)
      
      if (!paymentToUpdate) {
        throw new Error('Payment not found')
      }
      
      // Update payment status
      const updatedPayment = {
        ...paymentToUpdate,
        status: 'مدفوع',
        paidDate: new Date().toISOString(),
        paymentMethod: paymentToUpdate.paymentMethod || 'تحويل بنكي'
      }
      
      // Send update to API
      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      
      const response = await fetch(`/api/admin/financing/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedPayment)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update payment status')
      }
      
      // Update local state
      setPaymentsData(prevData => 
        prevData.map(item => item.id === id ? updatedPayment : item)
      )
      
      toast.success('تم تحديث حالة الفاتورة إلى مدفوع')
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('حدث خطأ أثناء تحديث حالة الفاتورة')
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/admin-dashboard/financing/payments/create">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>إنشاء فاتورة جديدة</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => {
              // Get token from localStorage
              const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
              
              // Create export URL
              const exportUrl = '/api/admin/financing/payments/export';
              
              if (token) {
                // Create a temporary link element for the download with auth
                fetch(exportUrl, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                })
                .then(response => response.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'payments-export.csv';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  
                  toast.success('تم تصدير البيانات بنجاح');
                })
                .catch(error => {
                  console.error('Error exporting data:', error);
                  toast.error('حدث خطأ أثناء تصدير البيانات');
                });
              } else {
                toast.error('غير مصرح لك بتصدير البيانات');
              }
            }}
          >
            <Download className="h-4 w-4" />
            <span>تصدير بيانات الفواتير</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة المدفوعات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي المدفوعات</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paymentsSummary.totalPayments.toLocaleString()} ريال</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+8% من العام السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>نسبة التحصيل</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paymentsSummary.collectionRate}%</div>
            <div className="text-sm text-muted-foreground mt-1">من إجمالي المدفوعات</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>متوسط قيمة الفاتورة</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(paymentsSummary.avgPaymentAmount).toLocaleString()} ريال</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>حالة المدفوعات</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {paymentsSummary.completedPayments}
                </Badge>
                <span className="text-sm">مدفوع</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  {paymentsSummary.pendingPayments}
                </Badge>
                <span className="text-sm">معلق</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  {paymentsSummary.overduePayments}
                </Badge>
                <span className="text-sm">متأخر</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في الفواتير..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="مدفوع">مدفوع</option>
              <option value="معلق">معلق</option>
              <option value="متأخر">متأخر</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  // Get token from localStorage
                  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                  
                  // Create export URL
                  let exportUrl = '/api/admin/financing/payments/export';
                  
                  // Add query parameters if needed
                  const queryParams = new URLSearchParams();
                  if (statusFilter !== 'all') {
                    queryParams.append('status', statusFilter);
                  }
                  if (searchQuery) {
                    queryParams.append('search', searchQuery);
                  }
                  
                  if (queryParams.toString()) {
                    exportUrl += `?${queryParams.toString()}`;
                  }
                  
                  if (token) {
                    // Create a temporary link element for the download with auth
                    fetch(exportUrl, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(response => response.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'payments-export.csv';
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      toast.success('تم تصدير البيانات بنجاح');
                    })
                    .catch(error => {
                      console.error('Error exporting data:', error);
                      toast.error('حدث خطأ أثناء تصدير البيانات');
                    });
                  } else {
                    toast.error('غير مصرح لك بتصدير البيانات');
                  }
                }}
              >
                <Download className="h-4 w-4" />
                <span>تصدير</span>
              </Button>
            </div>
            <CardTitle>قائمة الفواتير ({filteredPayments.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الإجراءات</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                    <TableHead className="text-right">الجهة</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/admin-dashboard/financing/payments/${payment.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/financing/payments/${payment.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4 text-amber-500" />
                              </Button>
                            </Link>
                            {payment.status !== "مدفوع" && (
                              <Button
                                variant="ghost" 
                                size="icon"
                                onClick={() => markAsPaid(payment.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deletePayment(payment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.status === "مدفوع" ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              مدفوع
                            </Badge>
                          ) : payment.status === "معلق" ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              معلق
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                              متأخر
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{payment.invoiceNumber}</TableCell>
                        <TableCell>
                          <Link href={`/admin-dashboard/startups/${payment.startupId}`} className="text-primary hover:underline">
                            {payment.startupName}
                          </Link>
                        </TableCell>
                        <TableCell>{payment.category}</TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{payment.dueDate}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        لا توجد فواتير مطابقة لبحثك
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع المدفوعات حسب الفئة</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">250,000 ريال</span>
                </div>
                <span className="text-muted-foreground">رسوم برامج</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">300,000 ريال</span>
                </div>
                <span className="text-muted-foreground">رسوم عضوية</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-3 bg-amber-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">180,000 ريال</span>
                </div>
                <span className="text-muted-foreground">رسوم استشارات</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-6 h-3 bg-purple-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">195,000 ريال</span>
                </div>
                <span className="text-muted-foreground">رسوم أخرى</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إحصائيات المدفوعات</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-right">
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">{filteredPayments.length}</span>
                <span className="text-muted-foreground">إجمالي الفواتير المصدرة</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">{paymentsSummary.completedPayments}</span>
                <span className="text-muted-foreground">الفواتير المدفوعة</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">{paymentsSummary.pendingPayments}</span>
                <span className="text-muted-foreground">الفواتير المعلقة</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">{paymentsSummary.overduePayments}</span>
                <span className="text-muted-foreground">الفواتير المتأخرة</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">{paymentsSummary.collectionRate}%</span>
                <span className="text-muted-foreground">نسبة التحصيل</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
