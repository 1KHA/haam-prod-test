"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  TrendingUp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
  Users,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FileCheck,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Download,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react"

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("active")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedDeal, setExpandedDeal] = useState<number | null>(null)

  const deals = [
    {
      id: 1,
      startupName: "تك سمارت",
      logo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      industry: "التكنولوجيا المالية",
      stage: "جولة أولى",
      amount: "500,000 ريال",
      equity: "5%",
      valuation: "10,000,000 ريال",
      status: "active",
      startDate: "2025/02/15",
      endDate: "2025/03/30",
      description: "استثمار في منصة تكنولوجيا مالية تقدم حلول مدفوعات رقمية للشركات الصغيرة والمتوسطة.",
      documents: [
        { name: "اتفاقية الاستثمار", type: "pdf", size: "2.4MB", date: "2025/02/15" },
        { name: "خطة العمل", type: "pdf", size: "5.1MB", date: "2025/02/10" },
        { name: "التقرير المالي", type: "xlsx", size: "1.8MB", date: "2025/02/05" }
      ],
      milestones: [
        { name: "توقيع اتفاقية الاستثمار", date: "2025/02/15", status: "completed" },
        { name: "تحويل الدفعة الأولى", date: "2025/02/20", status: "completed" },
        { name: "تحويل الدفعة الثانية", date: "2025/03/15", status: "pending" },
        { name: "إغلاق الصفقة", date: "2025/03/30", status: "pending" }
      ],
      team: [
        { name: "أحمد الشمري", position: "المؤسس والرئيس التنفيذي" },
        { name: "سارة العتيبي", position: "المدير التقني" }
      ],
      coinvestors: [
        { name: "صندوق الاستثمارات التقنية", amount: "1,000,000 ريال" },
        { name: "مستثمر ملاك - خالد العنزي", amount: "250,000 ريال" }
      ],
      progress: 65
    },
    {
      id: 2,
      startupName: "هيلث تك",
      logo: "https://placehold.co/100x100/10B981/FFFFFF?text=HT",
      industry: "التكنولوجيا الصحية",
      stage: "تمويل أولي",
      amount: "300,000 ريال",
      equity: "7.5%",
      valuation: "4,000,000 ريال",
      status: "active",
      startDate: "2025/03/01",
      endDate: "2025/04/15",
      description: "استثمار في منصة رعاية صحية رقمية تربط المرضى بالأطباء وتقدم خدمات استشارات طبية عن بعد.",
      documents: [
        { name: "اتفاقية الاستثمار", type: "pdf", size: "2.1MB", date: "2025/03/01" },
        { name: "خطة العمل", type: "pdf", size: "4.2MB", date: "2025/02/25" },
        { name: "التقرير المالي", type: "xlsx", size: "1.5MB", date: "2025/02/20" }
      ],
      milestones: [
        { name: "توقيع اتفاقية الاستثمار", date: "2025/03/01", status: "completed" },
        { name: "تحويل الدفعة الأولى", date: "2025/03/10", status: "pending" },
        { name: "إغلاق الصفقة", date: "2025/04/15", status: "pending" }
      ],
      team: [
        { name: "فيصل الغامدي", position: "المؤسس والرئيس التنفيذي" },
        { name: "ليلى المالكي", position: "المديرة الطبية" }
      ],
      coinvestors: [
        { name: "مستثمر ملاك - نورة الدوسري", amount: "200,000 ريال" }
      ],
      progress: 30
    },
    {
      id: 3,
      startupName: "إيكو سمارت",
      logo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=ES",
      industry: "التكنولوجيا الخضراء",
      stage: "جولة أولى",
      amount: "750,000 ريال",
      equity: "6%",
      valuation: "12,500,000 ريال",
      status: "completed",
      startDate: "2024/10/15",
      endDate: "2024/12/01",
      description: "استثمار في شركة تطور حلول تكنولوجية مستدامة لإدارة الطاقة في المباني التجارية والسكنية.",
      documents: [
        { name: "اتفاقية الاستثمار", type: "pdf", size: "2.8MB", date: "2024/10/15" },
        { name: "خطة العمل", type: "pdf", size: "6.3MB", date: "2024/10/10" },
        { name: "التقرير المالي", type: "xlsx", size: "2.1MB", date: "2024/10/05" },
        { name: "شهادة الأسهم", type: "pdf", size: "1.2MB", date: "2024/12/05" }
      ],
      milestones: [
        { name: "توقيع اتفاقية الاستثمار", date: "2024/10/15", status: "completed" },
        { name: "تحويل الدفعة الأولى", date: "2024/10/20", status: "completed" },
        { name: "تحويل الدفعة الثانية", date: "2024/11/15", status: "completed" },
        { name: "إغلاق الصفقة", date: "2024/12/01", status: "completed" }
      ],
      team: [
        { name: "عبدالله الحربي", position: "المؤسس والرئيس التنفيذي" },
        { name: "مها السليم", position: "المديرة الهندسية" }
      ],
      coinvestors: [
        { name: "صندوق الاستثمارات التقنية", amount: "1,500,000 ريال" },
        { name: "شركة الاستثمارات الخضراء", amount: "1,000,000 ريال" }
      ],
      progress: 100,
      returns: {
        initialValue: "750,000 ريال",
        currentValue: "900,000 ريال",
        roi: "+20%",
        lastUpdate: "2025/03/01"
      }
    },
    {
      id: 4,
      startupName: "ديليفر ناو",
      logo: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=DN",
      industry: "التجارة الإلكترونية",
      stage: "جولة ثانية",
      amount: "1,200,000 ريال",
      equity: "4%",
      valuation: "30,000,000 ريال",
      status: "negotiation",
      startDate: "2025/03/10",
      endDate: null,
      description: "استثمار محتمل في منصة توصيل طلبات للمتاجر المحلية والمطاعم مع خدمة توصيل سريعة في أقل من 30 دقيقة.",
      documents: [
        { name: "مذكرة تفاهم", type: "pdf", size: "1.5MB", date: "2025/03/10" },
        { name: "خطة العمل", type: "pdf", size: "7.2MB", date: "2025/03/05" },
        { name: "التقرير المالي", type: "xlsx", size: "2.4MB", date: "2025/03/01" }
      ],
      milestones: [
        { name: "توقيع مذكرة التفاهم", date: "2025/03/10", status: "completed" },
        { name: "العناية الواجبة", date: "2025/03/25", status: "in_progress" },
        { name: "توقيع اتفاقية الاستثمار", date: "2025/04/10", status: "pending" },
        { name: "إغلاق الصفقة", date: "2025/04/30", status: "pending" }
      ],
      team: [
        { name: "خالد العنزي", position: "المؤسس والرئيس التنفيذي" },
        { name: "نورة الشمري", position: "مديرة العمليات" }
      ],
      coinvestors: [
        { name: "صندوق الاستثمارات الرقمية", amount: "3,000,000 ريال" },
        { name: "شركة الاستثمارات التجارية", amount: "2,000,000 ريال" }
      ],
      progress: 15
    }
  ]

  const categories = [
    { id: "all", name: "جميع القطاعات" },
    { id: "fintech", name: "التكنولوجيا المالية" },
    { id: "healthtech", name: "التكنولوجيا الصحية" },
    { id: "greentech", name: "التكنولوجيا الخضراء" },
    { id: "ecommerce", name: "التجارة الإلكترونية" }
  ]

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.startupName.includes(searchQuery) || 
                          deal.industry.includes(searchQuery) ||
                          deal.description.includes(searchQuery)
    
    const matchesCategory = activeCategory === "all" || 
                           (activeCategory === "fintech" && deal.industry === "التكنولوجيا المالية") ||
                           (activeCategory === "healthtech" && deal.industry === "التكنولوجيا الصحية") ||
                           (activeCategory === "greentech" && deal.industry === "التكنولوجيا الخضراء") ||
                           (activeCategory === "ecommerce" && deal.industry === "التجارة الإلكترونية")
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && (deal.status === "active" || deal.status === "negotiation")) ||
                      (activeTab === "completed" && deal.status === "completed")
    
    return matchesSearch && matchesCategory && matchesTab
  })

  const toggleExpandDeal = (id: number) => {
    if (expandedDeal === id) {
      setExpandedDeal(null)
    } else {
      setExpandedDeal(id)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "غير محدد"
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "in_progress":
        return "text-amber-500"
      case "pending":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getDealStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <div className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">نشطة</div>
      case "completed":
        return <div className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">مكتملة</div>
      case "negotiation":
        return <div className="px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-800">قيد التفاوض</div>
      default:
        return <div className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">غير معروف</div>
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "xlsx":
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">إدارة الصفقات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">
              {deals.filter(deal => deal.status === "active" || deal.status === "negotiation").length}
            </div>
            <p className="text-muted-foreground">الصفقات النشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Briefcase className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {deals.filter(deal => deal.status === "completed").length}
            </div>
            <p className="text-muted-foreground">الصفقات المكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {deals.reduce((acc, deal) => acc + parseInt(deal.amount.replace(/[^0-9]/g, '')), 0).toLocaleString()} ريال
            </div>
            <p className="text-muted-foreground">إجمالي الاستثمارات</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
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
              <CardTitle>الصفقات الاستثمارية</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="justify-end">
                <TabsTrigger value="completed">المكتملة</TabsTrigger>
                <TabsTrigger value="active">النشطة</TabsTrigger>
                <TabsTrigger value="all">الكل</TabsTrigger>
              </TabsList>
              
              <div className="flex justify-end gap-2 mb-4">
                {categories.map(category => (
                  <Button 
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-4">
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal) => (
                    <Card key={deal.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div 
                          className="p-4 cursor-pointer"
                          onClick={() => toggleExpandDeal(deal.id)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getDealStatusBadge(deal.status)}
                                  <div className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                    {deal.industry}
                                  </div>
                                  <div className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    {deal.stage}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div>
                                    <h3 className="font-bold text-lg">{deal.startupName}</h3>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(deal.startDate)} {deal.endDate ? `- ${formatDate(deal.endDate)}` : ''}
                                    </div>
                                  </div>
                                  <div className="w-12 h-12 rounded-full overflow-hidden">
                                    <img 
                                      src={deal.logo} 
                                      alt={`شعار ${deal.startupName}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              </div>
                              <p className="text-muted-foreground mb-4">{deal.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center justify-end gap-2">
                                  <div>
                                    <div className="text-sm text-muted-foreground">مبلغ الاستثمار</div>
                                    <div className="font-medium">{deal.amount}</div>
                                  </div>
                                  <DollarSign className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                  <div>
                                    <div className="text-sm text-muted-foreground">نسبة الملكية</div>
                                    <div className="font-medium">{deal.equity}</div>
                                  </div>
                                  <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                  <div>
                                    <div className="text-sm text-muted-foreground">التقييم</div>
                                    <div className="font-medium">{deal.valuation}</div>
                                  </div>
                                  <Briefcase className="h-5 w-5 text-purple-500" />
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                  <div>
                                    <div className="text-sm text-muted-foreground">المستثمرون المشاركون</div>
                                    <div className="font-medium">{deal.coinvestors.length}</div>
                                  </div>
                                  <Users className="h-5 w-5 text-red-500" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {expandedDeal === deal.id ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {expandedDeal === deal.id ? "عرض أقل" : "عرض المزيد"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">تقدم الصفقة:</span>
                                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                                    <div 
                                      className={`h-full rounded-full ${
                                        deal.status === "completed" ? "bg-green-500" : "bg-blue-500"
                                      }`}
                                      style={{ width: `${deal.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{deal.progress}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد صفقات</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على صفقات تطابق معايير البحث</p>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 mx-auto"
                      onClick={() => {
                        setSearchQuery("")
                        setActiveCategory("all")
                        setActiveTab("all")
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span>عرض جميع الصفقات</span>
                    </Button>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
