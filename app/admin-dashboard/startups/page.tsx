"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle,
  Building,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Tag,
  Loader2
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { useRouter } from "next/navigation"
import { PermissionGate } from "@/hooks/usePermissions"

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  description: string
  status: string
  teamSize: number
  fundingNeeds: string | null
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
    accelerator: {
      name: string
      industry: string | null
      focusAreas: string | null
    } | null
  }
}

interface Statistics {
  total: number
  active: number
  pending: number
  rejected: number
  industries: { name: string; count: number }[]
  stages: { name: string; count: number }[]
  funding: {
    total: number
    average: number
  }
}

export default function StartupsManagement() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStartups, setSelectedStartups] = useState<string[]>([])
  const [startups, setStartups] = useState<Startup[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch startups from API
  const fetchStartups = async () => {
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      let queryParams = new URLSearchParams();
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      // Map tab to status filter
      if (activeTab === "active") {
        queryParams.append('status', 'APPROVED');
      } else if (activeTab === "pending") {
        queryParams.append('status', 'PENDING');
      } else if (activeTab === "rejected") {
        queryParams.append('status', 'REJECTED');
      }
      
      // Map tab to industry filter
      if (activeTab === "fintech") {
        queryParams.append('industry', 'التكنولوجيا المالية');
      } else if (activeTab === "healthtech") {
        queryParams.append('industry', 'التكنولوجيا الصحية');
      } else if (activeTab === "greentech") {
        queryParams.append('industry', 'التكنولوجيا الخضراء');
      }
      
      const response = await fetch(`/api/admin/startups?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch startups');
      }
      
      const data = await response.json();
      setStartups(data.startups);
      setStatistics(data.statistics);
      
      // Clear selected startups when fetching new data
      setSelectedStartups([]);
    } catch (err) {
      console.error('Error fetching startups:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      showAdminToast({
        title: "خطأ",
        description: "فشل في جلب بيانات الشركات الناشئة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchStartups();
    }
  }, [token, activeTab]);

  // Handle search
  const handleSearch = () => {
    fetchStartups();
  };

  // Handle export
  const handleExport = async () => {
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }
    
    setExportLoading(true);
    
    try {
      // Build query parameters for filtering
      let queryParams = new URLSearchParams();
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      // Map tab to status filter
      if (activeTab === "active") {
        queryParams.append('status', 'APPROVED');
      } else if (activeTab === "pending") {
        queryParams.append('status', 'PENDING');
      } else if (activeTab === "rejected") {
        queryParams.append('status', 'REJECTED');
      }
      
      // Map tab to industry filter
      if (activeTab === "fintech") {
        queryParams.append('industry', 'التكنولوجيا المالية');
      } else if (activeTab === "healthtech") {
        queryParams.append('industry', 'التكنولوجيا الصحية');
      } else if (activeTab === "greentech") {
        queryParams.append('industry', 'التكنولوجيا الخضراء');
      }
      
      // Create a temporary anchor element for file download
      const a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // Fetch the CSV data
      const response = await fetch(`/api/admin/startups/export?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export startups');
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Set up the download
      a.href = url;
      a.download = `startups-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showAdminToast({
        title: "تم بنجاح",
        description: "تم تصدير بيانات الشركات الناشئة بنجاح"
      });
    } catch (err) {
      console.error('Error exporting startups:', err);
      showAdminToast({
        title: "خطأ",
        description: err instanceof Error ? err.message : 'حدث خطأ أثناء تصدير البيانات',
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Toggle startup selection
  const toggleStartupSelection = (startupId: string) => {
    if (selectedStartups.includes(startupId)) {
      setSelectedStartups(selectedStartups.filter(id => id !== startupId));
    } else {
      setSelectedStartups([...selectedStartups, startupId]);
    }
  };

  // Select all startups
  const selectAllStartups = () => {
    if (selectedStartups.length === startups.length) {
      setSelectedStartups([]);
    } else {
      setSelectedStartups(startups.map(startup => startup.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, data?: any) => {
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    if (selectedStartups.length === 0) {
      showAdminToast({
        title: "تنبيه",
        description: "يرجى اختيار شركة ناشئة واحدة على الأقل",
        variant: "default"
      });
      return;
    }

    setBulkActionLoading(true);

    try {
      const response = await fetch('/api/admin/startups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startupIds: selectedStartups,
          action,
          data
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform bulk action');
      }

      const result = await response.json();
      
      showAdminToast({
        title: "تم بنجاح",
        description: `تم تنفيذ العملية على ${result.count} شركة ناشئة`
      });
      
      // Refresh startups
      fetchStartups();
    } catch (err) {
      console.error('Error performing bulk action:', err);
      showAdminToast({
        title: "خطأ",
        description: err instanceof Error ? err.message : 'حدث خطأ أثناء تنفيذ العملية',
        variant: "destructive"
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle delete startup
  const handleDeleteStartup = async (startupId: string) => {
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('هل أنت متأكد من حذف هذه الشركة الناشئة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/startups/${startupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete startup');
      }

      showAdminToast({
        title: "تم بنجاح",
        description: "تم حذف الشركة الناشئة بنجاح"
      });
      
      // Refresh startups
      fetchStartups();
    } catch (err) {
      console.error('Error deleting startup:', err);
      showAdminToast({
        title: "خطأ",
        description: err instanceof Error ? err.message : 'حدث خطأ أثناء حذف الشركة الناشئة',
        variant: "destructive"
      });
    }
  };

  // Handle view startup
  const handleViewStartup = (startupId: string) => {
    router.push(`/admin-dashboard/startups/${startupId}`);
  };

  // Handle edit startup
  const handleEditStartup = (startupId: string) => {
    router.push(`/admin-dashboard/startups/${startupId}/edit`);
  };

  // Handle add startup
  const handleAddStartup = () => {
    router.push('/admin-dashboard/startups/new');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Format funding
  const formatFunding = (funding: string | null) => {
    if (!funding) return 'غير محدد';
    return funding;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            نشط
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            معلق
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>يجب تسجيل الدخول أولاً</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleExport}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{exportLoading ? "جاري التصدير..." : "تصدير"}</span>
          </Button>
          <PermissionGate
            requirement={{ category: 'startups', action: 'add' }}
          >
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleAddStartup}
            >
              <Plus className="h-4 w-4" />
              <span>إضافة شركة ناشئة</span>
            </Button>
          </PermissionGate>
        </div>
        <h1 className="text-3xl font-bold">إدارة الشركات الناشئة</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن شركة ناشئة..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 md:grid-cols-7">
            <TabsTrigger value="greentech">التقنية الخضراء</TabsTrigger>
            <TabsTrigger value="healthtech">التقنية الصحية</TabsTrigger>
            <TabsTrigger value="fintech">التقنية المالية</TabsTrigger>
            <TabsTrigger value="rejected">مرفوضة</TabsTrigger>
            <TabsTrigger value="active">نشطة</TabsTrigger>
            <TabsTrigger value="pending">معلقة</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedStartups.length > 0 && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    disabled={bulkActionLoading}
                  >
                    <Award className="h-4 w-4" />
                    <span>تعيين موجه</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    disabled={bulkActionLoading}
                  >
                    <Building className="h-4 w-4" />
                    <span>تغيير البرنامج</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleBulkAction('updateStatus', { status: 'APPROVED' })}
                    disabled={bulkActionLoading}
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>قبول</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleBulkAction('updateStatus', { status: 'REJECTED' })}
                    disabled={bulkActionLoading}
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>رفض</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>حذف</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>قائمة الشركات الناشئة ({startups.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="grid grid-cols-9 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-1 flex items-center">
                  <input 
                    type="checkbox" 
                    className="ml-2"
                    checked={selectedStartups.length === startups.length && startups.length > 0}
                    onChange={selectAllStartups}
                  />
                  <span>الإجراءات</span>
                </div>
                <div className="col-span-1">الحالة</div>
                <div className="col-span-1">المرحلة</div>
                <div className="col-span-1">القطاع</div>
                <div className="col-span-1">البرنامج</div>
                <div className="col-span-1">التمويل</div>
                <div className="col-span-1">حجم الفريق</div>
                <div className="col-span-1">تاريخ الإنشاء</div>
                <div className="col-span-1">الاسم</div>
              </div>
              
              {startups.length > 0 ? (
                startups.map((startup) => (
                  <div key={startup.id} className="grid grid-cols-9 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                    <div className="col-span-1 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={selectedStartups.includes(startup.id)}
                        onChange={() => toggleStartupSelection(startup.id)}
                      />
                      <div className="flex gap-1">
                        <button 
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => handleViewStartup(startup.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-amber-500 hover:text-amber-700"
                          onClick={() => handleEditStartup(startup.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteStartup(startup.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1">
                      {getStatusBadge(startup.status)}
                    </div>
                    <div className="col-span-1">{startup.stage}</div>
                    <div className="col-span-1">{startup.industry}</div>
                    <div className="col-span-1">
                      {startup.creator.accelerator?.name || 'غير محدد'}
                    </div>
                    <div className="col-span-1">{formatFunding(startup.fundingNeeds)}</div>
                    <div className="col-span-1">{startup.teamSize}</div>
                    <div className="col-span-1">{formatDate(startup.createdAt)}</div>
                    <div className="col-span-1">{startup.name}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  لا توجد نتائج مطابقة لبحثك
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {activeTab === "pending" && startups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>طلبات الانضمام المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {startups.map((startup) => (
                <div key={startup.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleBulkAction('updateStatus', { status: 'REJECTED' })}
                      disabled={bulkActionLoading}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>رفض</span>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleBulkAction('updateStatus', { status: 'APPROVED' })}
                      disabled={bulkActionLoading}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>قبول</span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{startup.name}</div>
                    <div className="text-sm text-muted-foreground">{startup.industry} • {startup.creator.accelerator?.name || 'غير محدد'}</div>
                    <div className="text-xs text-muted-foreground">تاريخ الطلب: {formatDate(startup.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إحصائيات الشركات الناشئة</span>
              <Building className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statistics ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{statistics.total}</span>
                  <span className="text-muted-foreground">إجمالي الشركات الناشئة</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{statistics.active}</span>
                  <span className="text-muted-foreground">الشركات النشطة</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{statistics.pending}</span>
                  <span className="text-muted-foreground">الشركات المعلقة</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{statistics.rejected}</span>
                  <span className="text-muted-foreground">الشركات المرفوضة</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التوزيع حسب القطاع</span>
              <Tag className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statistics ? (
              <div className="space-y-4">
                {statistics.industries.map((industry) => (
                  <div key={industry.name} className="flex justify-between items-center">
                    <span className="text-lg font-bold">{industry.count}</span>
                    <span className="text-muted-foreground">{industry.name}</span>
                  </div>
                ))}
                {statistics.industries.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    لا توجد بيانات
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التمويل والتقييم</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statistics ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{statistics.funding.total.toLocaleString()} ريال</span>
                  <span className="text-muted-foreground">إجمالي التمويل</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{Math.round(statistics.funding.average).toLocaleString()} ريال</span>
                  <span className="text-muted-foreground">متوسط التمويل</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{statistics.stages.length}</span>
                  <span className="text-muted-foreground">عدد المراحل</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
