"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  CreditCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function PaymentsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Sample payments data
  const paymentsData = [
    {
      id: "1",
      invoiceNumber: "INV-2025-001",
      amount: "250,000 ريال",
      entity: "شركة الحلول التقنية",
      paymentType: "رسوم برنامج",
      status: "مكتمل",
      date: "12 يناير 2025",
      paymentMethod: "تحويل مصرفي",
      dueDate: "5 يناير 2025"
    },
    {
      id: "2",
      invoiceNumber: "INV-2025-002",
      amount: "75,000 ريال",
      entity: "مؤسسة التعليم الذكي",
      paymentType: "رسوم خدمات",
      status: "معلق",
      date: "8 يناير 2025",
      paymentMethod: "بطاقة ائتمان",
      dueDate: "15 يناير 2025"
    },
    {
      id: "3",
      invoiceNumber: "INV-2025-003",
      amount: "120,000 ريال",
      entity: "شركة التقنيات المتقدمة",
      paymentType: "رسوم فعالية",
      status: "مكتمل",
      date: "3 يناير 2025",
      paymentMethod: "تحويل مصرفي",
      dueDate: "1 يناير 2025"
    },
    {
      id: "4",
      invoiceNumber: "INV-2024-125",
      amount: "180,000 ريال",
      entity: "شركة البرمجيات الحديثة",
      paymentType: "رسوم اشتراك",
      status: "مكتمل",
      date: "28 ديسمبر 2024",
      paymentMethod: "تحويل مصرفي",
      dueDate: "26 ديسمبر 2024"
    },
    {
      id: "5",
      invoiceNumber: "INV-2024-126",
      amount: "95,000 ريال",
      entity: "مؤسسة الاتصالات المتكاملة",
      paymentType: "رسوم دعم",
      status: "متأخر",
      date: "25 ديسمبر 2024",
      paymentMethod: "شيك",
      dueDate: "15 ديسمبر 2024"
    },
    {
      id: "6",
      invoiceNumber: "INV-2024-127",
      amount: "320,000 ريال",
      entity: "شركة الحلول الذكية",
      paymentType: "رسوم برنامج",
      status: "مكتمل",
      date: "20 ديسمبر 2024",
      paymentMethod: "تحويل مصرفي",
      dueDate: "18 ديسمبر 2024"
    },
    {
      id: "7",
      invoiceNumber: "INV-2024-128",
      amount: "150,000 ريال",
      entity: "مؤسسة التطوير الرقمي",
      paymentType: "رسوم خدمات",
      status: "معلق",
      date: "15 ديسمبر 2024",
      paymentMethod: "تحويل مصرفي",
      dueDate: "1 يناير 2025"
    },
    {
      id: "8",
      invoiceNumber: "INV-2024-129",
      amount: "85,000 ريال",
      entity: "شركة المحتوى الرقمي",
      paymentType: "رسوم استشارة",
      status: "ملغي",
      date: "10 ديسمبر 2024",
      paymentMethod: "بطاقة ائتمان",
      dueDate: "5 ديسمبر 2024"
    },
    {
      id: "9",
      invoiceNumber: "INV-2024-130",
      amount: "270,000 ريال",
      entity: "شركة المنصات التعليمية",
      paymentType: "رسوم برنامج",
      status: "مكتمل",
      date: "5 ديسمبر 2024",
      paymentMethod: "تحويل مصرفي",
      dueDate: "1 ديسمبر 2024"
    },
    {
      id: "10",
      invoiceNumber: "INV-2024-131",
      amount: "110,000 ريال",
      entity: "مؤسسة التدريب الاحترافي",
      paymentType: "رسوم خدمات",
      status: "متأخر",
      date: "1 ديسمبر 2024",
      paymentMethod: "شيك",
      dueDate: "15 نوفمبر 2024"
    },
    {
      id: "11",
      invoiceNumber: "INV-2024-132",
      amount: "195,000 ريال",
      entity: "شركة الابتكار التقني",
      paymentType: "رسوم برنامج",
      status: "مكتمل",
      date: "25 نوفمبر 2024",
      paymentMethod: "تحويل مصرفي",
      dueDate: "20 نوفمبر 2024"
    },
    {
      id: "12",
      invoiceNumber: "INV-2024-133",
      amount: "80,000 ريال",
      entity: "مؤسسة التسويق الإلكتروني",
      paymentType: "رسوم استشارة",
      status: "معلق",
      date: "20 نوفمبر 2024",
      paymentMethod: "تحويل مصرفي",
      dueDate: "5 ديسمبر 2024"
    }
  ]

  // Fetch payments data on component mount
  useEffect(() => {
    // Simulating API call
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Filter payments data based on search query and filters
  const filteredData = paymentsData.filter(item => {
    // Filter by status
    if (statusFilter !== "all" && item.status !== statusFilter) return false
    
    // Filter by payment type
    if (typeFilter !== "all" && item.paymentType !== typeFilter) return false
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.invoiceNumber.toLowerCase().includes(query) ||
        item.entity.toLowerCase().includes(query) ||
        item.amount.toLowerCase().includes(query) ||
        item.paymentMethod.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  )

  // Handle delete payment
  const handleDelete = (id: string) => {
    // In a real implementation, this would call an API to delete the payment
    toast.success("تم حذف الفاتورة بنجاح")
    // You would then refresh the payments data
  }

  // Unique payment types and statuses for filtering
  const paymentTypes = Array.from(new Set(paymentsData.map(item => item.paymentType)))
  const statuses = Array.from(new Set(paymentsData.map(item => item.status)))

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "مكتمل":
        return "bg-green-100 text-green-800"
      case "معلق":
        return "bg-blue-100 text-blue-800"
      case "متأخر":
        return "bg-red-100 text-red-800"
      case "ملغي":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-amber-100 text-amber-800"
    }
  }

  // Calculate total and due amounts
  const totalAmount = paymentsData.reduce((total, item) => {
    const amount = parseFloat(item.amount.replace(/[^0-9.]/g, ''))
    return total + amount
  }, 0)
  
  const dueAmount = paymentsData
    .filter(item => ["معلق", "متأخر"].includes(item.status))
    .reduce((total, item) => {
      const amount = parseFloat(item.amount.replace(/[^0-9.]/g, ''))
      return total + amount
    }, 0)

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/admin-dashboard/finance/payments/export">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>تصدير البيانات</span>
            </Button>
          </Link>
          <Link href="/admin-dashboard/finance/payments/create">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>إضافة فاتورة</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin-dashboard/finance" className="text-muted-foreground hover:text-foreground">
            العودة إلى لوحة المالية
          </Link>
          <h1 className="text-3xl font-bold">إدارة المدفوعات</h1>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-lg">
              <span>إجمالي المدفوعات</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAmount.toLocaleString()} ريال</div>
            <div className="text-sm text-muted-foreground mt-1">{paymentsData.length} فاتورة</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-lg">
              <span>المدفوعات المستحقة</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dueAmount.toLocaleString()} ريال</div>
            <div className="text-sm text-muted-foreground mt-1">
              {paymentsData.filter(item => ["معلق", "متأخر"].includes(item.status)).length} فاتورة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-lg">
              <span>نسبة التحصيل</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((paymentsData.filter(item => item.status === "مكتمل").length / paymentsData.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {paymentsData.filter(item => item.status === "مكتمل").length} مكتمل / {paymentsData.length} إجمالي
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-lg">
              <span>متوسط المدفوعات</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(totalAmount / paymentsData.length).toLocaleString()} ريال
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
              <div 
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${Math.round((paymentsData.filter(item => item.status === "مكتمل").length / paymentsData.length) * 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>قائمة المدفوعات والفواتير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2 w-full md:w-1/2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="البحث في المدفوعات والفواتير..." 
                  className="pl-3 pr-10 w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <div className="w-40">
                <Select 
                  value={typeFilter} 
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="نوع المدفوعات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {paymentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="h-8 w-8 animate-spin mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <>
              <div className="border rounded-md">
                <div className="grid grid-cols-7 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                  <div className="col-span-1">الإجراءات</div>
                  <div className="col-span-1">تاريخ الاستحقاق</div>
                  <div className="col-span-1">طريقة الدفع</div>
                  <div className="col-span-1">الحالة</div>
                  <div className="col-span-1">نوع المدفوعات</div>
                  <div className="col-span-1">المبلغ</div>
                  <div className="col-span-1">رقم الفاتورة / الجهة</div>
                </div>
                
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <div key={item.id} className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                      <div className="col-span-1 flex items-center gap-2">
                        <div className="flex gap-1">
                          <Link href={`/admin-dashboard/finance/payments/${item.id}`}>
                            <button className="text-blue-500 hover:text-blue-700">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={`/admin-dashboard/finance/payments/${item.id}/edit`}>
                            <button className="text-amber-500 hover:text-amber-700">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                          <Dialog>
                            <DialogTrigger>
                              <button className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تأكيد الحذف</DialogTitle>
                                <DialogDescription>
                                  هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose>
                                  <Button variant="outline">إلغاء</Button>
                                </DialogClose>
                                <Button variant="destructive" onClick={() => handleDelete(item.id)}>
                                  تأكيد الحذف
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <div className="col-span-1">{item.dueDate}</div>
                      <div className="col-span-1">{item.paymentMethod}</div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="col-span-1">{item.paymentType}</div>
                      <div className="col-span-1">{item.amount}</div>
                      <div className="col-span-1">
                        <div className="font-medium">{item.invoiceNumber}</div>
                        <div className="text-muted-foreground text-xs">{item.entity}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    لا توجد مدفوعات أو فواتير مطابقة لبحثك
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  عرض {paginatedData.length} من {filteredData.length} سجل
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{currentPage} من {totalPages || 1}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
