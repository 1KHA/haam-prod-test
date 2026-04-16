"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft, 
  Save,
  AlertCircle,
  RefreshCw
} from "lucide-react"

interface PaymentFormData {
  amount: string;
  currency: string;
  status: string;
  type: string;
  description: string;
  payerName: string;
  payerEmail: string;
  paymentMethod: string;
  metadata: Record<string, any>;
  statusChangeNote?: string;
}

export default function EditPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    currency: 'SAR',
    status: '',
    type: '',
    description: '',
    payerName: '',
    payerEmail: '',
    paymentMethod: '',
    metadata: {}
  })
  const [originalStatus, setOriginalStatus] = useState('')
  const [advancedMode, setAdvancedMode] = useState(false)
  
  // Fetch payment details on component mount
  useEffect(() => {
    fetchPaymentDetails()
  }, [id])
  
  // Fetch payment details
  const fetchPaymentDetails = async () => {
    try {
      setIsLoading(true)

      // Fetch payment details
      const response = await fetch(`/api/admin/payments/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment details')
      }
      
      const data = await response.json()
      
      if (data.success) {
        const payment = data.data
        
        // Set form data
        setFormData({
          amount: payment.amount.toString(),
          currency: payment.currency,
          status: payment.status,
          type: payment.type,
          description: payment.description,
          payerName: payment.payerName,
          payerEmail: payment.payerEmail || '',
          paymentMethod: payment.paymentMethod,
          metadata: payment.metadata || {}
        })
        
        // Store original status for comparison
        setOriginalStatus(payment.status)
      } else {
        console.error('Error fetching payment details:', data.error)
        toast.error(data.error || 'Failed to fetch payment details')
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
      toast.error('Failed to fetch payment details')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  // Handle metadata changes
  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }))
  }
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    try {
      setIsSaving(true)
      
      // Validate form
      if (!formData.amount || !formData.payerName || !formData.description) {
        toast.error('Please fill in all required fields')
        return
      }
      
      // Check if status was changed and notes are required
      if (formData.status !== originalStatus && !formData.statusChangeNote) {
        toast.error('Please provide a note explaining the status change')
        return
      }
      
      // Prepare the request body
      const requestBody = {
        ...formData,
        amount: parseFloat(formData.amount)
      }

      // Update payment
      const response = await fetch(`/api/admin/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Payment updated successfully')
        
        // Redirect back to payment details page
        router.push(`/admin-dashboard/payments/${id}`)
      } else {
        console.error('Error updating payment:', data.error)
        toast.error(data.error || 'Failed to update payment')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Failed to update payment')
    } finally {
      setIsSaving(false)
    }
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

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-3xl font-bold">تعديل الدفعة</h1>
          <p className="text-muted-foreground">تعديل تفاصيل الدفعة وحالتها</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>عودة</span>
        </Button>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الدفعة الأساسية</CardTitle>
            <CardDescription>
              تعديل المعلومات الأساسية للدفعة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ <span className="text-red-500">*</span></Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="أدخل المبلغ"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="اختر العملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Status and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر حالة الدفعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">معلق</SelectItem>
                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                    <SelectItem value="FAILED">فشل</SelectItem>
                    <SelectItem value="REJECTED">مرفوض</SelectItem>
                    <SelectItem value="REFUNDED">مسترجع</SelectItem>
                    <SelectItem value="CANCELLED">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">نوع الدفعة</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="اختر نوع الدفعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROGRAM_FEE">رسوم برنامج</SelectItem>
                    <SelectItem value="MENTORSHIP_FEE">رسوم إرشاد</SelectItem>
                    <SelectItem value="EVENT_REGISTRATION">رسوم فعالية</SelectItem>
                    <SelectItem value="SERVICE_FEE">رسوم خدمات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Status Change Note (if status changed) */}
            {formData.status !== originalStatus && (
              <div className="space-y-2 border p-4 rounded-md bg-amber-50">
                <Label htmlFor="statusChangeNote" className="font-medium">
                  <AlertCircle className="h-4 w-4 inline-block mr-2" />
                  ملاحظات تغيير الحالة <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="statusChangeNote"
                  placeholder="اشرح سبب تغيير حالة الدفعة"
                  value={formData.statusChangeNote || ''}
                  onChange={(e) => handleInputChange('statusChangeNote', e.target.value)}
                  className="h-20"
                  required={formData.status !== originalStatus}
                />
                <p className="text-sm text-muted-foreground">
                  ملاحظة: سيتم إضافة هذه الملاحظة إلى سجل التاريخ لتوثيق سبب تغيير الحالة
                </p>
              </div>
            )}
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                placeholder="أدخل وصف الدفعة"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="h-20"
                required
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Payer Information */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الدافع</CardTitle>
            <CardDescription>
              تعديل معلومات الشخص أو الجهة التي قامت بالدفع
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payerName">اسم الدافع <span className="text-red-500">*</span></Label>
                <Input
                  id="payerName"
                  placeholder="أدخل اسم الدافع"
                  value={formData.payerName}
                  onChange={(e) => handleInputChange('payerName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payerEmail">البريد الإلكتروني</Label>
                <Input
                  id="payerEmail"
                  type="email"
                  placeholder="أدخل البريد الإلكتروني للدافع"
                  value={formData.payerEmail}
                  onChange={(e) => handleInputChange('payerEmail', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>معلومات إضافية</CardTitle>
              <CardDescription>
                بيانات إضافية مرتبطة بالدفعة
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="advancedMode" className="text-sm">الوضع المتقدم</Label>
              <Switch
                id="advancedMode"
                checked={advancedMode}
                onCheckedChange={setAdvancedMode}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Program and Startup IDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="programId">رقم البرنامج</Label>
                <Input
                  id="programId"
                  placeholder="أدخل رقم البرنامج (اختياري)"
                  value={formData.metadata?.programId || ''}
                  onChange={(e) => handleMetadataChange('programId', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startupId">رقم الشركة الناشئة</Label>
                <Input
                  id="startupId"
                  placeholder="أدخل رقم الشركة الناشئة (اختياري)"
                  value={formData.metadata?.startupId || ''}
                  onChange={(e) => handleMetadataChange('startupId', e.target.value)}
                />
              </div>
            </div>
            
            {/* Invoice ID and Bank Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invoiceId">رقم الفاتورة</Label>
                <Input
                  id="invoiceId"
                  placeholder="أدخل رقم الفاتورة (اختياري)"
                  value={formData.metadata?.invoiceId || ''}
                  onChange={(e) => handleMetadataChange('invoiceId', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bankReference">رقم المرجع البنكي</Label>
                <Input
                  id="bankReference"
                  placeholder="أدخل رقم المرجع البنكي (اختياري)"
                  value={formData.metadata?.bankReference || ''}
                  onChange={(e) => handleMetadataChange('bankReference', e.target.value)}
                />
              </div>
            </div>
            
            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                placeholder="أي ملاحظات إضافية تتعلق بالدفعة"
                value={formData.metadata?.notes || ''}
                onChange={(e) => handleMetadataChange('notes', e.target.value)}
                className="h-20"
              />
            </div>
            
            {/* Advanced Metadata Editor */}
            {advancedMode && (
              <div className="space-y-2 border p-4 rounded-md bg-muted">
                <Label htmlFor="rawMetadata" className="font-medium">
                  محرر البيانات الوصفية (JSON)
                </Label>
                <Textarea
                  id="rawMetadata"
                  value={JSON.stringify(formData.metadata, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsedValue = JSON.parse(e.target.value)
                      setFormData(prev => ({
                        ...prev,
                        metadata: parsedValue
                      }))
                    } catch (error) {
                      // If invalid JSON, don't update
                      console.error('Invalid JSON:', error)
                    }
                  }}
                  className="h-40 font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  تحذير: تعديل البيانات الوصفية مباشرة قد يؤثر على سلوك النظام. استخدم هذا الخيار بحذر.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Form Actions */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => router.back()}
          >
            إلغاء
          </Button>
          
          <Button 
            type="submit" 
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>حفظ التغييرات</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
