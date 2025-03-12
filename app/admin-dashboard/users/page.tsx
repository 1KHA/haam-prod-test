"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle,
  UserCheck,
  UserX,
  Shield,
  Mail
} from "lucide-react"

export default function UsersManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Sample user data
  const users = [
    { 
      id: "1", 
      name: "أحمد محمد", 
      email: "ahmed@example.com", 
      role: "مدير برنامج", 
      status: "نشط", 
      lastLogin: "منذ 2 ساعة",
      registrationDate: "15 يناير 2025",
      program: "مسرع التقنية المالية"
    },
    { 
      id: "2", 
      name: "سارة العتيبي", 
      email: "sarah@example.com", 
      role: "مستثمر", 
      status: "نشط", 
      lastLogin: "منذ 5 ساعات",
      registrationDate: "10 فبراير 2025",
      program: "-"
    },
    { 
      id: "3", 
      name: "محمد القحطاني", 
      email: "mohammed@example.com", 
      role: "موجه", 
      status: "نشط", 
      lastLogin: "منذ يوم واحد",
      registrationDate: "5 مارس 2025",
      program: "مسرع التقنيات الصحية"
    },
    { 
      id: "4", 
      name: "نورة السعيد", 
      email: "noura@example.com", 
      role: "مؤسس شركة ناشئة", 
      status: "نشط", 
      lastLogin: "منذ 3 أيام",
      registrationDate: "20 فبراير 2025",
      program: "حاضنة التقنيات الناشئة"
    },
    { 
      id: "5", 
      name: "خالد العمري", 
      email: "khaled@example.com", 
      role: "محكم", 
      status: "نشط", 
      lastLogin: "منذ أسبوع",
      registrationDate: "1 مارس 2025",
      program: "-"
    },
    { 
      id: "6", 
      name: "فاطمة الزهراء", 
      email: "fatima@example.com", 
      role: "مؤسس شركة ناشئة", 
      status: "معلق", 
      lastLogin: "-",
      registrationDate: "10 مارس 2025",
      program: "مسرع الذكاء الاصطناعي"
    },
    { 
      id: "7", 
      name: "عبدالله الغامدي", 
      email: "abdullah@example.com", 
      role: "مستثمر", 
      status: "معلق", 
      lastLogin: "-",
      registrationDate: "12 مارس 2025",
      program: "-"
    }
  ]

  // Filter users based on active tab and search query
  const filteredUsers = users.filter(user => {
    // Filter by tab
    if (activeTab === "active" && user.status !== "نشط") return false
    if (activeTab === "pending" && user.status !== "معلق") return false
    if (activeTab === "startups" && user.role !== "مؤسس شركة ناشئة") return false
    if (activeTab === "mentors" && user.role !== "موجه") return false
    if (activeTab === "investors" && user.role !== "مستثمر") return false
    if (activeTab === "managers" && user.role !== "مدير برنامج") return false
    if (activeTab === "judges" && user.role !== "محكم") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.program.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>إضافة مستخدم</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن مستخدم..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 md:grid-cols-7">
            <TabsTrigger value="judges">المحكمون</TabsTrigger>
            <TabsTrigger value="managers">المديرون</TabsTrigger>
            <TabsTrigger value="investors">المستثمرون</TabsTrigger>
            <TabsTrigger value="mentors">الموجهون</TabsTrigger>
            <TabsTrigger value="startups">الشركات الناشئة</TabsTrigger>
            <TabsTrigger value="pending">معلق</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedUsers.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>إرسال بريد</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span>تغيير الدور</span>
                  </Button>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1">
                    <Trash2 className="h-4 w-4" />
                    <span>حذف</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>قائمة المستخدمين ({filteredUsers.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="ml-2"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={selectAllUsers}
                />
                <span>الإجراءات</span>
              </div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">الدور</div>
              <div className="col-span-1">البرنامج</div>
              <div className="col-span-1">آخر تسجيل دخول</div>
              <div className="col-span-1">تاريخ التسجيل</div>
              <div className="col-span-1">البريد الإلكتروني</div>
              <div className="col-span-1">الاسم</div>
            </div>
            
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                    <div className="flex gap-1">
                      <button className="text-blue-500 hover:text-blue-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-amber-500 hover:text-amber-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {user.status === "نشط" ? (
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
                  </div>
                  <div className="col-span-1">{user.role}</div>
                  <div className="col-span-1">{user.program}</div>
                  <div className="col-span-1">{user.lastLogin}</div>
                  <div className="col-span-1">{user.registrationDate}</div>
                  <div className="col-span-1">{user.email}</div>
                  <div className="col-span-1">{user.name}</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                لا توجد نتائج مطابقة لبحثك
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {activeTab === "pending" && filteredUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>طلبات التسجيل المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>رفض</span>
                    </Button>
                    <Button variant="default" size="sm" className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>قبول</span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email} • {user.role}</div>
                    <div className="text-xs text-muted-foreground">تاريخ الطلب: {user.registrationDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
