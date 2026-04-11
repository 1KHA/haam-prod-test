"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export default function PMNotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        toast({ title: "تم", description: "تم تحديد جميع الإشعارات كمقروءة" })
      }
    } catch {
      toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" })
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الإشعارات</h1>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} إشعار غير مقروء</p>}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="h-4 w-4 ml-2" />تحديد الكل كمقروء
            </Button>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-end"><span>جميع الإشعارات</span><Bell className="h-5 w-5" /></CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 rounded-lg border text-right ${notification.read ? "bg-background" : "bg-blue-50 dark:bg-blue-950 border-blue-200"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleDateString("ar-SA")}</div>
                    <div><p className="font-semibold">{notification.title}</p><p className="text-sm text-muted-foreground mt-1">{notification.message}</p></div>
                  </div>
                  {!notification.read && <Badge className="mt-2" variant="secondary">جديد</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
