"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Building,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Tag
} from "lucide-react"

export default function StartupsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStartups, setSelectedStartups] = useState<string[]>([])

  // Sample startup data
  const startups = [
    { 
      id: "1", 
      name: "تك سمارت", 
      sector: "التكنولوجيا المالية", 
      stage: "جولة أولى", 
      status: "نشط", 
      program: "مسرع التقنية المالية",
      team: 5,
      funding: "5,000,000 ريال",
      valuation: "50,000,000 ريال",
      joinDate: "15 يناير 2025",
      location: "الرياض",
      growth: "+40%",
      mentor: "أحمد محمد"
    },
    { 
      id: "2", 
      name: "هيلث تك", 
      sector: "التكنولوجيا الصحية", 
      stage: "تمويل أولي", 
      status: "نشط", 
      program: "مسرع التقنيات الصحية",
      team: 3,
      funding: "3,000,000 ريال",
      valuation: "30,000,000 ريال",
      joinDate: "10 فبراير 2025",
      location: "جدة",
      growth: "+30%",
      mentor: "سارة العتيبي"
    },
    { 
      id: "3", 
      name: "إيكو سمارت", 
      sector: "التكنولوجيا الخضراء", 
      stage: "جولة ثانية", 
      status: "نشط", 
      program: "حاضنة التقنيات الناشئة",
      team: 8,
      funding: "10,000,000 ريال",
      valuation: "100,000,000 ريال",
      joinDate: "5 مارس 2025",
      location: "الدمام",
      growth: "+50%",
      mentor: "محمد القحطاني"
    },
    { 
      id: "4", 
      name: "فود تك", 
      sector: "تكنولوجيا الأغذية", 
      stage: "تمويل أولي", 
      status: "معلق", 
      program: "مسرع الذكاء الاصطناعي",
      team: 4,
      funding: "2,500,000 ريال",
      valuation: "25,000,000 ريال",
      joinDate: "20 فبراير 2025",
      location: "الرياض",
      growth: "+20%",
      mentor: "نورة السعيد"
    },
    { 
      id: "5", 
      name: "إيدو تك", 
      sector: "تكنولوجيا التعليم", 
      stage: "جولة أولى", 
      status: "معلق", 
      program: "حاضنة التقنيات الناشئة",
      team: 6,
      funding: "4,000,000 ريال",
      valuation: "40,000,000 ريال",
      joinDate: "1 مارس 2025",
      location: "جدة",
      growth: "+35%",
      mentor: "خالد العمري"
    },
    { 
      id: "6", 
      name: "سمارت هوم", 
      sector: "إنترنت الأشياء", 
      stage: "تمويل أولي", 
      status: "متخرج", 
      program: "مسرع التقنية المالية",
      team: 7,
      funding: "6,000,000 ريال",
      valuation: "60,000,000 ريال",
      joinDate: "10 يناير 2024",
      graduationDate: "10 يناير 2025",
      location: "الرياض",
      growth: "+60%",
      mentor: "فاطمة الزهراء"
    },
    { 
      id: "7", 
      name: "فينتك", 
      sector: "التكنولوجيا المالية", 
      stage: "جولة أولى", 
      status: "متوقف", 
      program: "مسرع التقنية المالية",
      team: 4,
      funding: "3,000,000 ريال",
      valuation: "0 ريال",
      joinDate: "5 فبراير 2024",
      exitDate: "5 ديسمبر 2024",
      location: "جدة",
      growth: "-100%",
      mentor: "عبدالله الغامدي"
    }
  ]

  // Filter startups based on active tab and search query
  const filteredStartups = startups.filter(startup => {
    // Filter by tab
    if (activeTab === "active" && startup.status !== "نشط") return false
    if (activeTab === "pending" && startup.status !== "معلق") return false
    if (activeTab === "graduated" && startup.status !== "متخرج") return false
    if (activeTab === "failed" && startup.status !== "متوقف") return false
    if (activeTab === "fintech" && startup.sector !== "التكنولوجيا المالية") return false
    if (activeTab === "healthtech" && startup.sector !== "التكنولوجيا الصحية") return false
    if (activeTab === "greentech" && startup.sector !== "التكنولوجيا الخضراء") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        startup.name.toLowerCase().includes(query) ||
        startup.sector.toLowerCase().includes(query) ||
        startup.program.toLowerCase().includes(query) ||
        startup.location.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleStartupSelection = (startupId: string) => {
    if (selectedStartups.includes(startupId)) {
      setSelectedStartups(selectedStartups.filter(id => id !== startupId))
    } else {
      setSelectedStartups([...selectedStartups, startupId])
    }
  }

  const selectAllStartups = () => {
    if (selectedStartups.length === filteredStartups.length) {
      setSelectedStartups([])
    } else {
      setSelectedStartups(filteredStartups.map(startup => startup.id))
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
            <Plus className="h-4 w-4" />
            <span>إضافة شركة ناشئة</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة الشركات الناشئة</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن شركة ناشئة..." 
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
            <TabsTrigger value="greentech">التقنية الخضراء</TabsTrigger>
            <TabsTrigger value="healthtech">التقنية الصحية</TabsTrigger>
            <TabsTrigger value="fintech">التقنية المالية</TabsTrigger>
            <TabsTrigger value="failed">متوقفة</TabsTrigger>
            <TabsTrigger value="graduated">متخرجة</TabsTrigger>
            <TabsTrigger value="pending">معلقة</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedStartups.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>تعيين موجه</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>تغيير البرنامج</span>
                  </Button>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1">
                    <Trash2 className="h-4 w-4" />
                    <span>حذف</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>قائمة الشركات الناشئة ({filteredStartups.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-9 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="ml-2"
                  checked={selectedStartups.length === filteredStartups.length && filteredStartups.length > 0}
                  onChange={selectAllStartups}
                />
                <span>الإجراءات</span>
              </div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">المرحلة</div>
              <div className="col-span-1">القطاع</div>
              <div className="col-span-1">البرنامج</div>
              <div className="col-span-1">التمويل</div>
              <div className="col-span-1">الموقع</div>
              <div className="col-span-1">تاريخ الانضمام</div>
              <div className="col-span-1">الاسم</div>
            </div>
            
            {filteredStartups.length > 0 ? (
              filteredStartups.map((startup) => (
                <div key={startup.id} className="grid grid-cols-9 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedStartups.includes(startup.id)}
                      onChange={() => toggleStartupSelection(startup.id)}
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
                    {startup.status === "نشط" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        نشط
                      </span>
                    ) : startup.status === "معلق" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        معلق
                      </span>
                    ) : startup.status === "متخرج" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        متخرج
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        متوقف
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">{startup.stage}</div>
                  <div className="col-span-1">{startup.sector}</div>
                  <div className="col-span-1">{startup.program}</div>
                  <div className="col-span-1">{startup.funding}</div>
                  <div className="col-span-1">{startup.location}</div>
                  <div className="col-span-1">{startup.joinDate}</div>
                  <div className="col-span-1">{startup.name}</div>
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

      {activeTab === "pending" && filteredStartups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>طلبات الانضمام المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStartups.map((startup) => (
                <div key={startup.id} className="flex items-center justify-between p-4 border rounded-md">
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
                    <div className="font-medium">{startup.name}</div>
                    <div className="text-sm text-muted-foreground">{startup.sector} • {startup.location}</div>
                    <div className="text-xs text-muted-foreground">تاريخ الطلب: {startup.joinDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إحصائيات الشركات الناشئة</span>
              <Building className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{startups.length}</span>
                <span className="text-muted-foreground">إجمالي الشركات الناشئة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{startups.filter(s => s.status === "نشط").length}</span>
                <span className="text-muted-foreground">الشركات النشطة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{startups.filter(s => s.status === "متخرج").length}</span>
                <span className="text-muted-foreground">الشركات المتخرجة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{startups.filter(s => s.status === "متوقف").length}</span>
                <span className="text-muted-foreground">الشركات المتوقفة</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التوزيع حسب القطاع</span>
              <Tag className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{startups.filter(s => s.sector === "التكنولوجيا المالية").length}</span>
                <span className="text-muted-foreground">التكنولوجيا المالية</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{startups.filter(s => s.sector === "التكنولوجيا الصحية").length}</span>
                <span className="text-muted-foreground">التكنولوجيا الصحية</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{startups.filter(s => s.sector === "التكنولوجيا الخضراء").length}</span>
                <span className="text-muted-foreground">التكنولوجيا الخضراء</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{startups.filter(s => !["التكنولوجيا المالية", "التكنولوجيا الصحية", "التكنولوجيا الخضراء"].includes(s.sector)).length}</span>
                <span className="text-muted-foreground">قطاعات أخرى</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التمويل والتقييم</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">33,500,000 ريال</span>
                <span className="text-muted-foreground">إجمالي التمويل</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">4,785,714 ريال</span>
                <span className="text-muted-foreground">متوسط التمويل</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">305,000,000 ريال</span>
                <span className="text-muted-foreground">إجمالي التقييم</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">+35%</span>
                <span className="text-muted-foreground">متوسط النمو</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
