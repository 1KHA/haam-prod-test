"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus, 
  DollarSign, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CheckCircle, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart
} from "lucide-react"

export default function FundingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const fundingRequests = [
    {
      id: 1,
      startupName: "تك سوليوشنز",
      amount: 150000,
      requestDate: "2025/03/01",
      purpose: "تطوير المنتج",
      status: "pending",
      cohort: "دفعة الابتكار 2025",
      description: "تمويل لتطوير النسخة الثانية من المنتج وإضافة ميزات جديدة مطلوبة من العملاء"
    },
    {
      id: 2,
      startupName: "هيلث تك",
      amount: 200000,
      requestDate: "2025/02/15",
      purpose: "توسيع الفريق",
      status: "approved",
      approvalDate: "2025/02/25",
      cohort: "دفعة التقنيات الصحية 2024",
      description: "تمويل لتوظيف مطورين جدد وخبير تسويق لتوسيع نطاق العمل"
    },
    {
      id: 3,
      startupName: "باي تك",
      amount: 100000,
      requestDate: "2025/02/20",
      purpose: "تسويق",
      status: "approved",
      approvalDate: "2025/03/01",
      cohort: "دفعة التقنية المالية 2024",
      description: "تمويل لحملة تسويقية لإطلاق المنتج في السوق المحلي"
    },
    {
      id: 4,
      startupName: "ميديكال إيه آي",
      amount: 300000,
      requestDate: "2025/01/10",
      purpose: "بحث وتطوير",
      status: "rejected",
      rejectionDate: "2025/01/20",
      rejectionReason: "الميزانية المطلوبة مرتفعة جداً مقارنة بالمرحلة الحالية للشركة",
      cohort: "دفعة التقنيات الصحية 2024",
      description: "تمويل لتطوير خوارزميات الذكاء الاصطناعي وتحسين دقة التشخيص"
    },
    {
      id: 5,
      startupName: "فينتك",
      amount: 250000,
      requestDate: "2025/03/05",
      purpose: "توسع جغرافي",
      status: "pending",
      cohort: "دفعة التقنية المالية 2024",
      description: "تمويل للتوسع في أسواق جديدة في دول مجلس التعاون الخليجي"
    }
  ]

  const filteredRequests = fundingRequests.filter(request => {
    const matchesSearch = request.startupName.includes(searchQuery) || 
                          request.purpose.includes(searchQuery) ||
                          request.description.includes(searchQuery) ||
                          request.cohort.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "pending") return matchesSearch && request.status === "pending"
    if (activeTab === "approved") return matchesSearch && request.status === "approved"
    if (activeTab === "rejected") return matchesSearch && request.status === "rejected"
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800"
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "قيد المراجعة"
      case "approved": return "تمت الموافقة"
      case "rejected": return "مرفوض"
      default: return "غير معروف"
    }
  }

  const totalRequested = fundingRequests.reduce((acc, request) => acc + request.amount, 0)
  const totalApproved = fundingRequests
    .filter(request => request.status === "approved")
    .reduce((acc, request) => acc + request.amount, 0)
  const pendingAmount = fundingRequests
    .filter(request => request.status === "pending")
    .reduce((acc, request) => acc + request.amount, 0)

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة التمويل</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إنشاء طلب تمويل جديد</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{totalApproved.toLocaleString()} ريال</div>
            <p className="text-muted-foreground">إجمالي التمويل المعتمد</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{pendingAmount.toLocaleString()} ريال</div>
            <p className="text-muted-foreground">طلبات قيد المراجعة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{Math.round((totalApproved / totalRequested) * 100)}%</div>
            <p className="text-muted-foreground">نسبة الموافقة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  className="pl-3 pr-9 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardTitle>طلبات التمويل</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="rejected">مرفوضة</TabsTrigger>
              <TabsTrigger value="approved">معتمدة</TabsTrigger>
              <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg">{request.startupName}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">الدفعة</div>
                    <div className="font-medium">{request.cohort}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 ml-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">المبلغ المطلوب</div>
                        <div className="font-medium">{request.amount.toLocaleString()} ريال</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">الغرض</div>
                      <div className="font-medium">{request.purpose}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">تاريخ الطلب</div>
                      <div className="font-medium">{request.requestDate}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">التفاصيل</div>
                    <p className="text-muted-foreground">{request.description}</p>
                  </div>
                  
                  {request.status === "approved" && (
                    <div className="flex items-center mb-4 bg-green-50 p-3 rounded-lg">
                      <ArrowUpRight className="h-4 w-4 text-green-500 ml-2" />
                      <div>
                        <div className="text-sm text-muted-foreground">تمت الموافقة بتاريخ</div>
                        <div className="font-medium">{request.approvalDate}</div>
                      </div>
                    </div>
                  )}
                  
                  {request.status === "rejected" && (
                    <div className="flex items-start mb-4 bg-red-50 p-3 rounded-lg">
                      <ArrowDownRight className="h-4 w-4 text-red-500 ml-2 mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">تم الرفض بتاريخ</div>
                        <div className="font-medium">{request.rejectionDate}</div>
                        <div className="text-sm text-muted-foreground mt-1">سبب الرفض</div>
                        <div className="text-sm">{request.rejectionReason}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">عرض التفاصيل الكاملة</Button>
                    
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm">رفض</Button>
                        <Button variant="default" size="sm">موافقة</Button>
                      </div>
                    )}
                    
                    {request.status === "approved" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">متابعة الصرف</Button>
                        <Button variant="default" size="sm">تقرير الإنفاق</Button>
                      </div>
                    )}
                    
                    {request.status === "rejected" && (
                      <Button variant="outline" size="sm">طلب إعادة تقديم</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
