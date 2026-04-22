"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showAdminToast } from "@/components/admin/admin-toaster"
import {
  ArrowLeft,
  Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
  BarChart3
} from "lucide-react"

interface Cohort {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  status: string
  capacity: number | null
  manager: { id: string; name: string; email: string }
  stats: { membersCount: number; mentorsCount: number }
}

interface Statistics {
  total: number
  upcoming: number
  active: number
  completed: number
}

export default function CohortsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [programName, setProgramName] = useState<string>("")

  useEffect(() => {
    // Token is now in HTTP-only cookie, credentials: "include" sends it automatically
    const storedToken = null; // Cookie-based auth - no localStorage token needed
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    fetchCohorts();
  }, [params.id, page, searchQuery, statusFilter]);

  const fetchCohorts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        programId: params.id
      });

      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter) queryParams.append('status', statusFilter);

      const response = await fetch(`/api/admin/cohorts?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCohorts(data.cohorts);
        setStatistics(data.statistics);
        setTotalPages(data.pagination.totalPages);
        if (data.cohorts.length > 0 && !programName) {
          setProgramName(data.cohorts[0].program?.name || "");
        }
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      showAdminToast({ title: "خطأ", description: "فشل في جلب الدفعات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cohortId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدفعة؟')) return;

    try {
      const response = await fetch(`/api/admin/cohorts/${cohortId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showAdminToast({ title: "تم بنجاح", description: "تم حذف الدفعة" });
        fetchCohorts();
      } else {
        throw new Error('Failed to delete');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showAdminToast({ title: "خطأ", description: "فشل في حذف الدفعة", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING': return <Badge variant="outline">قادم</Badge>;
      case 'ACTIVE': return <Badge className="bg-green-500">نشط</Badge>;
      case 'COMPLETED': return <Badge variant="secondary">مكتمل</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCohorts = cohorts.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin-dashboard/programs/${params.id}`)}>
            <ArrowLeft className="h-4 w-4 ml-2" /> رجوع للبرنامج
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة الدفعات</h1>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الدفعات</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
              <BarChart3 className="h-4 w-4 text-muted-foreground mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">الدفعات القادمة</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.upcoming}</div>
              <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">الدفعات النشطة</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{statistics.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">المكتملة</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="default" onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/new`)}>
          <Plus className="h-4 w-4 ml-2" /> إضافة دفعة جديدة
        </Button>
        <input
          type="text"
          placeholder="البحث عن دفعة..."
          className="px-4 py-2 border rounded-md w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الدفعات ({filteredCohorts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center"><RefreshCw className="h-8 w-8 animate-spin mx-auto" /></div>
          ) : filteredCohorts.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>لا توجد دفعات</p>
              <Button variant="link" onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/new`)}>
                إضافة دفعة جديدة
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="grid grid-cols-7 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div>الإجراءات</div>
                <div>الحالة</div>
                <div>المرشدين</div>
                <div>الشركات</div>
                <div>تاريخ الانتهاء</div>
                <div>تاريخ البدء</div>
                <div>اسم الدفعة</div>
              </div>
              {filteredCohorts.map(cohort => (
                <div key={cohort.id} className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/${cohort.id}`)} className="text-blue-500 hover:text-blue-700"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/${cohort.id}/edit`)} className="text-amber-500 hover:text-amber-700"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(cohort.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div>{getStatusBadge(cohort.status)}</div>
                  <div>{cohort.stats?.mentorsCount || 0}</div>
                  <div>{cohort.stats?.membersCount || 0}</div>
                  <div>{cohort.endDate ? new Date(cohort.endDate).toLocaleDateString('ar-SA') : '-'}</div>
                  <div>{cohort.startDate ? new Date(cohort.startDate).toLocaleDateString('ar-SA') : '-'}</div>
                  <div className="font-medium cursor-pointer hover:text-primary" onClick={() => router.push(`/admin-dashboard/programs/${params.id}/cohorts/${cohort.id}`)}>{cohort.name}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
        <span>صفحة {page} من {totalPages}</span>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>التالي</Button>
      </div>
    </div>
  );
}
