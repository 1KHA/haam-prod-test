"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Upload,
  Plus,
  Search,
  ArrowRight,
  BarChart,
  PieChart,
  TrendingUp,
  Clock,
  Download
} from "lucide-react"

export default function FundingPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  
  // Mock data for funding requests
  const [fundingRequests, setFundingRequests] = useState([
    {
      id: "1",
      title: "تمويل المرحلة الأولى",
      description: "طلب تمويل للمرحلة الأولى من تطوير المنتج، يشمل تكاليف البرمجة والتصميم والاختبار.",
      amount: 100000,
      submissionDate: "15 يناير 2025",
      status: "approved",
      category: "seed",
      documents: [
        { name: "خطة العمل", type: "pdf", url: "/documents/business-plan.pdf" },
        { name: "التوقعات المالية", type: "xlsx", url: "/documents/financial-projections.xlsx" }
      ]
    },
    {
      id: "2",
      title: "تمويل حملة التسويق",
      description: "طلب تمويل لإطلاق حملة تسويقية شاملة تشمل الإعلانات الرقمية والتسويق عبر وسائل التواصل الاجتماعي.",
      amount: 50000,
      submissionDate: "10 فبراير 2025",
      status: "pending",
      category: "other",
      documents: [
        { name: "خطة التسويق", type: "pdf", url: "/documents/marketing-plan.pdf" },
        { name: "ميزانية الحملة", type: "xlsx", url: "/documents/campaign-budget.xlsx" }
      ]
    },
    {
      id: "3",
      title: "تمويل توسيع الفريق",
      description: "طلب تمويل لتوظيف مطورين ومصممين جدد لتسريع تطوير المنتج.",
      amount: 75000,
      submissionDate: "5 مارس 2025",
      status: "rejected",
      category: "series_a",
      feedback: "يرجى تقديم خطة أكثر تفصيلاً لكيفية استخدام التمويل وتأثيره على نمو الشركة.",
      documents: [
        { name: "خطة التوظيف", type: "pdf", url: "/documents/hiring-plan.pdf" }
      ]
    }
  ])

  // Mock data for funding disbursements
  const [fundingDisbursements, setFundingDisbursements] = useState([
    {
      id: "d1",
      requestId: "1",
      amount: 50000,
      date: "1 فبراير 2025",
      status: "completed",
      description: "الدفعة الأولى من تمويل المرحلة الأولى"
    },
    {
      id: "d2",
      requestId: "1",
      amount: 50000,
      date: "1 مارس 2025",
      status: "scheduled",
      description: "الدفعة الثانية من تمويل المرحلة الأولى"
    }
  ])

  // New funding request form state
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    amount: 0,
    category: "seed"
  })

  // Filter funding requests based on search query
  const filteredRequests = fundingRequests.filter(request => {
    return request.title.includes(searchQuery) || 
           request.description.includes(searchQuery) || 
           request.category.includes(searchQuery)
  })

  const selectedRequest = fundingRequests.find(r => r.id === selectedRequestId) || null

  // Calculate funding statistics
  const totalRequested = fundingRequests.reduce((sum, request) => sum + request.amount, 0)
  const totalApproved = fundingRequests
    .filter(request => request.status === "approved")
    .reduce((sum, request) => sum + request.amount, 0)
  const totalPending = fundingRequests
    .filter(request => request.status === "pending")
    .reduce((sum, request) => sum + request.amount, 0)
  const totalDisbursed = fundingDisbursements
    .filter(disbursement => disbursement.status === "completed")
    .reduce((sum, disbursement) => sum + disbursement.amount, 0)

  const handleCreateRequest = () => {
    const id = Math.random().toString(36).substring(2, 9)
    const newFundingRequest = {
      id,
      ...newRequest,
      submissionDate: new Date().toLocaleDateString('ar-SA'),
      status: "draft",
      documents: []
    }

    setFundingRequests([...fundingRequests, newFundingRequest])
    setNewRequest({
      title: "",
      description: "",
      amount: 0,
      category: "seed"
    })
    setIsCreatingRequest(false)
    setSelectedRequestId(id)
  }

  const handleSubmitRequest = (requestId: string) => {
    setFundingRequests(fundingRequests.map(request => 
      request.id === requestId 
        ? { ...request, status: "pending" } 
        : request
    ))
    
    toast({ title: "تم", description: "تم تقديم طلب التمويل بنجاح" })
  }

  const handleDeleteRequest = (requestId: string) => {
    setFundingRequests(fundingRequests.filter(request => request.id !== requestId))
    setSelectedRequestId(null)
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "seed":
        return "تمويل أولي"
      case "series_a":
        return "تمويل المرحلة A"
      case "series_b":
        return "تمويل المرحلة B"
      case "grant":
        return "منحة"
      default:
        return "أخرى"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "draft":
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "تمت الموافقة"
      case "rejected":
        return "مرفوض"
      case "pending":
        return "قيد المراجعة"
      case "draft":
        return "مسودة"
      default:
        return "غير معروف"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => {
            setIsCreatingRequest(true)
            setSelectedRequestId(null)
          }}
          className="flex items-center gap-2"
          disabled={isCreatingRequest}
        >
          <Plus className="h-4 w-4" />
          طلب تمويل جديد
        </Button>
        <h1 className="text-3xl font-bold">طلبات التمويل</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="requests">الطلبات</TabsTrigger>
          <TabsTrigger value="disbursements">الدفعات</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي التمويل المطلوب</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRequested)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التمويل المعتمد</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalApproved)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التمويل قيد المراجعة</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التمويل المستلم</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalDisbursed)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع التمويل حسب الفئة</CardTitle>
                <CardDescription>توزيع طلبات التمويل حسب الفئة</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-64">
                <div className="flex items-center justify-center">
                  <PieChart className="h-32 w-32 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>حالة طلبات التمويل</CardTitle>
                <CardDescription>عدد الطلبات حسب الحالة</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-64">
                <div className="flex items-center justify-center">
                  <BarChart className="h-32 w-32 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          {isCreatingRequest ? (
            <Card>
              <CardHeader>
                <CardTitle>طلب تمويل جديد</CardTitle>
                <CardDescription>أدخل تفاصيل طلب التمويل الجديد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الطلب</Label>
                    <Input 
                      id="title" 
                      value={newRequest.title} 
                      onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      placeholder="أدخل عنوان طلب التمويل"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف الطلب</Label>
                    <Textarea 
                      id="description" 
                      rows={4} 
                      value={newRequest.description} 
                      onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                      placeholder="اشرح الغرض من طلب التمويل وكيفية استخدامه"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">المبلغ المطلوب (ريال)</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        value={newRequest.amount} 
                        onChange={(e) => setNewRequest({...newRequest, amount: Number(e.target.value)})}
                        placeholder="أدخل المبلغ المطلوب"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">فئة التمويل</Label>
                      <select 
                        id="category" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newRequest.category} 
                        onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                      >
                        <option value="seed">تمويل أولي</option>
                        <option value="series_a">تمويل المرحلة A</option>
                        <option value="series_b">تمويل المرحلة B</option>
                        <option value="grant">منحة</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatingRequest(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleCreateRequest}
                  disabled={!newRequest.title || !newRequest.description || newRequest.amount <= 0}
                >
                  إنشاء الطلب
                </Button>
              </CardFooter>
            </Card>
          ) : selectedRequest ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedRequestId(null)}
                  >
                    العودة للقائمة
                  </Button>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getStatusIcon(selectedRequest.status)}
                      <CardTitle>{selectedRequest.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">{getCategoryText(selectedRequest.category)} • {selectedRequest.submissionDate}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-right">وصف الطلب</h3>
                    <p className="text-right">{selectedRequest.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">المبلغ المطلوب</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(selectedRequest.amount)}</p>
                        </div>
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">تاريخ التقديم</p>
                          <p className="text-sm text-muted-foreground">{selectedRequest.submissionDate}</p>
                        </div>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">الحالة</p>
                          <p className="text-sm text-muted-foreground">{getStatusText(selectedRequest.status)}</p>
                        </div>
                        {getStatusIcon(selectedRequest.status)}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">فئة التمويل</p>
                          <p className="text-sm text-muted-foreground">{getCategoryText(selectedRequest.category)}</p>
                        </div>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {selectedRequest.status === "draft" && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDeleteRequest(selectedRequest.id)}
                      className="text-red-500 hover:text-red-500"
                    >
                      حذف الطلب
                    </Button>
                    <Button 
                      onClick={() => handleSubmitRequest(selectedRequest.id)}
                    >
                      تقديم الطلب
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-64">
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="بحث..." 
                    className="pr-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  إجمالي الطلبات: {fundingRequests.length}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            request.status === "approved" ? "bg-green-100 text-green-800" : 
                            request.status === "rejected" ? "bg-red-100 text-red-800" : 
                            request.status === "pending" ? "bg-amber-100 text-amber-800" : 
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <CardDescription className="mt-1">{getCategoryText(request.category)}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-right line-clamp-2">{request.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRequestId(request.id)}
                        >
                          عرض التفاصيل
                          <ArrowRight className="h-4 w-4 mr-2" />
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(request.amount)} • {request.submissionDate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="disbursements">
          <Card>
            <CardHeader>
              <CardTitle>الدفعات المالية</CardTitle>
              <CardDescription>سجل الدفعات المالية للتمويلات المعتمدة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fundingDisbursements.map((disbursement) => {
                  const request = fundingRequests.find(r => r.id === disbursement.requestId)
                  return (
                    <div key={disbursement.id} className="border-r-4 border-blue-500 pr-4 py-2">
                      <div className="flex justify-between items-start">
                        <div className="text-sm text-muted-foreground">
                          {disbursement.status === "completed" ? "تم الاستلام" : "مجدول"}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(disbursement.amount)}</p>
                          <p className="text-sm text-muted-foreground">{disbursement.date} • {request?.title}</p>
                          <p className="text-sm text-muted-foreground">{disbursement.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
