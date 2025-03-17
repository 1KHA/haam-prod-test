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
  DialogTrigger,
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
  Filter, 
  UserPlus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  MoreHorizontal,
  CheckCircle, 
  XCircle,
  UserCheck,
  UserX,
  Shield,
  Mail,
  RefreshCw
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  
  const router = useRouter()
  
  // Set up SSE connection for real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled) return
    
    // Close any existing connection
    if (eventSource) {
      eventSource.close()
    }
    
    // Create a new EventSource connection
    const newEventSource = new EventSource('/api/admin/users/sse')
    setEventSource(newEventSource)
    
    // Handle incoming events
    newEventSource.addEventListener('users', (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Apply filters to the received data
        let filteredUsers = data.users
        
        if (searchQuery) {
          filteredUsers = filteredUsers.filter((user: User) => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        
        if (activeTab !== "all") {
          filteredUsers = filteredUsers.filter((user: User) => 
            user.role.toLowerCase() === activeTab.toLowerCase()
          )
        }
        
        // Update state with the filtered data
        setUsers(filteredUsers)
        setTotalUsers(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
        setLoading(false)
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    })
    
    newEventSource.addEventListener('error', () => {
      console.error('SSE connection error')
      // Attempt to reconnect after a delay
      setTimeout(() => {
        newEventSource.close()
        setEventSource(null)
      }, 5000)
    })
    
    // Clean up on unmount
    return () => {
      newEventSource.close()
    }
  }, [isRealTimeEnabled, activeTab, searchQuery])
  
  // Fetch users (for initial load and manual refresh)
  const fetchUsers = async () => {
    setLoading(true)
    try {
      let url = `/api/admin/users?page=${currentPage}&limit=10`
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      
      if (activeTab !== "all") {
        url += `&role=${encodeURIComponent(activeTab.toUpperCase())}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
        setTotalUsers(data.pagination.total)
      } else {
        console.error('Failed to fetch users:', data.error)
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب المستخدمين",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showAdminToast({
        title: "خطأ",
        description: "فشل في جلب المستخدمين",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Initial fetch (only if real-time is disabled)
  useEffect(() => {
    if (!isRealTimeEnabled) {
      fetchUsers()
    }
  }, [currentPage, activeTab, isRealTimeEnabled])
  
  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    if (!isRealTimeEnabled) {
      fetchUsers()
    }
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
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action: 'updateRole',
          data: { role: selectedRole }
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showAdminToast({
          title: "تم بنجاح",
          description: `تم تحديث ${data.count} أدوار المستخدمين إلى ${selectedRole}`,
        })
        setSelectedUsers([])
        setIsRoleDialogOpen(false)
        
        // If real-time is disabled, manually refresh the data
        if (!isRealTimeEnabled) {
          fetchUsers()
        }
      } else {
        showAdminToast({
          title: "خطأ",
          description: data.error || "فشل في تحديث أدوار المستخدمين",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating user roles:', error)
      showAdminToast({
        title: "خطأ",
        description: "فشل في تحديث أدوار المستخدمين",
        variant: "destructive"
      })
    }
  }
  
  // Delete users
  const deleteUsers = async () => {
    if (selectedUsers.length === 0) return
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action: 'delete'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        showAdminToast({
          title: "تم بنجاح",
          description: `تم حذف ${data.count} مستخدمين`,
        })
        setSelectedUsers([])
        setIsDeleteDialogOpen(false)
        
        // If real-time is disabled, manually refresh the data
        if (!isRealTimeEnabled) {
          fetchUsers()
        }
      } else {
        showAdminToast({
          title: "خطأ",
          description: data.error || "فشل في حذف المستخدمين",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting users:', error)
      showAdminToast({
        title: "خطأ",
        description: "فشل في حذف المستخدمين",
        variant: "destructive"
      })
    }
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
  
  // Get role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'مدير',
      'PROGRAM_MANAGER': 'مدير برنامج',
      'STARTUP': 'شركة ناشئة',
      'MENTOR': 'موجه',
      'INVESTOR': 'مستثمر',
      'JUDGE': 'محكم',
      'PARTICIPANT': 'مشارك',
      'ACCELERATOR': 'مسرع أعمال'
    }
    
    return roleMap[role] || role
  }
  
  // Toggle real-time updates
  const toggleRealTimeUpdates = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled)
    
    if (isRealTimeEnabled) {
      // If disabling real-time, close the connection
      if (eventSource) {
        eventSource.close()
        setEventSource(null)
      }
      
      // Fetch data manually
      fetchUsers()
    }
    
    showAdminToast({
      title: isRealTimeEnabled ? "تم إيقاف التحديثات المباشرة" : "تم تفعيل التحديثات المباشرة",
      description: isRealTimeEnabled 
        ? "ستحتاج إلى تحديث البيانات يدويًا" 
        : "سيتم تحديث البيانات تلقائيًا عند إضافة مستخدمين جدد"
    })
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن مستخدم..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={isRealTimeEnabled ? toggleRealTimeUpdates : fetchUsers}
            title={isRealTimeEnabled ? "إيقاف التحديثات المباشرة" : "تحديث البيانات"}
          >
            <RefreshCw className={`h-4 w-4 ${isRealTimeEnabled ? 'text-green-500' : ''}`} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={isRealTimeEnabled ? "default" : "outline"} 
            size="sm" 
            className="flex items-center gap-1"
            onClick={toggleRealTimeUpdates}
          >
            <span>{isRealTimeEnabled ? "التحديثات المباشرة مفعلة" : "تفعيل التحديثات المباشرة"}</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.push("/admin-dashboard/users/new")}
          >
            <UserPlus className="h-4 w-4" />
            <span>إضافة مستخدم</span>
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsRoleDialogOpen(true)}
              >
                <Shield className="h-4 w-4" />
                <span>تغيير الدور</span>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span>حذف</span>
              </Button>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="جميع المستخدمين" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستخدمين</SelectItem>
              <SelectItem value="admin">المديرون</SelectItem>
              <SelectItem value="program_manager">مديرو البرامج</SelectItem>
              <SelectItem value="startup">الشركات الناشئة</SelectItem>
              <SelectItem value="mentor">الموجهون</SelectItem>
              <SelectItem value="investor">المستثمرون</SelectItem>
              <SelectItem value="judge">المحكمون</SelectItem>
              <SelectItem value="participant">المشاركون</SelectItem>
              <SelectItem value="accelerator">مسرعات الأعمال</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input 
                  type="checkbox" 
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={selectAllUsers}
                />
              </TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead>البرنامج</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
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
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                  <TableCell>
                    {user.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <UserCheck className="h-3 w-3 ml-1" />
                        نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <UserX className="h-3 w-3 ml-1" />
                        معلق
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{user.program || '-'}</TableCell>
                  <TableCell>
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
              <SelectItem value="ADMIN">مدير</SelectItem>
              <SelectItem value="PROGRAM_MANAGER">مدير برنامج</SelectItem>
              <SelectItem value="STARTUP">شركة ناشئة</SelectItem>
              <SelectItem value="MENTOR">موجه</SelectItem>
              <SelectItem value="INVESTOR">مستثمر</SelectItem>
              <SelectItem value="JUDGE">محكم</SelectItem>
              <SelectItem value="PARTICIPANT">مشارك</SelectItem>
              <SelectItem value="ACCELERATOR">مسرع أعمال</SelectItem>
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
