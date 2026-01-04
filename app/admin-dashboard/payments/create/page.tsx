"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"

interface PaymentFormData {
  amount: string;
  currency: string;
  type: string;
  description: string;
  payerName: string;
  payerEmail: string;
  paymentMethod: string;
  metadata: Record<string, any>;
}

export default function CreatePaymentPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    currency: 'SAR',
    type: 'PROGRAM_FEE',
    description: '',
    payerName: '',
    payerEmail: '',
    paymentMethod: 'bank_transfer',
    metadata: {}
  })

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
        toast.error('الرجاء ملء جميع الحقول المطلوبة')
        setIsSaving(false)
        return
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('لم يتم العثور على بيانات المستخدم - الرجاء تسجيل الدخول مرة أخرى')
        setIsSaving(false)
        return
      }
      
      // Prepare the request body
      const requestBody = {
        ...formData,
        amount: parseFloat(formData.amount)
      }
      
      console.log('Creating payment with token:', token)
      
      // Create payment
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'تم إنشاء الدفعة بنجاح')
        
        // Redirect back to payment listing page
        router.push('/admin-dashboard/payments')
      } else {
        console.error('Error creating payment:', data.error)
        toast.error(data.error || 'فشل في إنشاء الدفعة')
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('فشل في إنشاء الدفعة')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>عودة</span>
        </Button>
        
        <div className="flex flex-col items-end gap-1">
          <h1 className="text-3xl font-bold">إنشاء دفعة جديدة</h1>
          <p className="text-muted-foreground">إنشاء سجل دفعة أو فاتورة جديدة</p>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الدفعة الأساسية</CardTitle>
            <CardDescription>
              إدخال المعلومات الأساسية للدفعة
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
            
            {/* Payment Type */}
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
              إدخال معلومات الشخص أو الجهة التي ستقوم بالدفع
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
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
            <CardDescription>
              بيانات إضافية مرتبطة بالدفعة (اختياري)
            </CardDescription>
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
            <span>إنشاء الدفعة</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
