"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  PieChart,
  RefreshCw,
  Receipt
} from "lucide-react"

export default function PaymentsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("month")
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])

  // Sample payments data
  const payments = [
    { 
      id: "1", 
      reference: "INV-2025-001", 
      amount: "5,000 ريال", 
      type: "رسوم اشتراك", 
      status: "مكتمل", 
      date: "12 مارس 2025",
      time: "10:15:22",
      paymentMethod: "بطاقة ائتمان",
      entity: "شركة تك سمارت",
      entityType: "شركة ناشئة",
      program: "مسرع التقنية المالية",
      description: "رسوم الاشتراك السنوي في برنامج المسرع"
    },
    { 
      id: "2", 
      reference: "INV-2025-002", 
      amount: "3,500 ريال", 
      type: "رسوم خدمات", 
      status: "مكتمل", 
      date: "10 مارس 2025",
      time: "14:30:45",
      paymentMethod: "تحويل بنكي",
      entity: "شركة هيلث تك",
      entityType: "شركة ناشئة",
      program: "مسرع التقنيات الصحية",
      description: "رسوم خدمات استشارية"
    },
    { 
      id: "3", 
      reference: "INV-2025-003", 
      amount: "7,500 ريال", 
      type: "رسوم اشتراك", 
      status: "معلق", 
      date: "9 مارس 2025",
      time: "09:20:15",
      paymentMethod: "تحويل بنكي",
      entity: "شركة إيكو سمارت",
      entityType: "شركة ناشئة",
      program: "حاضنة التقنيات الناشئة",
      description: "رسوم الاشتراك السنوي في برنامج الحاضنة"
    },
    { 
      id: "4", 
      reference: "INV-2025-004", 
      amount: "2,000 ريال", 
      type: "رسوم فعالية", 
      status: "معلق", 
      date: "8 مارس 2025",
      time: "16:45:30",
      paymentMethod: "بطاقة ائتمان",
      entity: "شركة فود تك",
      entityType: "شركة ناشئة",
      program: "مسرع الذكاء الاصطناعي",
      description: "رسوم المشاركة في هاكاثون الذكاء الاصطناعي"
    },
    { 
      id: "5", 
      reference: "INV-2025-005", 
      amount: "4,500 ريال", 
      type: "رسوم خدمات", 
      status: "مرفوض", 
      date: "7 مارس 2025",
      time: "11:10:05",
      paymentMethod: "بطاقة ائتمان",
      entity: "شركة إيدو تك",
      entityType: "شركة ناشئة",
      program: "حاضنة التقنيات الناشئة",
      description: "رسوم خدمات تسويقية - فشل الدفع بسبب رفض البطاقة"
    },
    { 
      id: "6", 
      reference: "INV-2025-006", 
      amount: "10,000 ريال", 
      type: "رسوم اشتراك", 
      status: "مكتمل", 
      date: "5 مارس 2025",
      time: "13:25:40",
      paymentMethod: "تحويل بنكي",
      entity: "شركة سمارت هوم",
      entityType: "شركة ناشئة",
      program: "مسرع التقنية المالية",
      description: "رسوم الاشتراك السنوي في برنامج المسرع"
    },
    { 
      id: "7", 
      reference: "INV-2025-007", 
      amount: "3,000 ريال", 
      type: "رسوم خدمات", 
      status: "مكتمل", 
      date: "3 مارس 2025",
      time: "09:50:15",
      paymentMethod: "بطاقة ائتمان",
      entity: "شركة فينتك",
      entityType: "شركة ناشئة",
      program: "مسرع التقنية المالية",
      description: "رسوم خدمات استشارية قانونية"
    },
    { 
      id: "8", 
      reference: "INV-2025-008", 
      amount: "1,500 ريال", 
      type: "رسوم فعالية", 
      status: "مكتمل", 
      date: "1 مارس 2025",
      time: "14:15:30",
      paymentMethod: "بطاقة ائتمان",
      entity: "شركة تك سمارت",
      entityType: "شركة ناشئة",
      program: "مسرع التقنية المالية",
      description: "رسوم المشاركة في ورشة عمل التسويق الرقمي"
    },
    { 
      id: "9", 
      reference: "INV-2025-009", 
      amount: "8,000 ريال", 
      type: "رسوم اشتراك", 
      status: "معلق", 
      date: "28 فبراير 2025",
      time: "10:30:45",
      paymentMethod: "تحويل بنكي",
      entity: "شركة ميديا تك",
      entityType: "شركة ناشئة",
      program: "حاضنة التقنيات الناشئة",
      description: "رسوم الاشتراك السنوي في برنامج الحاضنة"
    },
    { 
      id: "10", 
      reference: "INV-2025-010", 
      amount: "2,500 ريال", 
      type: "رسوم خدمات", 
      status: "مرفوض", 
      date: "25 فبراير 2025",
      time: "15:20:10",
      paymentMethod: "بطاقة ائتمان",
      entity: "شركة إيكو سمارت",
      entityType: "شركة ناشئة",
      program: "حاضنة التقنيات الناشئة",
      description: "رسوم خدمات استشارية - فشل الدفع بسبب انتهاء صلاحية البطاقة"
    }
  ]

  // Filter payments based on active tab, search query, and date range
  const filteredPayments = payments.filter(payment => {
    // Filter by tab
    if (activeTab === "completed" && payment.status !== "مكتمل") return false
    if (activeTab === "pending" && payment.status !== "معلق") return false
    if (activeTab === "rejected" && payment.status !== "مرفوض") return false
    if (activeTab === "subscription" && payment.type !== "رسوم اشتراك") return false
    if (activeTab === "services" && payment.type !== "رسوم خدمات") return false
    if (activeTab === "events" && payment.type !== "رسوم فعالية") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        payment.reference.toLowerCase().includes(query) ||
        payment.entity.toLowerCase().includes(query) ||
        payment.program.toLowerCase().includes(query) ||
        payment.description.toLowerCase().includes(query)
      )
    }

    // Filter by date range (simplified for demo)
    // In a real app, you would parse the date and compare with actual date ranges
    if (dateRange === "week" && !payment.date.includes("مارس")) return false
    if (dateRange === "today" && payment.date !== "12 مارس 2025") return false

    return true
  })

  const togglePaymentSelection = (paymentId: string) => {
    if (selectedPayments.includes(paymentId)) {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId))
    } else {
      setSelectedPayments([...selectedPayments, paymentId])
    }
  }

  const selectAllPayments = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(filteredPayments.map(payment => payment.id))
    }
  }

  // Calculate total revenue
  const totalRevenue = payments
    .filter(p => p.status === "مكتمل")
    .reduce((sum, payment) => {
      const amount = parseInt(payment.amount.replace(/[^\d]/g, ''))
      return sum + amount
    }, 0)

  // Calculate pending revenue
  const pendingRevenue = payments
    .filter(p => p.status === "معلق")
    .reduce((sum, payment) => {
      const amount = parseInt(payment.amount.replace(/[^\d]/g, ''))
      return sum + amount
    }, 0)

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>تحديث</span>
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>إنشاء فاتورة</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة المدفوعات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي الإيرادات</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRevenue.toLocaleString()} ريال</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+12% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>المدفوعات المعلقة</span>
              <Clock className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRevenue.toLocaleString()} ريال</div>
            <div className="text-sm text-muted-foreground mt-1">{payments.filter(p => p.status === "معلق").length} معاملات</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>المعاملات المكتملة</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{payments.filter(p => p.status === "مكتمل").length}</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+8% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>المعاملات المرفوضة</span>
              <XCircle className="h-5 w-5 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{payments.filter(p => p.status === "مرفوض").length}</div>
            <div className="flex items-center mt-2 text-amber-600">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>-5% من الشهر السابق</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن معاملة..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-4">
          <select 
            className="p-2 border rounded-md"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">اليوم</option>
            <option value="week">آخر 7 أيام</option>
            <option value="month">آخر 30 يوم</option>
            <option value="quarter">آخر 3 أشهر</option>
          </select>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="events">فعاليات</TabsTrigger>
              <TabsTrigger value="services">خدمات</TabsTrigger>
              <TabsTrigger value="subscription">اشتراكات</TabsTrigger>
              <TabsTrigger value="rejected">مرفوض</TabsTrigger>
              <TabsTrigger value="pending">معلق</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedPayments.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    <span>إعادة إرسال الإيصال</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>تصدير المحدد</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>سجل المدفوعات ({filteredPayments.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="ml-2"
                  checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                  onChange={selectAllPayments}
                />
                <span>الإجراءات</span>
              </div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">طريقة الدفع</div>
              <div className="col-span-1">المبلغ</div>
              <div className="col-span-1">النوع</div>
              <div className="col-span-1">الجهة</div>
              <div className="col-span-1">التاريخ</div>
              <div className="col-span-1">رقم المرجع</div>
            </div>
            
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => togglePaymentSelection(payment.id)}
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
                    {payment.status === "مكتمل" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        مكتمل
                      </span>
                    ) : payment.status === "معلق" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        معلق
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        مرفوض
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">{payment.paymentMethod}</div>
                  <div className="col-span-1">{payment.amount}</div>
                  <div className="col-span-1">{payment.type}</div>
                  <div className="col-span-1">{payment.entity}</div>
                  <div className="col-span-1">{payment.date}</div>
                  <div className="col-span-1">{payment.reference}</div>
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

      {activeTab === "pending" && filteredPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المدفوعات المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>إلغاء</span>
                    </Button>
                    <Button variant="default" size="sm" className="flex items-center gap-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>إعادة محاولة</span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{payment.reference} - {payment.amount}</div>
                    <div className="text-sm text-muted-foreground">{payment.entity} • {payment.type}</div>
                    <div className="text-xs text-muted-foreground">تاريخ الطلب: {payment.date} {payment.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع المدفوعات حسب النوع</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.type === "رسوم اشتراك").length}
                  </span>
                </div>
                <span className="text-muted-foreground">رسوم اشتراك</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.type === "رسوم خدمات").length}
                  </span>
                </div>
                <span className="text-muted-foreground">رسوم خدمات</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-3 bg-amber-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.type === "رسوم فعالية").length}
                  </span>
                </div>
                <span className="text-muted-foreground">رسوم فعالية</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع المدفوعات حسب طريقة الدفع</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.paymentMethod === "بطاقة ائتمان").length}
                  </span>
                </div>
                <span className="text-muted-foreground">بطاقة ائتمان</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">
                    {payments.filter(p => p.paymentMethod === "تحويل بنكي").length}
                  </span>
                </div>
                <span className="text-muted-foreground">تحويل بنكي</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-end gap-2">
            <span>تقرير الإيرادات الشهرية</span>
            <BarChart className="h-5 w-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-end justify-between gap-2 pt-10 pb-5">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary rounded-t-md" style={{ height: '30%' }}></div>
              <span className="text-xs">يناير</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary rounded-t-md" style={{ height: '45%' }}></div>
              <span className="text-xs">فبراير</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary rounded-t-md" style={{ height: '60%' }}></div>
              <span className="text-xs">مارس</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '70%' }}></div>
              <span className="text-xs">أبريل</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '80%' }}></div>
              <span className="text-xs">مايو</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '90%' }}></div>
              <span className="text-xs">يونيو</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '75%' }}></div>
              <span className="text-xs">يوليو</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '65%' }}></div>
              <span className="text-xs">أغسطس</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '85%' }}></div>
              <span className="text-xs">سبتمبر</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '95%' }}></div>
              <span className="text-xs">أكتوبر</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '80%' }}></div>
              <span className="text-xs">نوفمبر</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-primary/50 rounded-t-md" style={{ height: '100%' }}></div>
              <span className="text-xs">ديسمبر</span>
            </div>
          </div>
