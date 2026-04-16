"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

interface StartupData {
  name: string
  industry: string
  stage: string
  status: string
  description: string
  problem: string
  solution: string
  teamSize: number
  fundingNeeds: string
}

export default function EditStartupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<StartupData>({
    name: "",
    industry: "",
    stage: "",
    status: "",
    description: "",
    problem: "",
    solution: "",
    teamSize: 0,
    fundingNeeds: ""
  })

  useEffect(() => {
    const fetchStartup = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/program-manager/startups/${params.id}`)
        if (!res.ok) throw new Error("Failed to fetch startup")
        const data = await res.json()
        setForm({
          name: data.name || "",
          industry: data.industry || "",
          stage: data.stage || "",
          status: data.status === "active" ? "APPROVED" : "PENDING",
          description: data.description || "",
          problem: data.problem || "",
          solution: data.solution || "",
          teamSize: data.teamSize || 0,
          fundingNeeds: data.fundingNeeds || ""
        })
      } catch {
        showAdminToast({ title: "خطأ", description: "فشل في جلب بيانات الشركة", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchStartup()
  }, [params.id])

  const handleChange = (field: keyof StartupData, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/program-manager/startups/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          industry: form.industry,
          stage: form.stage,
          status: form.status === "APPROVED" ? "active" : "at-risk",
          description: form.description,
          problem: form.problem,
          solution: form.solution,
          teamSize: Number(form.teamSize),
          fundingNeeds: form.fundingNeeds
        })
      })
      if (!res.ok) throw new Error("Failed to update startup")
      showAdminToast({ title: "تم بنجاح", description: "تم تحديث بيانات الشركة" })
      router.push(`/program-manager-dashboard/startups/${params.id}`)
    } catch {
      showAdminToast({ title: "خطأ", description: "فشل في تحديث بيانات الشركة", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mr-2">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تعديل الشركة</h1>
        <Button variant="outline" className="flex items-center gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span>العودة</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الشركة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>اسم الشركة</Label>
              <Input value={form.name} onChange={e => handleChange("name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>المجال</Label>
              <Input value={form.industry} onChange={e => handleChange("industry", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>المرحلة</Label>
              <Input value={form.stage} onChange={e => handleChange("stage", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={val => handleChange("status", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">موافق عليها</SelectItem>
                  <SelectItem value="PENDING">قيد المراجعة</SelectItem>
                  <SelectItem value="REJECTED">مرفوضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>حجم الفريق</Label>
              <Input
                type="number"
                value={form.teamSize}
                onChange={e => handleChange("teamSize", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>احتياجات التمويل</Label>
              <Input value={form.fundingNeeds} onChange={e => handleChange("fundingNeeds", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>الوصف</Label>
            <Textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} />
          </div>
          <div className="space-y-1">
            <Label>المشكلة</Label>
            <Textarea value={form.problem} onChange={e => handleChange("problem", e.target.value)} rows={3} />
          </div>
          <div className="space-y-1">
            <Label>الحل</Label>
            <Textarea value={form.solution} onChange={e => handleChange("solution", e.target.value)} rows={3} />
          </div>

          <div className="flex justify-start">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري الحفظ...</> : "حفظ التعديلات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
