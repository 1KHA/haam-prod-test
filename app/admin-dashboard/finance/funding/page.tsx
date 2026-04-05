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
  DollarSign,
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

export default function FundingManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Sample funding data
  const fundingData = [
    {
      id: "1",
      title: "تمويل شركة تك سمارت",
      amount: "5,000,000 ريال",
      company: "تك سمارت",
      category: "استثمار",
      status: "مكتمل",
      date: "15 يناير 2025",
      investor: "شركة الاستثمارات المتقدمة"
    },
    {
      id: "2",
      title: "منحة تطوير منتج صحي",
      amount: "3,000,000 ريال",
      company: "هيلث تك",
      category: "منحة",
      status: "قيد المراجعة",
      date: "10 يناير 2025",
      investor: "مؤسسة دعم الابتكار الصحي"
    },
    {
      id: "3",
      title: "تمويل مشروع التكنولوجيا الخضراء",
      amount: "10,000,000 ريال",
      company: "إيكو سمارت",
      category: "استثمار",
      status: "قيد المراجعة",
      date: "5 يناير 2025",
      investor: "صندوق الاستثمارات البيئية"
    },
    {
      id: "4",
      title: "تمويل تطوير تطبيق تعليمي",
      amount: "2,000,000 ريال",
      company: "تعليم بلس",
      category: "منحة",
      status: "مكتمل",
      date: "28 ديسمبر 2024",
      investor: "وزارة التعليم"
    },
    {
      id: "5",
      title: "استثمار في شركة تقنية مالية",
      amount: "8,000,000 ريال",
      company: "فين تك",
      category: "استثمار",
      status: "مكتمل",
      date: "15 ديسمبر 2024",
      investor: "بنك الاستثمار الرقمي"
    },
    {
      id: "6",
      title: "تمويل توسع إقليمي",
      amount: "4,500,000 ريال",
      company: "ترانس لوجيستكس",
      category: "قرض",
      status: "مرفوض",
      date: "10 ديسمبر 2024",
      investor: "شركة تمويل المشاريع الكبرى"
    },
    {
      id: "7",
      title: "استثمار في منصة تجارة إلكترونية",
      amount: "6,500,000 ريال",
      company: "سوق أونلاين",
      category: "استثمار",
      status: "مكتمل",
      date: "5 ديسمبر 2024",
      investor: "مجموعة الاستثمارات الرقمية"
    },
    {
      id: "8",
      title: "تمويل أبحاث الذكاء الاصطناعي",
      amount: "12,000,000 ريال",
      company: "أي آي لابز",
      category: "منحة",
      status: "قيد المراجعة",
      date: "1 ديسمبر 2024",
      investor: "مؤسسة تطوير التكنولوجيا"
    },
    {
      id: "9",
      title: "استثمار في تقنيات الواقع المعزز",
      amount: "7,000,000 ريال",
      company: "آر تك",
      category: "استثمار",
      status: "مكتمل",
      date: "25 نوفمبر 2024",
      investor: "صندوق تقنيات المستقبل"
    },
    {
      id: "10",
      title: "تمويل مشروع طاقة متجددة",
      amount: "15,000,000 ريال",
      company: "سولار بلس",
      category: "قرض",
      status: "معلق",
      date: "20 نوفمبر 2024",
      investor: "البنك الأخضر للاستثمار"
    },
    {
      id: "11",
      title: "استثمار في منصة تعليمية",
      amount: "4,000,000 ريال",
      company: "تعلم أونلاين",
      category: "استثمار",
      status: "مكتمل",
      date: "15 نوفمبر 2024",
      investor: "شركة استثمارات التعليم"
    },
    {
      id: "12",
      title: "تمويل تطوير برمجيات طبية",
      amount: "3,500,000 ريال",
      company: "ميد سوفت",
      category: "منحة",
      status: "قيد المراجعة",
      date: "10 نوفمبر 2024",
      investor: "هيئة التطوير الصحي"
    }
  ]

  // Fetch funding data on component mount
  useEffect(() => {
    // Simulating API call
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Filter funding data based on search query and filters
  const filteredData = fundingData.filter(item => {
    // Filter by status
    if (statusFilter !== "all" && item.status !== statusFilter) return false
    
    // Filter by category
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.title.toLowerCase().includes(query) ||
        item.company.toLowerCase().includes(query) ||
        item.investor.toLowerCase().includes(query) ||
        item.amount.toLowerCase().includes(query)
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

  // Handle delete funding
  const handleDelete = (id: string) => {
    // In a real implementation, this would call an API to delete the funding
    toast.success("تم حذف التمويل بنجاح")
    // You would then refresh the funding data
  }

  // Unique categories and statuses for filtering
  const categories = Array.from(new Set(fundingData.map(item => item.category)))
  const statuses = Array.from(new Set(fundingData.map(item => item.status)))

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/admin-dashboard/finance/funding/export">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>تصدير البيانات</span>
            </Button>
          </Link>
          <Link href="/admin-dashboard/finance/funding/create">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>إضافة تمويل</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin-dashboard/finance" className="text-muted-foreground hover:text-foreground">
            العودة إلى لوحة المالية
          </Link>
          <h1 className="text-3xl font-bold">إدارة التمويل</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>قائمة التمويل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2 w-full md:w-1/2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="البحث في التمويل..." 
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
                  value={categoryFilter} 
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
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
                  <div className="col-span-1">التاريخ</div>
                  <div className="col-span-1">الحالة</div>
                  <div className="col-span-1">الفئة</div>
                  <div className="col-span-1">المستثمر</div>
                  <div className="col-span-1">المبلغ</div>
                  <div className="col-span-1">العنوان</div>
                </div>
                
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <div key={item.id} className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                      <div className="col-span-1 flex items-center gap-2">
                        <div className="flex gap-1">
                          <Link href={`/admin-dashboard/finance/funding/${item.id}`}>
                            <button className="text-blue-500 hover:text-blue-700">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={`/admin-dashboard/finance/funding/${item.id}/edit`}>
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
                                  هل أنت متأكد من رغبتك في حذف هذا التمويل؟ لا يمكن التراجع عن هذا الإجراء.
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
                      <div className="col-span-1">{item.date}</div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${item.status === "مكتمل" ? "bg-green-100 text-green-800" : 
                            item.status === "قيد المراجعة" || item.status === "معلق" ? "bg-amber-100 text-amber-800" : 
                            "bg-red-100 text-red-800"}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="col-span-1">{item.category}</div>
                      <div className="col-span-1">{item.investor}</div>
                      <div className="col-span-1">{item.amount}</div>
                      <div className="col-span-1 font-medium">{item.title}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    لا توجد بيانات تمويل مطابقة لبحثك
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-lg">
              <span>إجمالي التمويل</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {fundingData.reduce((total, item) => {
                const amount = parseFloat(item.amount.replace(/[^0-9.]/g, ''))
                return total + amount
              }, 0).toLocaleString()} ريال
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-lg">
              <span>عمليات التمويل</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fundingData.length}</div>
            <div className="text-sm text-muted-foreground">
              {fundingData.filter(item => item.status === "مكتمل").length} مكتمل /
              {fundingData.filter(item => ["قيد المراجعة", "معلق"].includes(item.status)).length} قيد المراجعة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-lg">
              <span>متوسط التمويل</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(fundingData.reduce((total, item) => {
                const amount = parseFloat(item.amount.replace(/[^0-9.]/g, ''))
                return total + amount
              }, 0) / fundingData.length).toLocaleString()} ريال
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-lg">
              <span>توزيع التمويل</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{Math.round((fundingData.filter(i => i.category === "استثمار").length / fundingData.length) * 100)}%</span>
                <span>استثمار</span>
              </div>
              <div className="flex justify-between">
                <span>{Math.round((fundingData.filter(i => i.category === "منحة").length / fundingData.length) * 100)}%</span>
                <span>منحة</span>
              </div>
              <div className="flex justify-between">
                <span>{Math.round((fundingData.filter(i => i.category === "قرض").length / fundingData.length) * 100)}%</span>
                <span>قرض</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
