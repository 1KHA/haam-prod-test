"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Save, Lock } from "lucide-react"

export default function InvestorSettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: "خطأ", description: "كلمة المرور الجديدة غير متطابقة", variant: "destructive" })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 8 أحرف على الأقل", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        toast({ title: "تم بنجاح", description: "تم تغيير كلمة المرور بنجاح" })
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
      } else {
        const data = await res.json()
        toast({ title: "خطأ", description: data.error || "فشل تغيير كلمة المرور", variant: "destructive" })
      }
    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال بالخادم", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">الإعدادات</h1>
      <Card>
        <CardHeader><CardTitle>معلومات الحساب</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div><span className="text-sm font-medium text-muted-foreground">الاسم: </span><span>{user?.name}</span></div>
          <div><span className="text-sm font-medium text-muted-foreground">البريد الإلكتروني: </span><span>{user?.email}</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />تغيير كلمة المرور</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2"><Label>كلمة المرور الحالية</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
            <Separator />
            <div className="space-y-2"><Label>كلمة المرور الجديدة</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
            <div className="space-y-2"><Label>تأكيد كلمة المرور الجديدة</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
            <Button type="submit" disabled={saving}><Save className="h-4 w-4 ml-2" />{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
