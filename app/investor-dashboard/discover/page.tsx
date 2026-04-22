"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Rocket, 
  Star,
  Briefcase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BarChart,
  Users,
  DollarSign,
  FileText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Heart,
  Share2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MapPin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Tag,
  TrendingUp,
  Clock,
  Bookmark,
  BookmarkPlus
} from "lucide-react"

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")
  const [savedStartups, setSavedStartups] = useState<number[]>([])

  const startups = [
    {
      id: 1,
      name: "تك سمارت",
      logo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      industry: "التكنولوجيا المالية",
      stage: "جولة أولى",
      location: "الرياض، المملكة العربية السعودية",
      foundedYear: 2022,
      fundingGoal: "5,000,000 ريال",
      valuation: "20,000,000 ريال",
      traction: "15,000 مستخدم",
      growth: "+25% شهرياً",
      description: "منصة تكنولوجيا مالية تقدم حلول مدفوعات رقمية للشركات الصغيرة والمتوسطة.",
      team: [
        { name: "أحمد الشمري", position: "المؤسس والرئيس التنفيذي" },
        { name: "سارة العتيبي", position: "المدير التقني" },
        { name: "محمد القحطاني", position: "مدير المنتج" }
      ],
      tags: ["مدفوعات رقمية", "تكنولوجيا مالية", "الشركات الصغيرة والمتوسطة"],
      rating: 4.5,
      matchScore: 92,
      pitchDate: "2025/03/25"
    },
    {
      id: 2,
      name: "هيلث تك",
      logo: "https://placehold.co/100x100/10B981/FFFFFF?text=HT",
      industry: "التكنولوجيا الصحية",
      stage: "تمويل أولي",
      location: "جدة، المملكة العربية السعودية",
      foundedYear: 2023,
      fundingGoal: "2,500,000 ريال",
      valuation: "10,000,000 ريال",
      traction: "8,000 مستخدم",
      growth: "+18% شهرياً",
      description: "منصة رعاية صحية رقمية تربط المرضى بالأطباء وتقدم خدمات استشارات طبية عن بعد.",
      team: [
        { name: "فيصل الغامدي", position: "المؤسس والرئيس التنفيذي" },
        { name: "ليلى المالكي", position: "المديرة الطبية" }
      ],
      tags: ["الرعاية الصحية", "الطب عن بعد", "التكنولوجيا الصحية"],
      rating: 4.0,
      matchScore: 78,
      pitchDate: "2025/03/20"
    },
    {
      id: 3,
      name: "إيكو سمارت",
      logo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=ES",
      industry: "التكنولوجيا الخضراء",
      stage: "جولة أولى",
      location: "الدمام، المملكة العربية السعودية",
      foundedYear: 2021,
      fundingGoal: "7,000,000 ريال",
      valuation: "25,000,000 ريال",
      traction: "120 عميل",
      growth: "+15% شهرياً",
      description: "شركة تطور حلول تكنولوجية مستدامة لإدارة الطاقة في المباني التجارية والسكنية.",
      team: [
        { name: "عبدالله الحربي", position: "المؤسس والرئيس التنفيذي" },
        { name: "مها السليم", position: "المديرة الهندسية" },
        { name: "طارق العنزي", position: "مدير التطوير التجاري" }
      ],
      tags: ["الطاقة المتجددة", "إدارة الطاقة", "الاستدامة"],
      rating: 4.8,
      matchScore: 85,
      pitchDate: "2025/04/05"
    },
    {
      id: 4,
      name: "ديليفر ناو",
      logo: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=DN",
      industry: "التجارة الإلكترونية",
      stage: "جولة ثانية",
      location: "الرياض، المملكة العربية السعودية",
      foundedYear: 2020,
      fundingGoal: "10,000,000 ريال",
      valuation: "40,000,000 ريال",
      traction: "50,000 مستخدم",
      growth: "+30% شهرياً",
      description: "منصة توصيل طلبات للمتاجر المحلية والمطاعم مع خدمة توصيل سريعة في أقل من 30 دقيقة.",
      team: [
        { name: "خالد العنزي", position: "المؤسس والرئيس التنفيذي" },
        { name: "نورة الشمري", position: "مديرة العمليات" },
        { name: "فهد المطيري", position: "مدير التسويق" }
      ],
      tags: ["توصيل", "تجارة إلكترونية", "خدمات لوجستية"],
      rating: 4.3,
      matchScore: 70,
      pitchDate: "2025/03/15"
    },
    {
      id: 5,
      name: "إيدو تك",
      logo: "https://placehold.co/100x100/EC4899/FFFFFF?text=ET",
      industry: "التعليم التقني",
      stage: "تمويل أولي",
      location: "جدة، المملكة العربية السعودية",
      foundedYear: 2023,
      fundingGoal: "3,000,000 ريال",
      valuation: "12,000,000 ريال",
      traction: "5,000 مستخدم",
      growth: "+20% شهرياً",
      description: "منصة تعليمية تفاعلية تقدم دورات في البرمجة والذكاء الاصطناعي للطلاب والمهنيين.",
      team: [
        { name: "سلمان الدوسري", position: "المؤسس والرئيس التنفيذي" },
        { name: "هند العتيبي", position: "مديرة المحتوى التعليمي" }
      ],
      tags: ["تعليم تقني", "برمجة", "ذكاء اصطناعي"],
      rating: 4.2,
      matchScore: 65,
      pitchDate: "2025/04/10"
    }
  ]

  const categories = [
    { id: "all", name: "جميع القطاعات" },
    { id: "fintech", name: "التكنولوجيا المالية" },
    { id: "healthtech", name: "التكنولوجيا الصحية" },
    { id: "greentech", name: "التكنولوجيا الخضراء" },
    { id: "ecommerce", name: "التجارة الإلكترونية" },
    { id: "edutech", name: "التعليم التقني" }
  ]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stages = [
    { id: "all", name: "جميع المراحل" },
    { id: "seed", name: "تمويل أولي" },
    { id: "seriesA", name: "جولة أولى" },
    { id: "seriesB", name: "جولة ثانية" }
  ]

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.includes(searchQuery) || 
                          startup.industry.includes(searchQuery) ||
                          startup.description.includes(searchQuery) ||
                          startup.tags.some(tag => tag.includes(searchQuery))
    
    const matchesCategory = activeCategory === "all" || 
                           (activeCategory === "fintech" && startup.industry === "التكنولوجيا المالية") ||
                           (activeCategory === "healthtech" && startup.industry === "التكنولوجيا الصحية") ||
                           (activeCategory === "greentech" && startup.industry === "التكنولوجيا الخضراء") ||
                           (activeCategory === "ecommerce" && startup.industry === "التجارة الإلكترونية") ||
                           (activeCategory === "edutech" && startup.industry === "التعليم التقني")
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "saved" && savedStartups.includes(startup.id)) ||
                      (activeTab === "recommended" && startup.matchScore >= 80)
    
    return matchesSearch && matchesCategory && matchesTab
  })

  const toggleSaveStartup = (id: number) => {
    if (savedStartups.includes(id)) {
      setSavedStartups(savedStartups.filter(startupId => startupId !== id))
    } else {
      setSavedStartups([...savedStartups, id])
    }
  }

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
      />
    ))
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">اكتشاف الشركات الناشئة</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Rocket className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{startups.length}</div>
            <p className="text-muted-foreground">الشركات الناشئة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {startups.filter(startup => startup.matchScore >= 80).length}
            </div>
            <p className="text-muted-foreground">الشركات الموصى بها</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Bookmark className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{savedStartups.length}</div>
            <p className="text-muted-foreground">الشركات المحفوظة</p>
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
            <CardTitle>الشركات الناشئة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="saved">المحفوظة</TabsTrigger>
              <TabsTrigger value="recommended">الموصى بها</TabsTrigger>
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
              {filteredStartups.length > 0 ? (
                filteredStartups.map((startup) => (
                  <Card key={startup.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {startup.stage}
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                  {startup.industry}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div>
                                  <h3 className="font-bold text-lg">{startup.name}</h3>
                                  <div className="text-sm text-muted-foreground">{startup.location} • تأسست {startup.foundedYear}</div>
                                </div>
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                  <img 
                                    src={startup.logo} 
                                    alt={`شعار ${startup.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-4">{startup.description}</p>
                            <div className="flex flex-wrap gap-2 justify-end mb-4">
                              {startup.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-1 bg-muted text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">التقييم</div>
                                  <div className="font-medium">{startup.valuation}</div>
                                </div>
                                <Briefcase className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">هدف التمويل</div>
                                  <div className="font-medium">{startup.fundingGoal}</div>
                                </div>
                                <DollarSign className="h-5 w-5 text-green-500" />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">الجذب</div>
                                  <div className="font-medium">{startup.traction}</div>
                                </div>
                                <Users className="h-5 w-5 text-purple-500" />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">النمو</div>
                                  <div className="font-medium">{startup.growth}</div>
                                </div>
                                <TrendingUp className="h-5 w-5 text-red-500" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">عرض تقديمي: {startup.pitchDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {renderStars(startup.rating)}
                                  <span className="text-sm text-muted-foreground ml-1">({startup.rating})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  نسبة التطابق: {startup.matchScore}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end border-t p-2 bg-muted/10">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            <span>مشاركة</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => toggleSaveStartup(startup.id)}
                          >
                            {savedStartups.includes(startup.id) ? (
                              <>
                                <Bookmark className="h-4 w-4 fill-current" />
                                <span>محفوظة</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="h-4 w-4" />
                                <span>حفظ</span>
                              </>
                            )}
                          </Button>
                          <Button size="sm" className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>عرض التفاصيل</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد شركات ناشئة</h3>
                  <p className="text-muted-foreground mb-4">لم يتم العثور على شركات ناشئة تطابق معايير البحث</p>
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
                    <span>عرض جميع الشركات الناشئة</span>
                  </Button>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
