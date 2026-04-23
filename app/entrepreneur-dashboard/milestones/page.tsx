"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

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

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  status: MilestoneStatus
  progress: number
  category: string
  priority: string
  cohortId: string
  cohortName: string
  programName: string | null
  submissionStatus: SubmissionStatus
  canSubmit: boolean
  latestSubmission: MilestoneSubmission | null
}

export default function MilestonesPage() {
  const { token } = useAuth()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [submissions, setSubmissions] = useState<MilestoneSubmission[]>([])
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [canSubmitResponse, setCanSubmitResponse] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState("")
  const [responseFiles, setResponseFiles] = useState<File[]>([])

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const response = await fetch("/api/startups", {
        })

        if (!response.ok) {
          throw new Error("فشل في جلب بيانات الشركة")
        }

        const data = await response.json()
        if (data.companies?.length > 0) {
          setCompanyId(data.companies[0].id)
          setCompanyName(data.companies[0].name)
        } else {
          setError("لم يتم العثور على شركة لهذا المستخدم.")
          setLoading(false)
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "حدث خطأ أثناء جلب بيانات الشركة.")
        setLoading(false)
      }
    }

    fetchCompanyId()
  }, [token])

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!companyId) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/milestones?startupId=${companyId}`, {
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "فشل في جلب بيانات المراحل")
        }

        const nextMilestones = data.milestones || []
        setMilestones(nextMilestones)

        if (nextMilestones.length > 0) {
          setSelectedMilestoneId((current) =>
            current && nextMilestones.some((milestone: Milestone) => milestone.id === current)
              ? current
              : nextMilestones[0].id
          )
        } else {
          setSelectedMilestoneId(null)
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "حدث خطأ أثناء جلب بيانات المراحل.")
      } finally {
        setLoading(false)
      }
    }

    fetchMilestones()
  }, [token, companyId])

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!companyId || !selectedMilestoneId) return

      setSubmissionsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/milestones/${selectedMilestoneId}/submissions?startupId=${companyId}`,
          {
          }
        )

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "فشل في جلب عمليات التسليم")
        }

        setSubmissions(data.submissions || [])
        setCanSubmitResponse(Boolean(data.canSubmit))
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "حدث خطأ أثناء جلب عمليات التسليم.")
        setSubmissions([])
        setCanSubmitResponse(false)
      } finally {
        setSubmissionsLoading(false)
      }
    }

    fetchSubmissions()
  }, [token, companyId, selectedMilestoneId])

  const filteredMilestones = useMemo(() => {
    return milestones.filter((milestone) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        query.length === 0 ||
        milestone.title.toLowerCase().includes(query) ||
        milestone.description.toLowerCase().includes(query) ||
        milestone.cohortName.toLowerCase().includes(query)

      if (activeTab === "all") {
        return matchesSearch
      }

      return matchesSearch && milestone.status === activeTab
    })
  }, [activeTab, milestones, searchQuery])

  const selectedMilestone =
    milestones.find((milestone) => milestone.id === selectedMilestoneId) || null

  const totalMilestones = milestones.length
  const submittedMilestones = milestones.filter(
    (milestone) => milestone.submissionStatus === "SUBMITTED"
  ).length
  const pendingSubmissions = milestones.filter(
    (milestone) =>
      milestone.submissionStatus === "NOT_SUBMITTED" || milestone.submissionStatus === "REOPENED"
  ).length
  const completionRate =
    totalMilestones > 0 ? Math.round((submittedMilestones / totalMilestones) * 100) : 0

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
        return "لم يتم التسليم"
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

  const refreshData = async () => {
    if (!companyId) return

    const milestoneResponse = await fetch(`/api/milestones?startupId=${companyId}`, {
    })
    const milestoneData = await milestoneResponse.json()
    if (milestoneResponse.ok) {
      setMilestones(milestoneData.milestones || [])
    }

    if (selectedMilestoneId) {
      const submissionsResponse = await fetch(
        `/api/milestones/${selectedMilestoneId}/submissions?startupId=${companyId}`,
        {
        }
      )
      const submissionData = await submissionsResponse.json()
      if (submissionsResponse.ok) {
        setSubmissions(submissionData.submissions || [])
        setCanSubmitResponse(Boolean(submissionData.canSubmit))
      }
    }
  }

  const handleSubmitResponse = async () => {
    if (!companyId || !selectedMilestoneId || (!responseMessage.trim() && responseFiles.length === 0)) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("startupId", companyId)
      formData.append("message", responseMessage)
      responseFiles.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch(`/api/milestones/${selectedMilestoneId}/submissions`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "فشل في إرسال التسليم")
      }

      setResponseMessage("")
      setResponseFiles([])
      await refreshData()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "حدث خطأ أثناء إرسال التسليم.")
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-3xl font-bold">مراحل الدفعة والتسليمات</h1>
            <p className="text-sm text-muted-foreground">
              ترى شركتك كل مراحل الدفعة الحالية. يمكنك إرسال تسليم واحد لكل مرحلة، ولا يفتح إرسال جديد إلا إذا أعاد مدير البرنامج أو المشرف فتحها.
            </p>
          </div>
        </div>

        {!loading && error && (
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
              <CardTitle className="text-sm font-medium">تم تسليمها</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedMilestones}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">بانتظار التسليم</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSubmissions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نسبة التغطية</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-72">
                  <Input
                    placeholder="ابحث في مراحل الدفعة"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <CardTitle>مراحل {companyName || "الشركة"}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="justify-end w-full overflow-x-auto">
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
                  لا توجد مراحل متاحة لهذه الدفعة بعد
                </div>
              ) : (
                <div className="space-y-3">
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
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${getSubmissionStatusColor(
                              milestone.submissionStatus
                            )}`}
                          >
                            {getSubmissionStatusText(milestone.submissionStatus)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(milestone.status)}`}>
                              {getStatusText(milestone.status)}
                            </span>
                            <h3 className="font-semibold">{milestone.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                            <span>{milestone.cohortName}</span>
                            <span>•</span>
                            <span>{formatDate(milestone.dueDate)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المرحلة</CardTitle>
              <CardDescription>
                التسليم هنا يخص شركتك فقط، لكن المرحلة نفسها مشتركة لكل شركات الدفعة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : !selectedMilestone ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                  اختر مرحلة من القائمة لعرض التفاصيل والتسليم
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getSubmissionStatusColor(
                          selectedMilestone.submissionStatus
                        )}`}
                      >
                        {getSubmissionStatusText(selectedMilestone.submissionStatus)}
                      </span>
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

                    <p className="text-sm text-muted-foreground">{selectedMilestone.description}</p>

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
                        <div className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs ${getPriorityColor(selectedMilestone.priority)}`}>
                          {getPriorityText(selectedMilestone.priority)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{selectedMilestone.progress}%</span>
                        <span className="text-muted-foreground">تقدم المرحلة على مستوى الدفعة</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${selectedMilestone.progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>تسليم الشركة</CardTitle>
                      <CardDescription>
                        يُسمح بتسليم واحد فقط لكل مرحلة. إذا أُعيد فتح المرحلة لك ستظهر الاستمارة مرة أخرى.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {canSubmitResponse ? (
                        <>
                          <Textarea
                            rows={5}
                            placeholder="اكتب تحديثك أو ملاحظاتك على هذه المرحلة"
                            value={responseMessage}
                            onChange={(event) => setResponseMessage(event.target.value)}
                          />
                          <div className="space-y-2">
                            <label className="text-sm font-medium">ملفات مرفقة</label>
                            <Input
                              type="file"
                              multiple
                              onChange={(event) =>
                                setResponseFiles(Array.from(event.target.files || []))
                              }
                            />
                            {responseFiles.length > 0 ? (
                              <div className="space-y-1 text-sm text-muted-foreground">
                                {responseFiles.map((file) => (
                                  <div key={`${file.name}-${file.size}`}>{file.name}</div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              disabled={submitting || (!responseMessage.trim() && responseFiles.length === 0)}
                              onClick={handleSubmitResponse}
                            >
                              <Upload className="ml-2 h-4 w-4" />
                              {submitting ? "جاري الإرسال..." : "إرسال التسليم"}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          تم إغلاق التسليم لهذه المرحلة بعد إرسال شركتك. أي تعديل أو فرصة لتسليم جديد يجب أن تأتي من مدير البرنامج أو المشرف.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>سجل التسليمات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {submissionsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : submissions.length === 0 ? (
                        <div className="py-4 text-center text-muted-foreground">لا توجد أي تسليمات مرفوعة بعد</div>
                      ) : (
                        <div className="space-y-4">
                          {submissions.map((submission) => (
                            <div key={submission.id} className="rounded-lg border p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs ${getSubmissionStatusColor(
                                      submission.status
                                    )}`}
                                  >
                                    {getSubmissionStatusText(submission.status)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">الإصدار #{submission.submissionNumber}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDateTime(submission.createdAt)}
                                  </div>
                                </div>
                              </div>

                              {submission.message ? (
                                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                  {submission.message}
                                </p>
                              ) : null}

                              {submission.attachments.length > 0 ? (
                                <div className="mt-3 space-y-2">
                                  {submission.attachments.map((attachment) => (
                                    <a
                                      key={attachment.id}
                                      href={attachment.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
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
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RouteGuard>
  )
}
