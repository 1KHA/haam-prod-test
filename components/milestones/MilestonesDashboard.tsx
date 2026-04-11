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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  Edit,
  FileText,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Target,
  Trash2,
  Users,
} from "lucide-react"

type MilestoneStatus = "completed" | "in_progress" | "upcoming" | "overdue"
type SubmissionStatus = "NOT_SUBMITTED" | "SUBMITTED" | "REOPENED" | "SUPERSEDED"

interface MilestoneAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string | null
  fileSize: number | null
  createdAt: string
  updatedAt: string
}

interface MilestoneSubmission {
  id: string
  milestoneId: string
  startupId: string
  startupName: string
  submittedBy: string
  submitterName: string | null
  message: string | null
  status: SubmissionStatus
  submissionNumber: number
  attachments: MilestoneAttachment[]
  createdAt: string
  updatedAt: string
}

interface MilestoneStartupSubmission {
  startupId: string
  startupName: string
  submitted: boolean
  canSubmit: boolean
  latestSubmission: MilestoneSubmission | null
  submissionHistory: MilestoneSubmission[]
}

interface MilestoneItem {
  id: string
  title: string
  description: string
  dueDate: string
  status: MilestoneStatus
  progress: number
  priority: string
  category: string
  cohortId: string
  cohortName: string
  programName: string | null
  totalStartups: number
  submittedStartups: number
  pendingStartups: number
  createdBy: string
  creatorName: string | null
  createdAt: string
  updatedAt: string
}

interface MilestoneDetail extends MilestoneItem {
  startups: MilestoneStartupSubmission[]
}

interface MilestoneStats {
  total: number
  completed: number
  inProgress: number
  upcoming: number
  overdue: number
  averageProgress: number
}

interface CohortOption {
  id: string
  name: string
  programName: string | null
  managerId: string
  startupCount: number
}

interface MilestonesResponse {
  milestones: MilestoneItem[]
  stats: MilestoneStats
  cohorts: CohortOption[]
}

interface MilestonesDashboardProps {
  apiBase: string
  title: string
  description: string
}

interface MilestoneFormState {
  id: string | null
  cohortId: string
  title: string
  description: string
  dueDate: string
  category: string
  priority: string
  progress: string
  status: MilestoneStatus
}

interface SubmissionEditorState {
  milestoneId: string
  submissionId: string
  startupName: string
  message: string
}

const emptyStats: MilestoneStats = {
  total: 0,
  completed: 0,
  inProgress: 0,
  upcoming: 0,
  overdue: 0,
  averageProgress: 0,
}

const emptyMilestoneForm: MilestoneFormState = {
  id: null,
  cohortId: "",
  title: "",
  description: "",
  dueDate: "",
  category: "product",
  priority: "medium",
  progress: "0",
  status: "upcoming",
}

function clampProgress(value: string) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return 0
  }

  return Math.max(0, Math.min(100, parsed))
}

