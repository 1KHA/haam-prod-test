"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Filter, CheckCircle, XCircle, Clock, Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface SessionData {
  id: string
  startup: { id: string; name: string }
  mentor: { id: string; name: string; mentorProfile?: { expertise?: string } | null }
  cohort?: { id: string; name: string } | null
  topic: string
  sessionType: string
  status: string
  date: string
  duration: number
  location?: string
  notes?: string
}

interface StartupOption { id: string; name: string }
interface MentorOption { id: string; name: string; expertise?: string }

export default function SessionsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [startups, setStartups] = useState<StartupOption[]>([])
  const [mentors, setMentors] = useState<MentorOption[]>([])

  const [form, setForm] = useState({
    startupId: "",
    mentorId: "",
    topic: "",
    sessionType: "INDIVIDUAL",
    date: "",
    time: "10:00",
    duration: 60,
    location: "",
  })

  useEffect(() => {
    if (!token) return
    fetchSessions()
    fetchOptions()
  }, [token])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/program-manager/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch {
      toast({ title: "خطأ", description: "فشل في جلب الجلسات", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [startupRes, mentorRes] = await Promise.all([
        fetch("/api/program-manager/startups", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users?role=MENTOR", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (startupRes.ok) {
        const d = await startupRes.json()
        setStartups((d.startups || d).map((s: any) => ({ id: s.id, name: s.name })))
      }
      if (mentorRes.ok) {
        const d = await mentorRes.json()
        setMentors((d.users || []).map((u: any) => ({ id: u.id, name: u.name, expertise: u.mentorProfile?.expertise })))
      }
    } catch {}
  }

  const handleCreate = async () => {
    if (!form.startupId || !form.mentorId || !form.topic || !form.date) {
      toast({ title: "خطأ", description: "يجب ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const dateTime = new Date(`${form.date}T${form.time}:00`)
      const res = await fetch("/api/program-manager/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, date: dateTime.toISOString() }),
      })
      if (res.ok) {
        const data = await res.json()
        setSessions(prev => [data.session, ...prev])
        toast({ title: "تم", description: "تم جدولة الجلسة بنجاح" })
        setShowNewDialog(false)
        setForm({ startupId: "", mentorId: "", topic: "", sessionType: "INDIVIDUAL", date: "", time: "10:00", duration: 60, location: "" })
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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/program-manager/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
        toast({ title: "تم", description: "تم تحديث حالة الجلسة" })
      }
    } catch {
      toast({ title: "خطأ", description: "فشل في تحديث الجلسة", variant: "destructive" })
    }
  }

  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.startup.name.includes(searchQuery) ||
      s.mentor.name.includes(searchQuery) ||
      s.topic.includes(searchQuery)
    if (activeTab === "all") return matchesSearch
    if (activeTab === "upcoming") return matchesSearch && s.status === "scheduled"
    if (activeTab === "completed") return matchesSearch && s.status === "completed"
    if (activeTab === "cancelled") return matchesSearch && s.status === "cancelled"
    return matchesSearch
  })

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled": return "مجدولة"
      case "completed": return "مكتملة"
      case "cancelled": return "ملغية"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const scheduledCount = sessions.filter(s => s.status === "scheduled").length
  const completedCount = sessions.filter(s => s.status === "completed").length
  const cancelledCount = sessions.filter(s => s.status === "cancelled").length

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2" onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4" />
          <span>جدولة جلسة جديدة</span>
        </Button>
        <h1 className="text-3xl font-bold">جدولة الجلسات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{scheduledCount}</div>
            <p className="text-muted-foreground">جلسات قادمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-muted-foreground">جلسات مكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{cancelledCount}</div>
            <p className="text-muted-foreground">جلسات ملغية</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  className="pl-3 pr-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardTitle>جلسات الإرشاد</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="justify-end">
                <TabsTrigger value="cancelled">ملغية</TabsTrigger>
                <TabsTrigger value="completed">مكتملة</TabsTrigger>
                <TabsTrigger value="upcoming">قادمة</TabsTrigger>
                <TabsTrigger value="all">الكل</TabsTrigger>
              </TabsList>

              {filteredSessions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">لا توجد جلسات</div>
              ) : filteredSessions.map((session) => (
                <div key={session.id} className="border rounded-lg overflow-hidden mt-4">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs ${session.sessionType === "GROUP" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                          {session.sessionType === "GROUP" ? "جماعية" : "فردية"}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg">{session.topic}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">الشركة الناشئة</div>
                        <div className="font-medium">{session.startup.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">الموجه</div>
                        <div className="font-medium">{session.mentor.name}</div>
                        {session.mentor.mentorProfile?.expertise && (
                          <div className="text-sm text-muted-foreground">{session.mentor.mentorProfile.expertise}</div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">التاريخ</div>
                        <div className="font-medium">{new Date(session.date).toLocaleDateString("ar-SA")}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">الوقت</div>
                        <div className="font-medium">{new Date(session.date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">المدة</div>
                        <div className="font-medium">{session.duration} دقيقة</div>
                      </div>
                    </div>
                    {session.location && (
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground">المكان</div>
                        <div className="font-medium">{session.location}</div>
                      </div>
                    )}
                    <div className="flex justify-between mt-4">
                      {session.status === "scheduled" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(session.id, "completed")}>
                            تعديل الجلسة
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(session.id, "cancelled")}>
                              إلغاء
                            </Button>
                            <Button variant="default" size="sm" onClick={() => toast({ title: "تذكير", description: "تم إرسال التذكير" })}>
                              إرسال تذكير
                            </Button>
                          </div>
                        </>
                      )}
                      {session.status === "completed" && (
                        <Button variant="outline" size="sm">عرض التفاصيل</Button>
                      )}
                      {session.status === "cancelled" && (
                        <Button variant="default" size="sm" onClick={() => handleUpdateStatus(session.id, "scheduled")}>
                          إعادة جدولة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <div dir="rtl">
          <DialogHeader>
            <DialogTitle>جدولة جلسة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>الشركة الناشئة <span className="text-red-500">*</span></Label>
              <Select value={form.startupId} onValueChange={v => setForm(p => ({ ...p, startupId: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر الشركة" /></SelectTrigger>
                <SelectContent>
                  {startups.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الموجه <span className="text-red-500">*</span></Label>
              <Select value={form.mentorId} onValueChange={v => setForm(p => ({ ...p, mentorId: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر الموجه" /></SelectTrigger>
                <SelectContent>
                  {mentors.map(m => <SelectItem key={m.id} value={m.id}>{m.name}{m.expertise ? ` — ${m.expertise}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>موضوع الجلسة <span className="text-red-500">*</span></Label>
              <Input value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} placeholder="مثال: مراجعة نموذج العمل" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الجلسة</Label>
                <Select value={form.sessionType} onValueChange={v => setForm(p => ({ ...p, sessionType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">فردية</SelectItem>
                    <SelectItem value="GROUP">جماعية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المدة (دقيقة)</Label>
                <Input type="number" min={15} value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التاريخ <span className="text-red-500">*</span></Label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>الوقت</Label>
                <Input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>المكان</Label>
              <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="مثال: عن بعد (زوم)" />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              جدولة الجلسة
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
