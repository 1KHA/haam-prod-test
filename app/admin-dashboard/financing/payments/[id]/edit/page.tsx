"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Check,
  Loader2
} from "lucide-react"
import { toast } from "react-hot-toast"

interface EditPaymentProps {
  params: {
    id: string;
  };
}

export default function EditPayment({ params }: EditPaymentProps) {
  const router = useRouter()
  const { id } = params
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    startupId: "",
    startupName: "",
    amount: "",
    category: "",
    dueDate: "",
    description: "",
    status: "",
    paymentMethod: "",
    items: [
      { id: "item1", description: "", amount: "" },
      { id: "item2", description: "", amount: "" }
    ]
  })

  // Sample startups data for dropdown
  const startups = [
    { id: "123", name: "شركة الحلول التقنية" },
    { id: "456", name: "مؤسسة التعليم الذكي" },
    { id: "789", name: "شركة التقنيات المتقدمة" },
    { id: "101", name: "منصة الذكاء التقني" },
    { id: "202", name: "شركة الابتكارات الرقمية" }
  ]

  // Sample payment categories for dropdown
  const categories = [
    "رسوم برنامج",
    "رسوم خدمات",
    "رسوم فعالية",
    "رسوم عضوية",
    "رسوم استشارات",
    "رسوم تدريب",
    "رسوم تسجيل"
  ]

  // Sample payment methods for dropdown
  const paymentMethods = [
    "تحويل بنكي",
    "بطاقة ائتمان",
    "نقداً",
    "شيك",
    "محفظة إلكترونية",
    "نظام سداد"
  ]

  // Fetch payment data on component mount
  useEffect(() => {
    // This would be an API call to get the payment details
    const fetchPayment = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Sample payment data
        const paymentData = {
          id: "1", 
          invoiceNumber: "INV-001-2025",
          amount: "250000", 
          entity: "شركة الحلول التقنية", 
          status: "مدفوع", 
          date: "2025-01-12",
          category: "رسوم برنامج",
          startupId: "123",
          startupName: "شركة الحلول التقنية",
          paymentMethod: "تحويل بنكي",
          dueDate: "2025-01-10",
          description: "رسوم الاشتراك في برنامج مسرعات الأعمال 2025",
          items: [
            {
              id: "item1",
              description: "رسوم التسجيل في البرنامج",
              amount: "200000"
            },
            {
              id: "item2",
              description: "رسوم المرافق والخدمات",
              amount: "50000"
            }
          ]
        }
        
        setFormData(paymentData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching payment:", error)
        toast.error("حدث خطأ أثناء تحميل بيانات الفاتورة")
        router.push("/admin-dashboard/financing/payments")
      }
    }
    
    fetchPayment()
  }, [id, router])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelect = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))

    // If startup is selected, update the startupName as well
    if (name === "startupId") {
      const selected = startups.find(s => s.id === value)
      if (selected) {
        setFormData(prev => ({ ...prev, startupName: selected.name }))
      }
    }
  }

  // Handle item changes
  const handleItemChange = (index: number, field: 'description' | 'amount', value: string) => {
    const updatedItems = [...formData.items]
    updatedItems[index][field] = value
    setFormData(prev => ({ ...prev, items: updatedItems }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // This would typically be an API call
      console.log("Updating payment:", id, formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success("تم تحديث الفاتورة بنجاح")
      router.push(`/admin-dashboard/financing/payments/${id}`)
    } catch (error) {
      console.error("Error updating payment:", error)
      toast.error("حدث خطأ أثناء تحديث الفاتورة")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Link href={`/admin-dashboard/financing/payments/${id}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>العودة</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">تعديل الفاتورة</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الفاتورة</CardTitle>
          <CardDescription>قم بتعديل معلومات الفاتورة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
                <Input 
                  id="invoiceNumber" 
                  name="invoiceNumber"
                  placeholder="مثال: INV-001-2025"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startupId">الجهة / الشركة</Label>
                <Select 
                  name="startupId"
                  value={formData.startupId} 
                  onValueChange={(value) => handleSelect("startupId", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الجهة" />
                  </SelectTrigger>
                  <SelectContent>
                    {startups.map(startup => (
                      <SelectItem key={startup.id} value={startup.id}>
                        {startup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ الإجمالي</Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2">ريال</span>
                  <Input 
                    id="amount" 
                    name="amount"
                    placeholder="أدخل المبلغ بالريال السعودي"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="text-right pr-16"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">فئة الفاتورة</Label>
                <Select 
                  name="category"
                  value={formData.category} 
                  onValueChange={(value) => handleSelect("category", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">حالة الفاتورة</Label>
                <Select 
                  name="status"
                  value={formData.status} 
                  onValueChange={(value) => handleSelect("status", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مدفوع">مدفوع</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                    <SelectItem value="متأخر">متأخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                <Input 
                  id="dueDate" 
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="text-right"
                />
              </div>

              {formData.status === "مدفوع" && (
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                  <Select 
                    name="paymentMethod"
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleSelect("paymentMethod", value)}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">بنود الفاتورة</h3>
              {formData.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-desc`}>وصف البند</Label>
                    <Input
                      id={`item-${index}-desc`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-amount`}>المبلغ</Label>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2">ريال</span>
                      <Input
                        id={`item-${index}-amount`}
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                        className="text-right pr-16"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">تفاصيل الفاتورة</Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="أدخل تفاصيل إضافية عن الفاتورة"
                value={formData.description}
                onChange={handleChange}
                className="min-h-32 text-right"
              />
            </div>

            <div className="flex gap-4 justify-start">
              <Button type="submit" disabled={isSubmitting} className="w-40">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
              <Link href={`/admin-dashboard/financing/payments/${id}`}>
                <Button variant="outline" type="button" className="w-40">
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
