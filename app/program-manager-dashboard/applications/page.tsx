"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText,
  Loader2
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

interface Application {
  id: string
  companyName: string
  industry: string
  program: string
  submissionDate: string
  status: string
  teamSize: number
  stage: string
  cohortId: string | null
  founder: {
    name: string
    email: string
  }
}

interface ApplicationStats {
  pendingCount: number
  activeCount: number
  rejectedCount: number
  totalCount: number
}

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    pendingCount: 0,
    activeCount: 0,
    rejectedCount: 0,
    totalCount: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/program-manager/applications`);

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();

        const mappedApplications = data.applications.map((app: any) => ({
          id: app.id,
          companyName: app.companyName,
          industry: app.industry,
          program: app.program,
          submissionDate: new Date(app.submissionDate).toLocaleDateString('ar-SA'),
          status: app.status === "PENDING" ? "pending" :
                 app.status === "ACTIVE" ? "approved" :
                 app.status === "REJECTED" ? "rejected" : "pending",
          teamSize: app.teamSize || 0,
          stage: app.stage || "بذرة",
          cohortId: app.cohortId,
          founder: app.founder
        }));

        setApplications(mappedApplications);
        setStats({
          pendingCount: data.stats.pendingCount,
          activeCount: data.stats.activeCount,
          rejectedCount: data.stats.rejectedCount,
          totalCount: data.stats.totalCount
        });
      } catch (error) {
        console.error('Error fetching applications:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات الطلبات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const apiStatus = newStatus === "approved" ? "ACTIVE" :
                        newStatus === "rejected" ? "REJECTED" : "PENDING";

      const response = await fetch(`/api/program-manager/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: apiStatus,
          cohortId: applications.find(app => app.id === applicationId)?.cohortId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      setApplications(prevApplications =>
        prevApplications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      if (newStatus === "approved") {
        setStats(prev => ({
          ...prev,
          pendingCount: prev.pendingCount - 1,
          activeCount: prev.activeCount + 1
        }));
      } else if (newStatus === "rejected") {
        setStats(prev => ({
          ...prev,
          pendingCount: prev.pendingCount - 1,
          rejectedCount: prev.rejectedCount + 1
        }));
      }

      showAdminToast({
        title: "تم بنجاح",
        description: "تم تحديث حالة الطلب بنجاح"
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive"
      });
    }
  };

  const filteredApplications = applications.filter((app: Application) => {
    const matchesSearch = app.companyName.includes(searchQuery) ||
                          app.industry.includes(searchQuery) ||
                          app.program.includes(searchQuery)

    if (activeTab === "all") return matchesSearch
    if (activeTab === "pending") return matchesSearch && app.status === "pending"
    if (activeTab === "approved") return matchesSearch && app.status === "approved"
    if (activeTab === "rejected") return matchesSearch && app.status === "rejected"

    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800"
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "قيد الانتظار"
      case "approved": return "مقبول"
      case "rejected": return "مرفوض"
      default: return "غير معروف"
    }
  }

  const renderApplicationCard = (application: Application) => (
    <div key={application.id} className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(application.status)}`}>
            {getStatusText(application.status)}
          </div>
          <h3 className="font-bold text-lg">{application.companyName}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">المجال</div>
            <div className="font-medium">{application.industry}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">البرنامج</div>
            <div className="font-medium">{application.program}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
            <div className="font-medium">{application.submissionDate}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">حجم الفريق</div>
            <div className="font-medium">{application.teamSize} أعضاء</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">المرحلة</div>
            <div className="font-medium">{application.stage}</div>
          </div>
        </div>
        {application.founder && (
          <div className="mb-4 text-sm text-muted-foreground">
            المؤسس: {application.founder.name} — {application.founder.email}
          </div>
        )}
        {application.status === "pending" && (
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusUpdate(application.id, "rejected")}
            >
              رفض
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusUpdate(application.id, "approved")}
            >
              قبول
            </Button>
          </div>
        )}
        {(application.status === "approved" || application.status === "rejected") && (
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm">عرض التفاصيل</Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">مراجعة الطلبات</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>تصدير التقرير</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>تنزيل البيانات</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mr-2">جاري التحميل...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Clock className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
              <p className="text-muted-foreground">قيد الانتظار</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold">{stats.activeCount}</div>
              <p className="text-muted-foreground">مقبول</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <XCircle className="h-8 w-8 text-red-500 mb-2" />
              <div className="text-2xl font-bold">{stats.rejectedCount}</div>
              <p className="text-muted-foreground">مرفوض</p>
            </CardContent>
          </Card>
        </div>
      )}

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
            <CardTitle>طلبات الانضمام</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="rejected">مرفوض</TabsTrigger>
              <TabsTrigger value="approved">مقبول</TabsTrigger>
              <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map(renderApplicationCard)}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map(renderApplicationCard)}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map(renderApplicationCard)}
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map(renderApplicationCard)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
