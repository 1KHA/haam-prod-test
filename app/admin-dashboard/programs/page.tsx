"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  Plus, 
  Search, 
  Trash2, 
  Users
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { DataTable } from "@/components/ui/data-table"
import { PermissionGate } from "@/hooks/usePermissions"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Program {
  id: string
  name: string
  type: string
  status: string
  startDate: string | null
  endDate: string | null
  capacity: number | null
  stats: {
    cohortsCount: number
    activeCohortsCount: number
    totalStartups: number
  }
  creator: {
    name: string
    email: string
  }
  createdAt: string
}

interface ProgramsStatistics {
  total: number
  draft: number
  active: number
  completed: number
  cancelled: number
  types: { name: string; count: number }[]
  cohorts: {
    total: number
    active: number
  }
  startups: number
}

export default function ProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [statistics, setStatistics] = useState<ProgramsStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [token, setToken] = useState<string | null>(null)

  // Get token from localStorage
  useEffect(() => {
    // Token is now in HTTP-only cookie, credentials: "include" sends it automatically
  const storedToken = null; // Cookie-based auth - no localStorage token needed
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '10'
        });
        
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        
        if (statusFilter) {
          queryParams.append('status', statusFilter);
        }
        
        if (typeFilter) {
          queryParams.append('type', typeFilter);
        }
        
        const response = await fetch(`/api/admin/programs?${queryParams.toString()}`, {
          headers: {
                      }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        
        const data = await response.json();
        setPrograms(data.programs);
        setStatistics(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching programs:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب البرامج",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrograms();
  }, [page, searchQuery, statusFilter, typeFilter]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedPrograms.length === 0) {
      showAdminToast({
        title: "تنبيه",
        description: "الرجاء اختيار برنامج واحد على الأقل",
        variant: "default"
      });
      return;
    }
    
    try {
      let endpoint = '/api/admin/programs';
      let method = 'PUT';
      let body: any = {
        programIds: selectedPrograms,
        action: ''
      };
      
      if (action === 'delete') {
        body.action = 'delete';
      } else if (action === 'activate') {
        body.action = 'updateStatus';
        body.data = { status: 'ACTIVE' };
      } else if (action === 'complete') {
        body.action = 'updateStatus';
        body.data = { status: 'COMPLETED' };
      } else if (action === 'cancel') {
        body.action = 'updateStatus';
        body.data = { status: 'CANCELLED' };
      }
      
      console.log('Sending bulk action request:', body);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
                  },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }
      
      // Refresh the programs list
      setPage(1);
      setSelectedPrograms([]);
      
      showAdminToast({
        title: "تم بنجاح",
        description: "تم تنفيذ الإجراء بنجاح"
      });
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في تنفيذ الإجراء",
        variant: "destructive"
      });
    }
  };

  // Table columns
  const columns: ColumnDef<Program>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "اسم البرنامج",
      cell: ({ row }) => (
        <div className="font-medium cursor-pointer" onClick={() => router.push(`/admin-dashboard/programs/${row.original.id}`)}>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "النوع",
      cell: ({ row }) => {
        const typeMap: Record<string, string> = {
          ACCELERATOR: "مسرع أعمال",
          INCUBATOR: "حاضنة أعمال",
          WORKSHOP: "ورشة عمل",
          BOOTCAMP: "معسكر تدريبي",
          HACKATHON: "هاكاثون",
          OTHER: "أخرى",
        };
        return <div>{typeMap[row.original.type] || row.original.type}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "outline" | "secondary" | "destructive" = "default";
        let label = "مسودة";
        
        if (status === "ACTIVE") {
          variant = "default";
          label = "نشط";
        } else if (status === "COMPLETED") {
          variant = "secondary";
          label = "مكتمل";
        } else if (status === "CANCELLED") {
          variant = "destructive";
          label = "ملغي";
        } else if (status === "DRAFT") {
          variant = "outline";
          label = "مسودة";
        }
        
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "startDate",
      header: "تاريخ البدء",
      cell: ({ row }) => {
        const startDate = row.original.startDate;
        if (!startDate) return <div>-</div>;
        return <div>{new Date(startDate).toLocaleDateString('ar-SA')}</div>;
      },
    },
    {
      accessorKey: "stats.cohortsCount",
      header: "عدد الدفعات",
      cell: ({ row }) => <div>{row.original.stats.cohortsCount}</div>,
    },
    {
      accessorKey: "stats.totalStartups",
      header: "عدد الشركات الناشئة",
      cell: ({ row }) => <div>{row.original.stats.totalStartups}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/admin-dashboard/programs/${row.original.id}`)}>
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin-dashboard/programs/${row.original.id}/edit`)}>
                تعديل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة البرامج</h1>
        <PermissionGate
          requirement={{ category: 'programs', action: 'add' }}
        >
          <Button 
            variant="default" 
            className="flex items-center gap-1"
            onClick={() => router.push('/admin-dashboard/programs/new')}
          >
            <Plus className="h-4 w-4" />
            <span>إضافة برنامج</span>
          </Button>
        </PermissionGate>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي البرامج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">{statistics.active}</span> نشط
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الدفعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.cohorts.total}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">{statistics.cohorts.active}</span> نشط
                </div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الشركات الناشئة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.startups}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  في جميع البرامج
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                أنواع البرامج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.types.length}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  {statistics.types.slice(0, 2).map(type => type.name).join(', ')}
                  {statistics.types.length > 2 && '...'}
                </div>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="بحث عن برنامج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الحالات</SelectItem>
              <SelectItem value="DRAFT">مسودة</SelectItem>
              <SelectItem value="ACTIVE">نشط</SelectItem>
              <SelectItem value="COMPLETED">مكتمل</SelectItem>
              <SelectItem value="CANCELLED">ملغي</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الأنواع</SelectItem>
              {statistics?.types.map(type => (
                <SelectItem key={type.name} value={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 ml-2" />
                <span>الإجراءات</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                تنشيط المحدد
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('complete')}>
                إكمال المحدد
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('cancel')}>
                إلغاء المحدد
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                <Trash2 className="h-4 w-4 ml-2 text-destructive" />
                <span className="text-destructive">حذف المحدد</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            onClick={() => {
              // Build the export URL with filters
              let exportUrl = '/api/admin/programs/export?';
              const params = new URLSearchParams();

              if (searchQuery) {
                params.append('search', searchQuery);
              }

              if (statusFilter && statusFilter !== 'ALL') {
                params.append('status', statusFilter);
              }

              if (typeFilter && typeFilter !== 'ALL') {
                params.append('type', typeFilter);
              }

              // Open export URL in new tab
              window.open(`${exportUrl}${params.toString()}`, '_blank');
            }}
          >
            <Download className="h-4 w-4 ml-2" />
            <span>تصدير</span>
          </Button>
        </div>
      </div>

      {/* Programs Table */}
      <DataTable
        columns={columns}
        data={programs}
        loading={loading}
        onRowSelectionChange={(rows) => {
          setSelectedPrograms(rows);
        }}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          عرض {programs.length} من أصل {statistics?.total || 0} برنامج
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            disabled={page <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            صفحة {page} من {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            disabled={page >= totalPages}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
