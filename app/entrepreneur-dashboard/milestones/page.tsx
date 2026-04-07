"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

type MilestoneStatus = "completed" | "in_progress" | "upcoming" | "overdue"

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  status: MilestoneStatus
  progress: number
  category: string
  priority: string
  startupId: string
  startupName: string
  cohortName: string | null
}

interface MilestoneResponse {
  id: string
  message: string | null
  fileName: string | null
  fileUrl: string | null
  fileType: string | null
  fileSize: number | null
  createdAt: string
  submitter: {
    id: string
    name: string
    email: string
  }
}

export default function MilestonesPage() {
  const { token } = useAuth()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [responses, setResponses] = useState<MilestoneResponse[]>([])
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(false)
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState("")
  const [responseFile, setResponseFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!token) return

      try {
        const response = await fetch("/api/startups", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("فشل في جلب بيانات الشركة")
        }

        const data = await response.json()
        if (data.companies?.length > 0) {
          setCompanyId(data.companies[0].id)
        } else {
          setError("لم يتم العثور على شركة لهذا المستخدم.")
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "حدث خطأ أثناء جلب بيانات الشركة.")
      }
    }

    fetchCompanyId()
  }, [token])

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!token || !companyId) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/milestones?startupId=${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "فشل في جلب بيانات المراحل")
        }

        setMilestones(data.milestones || [])
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "حدث خطأ أثناء جلب بيانات المراحل.")
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
  }, [token, companyId])

  useEffect(() => {
    const fetchResponses = async () => {
      if (!token || !selectedMilestoneId) return

      setResponsesLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/milestones/${selectedMilestoneId}/responses`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "فشل في جلب الردود")
        }

        setResponses(data.responses || [])
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "حدث خطأ أثناء جلب الردود.")
      } finally {
        setResponsesLoading(false)
      }
    }

    fetchResponses()
  }, [token, selectedMilestoneId])

  const filteredMilestones = useMemo(() => {
    return milestones.filter((milestone) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        query.length === 0 ||
        milestone.title.toLowerCase().includes(query) ||
        milestone.description.toLowerCase().includes(query)

      if (activeTab === "all") {
        return matchesSearch
      }

      return matchesSearch && milestone.status === activeTab
    })
  }, [activeTab, milestones, searchQuery])

  const selectedMilestone =
    milestones.find((milestone) => milestone.id === selectedMilestoneId) || null

  const totalMilestones = milestones.length
  const completedMilestones = milestones.filter((milestone) => milestone.status === "completed").length
  const inProgressMilestones = milestones.filter((milestone) => milestone.status === "in_progress").length
  const completionRate =
    totalMilestones > 0
      ? Math.round(milestones.reduce((sum, milestone) => sum + milestone.progress, 0) / totalMilestones)
      : 0

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

  const formatFileSize = (size: number | null) => {
    if (!size) return ""
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleSubmitResponse = async () => {
    if (!token || !selectedMilestoneId || (!responseMessage.trim() && !responseFile)) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("message", responseMessage)
      if (responseFile) {
        formData.append("file", responseFile)
      }

      const response = await fetch(`/api/milestones/${selectedMilestoneId}/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "فشل في إرسال الرد")
      }

      setResponses((current) => [data.response, ...current])
      setResponseMessage("")
      setResponseFile(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "حدث خطأ أثناء إرسال الرد.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RouteGuard
      requiredPermission={{ category: "startups", action: "view" }}
      requiredRole={UserRole.ENTREPRENEUR}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-3xl font-bold">المراحل والتقدم</h1>
            <p className="text-sm text-muted-foreground">
              هذه المراحل يحددها مدير البرنامج، ويمكنك الرد عليها بتحديثات وملفات داعمة.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المراحل</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMilestones}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المراحل المكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedMilestones}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressMilestones}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط الإنجاز</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-72">
                <Input
                  placeholder="ابحث في المراحل"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <CardTitle>المراحل المكلّف بها</CardTitle>
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
            ) : selectedMilestone ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Button variant="outline" size="sm" onClick={() => setSelectedMilestoneId(null)}>
                      العودة للقائمة
                    </Button>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(selectedMilestone.status)}`}>
                          {getStatusText(selectedMilestone.status)}
                        </span>
                        <CardTitle>{selectedMilestone.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-2">
                        {getCategoryText(selectedMilestone.category)}
                        <span className={`mr-2 rounded-full px-2 py-1 text-xs ${getPriorityColor(selectedMilestone.priority)}`}>
                          {getPriorityText(selectedMilestone.priority)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">وصف المرحلة</h3>
                    <p className="text-muted-foreground">{selectedMilestone.description}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">الشركة</div>
                      <div className="text-sm text-muted-foreground">{selectedMilestone.startupName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">تاريخ الاستحقاق</div>
                      <div className="text-sm text-muted-foreground">{formatDate(selectedMilestone.dueDate)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{selectedMilestone.progress}%</span>
                      <span className="text-muted-foreground">نسبة الإنجاز الحالية</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          selectedMilestone.status === "completed"
                            ? "bg-green-500"
                            : selectedMilestone.status === "overdue"
                            ? "bg-red-500"
                            : selectedMilestone.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${selectedMilestone.progress}%` }}
                      />
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>إرسال رد أو مستند</CardTitle>
                      <CardDescription>
                        أرسل تحديثًا نصيًا وارفِق ملفًا إن لزم ليراجعه مدير البرنامج.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        rows={4}
                        placeholder="اكتب تحديثك أو ردك على هذه المرحلة"
                        value={responseMessage}
                        onChange={(event) => setResponseMessage(event.target.value)}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ملف مرفق</label>
                        <Input
                          type="file"
                          onChange={(event) => setResponseFile(event.target.files?.[0] || null)}
                        />
                        {responseFile && (
                          <p className="text-sm text-muted-foreground">{responseFile.name}</p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          disabled={submitting || (!responseMessage.trim() && !responseFile)}
                          onClick={handleSubmitResponse}
                        >
                          {submitting ? "جاري الإرسال..." : "إرسال الرد"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>الردود السابقة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {responsesLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : responses.length === 0 ? (
                        <div className="py-4 text-center text-muted-foreground">لا توجد ردود مرفوعة بعد</div>
                      ) : (
                        <div className="space-y-4">
                          {responses.map((response) => (
                            <div key={response.id} className="rounded-lg border p-4">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(response.createdAt)}
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{response.submitter.name}</div>
                                  <div className="text-sm text-muted-foreground">{response.submitter.email}</div>
                                </div>
                              </div>

                              {response.message && (
                                <p className="mt-3 text-sm text-muted-foreground">{response.message}</p>
                              )}

                              {response.fileUrl && (
                                <div className="mt-3 flex items-center justify-between rounded-md bg-muted px-3 py-2">
                                  <a
                                    href={response.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm"
                                  >
                                    <Download className="h-4 w-4" />
                                    تنزيل الملف
                                  </a>
                                  <div className="text-right text-sm">
                                    <div>{response.fileName}</div>
                                    <div className="text-muted-foreground">{formatFileSize(response.fileSize)}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            ) : filteredMilestones.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">لا توجد مراحل مطابقة</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredMilestones.map((milestone) => (
                  <Card key={milestone.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(milestone.status)}`}>
                            {getStatusText(milestone.status)}
                          </span>
                          <span className={`rounded-full px-2 py-1 text-xs ${getPriorityColor(milestone.priority)}`}>
                            {getPriorityText(milestone.priority)}
                          </span>
                        </div>
                        <div className="text-right">
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          <CardDescription className="mt-1">{getCategoryText(milestone.category)}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{milestone.description}</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{milestone.progress}%</span>
                          <span className="text-muted-foreground">
                            تاريخ الاستحقاق: {formatDate(milestone.dueDate)}
                          </span>
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
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => setSelectedMilestoneId(milestone.id)}>
                          عرض التفاصيل والرد
                          <ArrowRight className="mr-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
