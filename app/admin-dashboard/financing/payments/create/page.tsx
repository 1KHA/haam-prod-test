"use client"

import { useState } from "react"
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
  Loader2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreditCard,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function CreatePayment() {
  const router = useRouter()
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
    status: "معلق",
    paymentMethod: ""
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

  // Generate a new invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `INV-${random}-${year}`
  }

  // Set default invoice number on load
  useState(() => {
    setFormData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }))
  })

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format the amount to remove any non-numeric characters
      const formattedAmount = formData.amount.replace(/[^0-9]/g, '')
      
      // Create request payload
      const payload = {
        ...formData,
        amount: formattedAmount
      }
      
      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      // Make API call to create payment
      const response = await fetch('/api/admin/financing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment')
      }

      toast.success("تم إنشاء الفاتورة بنجاح")
      router.push("/admin-dashboard/financing/payments")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("حدث خطأ أثناء إنشاء الفاتورة")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Link href="/admin-dashboard/financing/payments">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>العودة</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">إنشاء فاتورة جديدة</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الفاتورة</CardTitle>
          <CardDescription>أدخل معلومات الفاتورة الجديدة</CardDescription>
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
                <Label htmlFor="amount">المبلغ</Label>
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
                <p className="text-xs text-muted-foreground">
                  (اختياري - فقط للفواتير المدفوعة)
                </p>
              </div>
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
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    إنشاء الفاتورة
                  </>
                )}
              </Button>
              <Link href="/admin-dashboard/financing/payments">
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
