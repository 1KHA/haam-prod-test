"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  Check, 
  RefreshCw, 
  FileCheck, 
  CheckCircle, 
  Calendar, 
  Users, 
  Info, 
  Clock, 
  Shield,
  DollarSign,
  Award,
  Eye,
  Filter
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useNotifications, Notification } from "@/contexts/notification-context"
import { cn } from "@/lib/utils"

// Type icon mapping
const typeIcons: Record<string, React.ReactNode> = {
  milestone: <FileCheck className="h-4 w-4" />,
  application: <CheckCircle className="h-4 w-4" />,
  event: <Calendar className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />,
  reminder: <Clock className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  funding: <DollarSign className="h-4 w-4" />,
  mentorship: <Award className="h-4 w-4" />,
}

// Type labels in Arabic
const typeLabels: Record<string, string> = {
  milestone: "مهمة",
  application: "طلب انضمام",
  event: "فعالية",
  team: "فريق",
  system: "نظام",
  reminder: "تذكير",
  security: "أمان",
  funding: "تمويل",
  mentorship: "إرشاد",
}

// Priority configuration
const priorityConfig: Record<string, { color: string; label: string; bgColor: string }> = {
  high: { 
    color: "bg-red-500 text-white", 
    label: "عالي",
    bgColor: "bg-red-50 dark:bg-red-950 border-red-200"
  },
  medium: { 
    color: "bg-yellow-500 text-white", 
    label: "متوسط",
    bgColor: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200"
  },
  low: { 
    color: "bg-blue-500 text-white", 
    label: "منخفض",
    bgColor: "bg-blue-50 dark:bg-blue-950 border-blue-200"
  },
}

export default function PMNotificationsPage() {
  const { toast } = useToast()
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications()
  const [filter, setFilter] = useState<"all" | "unread" | "high" | "milestone" | "application">("all")

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead
    if (filter === "high") return n.priority === "high"
    if (filter === "milestone") return n.type === "milestone"
    if (filter === "application") return n.type === "application"
    return true
  })

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    toast({ title: "تم", description: "تم تحديد الإشعار كمقروء" })
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    toast({ title: "تم", description: "تم تحديد جميع الإشعارات كمقروءة" })
  }

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
  }

  // Count notifications by type
  const milestoneCount = notifications.filter(n => n.type === "milestone" && !n.isRead).length
  const applicationCount = notifications.filter(n => n.type === "application" && !n.isRead).length

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">الإشعارات</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} غير مقروء
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshNotifications} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 ml-2", loading && "animate-spin")} />
            تحديث
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="h-4 w-4 ml-2" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cn("cursor-pointer transition-colors", filter === "milestone" && "border-primary")} onClick={() => setFilter(filter === "milestone" ? "all" : "milestone")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">ردود المهام</p>
                <p className="text-2xl font-bold">{milestoneCount}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={cn("cursor-pointer transition-colors", filter === "application" && "border-primary")} onClick={() => setFilter(filter === "application" ? "all" : "application")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">طلبات جديدة</p>
                <p className="text-2xl font-bold">{applicationCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={cn("cursor-pointer transition-colors", filter === "high" && "border-primary")} onClick={() => setFilter(filter === "high" ? "all" : "high")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">أولوية عالية</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.priority === "high" && !n.isRead).length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          الكل
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          غير المقروء ({unreadCount})
        </Button>
        <Button
          variant={filter === "high" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("high")}
        >
          عالي الأهمية
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-end">
            <span>قائمة الإشعارات</span>
            <Bell className="h-5 w-5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد إشعارات</p>
              <p className="text-sm mt-2">ستظهر هنا إشعارات المهام وطلبات الانضمام</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const priorityStyle = priorityConfig[notification.priority]
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      notification.isRead
                        ? "bg-background border-border"
                        : priorityStyle?.bgColor || "bg-blue-50 dark:bg-blue-950 border-blue-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Right side - Content */}
                      <div className="flex-1">
                        {/* Title row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                          <h3 className="font-semibold text-lg">{notification.title}</h3>
                          {/* Priority Badge */}
                          <Badge className={priorityStyle?.color || "bg-gray-500"}>
                            {priorityStyle?.label || notification.priority}
                          </Badge>
                          {/* Type Badge */}
                          <Badge variant="outline" className="flex items-center gap-1">
                            {typeIcons[notification.type] || <Info className="h-3 w-3" />}
                            {typeLabels[notification.type] || notification.type}
                          </Badge>
                        </div>

                        {/* Message */}
                        <p className="text-muted-foreground mb-3">{notification.message}</p>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span>
                            {new Date(notification.createdAt).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-3">
                          {notification.actionUrl && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleActionClick(notification)}
                            >
                              <Eye className="h-4 w-4 ml-1" />
                              {notification.actionLabel || "مراجعة"}
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4 ml-1" />
                              تحديد كمقروء
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Left side - Actions */}
                      <div className="flex flex-col gap-2">
                        {!notification.isRead && (
                          <Badge variant="secondary">جديد</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
