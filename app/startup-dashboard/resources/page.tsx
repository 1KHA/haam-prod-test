"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Download, 
  Search, 
  BookOpen, 
  Video, 
  FileCode, 
  File, 
  Filter,
  ChevronDown,
  Star,
  Clock,
  Play,
  ExternalLink
} from "lucide-react"

// Mock resources data
const resources = [
  {
    id: 1,
    title: "دليل إعداد خطة العمل",
    description: "دليل شامل لإعداد خطة عمل احترافية لشركتك الناشئة",
    category: "أدلة",
    type: "PDF",
    size: "2.5 MB",
    date: "15 يناير 2025",
    featured: true,
    popular: true,
    tags: ["خطة عمل", "استراتيجية"]
  },
  {
    id: 2,
    title: "قالب العرض التقديمي للمستثمرين",
    description: "قالب احترافي للعروض التقديمية أمام المستثمرين",
    category: "قوالب",
    type: "PPTX",
    size: "5.8 MB",
    date: "20 يناير 2025",
    featured: true,
    popular: true,
    tags: ["عرض تقديمي", "استثمار"]
  },
  {
    id: 3,
    title: "استراتيجيات التسويق للشركات الناشئة",
    description: "دليل شامل لاستراتيجيات التسويق الفعالة للشركات الناشئة",
    category: "أدلة",
    type: "PDF",
    size: "3.2 MB",
    date: "5 فبراير 2025",
    featured: false,
    popular: true,
    tags: ["تسويق", "نمو"]
  },
  {
    id: 4,
    title: "قالب الخطة المالية",
    description: "قالب Excel لإعداد الخطة المالية والتوقعات المالية",
    category: "قوالب",
    type: "XLSX",
    size: "1.8 MB",
    date: "10 فبراير 2025",
    featured: true,
    popular: false,
    tags: ["مالية", "توقعات"]
  },
  {
    id: 5,
    title: "أساسيات تطوير المنتج",
    description: "دورة تدريبية حول أساسيات تطوير المنتج وإدارة المنتجات",
    category: "دورات",
    type: "فيديو",
    duration: "2 ساعة و 30 دقيقة",
    date: "15 فبراير 2025",
    featured: false,
    popular: true,
    tags: ["تطوير المنتج", "إدارة المنتج"]
  },
  {
    id: 6,
    title: "نماذج اتفاقيات قانونية",
    description: "مجموعة من النماذج القانونية الأساسية للشركات الناشئة",
    category: "قانونية",
    type: "ZIP",
    size: "4.5 MB",
    date: "20 فبراير 2025",
    featured: false,
    popular: false,
    tags: ["قانوني", "اتفاقيات"]
  }
]

// Mock courses data
const courses = [
  {
    id: 1,
    title: "أساسيات ريادة الأعمال",
    description: "دورة شاملة حول أساسيات ريادة الأعمال وبناء الشركات الناشئة",
    instructor: "د. أحمد محمد",
    duration: "8 ساعات",
    modules: 12,
    progress: 75,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    title: "استراتيجيات التسويق الرقمي",
    description: "تعلم أحدث استراتيجيات التسويق الرقمي لنمو شركتك الناشئة",
    instructor: "م. سارة خالد",
    duration: "6 ساعات",
    modules: 8,
    progress: 50,
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 3,
    title: "إدارة المنتج للشركات الناشئة",
    description: "دورة متخصصة في إدارة المنتج وتطويره في الشركات الناشئة",
    instructor: "م. محمد العلي",
    duration: "5 ساعات",
    modules: 7,
    progress: 30,
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 4,
    title: "أساسيات التمويل للشركات الناشئة",
    description: "فهم أساسيات التمويل وإدارة الموارد المالية لشركتك الناشئة",
    instructor: "د. نورة الفهد",
    duration: "4 ساعات",
    modules: 6,
    progress: 0,
    image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
]

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("resources")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.includes(searchQuery) || 
                          resource.description.includes(searchQuery) ||
                          resource.tags.some(tag => tag.includes(searchQuery))
    
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-5 w-5 text-red-500" />
      case "PPTX":
        return <FileText className="h-5 w-5 text-orange-500" />
      case "XLSX":
        return <FileText className="h-5 w-5 text-green-500" />
      case "ZIP":
        return <File className="h-5 w-5 text-purple-500" />
      case "فيديو":
        return <Video className="h-5 w-5 text-blue-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">مركز الموارد التعليمية</h1>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن موارد..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>التصنيف</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            {/* Dropdown would go here in a real implementation */}
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="courses">الدورات التدريبية</TabsTrigger>
          <TabsTrigger value="resources">الموارد والقوالب</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">الموارد المميزة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources.filter(r => r.featured).map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          {getResourceIcon(resource.type)}
                          <div className="text-right">
                            <CardTitle>{resource.title}</CardTitle>
                            <CardDescription className="mt-1">{resource.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {resource.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{resource.type} • {resource.size}</span>
                          <span>{resource.date}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">
                          <Download className="h-4 w-4 ml-2" />
                          تنزيل
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">جميع الموارد</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          {getResourceIcon(resource.type)}
                          <div className="text-right">
                            <CardTitle>{resource.title}</CardTitle>
                            <CardDescription className="mt-1">{resource.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {resource.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{resource.type} • {resource.size || resource.duration}</span>
                          <span>{resource.date}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">
                          <Download className="h-4 w-4 ml-2" />
                          تنزيل
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">لا توجد موارد تطابق معايير البحث</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">الدورات التدريبية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 ml-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{course.duration}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <BookOpen className="h-4 w-4 ml-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{course.modules} وحدة</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <CardTitle>{course.title}</CardTitle>
                            <CardDescription className="mt-1">{course.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{course.progress}% مكتمل</span>
                          <span className="text-sm font-medium">المدرب: {course.instructor}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">
                          {course.progress > 0 ? (
                            <>
                              <Play className="h-4 w-4 ml-2" />
                              متابعة الدورة
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 ml-2" />
                              بدء الدورة
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>دورات موصى بها</CardTitle>
                <CardDescription>دورات تدريبية قد تهمك بناءً على اهتماماتك ومجال عملك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <img 
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                        alt="استراتيجيات النمو" 
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div>
                        <h3 className="font-bold">استراتيجيات النمو للشركات الناشئة</h3>
                        <p className="text-sm text-muted-foreground">المدرب: د. خالد العمري • 6 ساعات</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          <Star className="h-4 w-4 text-amber-500" />
                          <Star className="h-4 w-4 text-amber-500" />
                          <Star className="h-4 w-4 text-amber-500" />
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-muted-foreground mr-1">(120 تقييم)</span>
                        </div>
                      </div>
                    </div>
                    <Button>
                      <ExternalLink className="h-4 w-4 ml-2" />
                      عرض الدورة
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <img 
                        src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                        alt="الذكاء الاصطناعي" 
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div>
                        <h3 className="font-bold">تطبيقات الذكاء الاصطناعي في الأعمال</h3>
                        <p className="text-sm text-muted-foreground">المدرب: م. سارة الزهراني • 8 ساعات</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          <Star className="h-4 w-4 text-amber-500" />
                          <Star className="h-4 w-4 text-amber-500" />
                          <Star className="h-4 w-4 text-amber-500" />
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-muted-foreground mr-1">(85 تقييم)</span>
                        </div>
                      </div>
                    </div>
                    <Button>
                      <ExternalLink className="h-4 w-4 ml-2" />
                      عرض الدورة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
