"use client"

import { useState, useEffect } from "react"
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
  DollarSign,
  TrendingUp,
  Calendar,
  Building,
  Users,
  Briefcase,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function FundingManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFundings, setSelectedFundings] = useState<string[]>([])
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [fundingToDelete, setFundingToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sample funding data
  const fundings = [
    { 
      id: "1", 
      startupName: "تك سمارت", 
      amount: "5,000,000 ريال", 
      type: "استثمار", 
      status: "مكتمل", 
      date: "15 يناير 2025",
      investor: "صندوق الاستثمارات الجريئة",
      equity: "15%",
      valuation: "33,333,333 ريال",
      round: "جولة أولى",
      sector: "التكنولوجيا المالية",
      program: "مسرع التقنية المالية"
    },
    { 
      id: "2", 
      startupName: "هيلث تك", 
      amount: "3,000,000 ريال", 
      type: "استثمار", 
      status: "مكتمل", 
      date: "10 فبراير 2025",
      investor: "مستثمرون ملائكة",
      equity: "10%",
      valuation: "30,000,000 ريال",
      round: "تمويل أولي",
      sector: "التكنولوجيا الصحية",
      program: "مسرع التقنيات الصحية"
    },
    { 
      id: "3", 
      startupName: "إيكو سمارت", 
      amount: "10,000,000 ريال", 
      type: "استثمار", 
      status: "مكتمل", 
      date: "5 مارس 2025",
      investor: "صندوق التنمية المستدامة",
      equity: "20%",
      valuation: "50,000,000 ريال",
      round: "جولة ثانية",
      sector: "التكنولوجيا الخضراء",
      program: "حاضنة التقنيات الناشئة"
    },
    { 
      id: "4", 
      startupName: "فود تك", 
      amount: "2,500,000 ريال", 
      type: "منحة", 
      status: "قيد المراجعة", 
      date: "20 فبراير 2025",
      investor: "صندوق دعم الابتكار",
      equity: "0%",
      valuation: "25,000,000 ريال",
      round: "تمويل أولي",
      sector: "تكنولوجيا الأغذية",
      program: "مسرع الذكاء الاصطناعي"
    },
    { 
      id: "5", 
      startupName: "إيدو تك", 
      amount: "4,000,000 ريال", 
      type: "استثمار", 
      status: "قيد المراجعة", 
      date: "1 مارس 2025",
      investor: "شركة تعليم المستقبل",
      equity: "12%",
      valuation: "33,333,333 ريال",
      round: "جولة أولى",
      sector: "تكنولوجيا التعليم",
      program: "حاضنة التقنيات الناشئة"
    },
    { 
      id: "6", 
      startupName: "سمارت هوم", 
      amount: "6,000,000 ريال", 
      type: "استثمار", 
      status: "مرفوض", 
      date: "10 يناير 2025",
      investor: "صندوق التقنيات الناشئة",
      equity: "18%",
      valuation: "33,333,333 ريال",
      round: "تمويل أولي",
      sector: "إنترنت الأشياء",
      program: "مسرع التقنية المالية"
    },
    { 
      id: "7", 
      startupName: "فينتك", 
      amount: "3,000,000 ريال", 
      type: "قرض", 
      status: "مكتمل", 
      date: "5 فبراير 2025",
      investor: "بنك التنمية",
      equity: "0%",
      valuation: "20,000,000 ريال",
      round: "جولة أولى",
      sector: "التكنولوجيا المالية",
      program: "مسرع التقنية المالية"
    }
  ]

  // Filter fundings based on active tab and search query
  const filteredFundings = fundings.filter(funding => {
    // Filter by tab
    if (activeTab === "completed" && funding.status !== "مكتمل") return false
    if (activeTab === "pending" && funding.status !== "قيد المراجعة") return false
    if (activeTab === "rejected" && funding.status !== "مرفوض") return false
    if (activeTab === "investment" && funding.type !== "استثمار") return false
    if (activeTab === "grant" && funding.type !== "منحة") return false
    if (activeTab === "loan" && funding.type !== "قرض") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        funding.startupName.toLowerCase().includes(query) ||
        funding.investor.toLowerCase().includes(query) ||
        funding.sector.toLowerCase().includes(query) ||
        funding.program.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleFundingSelection = (fundingId: string) => {
    if (selectedFundings.includes(fundingId)) {
      setSelectedFundings(selectedFundings.filter(id => id !== fundingId))
    } else {
      setSelectedFundings([...selectedFundings, fundingId])
    }
  }

  const selectAllFundings = () => {
    if (selectedFundings.length === filteredFundings.length) {
      setSelectedFundings([])
    } else {
      setSelectedFundings(filteredFundings.map(funding => funding.id))
    }
  }

  // Calculate total funding
  const totalFunding = fundings
    .filter(f => f.status === "مكتمل")
    .reduce((sum, funding) => {
      const amount = parseInt(funding.amount.replace(/[^\d]/g, ''))
      return sum + amount
    }, 0)

  // Calculate average equity
  const avgEquity = fundings
    .filter(f => f.status === "مكتمل" && f.type === "استثمار")
    .reduce((sum, funding, _, arr) => {
      return sum + parseInt(funding.equity) / arr.length
    }, 0)
    
  // Confirm delete operation for a single funding
  const confirmDelete = (id: string) => {
    setFundingToDelete(id);
    setShowDeleteConfirmation(true);
  };
  
  // Cancel delete operation
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setFundingToDelete(null);
  };
  
  // Delete a funding opportunity
  const deleteFunding = async () => {
    if (!fundingToDelete) return;
    
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      
      // In a real implementation, this would call the API
      // For now, we'll just simulate a successful deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('تم حذف فرصة التمويل بنجاح');
      
      // Remove from selected fundings
      setSelectedFundings(selectedFundings.filter(id => id !== fundingToDelete));
      
    } catch (error) {
      console.error('Error deleting funding opportunity:', error);
      toast.error('فشل في حذف فرصة التمويل');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setFundingToDelete(null);
    }
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة التمويل</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>إضافة تمويل</span>
          </Button>
        </div>
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
            <div className="text-3xl font-bold">{totalFunding.toLocaleString()} ريال</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+15% من العام السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>عدد الصفقات</span>
              <Briefcase className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fundings.filter(f => f.status === "مكتمل").length}</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+25% من العام السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>متوسط الاستثمار</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(totalFunding / fundings.filter(f => f.status === "مكتمل").length).toLocaleString()} ريال
            </div>
            <div className="flex items-center mt-2 text-amber-600">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>-5% من العام السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>متوسط الحصة</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgEquity.toFixed(1)}%</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+2% من العام السابق</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن تمويل..." 
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
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="loan">قروض</TabsTrigger>
            <TabsTrigger value="grant">منح</TabsTrigger>
            <TabsTrigger value="investment">استثمارات</TabsTrigger>
            <TabsTrigger value="rejected">مرفوض</TabsTrigger>
            <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedFundings.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>تغيير الحالة</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => confirmDelete(selectedFundings[0])}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>حذف</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>قائمة التمويلات ({filteredFundings.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-9 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="ml-2"
                  checked={selectedFundings.length === filteredFundings.length && filteredFundings.length > 0}
                  onChange={selectAllFundings}
                />
                <span>الإجراءات</span>
              </div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">النوع</div>
              <div className="col-span-1">الحصة</div>
              <div className="col-span-1">المبلغ</div>
              <div className="col-span-1">المستثمر</div>
              <div className="col-span-1">القطاع</div>
              <div className="col-span-1">التاريخ</div>
              <div className="col-span-1">الشركة الناشئة</div>
            </div>
            
            {filteredFundings.length > 0 ? (
              filteredFundings.map((funding) => (
                <div key={funding.id} className="grid grid-cols-9 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedFundings.includes(funding.id)}
                      onChange={() => toggleFundingSelection(funding.id)}
                    />
                    <div className="flex gap-1">
                      <button 
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => window.location.href = `/admin-dashboard/funding/${funding.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-amber-500 hover:text-amber-700"
                        onClick={() => window.location.href = `/admin-dashboard/funding/${funding.id}/edit`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => confirmDelete(funding.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {funding.status === "مكتمل" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        مكتمل
                      </span>
                    ) : funding.status === "قيد المراجعة" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        قيد المراجعة
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        مرفوض
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">
                    {funding.type === "استثمار" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        استثمار
                      </span>
                    ) : funding.type === "منحة" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        منحة
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        قرض
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">{funding.equity}</div>
                  <div className="col-span-1">{funding.amount}</div>
                  <div className="col-span-1">{funding.investor}</div>
                  <div className="col-span-1">{funding.sector}</div>
                  <div className="col-span-1">{funding.date}</div>
                  <div className="col-span-1">{funding.startupName}</div>
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

      {activeTab === "pending" && filteredFundings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>طلبات التمويل قيد المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFundings.map((funding) => (
                <div key={funding.id} className="flex items-center justify-between p-4 border rounded-md">
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
                    <div className="font-medium">{funding.startupName} - {funding.amount}</div>
                    <div className="text-sm text-muted-foreground">{funding.investor} • {funding.type}</div>
                    <div className="text-xs text-muted-foreground">تاريخ الطلب: {funding.date}</div>
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
              <span>توزيع التمويل حسب النوع</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-14 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">18,000,000 ريال</span>
                </div>
                <span className="text-muted-foreground">استثمار</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-5 h-3 bg-purple-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">2,500,000 ريال</span>
                </div>
                <span className="text-muted-foreground">منحة</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-6 h-3 bg-gray-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">3,000,000 ريال</span>
                </div>
                <span className="text-muted-foreground">قرض</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-right">
            <h3 className="text-xl font-bold mb-4">تأكيد الحذف</h3>
            <p className="mb-6">
              هل أنت متأكد من رغبتك في حذف فرصة التمويل هذه؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-start gap-4">
              <Button 
                variant="default" 
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                إلغاء
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteFunding}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>تأكيد الحذف</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
