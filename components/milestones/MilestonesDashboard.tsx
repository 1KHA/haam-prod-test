"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  Search,
  Target,
  Trash2,
} from "lucide-react"

type MilestoneStatus = "completed" | "in_progress" | "upcoming" | "overdue"

interface MilestoneItem {
  id: string
  title: string
  description: string
  dueDate: string
  status: MilestoneStatus
  progress: number
  priority: string
  category: string
  startupId: string
  startupName: string
  cohortId: string | null
  cohortName: string | null
}

interface MilestoneStats {
  total: number
  completed: number
  inProgress: number
  upcoming: number
  overdue: number
  averageProgress: number
}

interface StartupOption {
  id: string
  name: string
  cohortId: string | null
  cohortName: string | null
}

interface MilestonesResponse {
  milestones: MilestoneItem[]
  stats: MilestoneStats
  startups: StartupOption[]
}

interface MilestonesDashboardProps {
  apiBase: string
  title: string
  description: string
}

const emptyStats: MilestoneStats = {
  total: 0,
  completed: 0,
  inProgress: 0,
  upcoming: 0,
  overdue: 0,
  averageProgress: 0,
}

export function MilestonesDashboard({
  apiBase,
  title,
  description,
}: MilestonesDashboardProps) {
  const searchParams = useSearchParams()
  const initialStartupId = searchParams.get("startupId") || "all"

  const [token, setToken] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])
  const [stats, setStats] = useState<MilestoneStats>(emptyStats)
  const [startups, setStartups] = useState<StartupOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [startupFilter, setStartupFilter] = useState(initialStartupId)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({
    startupId: initialStartupId !== "all" ? initialStartupId : "",
    title: "",
    description: "",
    dueDate: "",
    category: "product",
    priority: "medium",
  })

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const fetchMilestones = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(apiBase, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data: MilestonesResponse & { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch milestones")
      }

      setMilestones(data.milestones || [])
      setStats(data.stats || emptyStats)
      setStartups(data.startups || [])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "فشل في جلب بيانات المراحل")
      setMilestones([])
      setStats(emptyStats)
      setStartups([])
    } finally {
      setLoading(false)
    }
  }, [apiBase, token])

  useEffect(() => {
    fetchMilestones()
  }, [fetchMilestones])

  const filteredMilestones = useMemo(() => {
    return milestones.filter((milestone) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        query.length === 0 ||
        milestone.title.toLowerCase().includes(query) ||
        milestone.description.toLowerCase().includes(query) ||
        milestone.startupName.toLowerCase().includes(query) ||
        (milestone.cohortName || "").toLowerCase().includes(query)

      const matchesStartup =
        startupFilter === "all" || milestone.startupId === startupFilter

      if (activeTab === "all") {
        return matchesSearch && matchesStartup
      }

      return matchesSearch && matchesStartup && milestone.status === activeTab
    })
  }, [activeTab, milestones, searchQuery, startupFilter])

  const getStatusText = (status: MilestoneStatus) => {
    switch (status) {
      case "completed":
        return "مكتملة"
      case "in_progress":
        return "قيد التنفيذ"
      case "upcoming":
        return "قادمة"
      case "overdue":
        return "متأخرة"
      default:
        return "غير معروف"
    }
  }

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "upcoming":
        return "bg-amber-100 text-amber-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "عالية"
      case "medium":
        return "متوسطة"
      case "low":
        return "منخفضة"
      default:
        return priority
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const resetForm = () => {
    setForm({
      startupId: startupFilter !== "all" ? startupFilter : "",
      title: "",
      description: "",
      dueDate: "",
      category: "product",
      priority: "medium",
    })
  }

  const handleCreate = async () => {
    if (!token) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create milestone")
      }

      setMilestones((current) => [data.milestone, ...current])
      setIsCreating(false)
      resetForm()
      await fetchMilestones()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل في إنشاء المرحلة")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (milestoneId: string, status: MilestoneStatus, progress: number) => {
    if (!token) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${apiBase}/${milestoneId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, progress }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update milestone")
      }

      setMilestones((current) =>
        current.map((milestone) =>
          milestone.id === milestoneId ? data.milestone : milestone
        )
      )
      await fetchMilestones()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل في تحديث المرحلة")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (milestoneId: string) => {
    if (!token) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${apiBase}/${milestoneId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete milestone")
      }

      setMilestones((current) => current.filter((milestone) => milestone.id !== milestoneId))
      await fetchMilestones()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل في حذف المرحلة")
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return <div className="py-8 text-center">يجب تسجيل الدخول أولاً</div>
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setIsCreating((value) => !value)
            if (isCreating) {
              resetForm()
            }
          }}
        >
          <Plus className="h-4 w-4" />
          <span>{isCreating ? "إغلاق النموذج" : "إضافة مرحلة جديدة"}</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground">إجمالي المراحل</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-muted-foreground">المكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-muted-foreground">قيد التنفيذ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-muted-foreground">متوسط الإنجاز</p>
          </CardContent>
        </Card>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>مرحلة جديدة</CardTitle>
            <CardDescription>إنشاء مرحلة مرتبطة بشركة ناشئة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startupId">الشركة الناشئة</Label>
              <select
                id="startupId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.startupId}
                onChange={(event) => setForm((current) => ({ ...current, startupId: event.target.value }))}
              >
                <option value="">اختر شركة ناشئة</option>
                {startups.map((startup) => (
                  <option key={startup.id} value={startup.id}>
                    {startup.name}{startup.cohortName ? ` - ${startup.cohortName}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                >
                  <option value="product">المنتج</option>
                  <option value="business">الأعمال</option>
                  <option value="funding">التمويل</option>
                  <option value="team">الفريق</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                >
                  <option value="high">عالية</option>
                  <option value="medium">متوسطة</option>
                  <option value="low">منخفضة</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  resetForm()
                }}
              >
                إلغاء
              </Button>
              <Button
                disabled={
                  submitting ||
                  !form.startupId ||
                  !form.title.trim() ||
                  !form.description.trim() ||
                  !form.dueDate
                }
                onClick={handleCreate}
              >
                {submitting ? "جاري الحفظ..." : "حفظ المرحلة"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pr-9"
                  placeholder="ابحث في المراحل والشركات"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={startupFilter}
                onChange={(event) => {
                  setStartupFilter(event.target.value)
                  if (form.startupId === "") {
                    setForm((current) => ({
                      ...current,
                      startupId: event.target.value === "all" ? "" : event.target.value,
                    }))
                  }
                }}
              >
                <option value="all">كل الشركات</option>
                {startups.map((startup) => (
                  <option key={startup.id} value={startup.id}>
                    {startup.name}
                  </option>
                ))}
              </select>
            </div>
            <CardTitle>قائمة المراحل</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="justify-end">
              <TabsTrigger value="overdue">متأخرة</TabsTrigger>
              <TabsTrigger value="upcoming">قادمة</TabsTrigger>
              <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
              <TabsTrigger value="completed">مكتملة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredMilestones.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">لا توجد مراحل مطابقة</div>
          ) : (
            filteredMilestones.map((milestone) => (
              <div key={milestone.id} className="rounded-lg border">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(milestone.status)}`}>
                        {getStatusText(milestone.status)}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(milestone.priority)}`}>
                        {getPriorityText(milestone.priority)}
                      </span>
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-bold">{milestone.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        {milestone.startupName}
                        {milestone.cohortName ? ` • ${milestone.cohortName}` : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">تاريخ الاستحقاق</div>
                        <div className="text-sm text-muted-foreground">{formatDate(milestone.dueDate)}</div>
                      </div>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">التقدم</div>
                        <div className="text-sm text-muted-foreground">{milestone.progress}%</div>
                      </div>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">الفئة</div>
                        <div className="text-sm text-muted-foreground">{milestone.category}</div>
                      </div>
                      {milestone.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : milestone.status === "overdue" ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{milestone.progress}%</span>
                      <span className="text-muted-foreground">نسبة الإنجاز</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          milestone.status === "completed"
                            ? "bg-green-500"
                            : milestone.status === "overdue"
                            ? "bg-red-500"
                            : milestone.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {milestone.status === "upcoming" && (
                      <Button
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleStatusUpdate(milestone.id, "in_progress", Math.max(milestone.progress, 10))}
                      >
                        بدء العمل
                      </Button>
                    )}
                    {(milestone.status === "in_progress" || milestone.status === "overdue") && (
                      <Button
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleStatusUpdate(milestone.id, "completed", 100)}
                      >
                        إكمال المرحلة
                      </Button>
                    )}
                    {milestone.status === "overdue" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={submitting}
                        onClick={() => handleStatusUpdate(milestone.id, "in_progress", Math.max(milestone.progress, 10))}
                      >
                        استئناف العمل
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={submitting}
                      className="text-red-600"
                      onClick={() => handleDelete(milestone.id)}
                    >
                      <Trash2 className="ml-2 h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