export function MilestonesDashboard({
  apiBase,
  title,
  description,
}: MilestonesDashboardProps) {
  const searchParams = useSearchParams()
  const initialCohortId = searchParams.get("cohortId") || "all"
  const initialMilestoneId = searchParams.get("milestoneId")

  const [token, setToken] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])
  const [stats, setStats] = useState<MilestoneStats>(emptyStats)
  const [cohorts, setCohorts] = useState<CohortOption[]>([])
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(initialMilestoneId)
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cohortFilter, setCohortFilter] = useState(initialCohortId)
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)
  const [milestoneForm, setMilestoneForm] = useState<MilestoneFormState>(emptyMilestoneForm)
  const [submissionEditor, setSubmissionEditor] = useState<SubmissionEditorState | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const fetchMilestones = useCallback(async () => {
    if (!token) {
      return
    }

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
      setCohorts(data.cohorts || [])

      if (selectedMilestoneId && !data.milestones?.some((milestone) => milestone.id === selectedMilestoneId)) {
        setSelectedMilestoneId(null)
        setSelectedMilestone(null)
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "فشل في جلب بيانات المراحل")
      setMilestones([])
      setStats(emptyStats)
      setCohorts([])
    } finally {
      setLoading(false)
    }
  }, [apiBase, selectedMilestoneId, token])

  const fetchMilestoneDetail = useCallback(async () => {
    if (!token || !selectedMilestoneId) {
      setSelectedMilestone(null)
      return
    }

    setDetailLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiBase}/${selectedMilestoneId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data: { milestone?: MilestoneDetail; error?: string } = await response.json()
      if (!response.ok || !data.milestone) {
        throw new Error(data.error || "Failed to fetch milestone detail")
      }

      setSelectedMilestone(data.milestone)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "فشل في جلب تفاصيل المرحلة")
      setSelectedMilestone(null)
    } finally {
      setDetailLoading(false)
    }
  }, [apiBase, selectedMilestoneId, token])

  useEffect(() => {
    fetchMilestones()
  }, [fetchMilestones])

  useEffect(() => {
    fetchMilestoneDetail()
  }, [fetchMilestoneDetail])

  const filteredMilestones = useMemo(() => {
    return milestones.filter((milestone) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        query.length === 0 ||
        milestone.title.toLowerCase().includes(query) ||
        milestone.description.toLowerCase().includes(query) ||
        milestone.cohortName.toLowerCase().includes(query) ||
        (milestone.programName || "").toLowerCase().includes(query)

      const matchesCohort = cohortFilter === "all" || milestone.cohortId === cohortFilter

      if (activeTab === "all") {
        return matchesSearch && matchesCohort
      }

      return matchesSearch && matchesCohort && milestone.status === activeTab
    })
  }, [activeTab, cohortFilter, milestones, searchQuery])

  const openCreateDialog = () => {
    setMilestoneForm({
      ...emptyMilestoneForm,
      cohortId: cohortFilter !== "all" ? cohortFilter : cohorts[0]?.id || "",
    })
    setMilestoneDialogOpen(true)
  }

  const openEditDialog = (milestone: MilestoneItem | MilestoneDetail) => {
    setMilestoneForm({
      id: milestone.id,
      cohortId: milestone.cohortId,
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate.slice(0, 10),
      category: milestone.category,
      priority: milestone.priority,
      progress: String(milestone.progress),
      status: milestone.status,
    })
    setMilestoneDialogOpen(true)
  }

  const resetDialog = () => {
    setMilestoneDialogOpen(false)
    setMilestoneForm(emptyMilestoneForm)
  }

  const handleSaveMilestone = async () => {
    if (!token) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        cohortId: milestoneForm.cohortId,
        title: milestoneForm.title.trim(),
        description: milestoneForm.description.trim(),
        dueDate: milestoneForm.dueDate,
        category: milestoneForm.category,
        priority: milestoneForm.priority,
        progress: clampProgress(milestoneForm.progress),
        status: milestoneForm.status,
      }

      const response = await fetch(
        milestoneForm.id ? `${apiBase}/${milestoneForm.id}` : apiBase,
        {
          method: milestoneForm.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to save milestone")
      }

      resetDialog()
      const savedMilestoneId = data.milestone?.id || milestoneForm.id
      await fetchMilestones()
      if (savedMilestoneId) {
        setSelectedMilestoneId(savedMilestoneId)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل في حفظ المرحلة")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!token || !window.confirm("سيتم حذف هذه المرحلة وكل عمليات التسليم المرتبطة بها. هل تريد المتابعة؟")) {
      return
    }

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

      if (selectedMilestoneId === milestoneId) {
        setSelectedMilestoneId(null)
        setSelectedMilestone(null)
      }

      await fetchMilestones()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل في حذف المرحلة")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveSubmission = async () => {
    if (!token || !submissionEditor) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `${apiBase}/${submissionEditor.milestoneId}/submissions/${submissionEditor.submissionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: submissionEditor.message }),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update submission")
      }

      setSubmissionEditor(null)
      await fetchMilestones()
      await fetchMilestoneDetail()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل في تعديل التسليم")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReopenSubmission = async (milestoneId: string, submissionId: string) => {
    if (!token) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${apiBase}/${milestoneId}/submissions/${submissionId}/reopen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to reopen submission")
      }

      await fetchMilestones()
      await fetchMilestoneDetail()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "فشل في إعادة فتح التسليم")
    } finally {
      setSubmitting(false)
    }
  }

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

  const getSubmissionStatusText = (status: SubmissionStatus) => {
    switch (status) {
      case "SUBMITTED":
        return "تم التسليم"
      case "REOPENED":
        return "مفتوح لإعادة التسليم"
      case "SUPERSEDED":
        return "إصدار سابق"
      case "NOT_SUBMITTED":
        return "بانتظار التسليم"
      default:
        return "غير معروف"
    }
  }

  const getSubmissionStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-green-100 text-green-800"
      case "REOPENED":
        return "bg-amber-100 text-amber-800"
      case "SUPERSEDED":
        return "bg-slate-100 text-slate-700"
      case "NOT_SUBMITTED":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
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

  const getCategoryText = (category: string) => {
    switch (category) {
      case "product":
        return "المنتج"
      case "business":
        return "الأعمال"
      case "funding":
        return "التمويل"
      case "team":
        return "الفريق"
      default:
        return "أخرى"
    }
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const formatFileSize = (size: number | null) => {
    if (!size) return ""
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!token) {
    return <div className="py-8 text-center">يجب تسجيل الدخول أولاً</div>
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Button className="flex items-center gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          <span>إضافة مرحلة جديدة</span>
        </Button>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader dir="rtl" className="justify-start">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>إدارة مراحل الدفعات</CardTitle>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:w-72">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    placeholder="ابحث في المراحل والدفعات"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>

                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:w-64"
                  value={cohortFilter}
                  onChange={(event) => setCohortFilter(event.target.value)}
                >
                  <option value="all">كل الدفعات</option>
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name}
                      {cohort.programName ? ` - ${cohort.programName}` : ""}
                    </option>
                  ))}
                </select>
              </div>
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
              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                لا توجد مراحل مطابقة للفلاتر الحالية
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMilestones.map((milestone) => (
                  <button
                    key={milestone.id}
                    type="button"
                    className={`w-full rounded-lg border p-4 text-right transition ${
                      selectedMilestoneId === milestone.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/40"
                    }`}
                    onClick={() => setSelectedMilestoneId(milestone.id)}
                  >
                    <div className="flex items-start justify-between gap-4" dir="rtl">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-start gap-2">
                          <h3 className="text-lg font-semibold">{milestone.title}</h3>
                          <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(milestone.status)}`}>
                            {getStatusText(milestone.status)}
                          </span>
                          <span className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(milestone.priority)}`}>
                            {getPriorityText(milestone.priority)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-3">
                          <div className="flex items-center justify-start gap-2">
                            <Users className="h-4 w-4" />
                            <span>{milestone.cohortName}</span>
                          </div>
                          <div className="flex items-center justify-start gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(milestone.dueDate)}</span>
                          </div>
                          <div className="flex items-center justify-start gap-2">
                            <Target className="h-4 w-4" />
                            <span>{getCategoryText(milestone.category)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">تغطية التسليم داخل الدفعة</span>
                            <span>{milestone.submittedStartups}/{milestone.totalStartups}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: milestone.totalStartups
                                  ? `${Math.round((milestone.submittedStartups / milestone.totalStartups) * 100)}%`
                                  : "0%",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            openEditDialog(milestone)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteMilestone(milestone.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader dir="rtl" className="justify-start">
            <CardTitle>تفاصيل المرحلة</CardTitle>
          </CardHeader>
          <CardContent>
            {detailLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !selectedMilestone ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                اختر مرحلة من القائمة لعرض تفاصيلها
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(selectedMilestone)}>
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل المرحلة
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMilestone(selectedMilestone.id)}
                      >
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(selectedMilestone.status)}`}>
                          {getStatusText(selectedMilestone.status)}
                        </span>
                        <CardTitle>{selectedMilestone.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        {selectedMilestone.cohortName}
                        {selectedMilestone.programName ? ` - ${selectedMilestone.programName}` : ""}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-3 text-right">
                      <div className="text-xs text-muted-foreground">تاريخ الاستحقاق</div>
                      <div className="mt-1 font-medium">{formatDate(selectedMilestone.dueDate)}</div>
                    </div>
                    <div className="rounded-lg border p-3 text-right">
                      <div className="text-xs text-muted-foreground">الفئة</div>
                      <div className="mt-1 font-medium">{getCategoryText(selectedMilestone.category)}</div>
                    </div>
                    <div className="rounded-lg border p-3 text-right">
                      <div className="text-xs text-muted-foreground">الأولوية</div>
                      <div className="mt-1 font-medium">{getPriorityText(selectedMilestone.priority)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{selectedMilestone.progress}%</span>
                      <span className="text-muted-foreground">تقدم المرحلة</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${selectedMilestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{selectedMilestone.totalStartups}</div>
                    <div className="text-sm text-muted-foreground">شركات الدفعة</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedMilestone.submittedStartups}</div>
                    <div className="text-sm text-muted-foreground">تم التسليم</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">{selectedMilestone.pendingStartups}</div>
                    <div className="text-sm text-muted-foreground">بانتظار التسليم</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedMilestone.startups.map((startup) => {
                    const latestSubmission = startup.latestSubmission

                    return (
                      <div key={startup.startupId} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {latestSubmission ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSubmissionEditor({
                                      milestoneId: selectedMilestone.id,
                                      submissionId: latestSubmission.id,
                                      startupName: startup.startupName,
                                      message: latestSubmission.message || "",
                                    })
                                  }
                                >
                                  <Edit className="ml-2 h-4 w-4" />
                                  تعديل الرد
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={latestSubmission.status === "REOPENED" || submitting}
                                  onClick={() =>
                                    handleReopenSubmission(selectedMilestone.id, latestSubmission.id)
                                  }
                                >
                                  <RefreshCcw className="ml-2 h-4 w-4" />
                                  السماح بإعادة التسليم
                                </Button>
                              </>
                            ) : null}
                          </div>

                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${getSubmissionStatusColor(
                                  latestSubmission?.status || "NOT_SUBMITTED"
                                )}`}
                              >
                                {getSubmissionStatusText(latestSubmission?.status || "NOT_SUBMITTED")}
                              </span>
                              <h4 className="font-semibold">{startup.startupName}</h4>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {latestSubmission
                                ? `آخر تسليم: ${formatDateTime(latestSubmission.createdAt)}`
                                : "لم يتم إرسال أي تسليم لهذا المعلَم بعد"}
                            </p>
                          </div>
                        </div>

                        {latestSubmission ? (
                          <div className="mt-4 space-y-3">
                            <div className="rounded-md bg-muted/40 p-3">
                              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                <span>الإصدار #{latestSubmission.submissionNumber}</span>
                                <span>{latestSubmission.submitterName || "مستخدم الشركة"}</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {latestSubmission.message || "لا توجد ملاحظة نصية في هذا التسليم."}
                              </p>
                            </div>

                            {latestSubmission.attachments.length > 0 ? (
                              <div className="space-y-2">
                                {latestSubmission.attachments.map((attachment) => (
                                  <a
                                    key={attachment.id}
                                    href={attachment.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/30"
                                  >
                                    <span className="text-muted-foreground">{formatFileSize(attachment.fileSize)}</span>
                                    <span className="inline-flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      {attachment.fileName}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            ) : null}

                            {startup.submissionHistory.length > 1 ? (
                              <div className="rounded-md border border-dashed p-3">
                                <div className="mb-2 text-sm font-medium">سجل التسليمات السابقة</div>
                                <div className="space-y-2">
                                  {startup.submissionHistory.slice(1).map((submission) => (
                                    <div
                                      key={submission.id}
                                      className="flex items-center justify-between text-sm text-muted-foreground"
                                    >
                                      <span
                                        className={`rounded-full px-2 py-1 text-xs ${getSubmissionStatusColor(
                                          submission.status
                                        )}`}
                                      >
                                        {getSubmissionStatusText(submission.status)}
                                      </span>
                                      <span>
                                        الإصدار #{submission.submissionNumber} - {formatDateTime(submission.createdAt)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                            هذه الشركة ترى المرحلة لأنها ضمن الدفعة، لكن لا يوجد أي تسليم حتى الآن.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{milestoneForm.id ? "تعديل المرحلة" : "إنشاء مرحلة جديدة"}</DialogTitle>
            <DialogDescription>
              كل شركة نشطة داخل الدفعة سترى هذه المرحلة وتستطيع إرسال تسليم واحد لكل دورة فتح.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cohortId">الدفعة</Label>
              <select
                id="cohortId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={milestoneForm.cohortId}
                onChange={(event) =>
                  setMilestoneForm((current) => ({ ...current, cohortId: event.target.value }))
                }
              >
                <option value="">اختر دفعة</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>
                    {cohort.name}
                    {cohort.programName ? ` - ${cohort.programName}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={milestoneForm.title}
                onChange={(event) =>
                  setMilestoneForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                rows={4}
                value={milestoneForm.description}
                onChange={(event) =>
                  setMilestoneForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({ ...current, dueDate: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">نسبة التقدم</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={milestoneForm.progress}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({ ...current, progress: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={milestoneForm.category}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({ ...current, category: event.target.value }))
                  }
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
                  value={milestoneForm.priority}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({ ...current, priority: event.target.value }))
                  }
                >
                  <option value="high">عالية</option>
                  <option value="medium">متوسطة</option>
                  <option value="low">منخفضة</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={milestoneForm.status}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({
                      ...current,
                      status: event.target.value as MilestoneStatus,
                    }))
                  }
                >
                  <option value="upcoming">قادمة</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتملة</option>
                  <option value="overdue">متأخرة</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={resetDialog}>
              إلغاء
            </Button>
            <Button
              disabled={
                submitting ||
                !milestoneForm.cohortId ||
                !milestoneForm.title.trim() ||
                !milestoneForm.description.trim() ||
                !milestoneForm.dueDate
              }
              onClick={handleSaveMilestone}
            >
              {submitting ? "جاري الحفظ..." : milestoneForm.id ? "حفظ التعديلات" : "إنشاء المرحلة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(submissionEditor)} onOpenChange={(open) => !open && setSubmissionEditor(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل تسليم الشركة</DialogTitle>
            <DialogDescription>
              تعديل ملاحظات تسليم {submissionEditor?.startupName || "الشركة"} بدون السماح بتقديم جديد.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="submission-message">نص التسليم</Label>
            <Textarea
              id="submission-message"
              rows={6}
              value={submissionEditor?.message || ""}
              onChange={(event) =>
                setSubmissionEditor((current) =>
                  current
                    ? {
                        ...current,
                        message: event.target.value,
                      }
                    : null
                )
              }
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSubmissionEditor(null)}>
              إلغاء
            </Button>
            <Button disabled={submitting || !submissionEditor} onClick={handleSaveSubmission}>
              {submitting ? "جاري الحفظ..." : "حفظ الرد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
