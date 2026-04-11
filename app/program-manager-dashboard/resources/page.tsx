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
  BookOpen, 
  FileText, 
  Video, 
  Link as LinkIcon,
  Download,
  Eye,
  BarChart,
  Upload
} from "lucide-react"

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const resources = [
    {
      id: 1,
      title: "دليل إعداد خطة العمل",
      type: "document",
      format: "PDF",
      category: "تخطيط الأعمال",
      uploadDate: "2025/01/15",
      size: "2.5 MB",
      viewCount: 120,
      downloadCount: 85,
      description: "دليل شامل لإعداد خطة عمل احترافية للشركات الناشئة، يتضمن نماذج وأمثلة توضيحية"
    },
    {
      id: 2,
      title: "قالب العرض التقديمي للمستثمرين",
      type: "document",
      format: "PPTX",
      category: "التمويل",
      uploadDate: "2025/01/20",
      size: "5.8 MB",
      viewCount: 95,
      downloadCount: 72,
      description: "قالب احترافي للعرض التقديمي للمستثمرين، يتضمن جميع العناصر الأساسية التي يبحث عنها المستثمرون"
    },
    {
      id: 3,
      title: "أساسيات التسويق الرقمي",
      type: "video",
      format: "MP4",
      category: "التسويق",
      uploadDate: "2025/02/05",
      size: "150 MB",
      duration: "45 دقيقة",
      viewCount: 210,
      downloadCount: 0,
      description: "دورة تدريبية حول أساسيات التسويق الرقمي للشركات الناشئة، تتضمن استراتيجيات وأدوات عملية"
    },
    {
      id: 4,
      title: "نموذج الخطة المالية",
      type: "document",
      format: "XLSX",
      category: "التمويل",
      uploadDate: "2025/02/10",
      size: "1.2 MB",
      viewCount: 85,
      downloadCount: 65,
      description: "نموذج شامل للخطة المالية للشركات الناشئة، يتضمن توقعات الإيرادات والمصروفات والتدفقات النقدية"
    },
    {
      id: 5,
      title: "كيفية جذب المستثمرين",
      type: "video",
      format: "MP4",
      category: "التمويل",
      uploadDate: "2025/02/15",
      size: "200 MB",
      duration: "60 دقيقة",
      viewCount: 180,
      downloadCount: 0,
      description: "ورشة عمل حول كيفية جذب المستثمرين للشركات الناشئة، تتضمن نصائح وتجارب عملية من مستثمرين ورواد أعمال ناجحين"
    },
    {
      id: 6,
      title: "دليل الملكية الفكرية",
      type: "document",
      format: "PDF",
      category: "القانونية",
      uploadDate: "2025/02/20",
      size: "3.1 MB",
      viewCount: 65,
      downloadCount: 45,
      description: "دليل شامل حول حماية الملكية الفكرية للشركات الناشئة، يتضمن معلومات عن براءات الاختراع والعلامات التجارية وحقوق النشر"
    },
    {
      id: 7,
      title: "منصات التمويل الجماعي",
      type: "link",
      category: "التمويل",
      uploadDate: "2025/03/01",
      url: "https://example.com/crowdfunding",
      viewCount: 110,
      description: "قائمة بأفضل منصات التمويل الجماعي للشركات الناشئة، مع نصائح حول كيفية إعداد حملة ناجحة"
    },
    {
      id: 8,
      title: "أدوات إدارة المشاريع",
      type: "link",
      category: "إدارة",
      uploadDate: "2025/03/05",
      url: "https://example.com/project-management",
      viewCount: 95,
      description: "قائمة بأفضل أدوات إدارة المشاريع للشركات الناشئة، مع مقارنة بين الميزات والأسعار"
    }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.includes(searchQuery) || 
                          resource.description.includes(searchQuery) ||
                          resource.category.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "documents") return matchesSearch && resource.type === "document"
    if (activeTab === "videos") return matchesSearch && resource.type === "video"
    if (activeTab === "links") return matchesSearch && resource.type === "link"
    
    return matchesSearch
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-5 w-5 text-blue-500" />
      case "video": return <Video className="h-5 w-5 text-red-500" />
      case "link": return <LinkIcon className="h-5 w-5 text-green-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document": return "bg-blue-100 text-blue-800"
      case "video": return "bg-red-100 text-red-800"
      case "link": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "document": return "مستند"
      case "video": return "فيديو"
      case "link": return "رابط"
      default: return "غير معروف"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "تخطيط الأعمال": return "bg-purple-100 text-purple-800"
      case "التمويل": return "bg-green-100 text-green-800"
      case "التسويق": return "bg-blue-100 text-blue-800"
      case "القانونية": return "bg-amber-100 text-amber-800"
      case "إدارة": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const totalResources = resources.length
  const totalViews = resources.reduce((acc, resource) => acc + resource.viewCount, 0)
  const totalDownloads = resources.reduce((acc, resource) => acc + (resource.downloadCount || 0), 0)

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الموارد التعليمية</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة مورد جديد</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{totalResources}</div>
            <p className="text-muted-foreground">إجمالي الموارد</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Eye className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-muted-foreground">إجمالي المشاهدات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Download className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-muted-foreground">إجمالي التنزيلات</p>
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
            <CardTitle>الموارد التعليمية</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="links">روابط</TabsTrigger>
              <TabsTrigger value="videos">فيديوهات</TabsTrigger>
              <TabsTrigger value="documents">مستندات</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredResources.map((resource) => (
              <div key={resource.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs ${getTypeColor(resource.type)}`}>
                        {getTypeText(resource.type)}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs ${getCategoryColor(resource.category)}`}>
                        {resource.category}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg ml-2">{resource.title}</h3>
                      {getTypeIcon(resource.type)}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-muted-foreground">{resource.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">تاريخ الرفع</div>
                      <div className="font-medium">{resource.uploadDate}</div>
                    </div>
                    
                    {resource.format && (
                      <div>
                        <div className="text-sm text-muted-foreground">الصيغة</div>
                        <div className="font-medium">{resource.format}</div>
                      </div>
                    )}
                    
                    {resource.size && (
                      <div>
                        <div className="text-sm text-muted-foreground">الحجم</div>
                        <div className="font-medium">{resource.size}</div>
                      </div>
                    )}
                    
                    {resource.duration && (
                      <div>
                        <div className="text-sm text-muted-foreground">المدة</div>
                        <div className="font-medium">{resource.duration}</div>
                      </div>
                    )}
                    
                    {resource.url && (
                      <div>
                        <div className="text-sm text-muted-foreground">الرابط</div>
                        <div className="font-medium truncate max-w-[200px]">{resource.url}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 ml-1 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{resource.viewCount} مشاهدة</span>
                    </div>
                    
                    {resource.downloadCount !== undefined && (
                      <div className="flex items-center">
                        <Download className="h-4 w-4 ml-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{resource.downloadCount} تنزيل</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">تعديل</Button>
                    
                    <div className="flex gap-2">
                      {resource.type === "document" && (
                        <Button variant="default" size="sm" className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          <span>تنزيل</span>
                        </Button>
                      )}
                      
                      {resource.type === "video" && (
                        <Button variant="default" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>مشاهدة</span>
                        </Button>
                      )}
                      
                      {resource.type === "link" && (
                        <Button variant="default" size="sm" className="flex items-center gap-1">
                          <LinkIcon className="h-4 w-4" />
                          <span>فتح الرابط</span>
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <BarChart className="h-4 w-4" />
                        <span>الإحصائيات</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredResources.length === 0 && (
              <div className="text-center p-8 border rounded-lg">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد موارد</h3>
                <p className="text-muted-foreground mb-4">لم يتم العثور على موارد تطابق معايير البحث</p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveTab("all")
                  }}
                >
                  <Search className="h-4 w-4" />
                  <span>عرض جميع الموارد</span>
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
