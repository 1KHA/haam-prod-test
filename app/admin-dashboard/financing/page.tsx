"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Trash2, 
  Edit, 
  Eye, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CheckCircle, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle,
  DollarSign,
  TrendingUp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users,
  Briefcase,
  PieChart,
  ArrowUpRight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowDownRight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertTriangle,
  RefreshCw,
  CreditCard
} from "lucide-react"
import { toast } from "react-hot-toast"
import { exportPresets } from "@/lib/export-utils"

export default function FinancingManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Sample finance summary data
  const financingSummary = {
    totalFunding: 23500000,
    totalPayments: 7850000,
    netRevenue: 4250000,
    avgInvestment: 5600000,
    completedDeals: 8,
    pendingDeals: 5,
    completedPayments: 42,
    pendingPayments: 12
  }

  // Sample latest transactions
  const latestTransactions = [
    { 
      id: "1", 
      type: "funding", 
      amount: "5,000,000 ريال", 
      entity: "تك سمارت", 
      status: "مكتمل", 
      date: "15 يناير 2025",
      category: "استثمار"
    },
    { 
      id: "2", 
      type: "payment", 
      amount: "250,000 ريال", 
      entity: "شركة الحلول التقنية", 
      status: "مكتمل", 
      date: "12 يناير 2025",
      category: "رسوم برنامج"
    },
    { 
      id: "3", 
      type: "funding", 
      amount: "3,000,000 ريال", 
      entity: "هيلث تك", 
      status: "قيد المراجعة", 
      date: "10 يناير 2025",
      category: "منحة"
    },
    { 
      id: "4", 
      type: "payment", 
      amount: "75,000 ريال", 
      entity: "مؤسسة التعليم الذكي", 
      status: "معلق", 
      date: "8 يناير 2025",
      category: "رسوم خدمات"
    },
    { 
      id: "5", 
      type: "funding", 
      amount: "10,000,000 ريال", 
      entity: "إيكو سمارت", 
      status: "قيد المراجعة", 
      date: "5 يناير 2025",
      category: "استثمار"
    },
    { 
      id: "6", 
      type: "payment", 
      amount: "120,000 ريال", 
      entity: "شركة التقنيات المتقدمة", 
      status: "مكتمل", 
      date: "3 يناير 2025",
      category: "رسوم فعالية"
    }
  ]

  // Fetch finance data on component mount
  useEffect(() => {
    // Simulating API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter transactions based on active tab and search query
  const filteredTransactions = latestTransactions.filter(transaction => {
    // Filter by tab
    if (activeTab === "funding" && transaction.type !== "funding") return false
    if (activeTab === "payments" && transaction.type !== "payment") return false
    if (activeTab === "completed" && transaction.status !== "مكتمل") return false
    if (activeTab === "pending" && !["قيد المراجعة", "معلق"].includes(transaction.status)) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        transaction.entity.toLowerCase().includes(query) ||
        transaction.amount.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query)
      )
    }

    return true
  })

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={async () => {
              try {
                await exportPresets.financing({}, {
                  onSuccess: () => toast.success('تم تصدير التقارير المالية بنجاح'),
                  onError: (error) => toast.error(`حدث خطأ أثناء تصدير البيانات: ${error}`)
                });
              } catch (error) {
                console.error('Export error:', error);
                toast.error('حدث خطأ أثناء تصدير البيانات');
              }
            }}
          >
            <Download className="h-4 w-4" />
            <span>تصدير التقارير المالية</span>
          </Button>
          <Link href="/admin-dashboard/financing/funding/create">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>إضافة تمويل</span>
            </Button>
          </Link>
          <Link href="/admin-dashboard/financing/payments/create">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>إنشاء فاتورة</span>
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">إدارة التمويل</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي التمويل</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{financingSummary.totalFunding.toLocaleString()} ريال</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+15% من العام السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي المدفوعات</span>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{financingSummary.totalPayments.toLocaleString()} ريال</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+8% من العام السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>صافي الإيرادات</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{financingSummary.netRevenue.toLocaleString()} ريال</div>
            <div className="flex items-center mt-2 text-amber-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+12% من العام السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>الصفقات المكتملة</span>
              <Briefcase className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{financingSummary.completedDeals}</div>
            <div className="text-sm text-muted-foreground mt-1">{financingSummary.pendingDeals} صفقات معلقة</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin-dashboard/financing/funding" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>إدارة التمويل</span>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>عرض وإدارة فرص التمويل والاستثمارات والمنح</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium text-muted-foreground">الصفقات المكتملة</div>
                  <div className="text-2xl font-bold mt-1">{financingSummary.completedDeals}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium text-muted-foreground">متوسط التمويل</div>
                  <div className="text-2xl font-bold mt-1">{(financingSummary.avgInvestment / 1000000).toFixed(1)}M ريال</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin-dashboard/financing/payments" className="block">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-end gap-2">
                <span>إدارة المدفوعات</span>
                <CreditCard className="h-5 w-5 text-primary" />
              </CardTitle>
              <CardDescription>عرض وإدارة المدفوعات والفواتير والإيرادات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium text-muted-foreground">المدفوعات المكتملة</div>
                  <div className="text-2xl font-bold mt-1">{financingSummary.completedPayments}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium text-muted-foreground">المدفوعات المعلقة</div>
                  <div className="text-2xl font-bold mt-1">{financingSummary.pendingPayments}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في المعاملات المالية..." 
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
          <TabsList className="grid grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="pending">معلق</TabsTrigger>
            <TabsTrigger value="completed">مكتمل</TabsTrigger>
            <TabsTrigger value="payments">مدفوعات</TabsTrigger>
            <TabsTrigger value="funding">تمويل</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={async () => {
                  try {
                    const exportUrl = `/api/admin/financing/export?format=csv&type=${activeTab === 'funding' ? 'funding' : activeTab === 'payments' ? 'payments' : 'all'}`;

                    const response = await fetch(exportUrl);

                    if (!response.ok) {
                      throw new Error('فشل في تصدير البيانات');
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `financing-${activeTab}-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    toast.success('تم تصدير البيانات المالية بنجاح');
                  } catch (error) {
                    console.error('Export error:', error);
                    toast.error('حدث خطأ أثناء تصدير البيانات');
                  }
                }}
              >
                <Download className="h-4 w-4" />
                <span>تصدير</span>
              </Button>
            </div>
            <CardTitle>أحدث المعاملات المالية ({filteredTransactions.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="grid grid-cols-7 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-1">الإجراءات</div>
                <div className="col-span-1">التاريخ</div>
                <div className="col-span-1">النوع</div>
                <div className="col-span-1">الفئة</div>
                <div className="col-span-1">الحالة</div>
                <div className="col-span-1">المبلغ</div>
                <div className="col-span-1">الجهة</div>
              </div>
              
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                    <div className="col-span-1 flex items-center gap-2">
                      <div className="flex gap-1">
                        <Link 
                          href={transaction.type === "funding" 
                            ? `/admin-dashboard/financing/funding/${transaction.id}` 
                            : `/admin-dashboard/financing/payments/${transaction.id}`}
                        >
                          <button className="text-blue-500 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link 
                          href={transaction.type === "funding" 
                            ? `/admin-dashboard/financing/funding/${transaction.id}/edit` 
                            : `/admin-dashboard/financing/payments/${transaction.id}/edit`}
                        >
                          <button className="text-amber-500 hover:text-amber-700">
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                    <div className="col-span-1">{transaction.date}</div>
                    <div className="col-span-1">
                      {transaction.type === "funding" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          تمويل
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          مدفوعات
                        </span>
                      )}
                    </div>
                    <div className="col-span-1">{transaction.category}</div>
                    <div className="col-span-1">
                      {transaction.status === "مكتمل" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          مكتمل
                        </span>
                      ) : transaction.status === "قيد المراجعة" || transaction.status === "معلق" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {transaction.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {transaction.status}
                        </span>
                      )}
                    </div>
                    <div className="col-span-1">{transaction.amount}</div>
                    <div className="col-span-1">{transaction.entity}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  لا توجد معاملات مطابقة لبحثك
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع التمويل حسب القطاع</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">8,000,000 ريال</span>
                </div>
                <span className="text-muted-foreground">التكنولوجيا المالية</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">3,000,000 ريال</span>
                </div>
                <span className="text-muted-foreground">التكنولوجيا الصحية</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-3 bg-amber-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">10,000,000 ريال</span>
                </div>
                <span className="text-muted-foreground">التكنولوجيا الخضراء</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-6 h-3 bg-purple-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">2,500,000 ريال</span>
                </div>
                <span className="text-muted-foreground">قطاعات أخرى</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إيرادات الاشتراكات الشهرية</span>
              <TrendingUp className="h-5 w-5 text-primary" />
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
