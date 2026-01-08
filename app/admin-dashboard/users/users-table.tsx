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

// Custom EventSource with Authentication
class EventSourceWithAuth {
  private eventSource: EventSource | null = null;
  private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};
  private url: string;
  private token: string;
  
  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
    this.connect();
  }
  
  private connect() {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${this.token}`);
    
    // Use fetch to create a readable stream with proper auth headers
    fetch(this.url, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }
        
        // Handle the response body as a stream
        const reader = response.body!.getReader();
        let buffer = '';
        
        // Process the stream data
        const processStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              console.log('SSE stream completed');
              return;
            }
            
            // Decode the received data
            buffer += new TextDecoder().decode(value);
            
            // Process complete events (separated by double newlines)
            const events = buffer.split('\n\n');
            buffer = events.pop() || ''; // Keep last potentially incomplete event
            
            // Process each complete event
            events.forEach(eventText => {
              if (!eventText.trim()) return;
              
              // Parse event type and data
              const lines = eventText.split('\n');
              let eventType = 'message';
              let data = '';
              
              lines.forEach(line => {
                if (line.startsWith('event:')) {
                  eventType = line.slice(6).trim();
                } else if (line.startsWith('data:')) {
                  data = line.slice(5).trim();
                }
              });
              
              // Create a message event
              const event = new MessageEvent(eventType, { data });
              
              // Dispatch to listeners
              if (this.listeners[eventType]) {
                this.listeners[eventType].forEach(listener => listener(event));
              }
            });
            
            // Continue reading
            processStream();
          }).catch(error => {
            console.error('SSE read error:', error);
            this.dispatchEvent(new Event('error'));
          });
        };
        
        processStream();
      })
      .catch(error => {
        console.error('SSE connection error:', error);
        this.dispatchEvent(new Event('error'));
      });
  }
  
  addEventListener(type: string, callback: (event: MessageEvent) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }
  
  removeEventListener(type: string, callback: (event: MessageEvent) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }
  
  dispatchEvent(event: Event) {
    if (event.type === 'error' && this.listeners['error']) {
      this.listeners['error'].forEach(listener => listener(new MessageEvent('error')));
    }
    return true;
  }
  
  close() {
    // Clear all listeners
    this.listeners = {};
  }
  
  get readyState() {
    return this.eventSource?.readyState || EventSource.CLOSED;
  }
}
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [eventSource, setEventSource] = useState<EventSourceWithAuth | null>(null)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  
  const router = useRouter()
  
    // Set up SSE connection for real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled) return
    
    // Close any existing connection
    if (eventSource) {
      eventSource.close()
    }
    
    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (!token) {
      console.error("No authentication token found in localStorage");
      showAdminToast({
        title: "خطأ في المصادقة",
        description: "لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.",
        variant: "destructive"
      });
      return;
    }
    
    // Build URL with query parameters for filtering
    let sseUrl = `/api/admin/users/sse?page=${currentPage}&limit=10`;
    if (searchQuery) {
      sseUrl += `&search=${encodeURIComponent(searchQuery)}`;
    }
    if (activeTab !== "all") {
      sseUrl += `&role=${encodeURIComponent(normalizeRoleForApi(activeTab))}`;
    }
    
    // Create a new EventSource connection with Authorization header using fetch API
    // This creates a properly authenticated SSE connection
    const newEventSource = new EventSourceWithAuth(sseUrl, token);
    setEventSource(newEventSource);
    
    console.log("Connecting to authenticated SSE endpoint");
    
    // Handle incoming events
    newEventSource.addEventListener('users', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update state with the data from server (already filtered)
        setUsers(data.users);
        setTotalUsers(data.pagination.total);
        setTotalPages(data.pagination.totalPages || Math.ceil(data.pagination.total / data.pagination.limit));
        setCurrentPage(data.pagination.currentPage || 1);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        showAdminToast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحديث البيانات",
          variant: "destructive"
        });
      }
    });
    
    // Handle heartbeat events to keep connection alive
    newEventSource.addEventListener('heartbeat', () => {
      // Connection is still active
      console.log('SSE heartbeat received');
    });
    
    newEventSource.addEventListener('error', (error) => {
      console.error('SSE connection error:', error);
      showAdminToast({
        title: "تنبيه",
        description: "تم فقد الاتصال بالخادم. جاري المحاولة مرة أخرى...",
        variant: "destructive"
      });
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (newEventSource.readyState === EventSource.CLOSED) {
          newEventSource.close();
          setEventSource(null);
        }
      }, 5000);
    });
    
    // Clean up on unmount or when dependencies change
    return () => {
      newEventSource.close();
    }
  }, [isRealTimeEnabled, activeTab, searchQuery, currentPage]);
  
  // Fetch users (for initial load and manual refresh)
  const fetchUsers = async () => {
    setLoading(true)
    try {
      let url = `/api/admin/users?page=${currentPage}&limit=10`
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      
      if (activeTab !== "all") {
        url += `&role=${encodeURIComponent(normalizeRoleForApi(activeTab))}`
      }
      
      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch(url, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
        setTotalPages(data.pagination.pages || Math.ceil(data.pagination.total / data.pagination.limit))
        setTotalUsers(data.pagination.total)
        // Don't update currentPage here to avoid infinite loop
      } else {
        console.error('Failed to fetch users:', data.error)
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب المستخدمين: " + (data.error || "خطأ غير معروف"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showAdminToast({
        title: "خطأ",
        description: "فشل في جلب المستخدمين. تأكد من الاتصال بالخادم.",
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
  
  // Normalize role for API request (convert to uppercase)
  const normalizeRoleForApi = (role: string): string => {
    if (role === 'all') return 'ALL';
    return role.toUpperCase();
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
      // Get token from localStorage (or context/provider if available)
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

        // If real-time is disabled, manually refresh the data
        if (!isRealTimeEnabled) {
          fetchUsers()
        }
      } else {
        showAdminToast({
          title: "خطأ",
          description: data.error || "فشل في تحديث دور المستخدم",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating user roles:', error)
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
      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      // Delete users one by one (since our API doesn't support batch delete)
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
      
      // If real-time is disabled, manually refresh the data
      if (!isRealTimeEnabled) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting users:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في حذف المستخدمين",
        variant: "destructive"
      });
    }
  };
  
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
      'PARTICIPANT': 'مشارك',
      'ENTREPRENEUR': 'رائد أعمال'
    }
    
    // If the role is not in the map, log a warning and return the role as-is
    if (!roleMap[role]) {
      console.warn(`Warning: No Arabic mapping found for role "${role}". Using the role value directly.`);
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
  
  // Handle export users data
  const handleExport = async () => {
    try {
      // Build filters based on current search and tab
      const filters: any = {};
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      if (activeTab !== "all") {
        filters.role = normalizeRoleForApi(activeTab);
      }
      
      // Use the new export utility with automatic delimiter detection
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
    } catch (error) {
      console.error('Error exporting users:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في تصدير بيانات المستخدمين",
        variant: "destructive"
      });
    }
  };
  
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleExport}
          >
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
              <SelectItem value="mentor">الموجهون</SelectItem>
              <SelectItem value="investor">المستثمرون</SelectItem>
              <SelectItem value="participant">المشاركون</SelectItem>
              <SelectItem value="entrepreneur">رواد الأعمال</SelectItem>
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
              <SelectItem value="ADMIN">مدير النظام</SelectItem>
              <SelectItem value="PROGRAM_MANAGER">مدير برنامج</SelectItem>
              <SelectItem value="MENTOR">موجه</SelectItem>
              <SelectItem value="INVESTOR">مستثمر</SelectItem>
              <SelectItem value="PARTICIPANT">مشارك</SelectItem>
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
