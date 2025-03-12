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
  Calendar,
  Users,
  Building,
  Rocket,
  Briefcase,
  Clock,
  BarChart,
  FileText
} from "lucide-react"

export default function ProgramsManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])

  // Sample program data
  const programs = [
    { 
      id: "1", 
      name: "مسرع التقنية المالية", 
      type: "مسرع", 
      status: "نشط", 
      startDate: "15 يناير 2025",
      endDate: "15 يوليو 2025",
      duration: "6 أشهر",
      startups: 12,
      mentors: 8,
      manager: "أحمد محمد",
      location: "الرياض",
      budget: "5,000,000 ريال",
      description: "برنامج مسرع للشركات الناشئة في مجال التقنية المالية"
    },
    { 
      id: "2", 
      name: "حاضنة التقنيات الناشئة", 
      type: "حاضنة", 
      status: "نشط", 
      startDate: "1 فبراير 2025",
      endDate: "1 فبراير 2026",
      duration: "12 شهر",
      startups: 20,
      mentors: 15,
      manager: "سارة العتيبي",
      location: "جدة",
      budget: "8,000,000 ريال",
      description: "برنامج حاضنة للشركات الناشئة في مختلف المجالات التقنية"
    },
    { 
      id: "3", 
      name: "مسرع التقنيات الصحية", 
      type: "مسرع", 
      status: "نشط", 
      startDate: "10 مارس 2025",
      endDate: "10 سبتمبر 2025",
      duration: "6 أشهر",
      startups: 8,
      mentors: 10,
      manager: "محمد القحطاني",
      location: "الرياض",
      budget: "6,000,000 ريال",
      description: "برنامج مسرع للشركات الناشئة في مجال التقنيات الصحية"
    },
    { 
      id: "4", 
      name: "مسرع الذكاء الاصطناعي", 
      type: "مسرع", 
      status: "قادم", 
      startDate: "1 يونيو 2025",
      endDate: "1 ديسمبر 2025",
      duration: "6 أشهر",
      startups: 0,
      mentors: 12,
      manager: "نورة السعيد",
      location: "الرياض",
      budget: "7,000,000 ريال",
      description: "برنامج مسرع للشركات الناشئة في مجال الذكاء الاصطناعي"
    },
    { 
      id: "5", 
      name: "حاضنة التجارة الإلكترونية", 
      type: "حاضنة", 
      status: "قادم", 
      startDate: "15 يوليو 2025",
      endDate: "15 يوليو 2026",
      duration: "12 شهر",
      startups: 0,
      mentors: 8,
      manager: "خالد العمري",
      location: "جدة",
      budget: "5,500,000 ريال",
      description: "برنامج حاضنة للشركات الناشئة في مجال التجارة الإلكترونية"
    },
    { 
      id: "6", 
      name: "مسرع التقنيات الزراعية", 
      type: "مسرع", 
      status: "مكتمل", 
      startDate: "1 يناير 2024",
      endDate: "1 يوليو 2024",
      duration: "6 أشهر",
      startups: 10,
      mentors: 6,
      manager: "فاطمة الزهراء",
      location: "الرياض",
      budget: "4,000,000 ريال",
      description: "برنامج مسرع للشركات الناشئة في مجال التقنيات الزراعية"
    },
    { 
      id: "7", 
      name: "حاضنة تقنيات الطاقة", 
      type: "حاضنة", 
      status: "مكتمل", 
      startDate: "15 فبراير 2024",
      endDate: "15 فبراير 2025",
      duration: "12 شهر",
      startups: 15,
      mentors: 10,
      manager: "عبدالله الغامدي",
      location: "الدمام",
      budget: "7,500,000 ريال",
      description: "برنامج حاضنة للشركات الناشئة في مجال تقنيات الطاقة"
    }
  ]

  // Filter programs based on active tab and search query
  const filteredPrograms = programs.filter(program => {
    // Filter by tab
    if (activeTab === "active" && program.status !== "نشط") return false
    if (activeTab === "upcoming" && program.status !== "قادم") return false
    if (activeTab === "completed" && program.status !== "مكتمل") return false
    if (activeTab === "accelerators" && program.type !== "مسرع") return false
    if (activeTab === "incubators" && program.type !== "حاضنة") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        program.name.toLowerCase().includes(query) ||
        program.type.toLowerCase().includes(query) ||
        program.manager.toLowerCase().includes(query) ||
        program.location.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleProgramSelection = (programId: string) => {
    if (selectedPrograms.includes(programId)) {
      setSelectedPrograms(selectedPrograms.filter(id => id !== programId))
    } else {
      setSelectedPrograms([...selectedPrograms, programId])
    }
  }

  const selectAllPrograms = () => {
    if (selectedPrograms.length === filteredPrograms.length) {
      setSelectedPrograms([])
    } else {
      setSelectedPrograms(filteredPrograms.map(program => program.id))
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
            <span>إضافة برنامج</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة البرامج</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن برنامج..." 
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
          <TabsList className="grid grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="incubators">الحاضنات</TabsTrigger>
            <TabsTrigger value="accelerators">المسرعات</TabsTrigger>
            <TabsTrigger value="completed">المكتملة</TabsTrigger>
            <TabsTrigger value="upcoming">القادمة</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <CardTitle>{program.name}</CardTitle>
                    {program.type === "مسرع" ? (
                      <Rocket className="h-5 w-5 text-primary" />
                    ) : (
                      <Building className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardDescription>{program.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                {program.status === "نشط" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    نشط
                  </span>
                ) : program.status === "قادم" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    قادم
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    مكتمل
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="font-medium">{program.manager}</div>
                    <div className="text-xs text-muted-foreground">مدير البرنامج</div>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="font-medium">{program.location}</div>
                    <div className="text-xs text-muted-foreground">الموقع</div>
                  </div>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="font-medium">{program.startDate}</div>
                    <div className="text-xs text-muted-foreground">تاريخ البدء</div>
                  </div>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="font-medium">{program.duration}</div>
                    <div className="text-xs text-muted-foreground">المدة</div>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="font-medium">{program.startups}</div>
                    <div className="text-xs text-muted-foreground">الشركات الناشئة</div>
                  </div>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="font-medium">{program.mentors}</div>
                    <div className="text-xs text-muted-foreground">الموجهون</div>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>التقارير</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>التفاصيل</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeTab === "upcoming" && filteredPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>جدول البرامج القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-1">المدير</div>
                <div className="col-span-1">الميزانية</div>
                <div className="col-span-1">المدة</div>
                <div className="col-span-1">تاريخ البدء</div>
                <div className="col-span-1">اسم البرنامج</div>
              </div>
              
              {filteredPrograms.map((program) => (
                <div key={program.id} className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1">{program.manager}</div>
                  <div className="col-span-1">{program.budget}</div>
                  <div className="col-span-1">{program.duration}</div>
                  <div className="col-span-1">{program.startDate}</div>
                  <div className="col-span-1">{program.name}</div>
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
              <span>إحصائيات البرامج</span>
              <BarChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{programs.length}</span>
                <span className="text-muted-foreground">إجمالي البرامج</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{programs.filter(p => p.status === "نشط").length}</span>
                <span className="text-muted-foreground">البرامج النشطة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{programs.filter(p => p.status === "قادم").length}</span>
                <span className="text-muted-foreground">البرامج القادمة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{programs.filter(p => p.status === "مكتمل").length}</span>
                <span className="text-muted-foreground">البرامج المكتملة</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التوزيع حسب النوع</span>
              <Rocket className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{programs.filter(p => p.type === "مسرع").length}</span>
                <span className="text-muted-foreground">المسرعات</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{programs.filter(p => p.type === "حاضنة").length}</span>
                <span className="text-muted-foreground">الحاضنات</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">65</span>
                <span className="text-muted-foreground">إجمالي الشركات الناشئة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">69</span>
                <span className="text-muted-foreground">إجمالي الموجهين</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>الميزانية والتمويل</span>
              <Briefcase className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">43,000,000 ريال</span>
                <span className="text-muted-foreground">إجمالي الميزانية</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">6,142,857 ريال</span>
                <span className="text-muted-foreground">متوسط ميزانية البرنامج</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">26,000,000 ريال</span>
                <span className="text-muted-foreground">ميزانية البرامج النشطة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">12,500,000 ريال</span>
                <span className="text-muted-foreground">ميزانية البرامج القادمة</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
