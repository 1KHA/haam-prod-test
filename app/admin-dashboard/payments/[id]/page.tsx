"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  Printer, 
  CheckCircle, 
  XCircle,
  Clock,
  CreditCard,
  Receipt,
  FileText,
  Mail,
  User,
  CalendarClock,
  Building,
  Tag,
  ClipboardList,
  AlertCircle,
  ArrowRight,
  Edit,
  Trash2,
  Undo,
  Plus
} from "lucide-react"

interface PaymentDetail {
  id: string;
  referenceNumber: string;
  paymentDate: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description: string;
  payerName: string;
  payerEmail: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  metadata: {
    programId?: string;
    startupId?: string;
    invoiceId?: string;
    notes?: string;
    bankReference?: string;
    paymentProof?: string;
  };
  history: Array<{
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }>;
  relatedDocuments: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    createdAt: string;
  }>;
}

export default function PaymentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  
  const [payment, setPayment] = useState<PaymentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [processingStatus, setProcessingStatus] = useState<{
    status: string;
    lastProcessedAt: string;
    lastProcessedBy: string;
    processingHistory: Array<{
      timestamp: string;
      action: string;
      status: string;
      user: string;
      notes: string;
    }>;
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch payment details on component mount
  useEffect(() => {
    fetchPaymentDetails()
  }, [id])

  // Fetch payment processing status when the processing tab is active
  useEffect(() => {
    if (activeTab === "processing" && payment?.id) {
      fetchProcessingStatus()
    }
  }, [activeTab, payment?.id])

  // Fetch payment details
  const fetchPaymentDetails = async () => {
    try {
      setIsLoading(true)
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('لم يتم العثور على بيانات المستخدم - الرجاء تسجيل الدخول مرة أخرى')
        router.push('/admin-dashboard/payments')
        return
      }
      
      // Fetch payment details
      const response = await fetch(`/api/admin/payments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('فشل في جلب تفاصيل الدفعة')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPayment(data.data)
      } else {
        console.error('Error fetching payment details:', data.error)
        toast.error(data.error || 'فشل في جلب تفاصيل الدفعة')
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
      toast.error('فشل في جلب تفاصيل الدفعة')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch payment processing status
  const fetchProcessingStatus = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('لم يتم العثور على بيانات المستخدم - الرجاء تسجيل الدخول مرة أخرى')
        return
      }
      
      // Fetch payment processing status
      const response = await fetch(`/api/admin/payments/process?paymentId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('فشل في جلب حالة معالجة الدفعة')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProcessingStatus(data.data)
      } else {
        console.error('Error fetching processing status:', data.error)
        toast.error(data.error || 'فشل في جلب حالة معالجة الدفعة')
      }
    } catch (error) {
      console.error('Error fetching processing status:', error)
      toast.error('فشل في جلب حالة معالجة الدفعة')
    }
  }

  // Process payment
  const processPayment = async (action: string, notes: string = '') => {
    try {
      setIsProcessing(true)
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('لم يتم العثور على بيانات المستخدم - الرجاء تسجيل الدخول مرة أخرى')
        setIsProcessing(false)
        return
      }
      
      // Process payment
      const response = await fetch('/api/admin/payments/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: id,
          action,
          notes
        })
      })
      
      if (!response.ok) {
        throw new Error('فشل في معالجة الدفعة')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'تمت معالجة الدفعة بنجاح')
        
        // Refresh payment details and processing status
        fetchPaymentDetails()
        fetchProcessingStatus()
      } else {
        console.error('Error processing payment:', data.error)
        toast.error(data.error || 'فشل في معالجة الدفعة')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('فشل في معالجة الدفعة')
    } finally {
      setIsProcessing(false)
    }
  }

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      case 'cancelled': return 'ملغي';
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

  // Get status color
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
  
  // Get document type in Arabic
  const getDocumentTypeArabic = (type: string) => {
    switch(type) {
      case 'invoice': return 'فاتورة';
      case 'receipt': return 'إيصال';
      case 'proof': return 'إثبات الدفع';
      default: return type;
    }
  }

  // Handle printing
  const handlePrint = () => {
    window.print();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-xl text-muted-foreground">جاري تحميل تفاصيل الدفعة...</p>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-xl text-red-500 mb-2">لم يتم العثور على تفاصيل الدفعة</p>
          <p className="text-muted-foreground mb-6">تأكد من صحة رابط الدفعة أو قم بالرجوع إلى قائمة المدفوعات</p>
          <Button 
            variant="default" 
            className="flex items-center gap-2" 
            onClick={() => router.push('/admin-dashboard/payments')}
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة إلى قائمة المدفوعات</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>عودة</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            <span>طباعة</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={fetchPaymentDetails}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </Button>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <h1 className="text-3xl font-bold">تفاصيل الدفعة #{payment.referenceNumber}</h1>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(payment.status)}>
              {getPaymentStatusArabic(payment.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(payment.paymentDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {payment.status === 'pending' && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => processPayment('reject', 'تم رفض الدفعة')}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 text-red-500" />
              <span>رفض</span>
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => processPayment('approve', 'تم قبول الدفعة')}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4" />
              <span>قبول</span>
            </Button>
          </>
        )}
        
        {payment.status === 'completed' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => processPayment('refund', 'تم استرجاع المبلغ')}
            disabled={isProcessing}
          >
            <Undo className="h-4 w-4 text-amber-500" />
            <span>استرجاع المبلغ</span>
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => router.push(`/admin-dashboard/payments/${id}/edit`)}
        >
          <Edit className="h-4 w-4" />
          <span>تعديل</span>
        </Button>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="details">تفاصيل الدفعة</TabsTrigger>
          <TabsTrigger value="history">تاريخ الدفعة</TabsTrigger>
          <TabsTrigger value="processing">معالجة الدفع</TabsTrigger>
        </TabsList>
        
        {/* Payment Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic payment information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>معلومات الدفعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">المبلغ</p>
                    <p className="text-lg font-semibold">{formatCurrency(payment.amount, payment.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <p className="font-medium">{getPaymentMethodArabic(payment.paymentMethod)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم المرجع</p>
                    <p className="font-medium">{payment.referenceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">نوع الدفعة</p>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <p className="font-medium">{getPaymentTypeArabic(payment.type)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الدفعة</p>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      <p className="font-medium">{formatDate(payment.paymentDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الحالة</p>
                    <Badge className={getStatusColor(payment.status)}>
                      {getPaymentStatusArabic(payment.status)}
                    </Badge>
                  </div>
                </div>

                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الوصف</p>
                  <p className="font-medium">{payment.description}</p>
                </div>

                {payment.metadata?.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
                    <p className="font-medium">{payment.metadata.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payer information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>معلومات الدافع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الاسم</p>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <p className="font-medium">{payment.payerName}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="font-medium">{payment.payerEmail}</p>
                  </div>
                </div>

                {payment.metadata?.startupId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">الشركة الناشئة</p>
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      <p className="font-medium">ID: {payment.metadata.startupId}</p>
                    </div>
                  </div>
                )}

                {payment.metadata?.programId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">البرنامج</p>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      <p className="font-medium">ID: {payment.metadata.programId}</p>
                    </div>
                  </div>
                )}

                {payment.metadata?.bankReference && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">رقم المرجع البنكي</p>
                    <p className="font-medium">{payment.metadata.bankReference}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System metadata */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>بيانات النظام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">تم الإنشاء في</p>
                    <p className="font-medium">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">بواسطة</p>
                    <p className="font-medium">{payment.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">آخر تحديث</p>
                    <p className="font-medium">{formatDate(payment.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">بواسطة</p>
                    <p className="font-medium">{payment.updatedBy}</p>
                  </div>
                </div>
                
                {payment.metadata?.invoiceId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">رقم الفاتورة</p>
                    <p className="font-medium">{payment.metadata.invoiceId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related documents */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>المستندات المرتبطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payment.relatedDocuments && payment.relatedDocuments.length > 0 ? (
                    payment.relatedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between border p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              <span>تنزيل</span>
                            </a>
                          </Button>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {formatDate(doc.createdAt)}
                            </p>
                            <Badge variant="outline">
                              {getDocumentTypeArabic(doc.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد مستندات مرتبطة بهذه الدفعة
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => window.location.href = `/admin-dashboard/payments/${id}/documents/add`}
                >
                  <FileText className="h-4 w-4" />
                  <span>إضافة مستند</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تاريخ الدفعة</CardTitle>
              <CardDescription>
                سجل كامل للإجراءات والتحديثات على الدفعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payment.history && payment.history.length > 0 ? (
                <div className="relative border-r-2 border-muted pr-6 space-y-8">
                  {payment.history.map((event, index) => (
                    <div key={index} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute right-[-31px] top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        {event.action === 'created' ? (
                          <Plus className="h-3 w-3 text-primary-foreground" />
                        ) : event.action === 'updated' ? (
                          <Edit className="h-3 w-3 text-primary-foreground" />
                        ) : event.action === 'completed' ? (
                          <CheckCircle className="h-3 w-3 text-primary-foreground" />
                        ) : (
                          <Clock className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium">
                        {event.action === 'created' ? 'تم إنشاء الدفعة' : 
                         event.action === 'updated' ? 'تم تحديث الدفعة' :
                         event.action === 'completed' ? 'تم إكمال الدفعة' : event.action}
                      </h4>
                      
                      <div className="mt-1 flex flex-col gap-1">
                        <p>{event.details}</p>
                        <span className="text-sm text-muted-foreground">
                          بواسطة: {event.user}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا يوجد سجل تاريخي متاح لهذه الدفعة
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Processing Tab */}
        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معالجة الدفع</CardTitle>
              <CardDescription>
                تفاصيل ومراحل معالجة الدفع
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : processingStatus ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-muted-foreground">الحالة الحالية</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(processingStatus.status)}>
                          {getPaymentStatusArabic(processingStatus.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-muted-foreground">آخر تحديث</p>
                      <p className="font-medium mt-1">{formatDate(processingStatus.lastProcessedAt)}</p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-muted-foreground">بواسطة</p>
                      <p className="font-medium mt-1">{processingStatus.lastProcessedBy}</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-4">سجل المعالجة</h3>
                    
                    {processingStatus.processingHistory && processingStatus.processingHistory.length > 0 ? (
                      <div className="relative border-r-2 border-muted pr-6 space-y-6">
                        {processingStatus.processingHistory.map((event, index) => (
                          <div key={index} className="relative">
                            {/* Timeline dot */}
                            <div className="absolute right-[-27px] top-0 w-5 h-5 rounded-full bg-muted-foreground"></div>
                            
                            <div className="mb-2">
                              <span className="text-sm text-muted-foreground">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                            
                            <h4 className="text-lg font-medium">
                              {event.action === 'created' ? 'إنشاء طلب الدفع' : 
                               event.action === 'mark_as_paid' ? 'تحديث كمدفوع' :
                               event.action === 'approve' ? 'الموافقة على الدفعة' : 
                               event.action === 'reject' ? 'رفض الدفعة' :
                               event.action === 'refund' ? 'استرجاع المبلغ' :
                               event.action === 'cancel' ? 'إلغاء الدفعة' : event.action}
                            </h4>
                            
                            <div className="mt-1">
                              <Badge className={getStatusColor(event.status)}>
                                {getPaymentStatusArabic(event.status)}
                              </Badge>
                            </div>
                            
                            <div className="mt-2 flex flex-col gap-1">
                              {event.notes && <p>{event.notes}</p>}
                              <span className="text-sm text-muted-foreground">
                                بواسطة: {event.user}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        لا يوجد سجل معالجة متاح لهذه الدفعة
                      </p>
                    )}
                  </div>
                  
                  {payment.status === 'pending' && (
                    <div className="border rounded-md p-4 bg-muted/20">
                      <h3 className="font-medium text-lg mb-4">إجراءات متاحة</h3>
                      
                      <div className="flex flex-wrap gap-3 justify-end">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => processPayment('cancel', 'تم إلغاء الدفعة')}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>إلغاء الدفعة</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => processPayment('reject', 'تم رفض الدفعة لعدم صحة البيانات')}
                          disabled={isProcessing}
                        >
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span>رفض الدفعة</span>
                        </Button>
                        
                        <Button 
                          variant="default" 
                          className="flex items-center gap-1"
                          onClick={() => processPayment('approve', 'تم التحقق من الدفعة والموافقة عليها')}
                          disabled={isProcessing}
                        >
                          <CheckCircle className="h-4 w-4 text-white" />
                          <span>موافقة وتأكيد</span>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {payment.status === 'completed' && (
                    <div className="border rounded-md p-4 bg-muted/20">
                      <h3 className="font-medium text-lg mb-4">إجراءات متاحة</h3>
                      
                      <div className="flex flex-wrap gap-3 justify-end">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => processPayment('refund', 'تم استرجاع المبلغ بناءً على طلب العميل')}
                          disabled={isProcessing}
                        >
                          <Undo className="h-4 w-4 text-amber-500" />
                          <span>استرجاع المبلغ</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-1"
                        >
                          <Receipt className="h-4 w-4" />
                          <span>إعادة إرسال الإيصال</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد معلومات معالجة متاحة لهذه الدفعة
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
