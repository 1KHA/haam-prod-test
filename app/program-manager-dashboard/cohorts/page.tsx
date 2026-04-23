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
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Cohort {
  id: string
  name: string
  status: string
  startDate: string
  endDate: string
  capacity: number | null
  program: {
    id: string
    name: string
    type: string
  }
  stats: {
    membersCount: number
    mentorsCount: number
  }
  createdAt: string
}

interface Program {
  id: string
  name: string
  type: string
  cohortsCount: number
}

interface CohortStatistics {
  total: number
  upcoming: number
  active: number
  completed: number
  startups: number
  mentors: number
  programs: Program[]
}

export default function CohortsPage() {
  const router = useRouter()
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [statistics, setStatistics] = useState<CohortStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [programFilter, setProgramFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  // Fetch cohorts
  useEffect(() => {
    const fetchCohorts = async () => {
      setLoading(true);
      
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '10'
        });
        
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        
        // Only add status filter if it's a valid status (not "ALL")
        if (statusFilter && statusFilter !== 'ALL') {
          queryParams.append('status', statusFilter);
        }
        
        // Only add program filter if it's a valid program ID (not "ALL")
        if (programFilter && programFilter !== 'ALL') {
          queryParams.append('programId', programFilter);
        }
        
        const response = await fetch(`/api/program-manager/cohorts?${queryParams.toString()}`, {
          headers: {
                      }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch cohorts');
        }
        
        const data = await response.json();
        setCohorts(data.cohorts);
        setStatistics(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching cohorts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCohorts();
  }, [page, searchQuery, statusFilter, programFilter]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedCohorts.length === 0) {
      return;
    }
    
    try {
      const endpoint = '/api/program-manager/cohorts';
      const method = 'PUT';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = {
        cohortIds: selectedCohorts,
        action: ''
      };
      
      if (action === 'delete') {
        // For delete, we need to delete each cohort individually
        for (const cohortId of selectedCohorts) {
          await fetch(`/api/program-manager/cohorts/${cohortId}`, {
            method: 'DELETE'
          });
        }
      } else if (action === 'activate') {
        body.action = 'updateStatus';
        body.data = { status: 'ACTIVE' };
        
        await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      } else if (action === 'complete') {
        body.action = 'updateStatus';
        body.data = { status: 'COMPLETED' };

        await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      }
      
      // Refresh the cohorts list
      setPage(1);
      setSelectedCohorts([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Table columns
  const columns: ColumnDef<Cohort>[] = [
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
      header: "اسم الدفعة",
      cell: ({ row }) => (
        <div className="font-medium cursor-pointer" onClick={() => router.push(`/program-manager-dashboard/cohorts/${row.original.id}`)}>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "program.name",
      header: "البرنامج",
      cell: ({ row }) => <div>{row.original.program.name}</div>,
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "outline" | "secondary" | "destructive" = "default";
        let label = "قادم";
        
        if (status === "ACTIVE") {
          variant = "default";
          label = "نشط";
        } else if (status === "COMPLETED") {
          variant = "secondary";
          label = "مكتمل";
        } else if (status === "UPCOMING") {
          variant = "outline";
          label = "قادم";
        }
        
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "startDate",
      header: "تاريخ البدء",
      cell: ({ row }) => {
        const startDate = row.original.startDate;
        return <div>{new Date(startDate).toLocaleDateString('ar-SA')}</div>;
      },
    },
    {
      accessorKey: "endDate",
      header: "تاريخ الانتهاء",
      cell: ({ row }) => {
        const endDate = row.original.endDate;
        return <div>{new Date(endDate).toLocaleDateString('ar-SA')}</div>;
      },
    },
    {
      accessorKey: "stats.membersCount",
      header: "عدد الشركات",
      cell: ({ row }) => <div>{row.original.stats.membersCount}</div>,
    },
    {
      accessorKey: "stats.mentorsCount",
      header: "عدد المرشدين",
      cell: ({ row }) => <div>{row.original.stats.mentorsCount}</div>,
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
              <DropdownMenuItem onClick={() => router.push(`/program-manager-dashboard/cohorts/${row.original.id}`)}>
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/program-manager-dashboard/cohorts/${row.original.id}/edit`)}>
                تعديل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/program-manager-dashboard/cohorts/${row.original.id}/members`)}>
                إدارة الشركات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/program-manager-dashboard/cohorts/${row.original.id}/mentors`)}>
                إدارة المرشدين
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">إدارة الدفعات</h1>
        <Button 
          variant="default" 
          className="flex items-center gap-1"
          onClick={() => router.push('/program-manager-dashboard/cohorts/new')}
        >
          <Plus className="h-4 w-4" />
          <span>إضافة دفعة</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الدفعات
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
                البرامج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.programs.length}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  {statistics.programs.slice(0, 2).map(p => p.name).join(', ')}
                  {statistics.programs.length > 2 && '...'}
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
                  في جميع الدفعات
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المرشدين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.mentors}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground">
                  في جميع الدفعات
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="بحث عن دفعة..."
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
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الحالات</SelectItem>
              <SelectItem value="UPCOMING">قادم</SelectItem>
              <SelectItem value="ACTIVE">نشط</SelectItem>
              <SelectItem value="COMPLETED">مكتمل</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="البرنامج" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع البرامج</SelectItem>
              {statistics?.programs.map(program => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                <Trash2 className="h-4 w-4 ml-2 text-destructive" />
                <span className="text-destructive">حذف المحدد</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            <span>تصدير</span>
          </Button>
        </div>
      </div>

      {/* Cohorts Table */}
      <DataTable
        columns={columns}
        data={cohorts}
        loading={loading}
        onRowSelectionChange={(rows) => {
          setSelectedCohorts(rows);
        }}
      />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          عرض {cohorts.length} من أصل {statistics?.total || 0} دفعة
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
