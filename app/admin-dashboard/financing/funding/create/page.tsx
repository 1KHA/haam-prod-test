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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DollarSign,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CalendarIcon,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building,
  Check,
  Loader2
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function CreateFunding() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    startupId: "",
    startupName: "",
    amount: "",
    fundingType: "",
    investorName: "",
    date: "",
    description: "",
    status: "قيد المراجعة"
  })

  // Sample startups data for dropdown
  const startups = [
    { id: "123", name: "تك سمارت" },
    { id: "456", name: "هيلث تك" },
    { id: "789", name: "إيكو سمارت" },
    { id: "101", name: "أوربت" },
    { id: "202", name: "ديجي لوجي" }
  ]

  // Sample funding types for dropdown
  const fundingTypes = [
    "استثمار مباشر",
    "استثمار جولة أ",
    "استثمار جولة ب",
    "منحة بحث وتطوير",
    "منحة تقنية",
    "تمويل ذاتي",
    "قرض"
  ]

  // Sample investors for dropdown
  const investors = [
    "صندوق الاستثمارات العامة",
    "وزارة الاتصالات وتقنية المعلومات",
    "سدرة فينشرز",
    "الشركة السعودية للاستثمار الجريء",
    "صندوق التنمية الصناعية",
    "مستثمر فردي"
  ]

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
      
      // Make API call to create funding
      const response = await fetch('/api/admin/financing/funding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create funding')
      }
      
      toast.success("تم إنشاء التمويل بنجاح")
      router.push("/admin-dashboard/financing/funding")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء التمويل")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Link href="/admin-dashboard/financing/funding">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>العودة</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">إضافة تمويل جديد</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل التمويل</CardTitle>
          <CardDescription>أدخل معلومات التمويل الجديد</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان التمويل</Label>
                <Input 
                  id="title" 
                  name="title"
                  placeholder="مثال: استثمار مباشر - تك سمارت"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startupId">الشركة الناشئة</Label>
                <Select 
                  name="startupId"
                  value={formData.startupId} 
                  onValueChange={(value) => handleSelect("startupId", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الشركة الناشئة" />
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
                <Label htmlFor="amount">مبلغ التمويل</Label>
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
                <Label htmlFor="fundingType">نوع التمويل</Label>
                <Select 
                  name="fundingType"
                  value={formData.fundingType} 
                  onValueChange={(value) => handleSelect("fundingType", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر نوع التمويل" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundingTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investorName">المستثمر / الجهة الممولة</Label>
                <Select 
                  name="investorName"
                  value={formData.investorName} 
                  onValueChange={(value) => handleSelect("investorName", value)}
                  required
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر المستثمر" />
                  </SelectTrigger>
                  <SelectContent>
                    {investors.map(investor => (
                      <SelectItem key={investor} value={investor}>
                        {investor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">تاريخ التمويل</Label>
                <Input 
                  id="date" 
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">حالة التمويل</Label>
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
                    <SelectItem value="مكتمل">مكتمل</SelectItem>
                    <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                    <SelectItem value="مرفوض">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">تفاصيل التمويل</Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="أدخل تفاصيل إضافية عن التمويل"
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
                    حفظ التمويل
                  </>
                )}
              </Button>
              <Link href="/admin-dashboard/financing/funding">
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
