"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Building,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Tag,
  FileText,
  ArrowRight,
  Download,
  Upload
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

interface PaymentDetailsProps {
  params: {
    id: string;
  };
}

export default function PaymentDetails({ params }: PaymentDetailsProps) {
  const router = useRouter()
  const { id } = params
  const [isLoading, setIsLoading] = useState(true)
  const [payment, setPayment] = useState<any>(null)

  // Sample payment data
  const paymentData = {
    id: "1", 
    invoiceNumber: "INV-001-2025",
    amount: "250,000 ريال", 
    entity: "شركة الحلول التقنية", 
    status: "مدفوع", 
    date: "12 يناير 2025",
    category: "رسوم برنامج",
    startupId: "123",
    startupName: "شركة الحلول التقنية",
    paymentMethod: "تحويل بنكي",
    bankName: "البنك الأهلي السعودي",
    bankAccount: "SA1234567890123456789012",
    dueDate: "10 يناير 2025",
    paidDate: "8 يناير 2025",
    description: "رسوم الاشتراك في برنامج مسرعات الأعمال 2025",
    items: [
      {
        id: "item1",
        description: "رسوم التسجيل في البرنامج",
        amount: "200,000 ريال"
      },
      {
        id: "item2",
        description: "رسوم المرافق والخدمات",
        amount: "50,000 ريال"
      }
    ],
    createdBy: "أحمد محمد",
    createdAt: "5 يناير 2025",
    updatedAt: "8 يناير 2025",
    relatedDocuments: [
      {
        id: "doc1",
        name: "عقد الاشتراك.pdf",
        type: "pdf",
        size: "1.2 MB",
        uploadedAt: "5 يناير 2025"
      },
      {
        id: "doc2",
        name: "إيصال الدفع.pdf",
        type: "pdf",
        size: "0.5 MB",
        uploadedAt: "8 يناير 2025"
      }
    ]
  }

  // Fetch payment data on component mount
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setPayment(paymentData)
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [id])

  // Delete payment handler
  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      try {
        // This would typically be an API call
        console.log("Deleting payment:", id)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        toast.success("تم حذف الفاتورة بنجاح")
        router.push("/admin-dashboard/financing/payments")
      } catch (error) {
        console.error("Error deleting payment:", error)
        toast.error("حدث خطأ أثناء حذف الفاتورة")
      }
    }
  }

  // Mark payment as paid handler
  const handleMarkAsPaid = async () => {
    if (window.confirm("هل أنت متأكد من تحديث حالة الفاتورة إلى مدفوعة؟")) {
      try {
        // This would typically be an API call
        console.log("Marking payment as paid:", id)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        toast.success("تم تحديث حالة الفاتورة إلى مدفوع")
        // Update local state
        setPayment((prev: any) => ({
          ...prev,
          status: "مدفوع",
          paidDate: new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
        }))
      } catch (error) {
        console.error("Error marking payment as paid:", error)
        toast.error("حدث خطأ أثناء تحديث حالة الفاتورة")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">لم يتم العثور على الفاتورة</h2>
        <p className="text-muted-foreground mb-6">
          تعذر العثور على الفاتورة المطلوبة، ربما تم حذفها أو تغيير المعرف الخاص بها.
        </p>
        <Link href="/admin-dashboard/financing/payments">
          <Button>العودة إلى قائمة الفواتير</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 className="h-4 w-4" />
            <span>حذف</span>
          </Button>
          <Link href={`/admin-dashboard/financing/payments/${id}/edit`}>
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              <span>تعديل</span>
            </Button>
          </Link>
          {payment.status !== "مدفوع" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAsPaid} 
              className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>تحديد كمدفوع</span>
            </Button>
          )}
          <Link href="/admin-dashboard/financing/payments">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>العودة</span>
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">تفاصيل الفاتورة</h1>
      </div>

      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Badge 
              variant="outline" 
              className={payment.status === "مدفوع" 
                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                : payment.status === "معلق"
                ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              {payment.status}
            </Badge>
            <div className="text-right">
              <CardTitle className="text-2xl mb-1">فاتورة #{payment.invoiceNumber}</CardTitle>
              <CardDescription className="text-base">
                {payment.startupName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <span>بيانات العميل</span>
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3">
                  <p className="text-muted-foreground">الاسم:</p>
                  <p className="col-span-2 font-medium">{payment.startupName}</p>
                </div>
                <div className="grid grid-cols-3">
                  <p className="text-muted-foreground">الرقم المرجعي:</p>
                  <p className="col-span-2 font-medium">{payment.startupId}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>التواريخ</span>
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3">
                  <p className="text-muted-foreground">تاريخ الإصدار:</p>
                  <p className="col-span-2 font-medium">{payment.date}</p>
                </div>
                <div className="grid grid-cols-3">
                  <p className="text-muted-foreground">تاريخ الاستحقاق:</p>
                  <p className="col-span-2 font-medium">{payment.dueDate}</p>
                </div>
                {payment.status === "مدفوع" && (
                  <div className="grid grid-cols-3">
                    <p className="text-muted-foreground">تاريخ السداد:</p>
                    <p className="col-span-2 font-medium">{payment.paidDate}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>تفاصيل الفاتورة</span>
            </h3>
            <div className="overflow-hidden border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right p-3 font-medium">البند</th>
                    <th className="text-left p-3 font-medium">القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.items.map((item: any) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-left">{item.amount}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/20">
                    <td className="p-3 font-bold">الإجمالي</td>
                    <td className="p-3 text-left font-bold">{payment.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <span>تفاصيل إضافية</span>
            </h3>
            <p className="text-muted-foreground text-right leading-relaxed">
              {payment.description}
            </p>
          </div>

          {payment.status === "مدفوع" && (
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>بيانات الدفع</span>
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3">
                  <p className="text-muted-foreground">طريقة الدفع:</p>
                  <p className="col-span-2 font-medium">{payment.paymentMethod}</p>
                </div>
                {payment.bankName && (
                  <>
                    <div className="grid grid-cols-3">
                      <p className="text-muted-foreground">البنك:</p>
                      <p className="col-span-2 font-medium">{payment.bankName}</p>
                    </div>
                    <div className="grid grid-cols-3">
                      <p className="text-muted-foreground">رقم الحساب:</p>
                      <p className="col-span-2 font-medium">{payment.bankAccount}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="space-y-1 text-center md:text-right">
            <p className="text-sm text-muted-foreground">تم إنشاء الفاتورة بواسطة {payment.createdBy}</p>
            <p className="text-xs text-muted-foreground">آخر تحديث: {payment.updatedAt}</p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => toast.success("تم تحميل الفاتورة بنجاح")}
          >
            <Download className="h-4 w-4" />
            <span>تحميل الفاتورة (PDF)</span>
          </Button>
        </CardFooter>
      </Card>

      {payment.relatedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>المستندات المرفقة</span>
              <FileText className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>المستندات المرتبطة بهذه الفاتورة</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {payment.relatedDocuments.map((doc: any) => (
                <li key={doc.id} className="flex justify-between items-center p-2 border rounded hover:bg-accent/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{doc.size}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {doc.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{doc.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
            <CardFooter className="justify-center border-t pt-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center gap-2"
                onClick={() => {
                  // Prepare documents for download as a ZIP file
                  // In a real implementation, this would call an API endpoint
                  // For demo, we'll just show a toast notification
                  toast.success("جاري تحميل جميع المستندات");
                  
                  // Simulate successful download after a delay
                  setTimeout(() => {
                    toast.success("تم تحميل جميع المستندات بنجاح");
                  }, 1500);
                }}
              >
                <Download className="h-4 w-4" />
                <span>تحميل جميع المستندات</span>
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                className="w-full flex items-center gap-2 mt-2"
                onClick={() => {
                  // Create a file input element
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = '.pdf,.docx,.xlsx,.jpg,.png';
                  
                  // Handle file selection
                  input.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (!files || files.length === 0) return;
                    
                    // Show loading notification
                    toast.loading("جاري رفع المستندات...", { duration: 1000 });
                    
                    // Simulate upload delay
                    setTimeout(() => {
                      // In a real implementation, this would call an API endpoint to upload files
                      // For demo, we'll just show a success notification
                      toast.success(`تم رفع ${files.length} مستندات بنجاح`);
                    }, 1500);
                  };
                  
                  // Trigger file selection dialog
                  input.click();
                }}
              >
                <Upload className="h-4 w-4" />
                <span>رفع مستندات جديدة</span>
              </Button>
            </CardFooter>
        </Card>
      )}

      <div className="flex justify-end">
        <Link href="/admin-dashboard/financing/payments">
          <Button variant="outline">العودة إلى قائمة الفواتير</Button>
        </Link>
      </div>
    </div>
  )
}
