"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Video, 
  BookOpen, 
  Download, 
  Search, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Filter, 
  Star, 
  Play,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ExternalLink,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FileDown,
  Clock,
  BookOpen as BookIcon,
  FileText as FileIcon,
  Video as VideoIcon,
  ArrowRight,
  Heart,
  User,
  Calendar,
  CheckCircle
} from "lucide-react"

interface Resource {
  id: string
  title: string
  description: string
  type: "guide" | "template" | "video" | "course" | "article"
  category: "business" | "marketing" | "finance" | "legal" | "technical" | "other"
  url: string
  thumbnail: string
  author: string
  date: string
  duration?: string
  isFavorite: boolean
  isNew: boolean
  downloadCount: number
}

export default function ResourcesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  // Mock data for resources
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      title: "دليل بناء نموذج الأعمال",
      description: "دليل شامل لبناء نموذج أعمال قوي لشركتك الناشئة. يتضمن الدليل شرحاً مفصلاً لكل عنصر من عناصر نموذج الأعمال، مع أمثلة واقعية وتمارين عملية.",
      type: "guide",
      category: "business",
      url: "/resources/business-model-guide.pdf",
      thumbnail: "/thumbnails/business-model.jpg",
      author: "فريق مسرع الأعمال",
      date: "15 يناير 2025",
      isFavorite: true,
      isNew: false,
      downloadCount: 120
    },
    {
      id: "2",
      title: "قالب خطة العمل",
      description: "قالب جاهز لإعداد خطة عمل احترافية لشركتك الناشئة. يتضمن القالب جميع العناصر الأساسية لخطة العمل، مع إرشادات وأمثلة لكل قسم.",
      type: "template",
      category: "business",
      url: "/resources/business-plan-template.docx",
      thumbnail: "/thumbnails/business-plan.jpg",
      author: "فريق مسرع الأعمال",
      date: "20 يناير 2025",
      isFavorite: false,
      isNew: false,
      downloadCount: 85
    },
    {
      id: "3",
      title: "دورة تدريبية: أساسيات التسويق للشركات الناشئة",
      description: "دورة تدريبية شاملة لتعلم أساسيات التسويق للشركات الناشئة. تتضمن الدورة 10 محاضرات فيديو، مع تمارين عملية ودراسات حالة.",
      type: "course",
      category: "marketing",
      url: "/resources/marketing-course",
      thumbnail: "/thumbnails/marketing-course.jpg",
      author: "د. سارة الأحمد",
      date: "5 فبراير 2025",
      duration: "5 ساعات",
      isFavorite: true,
      isNew: false,
      downloadCount: 65
    },
    {
      id: "4",
      title: "قالب العرض التقديمي للمستثمرين",
      description: "قالب احترافي للعرض التقديمي للمستثمرين. يتضمن القالب جميع الشرائح الأساسية التي يحتاجها رواد الأعمال عند تقديم شركاتهم الناشئة للمستثمرين.",
      type: "template",
      category: "finance",
      url: "/resources/pitch-deck-template.pptx",
      thumbnail: "/thumbnails/pitch-deck.jpg",
      author: "فريق مسرع الأعمال",
      date: "10 فبراير 2025",
      isFavorite: false,
      isNew: false,
      downloadCount: 95
    },
    {
      id: "5",
      title: "فيديو: كيفية جذب المستثمرين لشركتك الناشئة",
      description: "فيديو تعليمي يشرح كيفية جذب المستثمرين لشركتك الناشئة. يتضمن الفيديو نصائح عملية من مستثمرين وخبراء في مجال رأس المال الاستثماري.",
      type: "video",
      category: "finance",
      url: "/resources/attracting-investors-video.mp4",
      thumbnail: "/thumbnails/investors-video.jpg",
      author: "م. خالد العمري",
      date: "15 فبراير 2025",
      duration: "45 دقيقة",
      isFavorite: false,
      isNew: false,
      downloadCount: 70
    },
    {
      id: "6",
      title: "دليل الجوانب القانونية للشركات الناشئة",
      description: "دليل شامل للجوانب القانونية التي يجب على رواد الأعمال معرفتها عند تأسيس وإدارة شركاتهم الناشئة. يتضمن الدليل معلومات عن تأسيس الشركة، وحماية الملكية الفكرية، والعقود، والامتثال للقوانين واللوائح.",
      type: "guide",
      category: "legal",
      url: "/resources/legal-guide.pdf",
      thumbnail: "/thumbnails/legal-guide.jpg",
      author: "المستشار القانوني أحمد الزهراني",
      date: "20 فبراير 2025",
      isFavorite: false,
      isNew: true,
      downloadCount: 45
    },
    {
      id: "7",
      title: "مقالة: استراتيجيات النمو للشركات الناشئة",
      description: "مقالة تتناول استراتيجيات النمو المختلفة للشركات الناشئة، مع أمثلة واقعية لشركات ناجحة. تتضمن المقالة نصائح عملية لتحقيق النمو المستدام.",
      type: "article",
      category: "business",
      url: "/resources/growth-strategies-article.pdf",
      thumbnail: "/thumbnails/growth-article.jpg",
      author: "د. محمد السعيد",
      date: "25 فبراير 2025",
      isFavorite: false,
      isNew: true,
      downloadCount: 30
    },
    {
      id: "8",
      title: "قالب الخطة المالية",
      description: "قالب إكسل شامل للخطة المالية لشركتك الناشئة. يتضمن القالب توقعات الإيرادات والمصروفات، والتدفق النقدي، وتحليل نقطة التعادل، ومؤشرات الأداء الرئيسية.",
      type: "template",
      category: "finance",
      url: "/resources/financial-plan-template.xlsx",
      thumbnail: "/thumbnails/financial-plan.jpg",
      author: "فريق مسرع الأعمال",
      date: "1 مارس 2025",
      isFavorite: false,
      isNew: true,
      downloadCount: 25
    }
  ])

  // Filter resources based on search query, selected category, and active tab
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.includes(searchQuery) || 
                          resource.description.includes(searchQuery) || 
                          resource.author.includes(searchQuery)
    
    const matchesCategory = selectedCategory === null || resource.category === selectedCategory
    
    if (activeTab === "all") return matchesSearch && matchesCategory
    if (activeTab === "favorites") return matchesSearch && matchesCategory && resource.isFavorite
    if (activeTab === "new") return matchesSearch && matchesCategory && resource.isNew
    if (activeTab === "guides") return matchesSearch && matchesCategory && resource.type === "guide"
    if (activeTab === "templates") return matchesSearch && matchesCategory && resource.type === "template"
    if (activeTab === "courses") return matchesSearch && matchesCategory && resource.type === "course"
    if (activeTab === "videos") return matchesSearch && matchesCategory && resource.type === "video"
    
    return matchesSearch && matchesCategory
  })

  const handleToggleFavorite = (resourceId: string) => {
    setResources(resources.map(resource => 
      resource.id === resourceId 
        ? { ...resource, isFavorite: !resource.isFavorite } 
        : resource
    ))
  }

  const handleDownload = (resourceId: string) => {
    setResources(resources.map(resource => 
      resource.id === resourceId 
        ? { ...resource, downloadCount: resource.downloadCount + 1 } 
        : resource
    ))
    
    // In a real app, this would trigger a download
    toast({ title: "تحميل", description: "تم بدء تحميل المورد" })
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "guide":
        return <BookIcon className="h-5 w-5 text-blue-500" />
      case "template":
        return <FileIcon className="h-5 w-5 text-green-500" />
      case "video":
        return <VideoIcon className="h-5 w-5 text-red-500" />
      case "course":
        return <BookOpen className="h-5 w-5 text-amber-500" />
      case "article":
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getResourceTypeText = (type: string) => {
    switch (type) {
      case "guide":
        return "دليل"
      case "template":
        return "قالب"
      case "video":
        return "فيديو"
      case "course":
        return "دورة تدريبية"
      case "article":
        return "مقالة"
      default:
        return "مورد"
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "business":
        return "الأعمال"
      case "marketing":
        return "التسويق"
      case "finance":
        return "التمويل"
      case "legal":
        return "القانون"
      case "technical":
        return "التقنية"
      default:
        return "أخرى"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div></div>
        <h1 className="text-3xl font-bold">الموارد التعليمية</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end w-full overflow-x-auto">
          <TabsTrigger value="videos">الفيديوهات</TabsTrigger>
          <TabsTrigger value="courses">الدورات</TabsTrigger>
          <TabsTrigger value="templates">القوالب</TabsTrigger>
          <TabsTrigger value="guides">الأدلة</TabsTrigger>
          <TabsTrigger value="new">جديد</TabsTrigger>
          <TabsTrigger value="favorites">المفضلة</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث..." 
              className="pr-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              الكل
            </Button>
            <Button 
              variant={selectedCategory === "business" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("business")}
            >
              الأعمال
            </Button>
            <Button 
              variant={selectedCategory === "marketing" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("marketing")}
            >
              التسويق
            </Button>
            <Button 
              variant={selectedCategory === "finance" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("finance")}
            >
              التمويل
            </Button>
            <Button 
              variant={selectedCategory === "legal" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("legal")}
            >
              القانون
            </Button>
            <Button 
              variant={selectedCategory === "technical" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory("technical")}
            >
              التقنية
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab}>
          {selectedResource ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedResource(null)}
                  >
                    العودة للقائمة
                  </Button>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getResourceTypeIcon(selectedResource.type)}
                      <CardTitle>{selectedResource.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">{getResourceTypeText(selectedResource.type)} - {getCategoryText(selectedResource.category)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedResource.thumbnail} 
                      alt={selectedResource.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/640x360";
                      }}
                    />
                    {selectedResource.type === "video" && (
                      <div className="absolute">
                        <div className="bg-black/50 rounded-full p-4">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-right">الوصف</h3>
                    <p className="text-right">{selectedResource.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">المؤلف</p>
                          <p className="text-sm text-muted-foreground">{selectedResource.author}</p>
                        </div>
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">تاريخ النشر</p>
                          <p className="text-sm text-muted-foreground">{selectedResource.date}</p>
                        </div>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {selectedResource.duration && (
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">المدة</p>
                            <p className="text-sm text-muted-foreground">{selectedResource.duration}</p>
                          </div>
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">عدد التحميلات</p>
                          <p className="text-sm text-muted-foreground">{selectedResource.downloadCount}</p>
                        </div>
                        <Download className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">الحالة</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedResource.isNew ? "جديد" : "متاح"}
                          </p>
                        </div>
                        {selectedResource.isNew ? 
                          <Star className="h-5 w-5 text-amber-500" /> : 
                          <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">المفضلة</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedResource.isFavorite ? "مضاف للمفضلة" : "غير مضاف للمفضلة"}
                          </p>
                        </div>
                        <Heart className={`h-5 w-5 ${selectedResource.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleToggleFavorite(selectedResource.id)}
                >
                  {selectedResource.isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  <Heart className={`h-4 w-4 ml-2 ${selectedResource.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                {selectedResource.type === "course" || selectedResource.type === "video" ? (
                  <Button>
                    بدء المشاهدة
                    <Play className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => handleDownload(selectedResource.id)}>
                    تحميل
                    <Download className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img 
                      src={resource.thumbnail} 
                      alt={resource.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/640x360";
                      }}
                    />
                    {resource.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {resource.isNew && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">جديد</span>
                      )}
                      {resource.isFavorite && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">مفضل</span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="text-xs bg-black/70 text-white px-2 py-1 rounded-full">
                        {getResourceTypeText(resource.type)}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(resource.id);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${resource.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                        </Button>
                      </div>
                      <div className="text-right">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription className="mt-1">{getCategoryText(resource.category)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-right line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">{resource.date}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{resource.author}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-xs text-muted-foreground">
                      {resource.downloadCount} تحميل
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedResource(resource)}
                    >
                      عرض التفاصيل
                      <ArrowRight className="h-4 w-4 mr-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {filteredResources.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">لا توجد موارد متطابقة مع البحث</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
