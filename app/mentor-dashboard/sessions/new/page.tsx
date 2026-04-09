"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Startup {
  id: string
  name: string
}

export default function NewMentorSessionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [startups, setStartups] = useState<Startup[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    startupId: "",
    topic: "",
    type: "INDIVIDUAL",
    date: "",
    time: "10:00",
    duration: 60,
    location: "",
    notes: "",
  })

  useEffect(() => {
    const fetchStartups = async () => {
      const token = localStorage.getItem("token")
      try {
        const res = await fetch("/api/mentor/startups", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setStartups(data.startups || [])
        }
      } catch {}
    }
    fetchStartups()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.startupId || !form.topic || !form.date) {
      toast({ title: "خطأ", description: "يجب ملء الحقول المطلوبة", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/mentor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast({ title: "تم", description: "تم جدولة الجلسة بنجاح" })
        router.push("/mentor-dashboard/sessions")
      } else {
        const d = await res.json()
        toast({ title: "خطأ", description: d.error || "فشل في إنشاء الجلسة", variant: "destructive" })
      }
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء إنشاء الجلسة", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
          <ArrowRight className="h-4 w-4" />
          رجوع
        </Button>
        <h1 className="text-3xl font-bold">جدولة جلسة جديدة</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الجلسة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>الشركة الناشئة <span className="text-red-500">*</span></Label>
              <Select value={form.startupId} onValueChange={(v) => setForm((p) => ({ ...p, startupId: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر الشركة" /></SelectTrigger>
                <SelectContent>
                  {startups.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>موضوع الجلسة <span className="text-red-500">*</span></Label>
              <Input
                value={form.topic}
                onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                placeholder="مثال: مراجعة نموذج العمل"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الجلسة</Label>
                <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">فردية</SelectItem>
                    <SelectItem value="GROUP">جماعية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المدة (دقيقة)</Label>
                <Input
                  type="number"
                  min={15}
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التاريخ <span className="text-red-500">*</span></Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>الوقت</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>المكان</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="مثال: عن بعد (زوم)"
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>إلغاء</Button>
          <Button type="submit" disabled={saving} className="flex items-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            جدولة الجلسة
          </Button>
        </div>
      </form>
    </div>
  )
}
