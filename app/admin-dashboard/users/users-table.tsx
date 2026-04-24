"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Download,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  CheckCircle,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  Ban,
  Loader2
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { exportPresets } from "@/lib/export-utils"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  program?: string
  specialization?: string
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bulkStatusLoading, setBulkStatusLoading] = useState<'approve' | 'suspend' | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const router = useRouter()

  // Normalize role for API request (convert to uppercase)
  const normalizeRoleForApi = (role: string): string => {
    if (role === 'all') return 'ALL';
    return role.toUpperCase();
  }

  const fetchUsers = async (page?: number, search?: string, role?: string) => {
    const p = page ?? currentPage;
    const s = search ?? searchQuery;
    const r = role ?? activeTab;
    setLoading(true)
    try {
      let url = `/api/admin/users?page=${p}&limit=10`
      if (s) url += `&search=${encodeURIComponent(s)}`
      if (r !== "all") url += `&role=${encodeURIComponent(normalizeRoleForApi(r))}`
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(url, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      })
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
        setTotalPages(data.pagination.pages || Math.ceil(data.pagination.total / data.pagination.limit))
        setTotalUsers(data.pagination.total)
      } else {
        showAdminToast({ title: "خطأ", description: "فشل في جلب المستخدمين", variant: "destructive" })
      }
    } catch {
      showAdminToast({ title: "خطأ", description: "فشل في جلب المستخدمين", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => { fetchUsers(1, undefined, activeTab) }, [activeTab])
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1, searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])
  useEffect(() => { fetchUsers(currentPage) }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchUsers(1, searchQuery)
  }

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  // Select all users
  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
  }

  // Update user roles
  const updateUserRoles = async () => {
    if (!selectedRole || selectedUsers.length === 0) return

    if (selectedUsers.length > 1) {
      showAdminToast({
        title: "خطأ",
        description: "يرجى تحديد مستخدم واحد فقط لتغيير دوره من هذه الصفحة. استخدم صفحة تغيير الأدوار الجماعية للعمليات المتعددة.",
        variant: "destructive"
      })
      return
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(`/api/admin/users/${selectedUsers[0]}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          role: selectedRole
        })
      })

      const data = await response.json()

      if (response.ok) {
        showAdminToast({
          title: "تم بنجاح",
          description: `تم تحديث دور المستخدم إلى ${selectedRole}`,
        })
        setSelectedUsers([])
        setIsRoleDialogOpen(false)
        fetchUsers()
      } else {
        showAdminToast({
          title: "خطأ",
          description: data.error || "فشل في تحديث دور المستخدم",
          variant: "destructive"
        })
      }
    } catch {
      showAdminToast({
        title: "خطأ",
        description: "فشل في تحديث دور المستخدم",
        variant: "destructive"
      })
    }
  }

  // Delete users
  const deleteUsers = async () => {
    if (selectedUsers.length === 0) return

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      let successCount = 0;
      let failCount = 0;

      for (const userId of selectedUsers) {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          const errorData = await response.json();
          console.error(`Failed to delete user ${userId}:`, errorData.error);
        }
      }

      if (successCount > 0) {
        showAdminToast({
          title: "تم بنجاح",
          description: `تم حذف ${successCount} مستخدمين`,
        });
      }

      if (failCount > 0) {
        showAdminToast({
          title: "تحذير",
          description: `فشل في حذف ${failCount} مستخدمين`,
          variant: "destructive"
        });
      }

      setSelectedUsers([]);
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch {
      showAdminToast({
        title: "خطأ",
        description: "فشل في حذف المستخدمين",
        variant: "destructive"
      });
    }
  };

  // Change user approval status (activate or suspend)
  const changeUserStatus = async (userId: string, action: 'approve' | 'suspend') => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const successMsg = action === 'approve' ? "تم تفعيل حساب المستخدم" : "تم تعليق حساب المستخدم";
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ action })
      });
      if (response.ok) {
        showAdminToast({ title: "تم بنجاح", description: successMsg });
        fetchUsers();
      } else {
        showAdminToast({ title: "خطأ", description: "فشل في تغيير حالة الحساب", variant: "destructive" });
      }
    } catch {
      showAdminToast({ title: "خطأ", description: "فشل في تغيير حالة الحساب", variant: "destructive" });
    }
  }

  // Bulk approve or suspend selected users
  const bulkChangeStatus = async (action: 'approve' | 'suspend') => {
    if (selectedUsers.length === 0) return
    setBulkStatusLoading(action)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    let successCount = 0, failCount = 0

    for (const userId of selectedUsers) {
      try {
        const res = await fetch(`/api/admin/users/${userId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ action })
        })
        if (res.ok) successCount++; else failCount++
      } catch { failCount++ }
    }

    if (successCount > 0) {
      const msg = action === 'approve' ? `تم قبول ${successCount} مستخدم` : `تم رفض ${successCount} مستخدم`
      showAdminToast({ title: "تم بنجاح", description: msg })
    }
    if (failCount > 0) {
      showAdminToast({ title: "تحذير", description: `فشل في تغيير حالة ${failCount} مستخدم`, variant: "destructive" })
    }

    setBulkStatusLoading(null)
    setSelectedUsers([])
    fetchUsers()
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Get role display name - standardized with auth.ts and Prisma schema
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'مدير النظام',
      'PROGRAM_MANAGER': 'مدير برنامج',
      'MENTOR': 'موجه',
      'INVESTOR': 'مستثمر',
      'ENTREPRENEUR': 'رائد أعمال'
    }

    if (!roleMap[role]) {
      console.warn(`Warning: No Arabic mapping found for role "${role}". Using the role value directly.`);
    }

    return roleMap[role] || role
  }

  // Handle export users data
  const handleExport = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters: any = {};

      if (searchQuery) {
        filters.search = searchQuery;
      }

      if (activeTab !== "all") {
        filters.role = normalizeRoleForApi(activeTab);
      }

      await exportPresets.users(filters, {
        onSuccess: () => {
          showAdminToast({
            title: "تم التصدير بنجاح",
            description: "تم تصدير بيانات المستخدمين بنجاح"
          });
        },
        onError: (error) => {
          showAdminToast({
            title: "خطأ",
            description: error,
            variant: "destructive"
          });
        }
      });
    } catch {
      showAdminToast({
        title: "خطأ",
        description: "فشل في تصدير بيانات المستخدمين",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar row ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن مستخدم..."
            className="pr-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Role filter */}
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="جميع المستخدمين" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المستخدمين</SelectItem>
            <SelectItem value="admin">المديرون</SelectItem>
            <SelectItem value="program_manager">مديرو البرامج</SelectItem>
            <SelectItem value="mentor">الموجهون</SelectItem>
            <SelectItem value="investor">المستثمرون</SelectItem>
            <SelectItem value="entrepreneur">رواد الأعمال</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh */}
        <Button variant="outline" size="icon" onClick={() => fetchUsers()} title="تحديث البيانات">
          <RefreshCw className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {/* Export */}
        <Button variant="outline" size="sm" className="gap-1" onClick={handleExport}>
          <Download className="h-4 w-4" />
          تصدير
        </Button>
      </div>

      {/* ── Bulk-action bar (only visible when rows are selected) ── */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm">
          <span className="text-muted-foreground ml-auto">
            تم تحديد {selectedUsers.length} مستخدم
          </span>
          <Button
            variant="outline" size="sm" className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
            onClick={() => bulkChangeStatus('approve')}
            disabled={bulkStatusLoading !== null}
          >
            {bulkStatusLoading === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            قبول
          </Button>
          <Button
            variant="outline" size="sm" className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
            onClick={() => bulkChangeStatus('suspend')}
            disabled={bulkStatusLoading !== null}
          >
            {bulkStatusLoading === 'suspend' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
            رفض
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsRoleDialogOpen(true)}>
            <Shield className="h-4 w-4" />
            تغيير الدور
          </Button>
          <Button variant="destructive" size="sm" className="gap-1" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      )}

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-right">
              <TableHead className="w-10 text-right">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={selectAllUsers}
                />
              </TableHead>
              <TableHead className="text-right min-w-[140px]">الاسم</TableHead>
              <TableHead className="text-right min-w-[180px]">البريد الإلكتروني</TableHead>
              <TableHead className="text-right min-w-[120px]">الدور</TableHead>
              <TableHead className="text-right min-w-[130px]">الحالة</TableHead>
              <TableHead className="text-right min-w-[120px]">تاريخ التسجيل</TableHead>
              <TableHead className="text-right min-w-[100px]">البرنامج</TableHead>
              <TableHead className="text-right w-16">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  لا توجد نتائج مطابقة لبحثك
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-right">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">{user.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-right">{getRoleDisplayName(user.role)}</TableCell>
                  <TableCell>
                    {user.status === 'ACTIVE' ? (
                      <button
                        title="انقر لتعليق الحساب"
                        onClick={() => changeUserStatus(user.id, 'suspend')}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800 cursor-pointer transition-colors"
                      >
                        <UserCheck className="h-3 w-3 ml-1" />
                        نشط
                      </button>
                    ) : user.status === 'PENDING_APPROVAL' ? (
                      <button
                        title="انقر لاعتماد الحساب"
                        onClick={() => changeUserStatus(user.id, 'approve')}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-green-100 hover:text-green-800 cursor-pointer transition-colors"
                      >
                        <UserX className="h-3 w-3 ml-1" />
                        قيد المراجعة
                      </button>
                    ) : (
                      <button
                        title="انقر لتفعيل الحساب"
                        onClick={() => changeUserStatus(user.id, 'approve')}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800 cursor-pointer transition-colors"
                      >
                        <UserX className="h-3 w-3 ml-1" />
                        معلق
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">{user.program || '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/admin-dashboard/users/${user.id}`)}>
                          <Eye className="h-4 w-4 ml-2" />
                          عرض
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin-dashboard/users/${user.id}/edit`)}>
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'ACTIVE' ? (
                          <DropdownMenuItem
                            className="text-amber-600"
                            onClick={() => changeUserStatus(user.id, 'suspend')}
                          >
                            <Ban className="h-4 w-4 ml-2" />
                            تعليق الحساب
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => changeUserStatus(user.id, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 ml-2" />
                            {user.status === 'PENDING_APPROVAL' ? 'اعتماد الحساب' : 'تفعيل الحساب'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedUsers([user.id])
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            عرض {users.length} من {totalUsers} مستخدم
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير دور المستخدمين</DialogTitle>
            <DialogDescription>
              اختر الدور الجديد للمستخدمين المحددين ({selectedUsers.length} مستخدم)
            </DialogDescription>
          </DialogHeader>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">مدير النظام</SelectItem>
              <SelectItem value="PROGRAM_MANAGER">مدير برنامج</SelectItem>
              <SelectItem value="MENTOR">موجه</SelectItem>
              <SelectItem value="INVESTOR">مستثمر</SelectItem>
              <SelectItem value="ENTREPRENEUR">رائد أعمال</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={updateUserRoles}>
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف المستخدمين</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف المستخدمين المحددين ({selectedUsers.length} مستخدم)؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={deleteUsers}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
