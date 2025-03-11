"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Download, 
  Upload,
  Plus,
  BookOpen,
  File,
  FolderPlus
} from "lucide-react"

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")

  const resources = [
    {
      id: 1,
      title: "دليل إعداد خطة التسويق",
      description: "دليل شامل لإعداد خطة تسويق فعالة للشركات الناشئة",
      type: "document",
      category: "marketing",
      url: "#",
      uploadedBy: "أحمد محمد",
      uploadDate: "2025/02/15",
      downloads: 45,
      fileSize: "2.5 MB",
      fileType: "PDF"
    },
    {
      id: 2,
      title: "استراتيجيات جمع التمويل",
      description: "استراتيجيات وأساليب جمع التمويل للشركات الناشئة في مراحلها المبكرة",
      type: "document",
      category: "funding",
      url: "#",
      uploadedBy: "سارة الخالدي",
      uploadDate: "2025/02/10",
      downloads: 78,
      fileSize: "3.2 MB",
      fileType: "PDF"
    },
    {
      id: 3,
      title: "كيفية إعداد عرض تقديمي للمستثمرين",
      description: "فيديو تعليمي حول كيفية إعداد عرض تقديمي مقنع للمستثمرين",
      type: "video",
      category: "funding",
      url: "#",
      uploadedBy: "محمد العمري",
      uploadDate: "2025/01/25",
      views: 120,
      duration: "45:30"
    },
    {
      id: 4,
      title: "نموذج خطة عمل",
      description: "نموذج جاهز لخطة عمل شاملة للشركات الناشئة",
      type: "document",
      category: "planning",
      url: "#",
      uploadedBy: "فهد الدوسري",
      uploadDate: "2025/01/20",
      downloads: 92,
      fileSize: "1.8 MB",
      fileType: "DOCX"
    },
    {
      id: 5,
      title: "أساسيات تطوير المنتج",
      description: "دورة تدريبية حول أساسيات تطوير المنتج وإدارة دورة حياته",
      type: "link",
      category: "product",
      url: "https://example.com/product-development",
      uploadedBy: "نورة العتيبي",
      uploadDate: "2025/01/15",
      clicks: 65
    },
    {
      id: 6,
      title: "نموذج مالي للشركات الناشئة",
      description: "نموذج مالي شامل للشركات الناشئة يتضمن التوقعات المالية والتدفقات النقدية",
      type: "document",
      category: "finance",
      url: "#",
      uploadedBy: "خالد السعيد",
      uploadDate: "2025/01/10",
      downloads: 56,
      fileSize: "4.1 MB",
      fileType: "XLSX"
    }
  ]

  const categories = [
    { id: "all", name: "جميع الفئات" },
    { id: "marketing", name: "التسويق" },
    { id: "funding", name: "التمويل" },
    { id: "planning", name: "التخطيط" },
    { id: "product", name: "تطوير المنتج" },
    { id: "finance", name: "الإدارة المالية" }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.includes(searchQuery) || 
                          resource.description.includes(searchQuery)
    
    const matchesType = activeTab === "all" || resource.type === activeTab
    
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory
    
    return matchesSearch && matchesType && matchesCategory
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-10 w-10 text-blue-500" />
      case "video": return <Video className="h-10 w-10 text-red-500" />
      case "link": return <LinkIcon className="h-10 w-10 text-green-500" />
      default: return <File className="h-10 w-10 text-gray-500" />
    }
  }

  const getResourceTypeText = (type: string) => {
    switch (type) {
      case "document": return "مستند"
      case "video": return "فيديو"
      case "link": return "رابط"
      default: return "ملف"
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>رفع ملف</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            <span>إنشاء مجلد</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">الموارد التعليمية</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <FileText className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{resources.filter(r => r.type === "document").length}</div>
            <p className="text-muted-foreground">المستندات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Video className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{resources.filter(r => r.type === "video").length}</div>
            <p className="text-muted-foreground">الفيديوهات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <LinkIcon className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{resources.filter(r => r.type === "link").length}</div>
            <p className="text-muted-foreground">الروابط</p>
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
              <TabsTrigger value="link">روابط</TabsTrigger>
              <TabsTrigger value="video">فيديوهات</TabsTrigger>
              <TabsTrigger value="document">مستندات</TabsTrigger>
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
            
            <TabsContent value="all" className="mt-0">
              <div className="space-y-4">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <div key={resource.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                {getResourceTypeText(resource.type)}
                              </div>
                              <h3 className="font-bold text-lg">{resource.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">{resource.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">تم الرفع بواسطة</div>
                                <div>{resource.uploadedBy}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">تاريخ الرفع</div>
                                <div>{formatDate(resource.uploadDate)}</div>
                              </div>
                              <div>
                                {resource.type === "document" && (
                                  <>
                                    <div className="text-muted-foreground">التنزيلات</div>
                                    <div>{resource.downloads}</div>
                                  </>
                                )}
                                {resource.type === "video" && (
                                  <>
                                    <div className="text-muted-foreground">المشاهدات</div>
                                    <div>{resource.views}</div>
                                  </>
                                )}
                                {resource.type === "link" && (
                                  <>
                                    <div className="text-muted-foreground">النقرات</div>
                                    <div>{resource.clicks}</div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              {resource.type === "document" && <Download className="h-4 w-4" />}
                              {resource.type === "video" && <Video className="h-4 w-4" />}
                              {resource.type === "link" && <LinkIcon className="h-4 w-4" />}
                              <span>
                                {resource.type === "document" && "تنزيل"}
                                {resource.type === "video" && "مشاهدة"}
                                {resource.type === "link" && "فتح"}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
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
                        setActiveCategory("all")
                      }}
                    >
                      <Search className="h-4 w-4" />
                      <span>عرض جميع الموارد</span>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="document" className="mt-0">
              <div className="space-y-4">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <div key={resource.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                {resource.fileType}
                              </div>
                              <h3 className="font-bold text-lg">{resource.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">{resource.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">تم الرفع بواسطة</div>
                                <div>{resource.uploadedBy}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">تاريخ الرفع</div>
                                <div>{formatDate(resource.uploadDate)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">حجم الملف</div>
                                <div>{resource.fileSize}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">التنزيلات</div>
                                <div>{resource.downloads}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-10 w-10 text-blue-500" />
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              <span>تنزيل</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد مستندات</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على مستندات تطابق معايير البحث</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="video" className="mt-0">
              <div className="space-y-4">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <div key={resource.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                {resource.duration}
                              </div>
                              <h3 className="font-bold text-lg">{resource.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">{resource.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">تم الرفع بواسطة</div>
                                <div>{resource.uploadedBy}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">تاريخ الرفع</div>
                                <div>{formatDate(resource.uploadDate)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">المشاهدات</div>
                                <div>{resource.views}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <Video className="h-10 w-10 text-red-500" />
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              <span>مشاهدة</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد فيديوهات</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على فيديوهات تطابق معايير البحث</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="link" className="mt-0">
              <div className="space-y-4">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <div key={resource.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                رابط خارجي
                              </div>
                              <h3 className="font-bold text-lg">{resource.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">{resource.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">تم الإضافة بواسطة</div>
                                <div>{resource.uploadedBy}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">تاريخ الإضافة</div>
                                <div>{formatDate(resource.uploadDate)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">النقرات</div>
                                <div>{resource.clicks}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <LinkIcon className="h-10 w-10 text-green-500" />
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <LinkIcon className="h-4 w-4" />
                              <span>فتح</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد روابط</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على روابط تطابق معايير البحث</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
