"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  FileCheck, 
  Download, 
  ExternalLink, 
  Star,
  Briefcase,
  BarChart,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"

export default function DueDiligencePage() {
  const [searchQuery, setSearchQuery] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("startups")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedStartup, setExpandedStartup] = useState<number | null>(null)

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
      readiness: 85,
      description: "منصة تكنولوجيا مالية تقدم حلول مدفوعات رقمية للشركات الصغيرة والمتوسطة.",
      team: [
        { name: "أحمد الشمري", position: "المؤسس والرئيس التنفيذي", linkedin: "#" },
        { name: "سارة العتيبي", position: "المدير التقني", linkedin: "#" },
        { name: "محمد القحطاني", position: "مدير المنتج", linkedin: "#" }
      ],
      metrics: {
        revenue: "1,200,000 ريال",
        users: 15000,
        growth: "+25% شهرياً",
        burn: "150,000 ريال شهرياً",
        runway: "8 أشهر"
      },
      documents: [
        { name: "خطة العمل", type: "pdf", size: "2.4MB", date: "2025/02/15" },
        { name: "العرض التقديمي", type: "pptx", size: "5.1MB", date: "2025/02/20" },
        { name: "التقرير المالي", type: "xlsx", size: "1.8MB", date: "2025/02/10" },
        { name: "تقرير العناية الواجبة", type: "pdf", size: "3.5MB", date: "2025/03/05" }
      ],
      compliance: {
        legal: { status: "مكتمل", notes: "جميع الوثائق القانونية مكتملة وسارية المفعول" },
        financial: { status: "مكتمل", notes: "البيانات المالية مدققة ومعتمدة" },
        technical: { status: "قيد التقدم", notes: "تقييم الأمان السيبراني قيد التنفيذ" },
        market: { status: "مكتمل", notes: "تحليل السوق والمنافسين مكتمل" }
      },
      mentorFeedback: [
        { mentor: "د. خالد العمري", rating: 4.5, comment: "فريق قوي مع رؤية واضحة للمنتج. أوصي بمزيد من التركيز على استراتيجية التسويق." },
        { mentor: "م. نورة الدوسري", rating: 4.2, comment: "تقنية مبتكرة وحل فعال لمشكلة حقيقية. يحتاج إلى تحسين في قابلية التوسع." }
      ]
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
      readiness: 70,
      description: "منصة رعاية صحية رقمية تربط المرضى بالأطباء وتقدم خدمات استشارات طبية عن بعد.",
      team: [
        { name: "فيصل الغامدي", position: "المؤسس والرئيس التنفيذي", linkedin: "#" },
        { name: "ليلى المالكي", position: "المديرة الطبية", linkedin: "#" }
      ],
      metrics: {
        revenue: "450,000 ريال",
        users: 8000,
        growth: "+18% شهرياً",
        burn: "120,000 ريال شهرياً",
        runway: "6 أشهر"
      },
      documents: [
        { name: "خطة العمل", type: "pdf", size: "3.1MB", date: "2025/01/20" },
        { name: "العرض التقديمي", type: "pptx", size: "4.2MB", date: "2025/01/25" },
        { name: "التقرير المالي", type: "xlsx", size: "1.5MB", date: "2025/01/15" }
      ],
      compliance: {
        legal: { status: "مكتمل", notes: "جميع التراخيص الطبية والموافقات التنظيمية مكتملة" },
        financial: { status: "قيد التقدم", notes: "التدقيق المالي قيد التنفيذ" },
        technical: { status: "مكتمل", notes: "تم اجتياز تقييم أمان البيانات" },
        market: { status: "مكتمل", notes: "دراسة السوق مكتملة" }
      },
      mentorFeedback: [
        { mentor: "د. سلمى الزهراني", rating: 4.0, comment: "فكرة واعدة في سوق متنامي. يحتاج إلى تعزيز فريق التطوير التقني." }
      ]
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
      readiness: 90,
      description: "شركة تطور حلول تكنولوجية مستدامة لإدارة الطاقة في المباني التجارية والسكنية.",
      team: [
        { name: "عبدالله الحربي", position: "المؤسس والرئيس التنفيذي", linkedin: "#" },
        { name: "مها السليم", position: "المديرة الهندسية", linkedin: "#" },
        { name: "طارق العنزي", position: "مدير التطوير التجاري", linkedin: "#" }
      ],
      metrics: {
        revenue: "3,500,000 ريال",
        users: 120,
        growth: "+15% شهرياً",
        burn: "200,000 ريال شهرياً",
        runway: "12 أشهر"
      },
      documents: [
        { name: "خطة العمل", type: "pdf", size: "4.2MB", date: "2025/02/05" },
        { name: "العرض التقديمي", type: "pptx", size: "6.3MB", date: "2025/02/10" },
        { name: "التقرير المالي", type: "xlsx", size: "2.1MB", date: "2025/02/01" },
        { name: "تقرير العناية الواجبة", type: "pdf", size: "5.0MB", date: "2025/03/01" },
        { name: "تقرير الأثر البيئي", type: "pdf", size: "3.2MB", date: "2025/02/20" }
      ],
      compliance: {
        legal: { status: "مكتمل", notes: "جميع براءات الاختراع والملكية الفكرية مسجلة" },
        financial: { status: "مكتمل", notes: "البيانات المالية مدققة ومعتمدة" },
        technical: { status: "مكتمل", notes: "تم اجتياز جميع اختبارات الجودة والأداء" },
        market: { status: "مكتمل", notes: "تحليل السوق والمنافسين مكتمل" }
      },
      mentorFeedback: [
        { mentor: "م. فهد العتيبي", rating: 4.8, comment: "نموذج عمل قوي مع إمكانية توسع عالمية. الفريق متميز ولديه خبرة عميقة في المجال." },
        { mentor: "د. نوف الشمري", rating: 4.7, comment: "تقنية مبتكرة تلبي احتياجات السوق المتزايدة للحلول المستدامة. أداء مالي قوي." }
      ]
    }
  ]

  const categories = [
    { id: "all", name: "جميع الشركات" },
    { id: "fintech", name: "التكنولوجيا المالية" },
    { id: "healthtech", name: "التكنولوجيا الصحية" },
    { id: "greentech", name: "التكنولوجيا الخضراء" },
    { id: "ecommerce", name: "التجارة الإلكترونية" }
  ]

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.includes(searchQuery) || 
                          startup.industry.includes(searchQuery) ||
                          startup.description.includes(searchQuery)
    
    const matchesCategory = activeCategory === "all" || 
                           (activeCategory === "fintech" && startup.industry === "التكنولوجيا المالية") ||
                           (activeCategory === "healthtech" && startup.industry === "التكنولوجيا الصحية") ||
                           (activeCategory === "greentech" && startup.industry === "التكنولوجيا الخضراء") ||
                           (activeCategory === "ecommerce" && startup.industry === "التجارة الإلكترونية")
    
    return matchesSearch && matchesCategory
  })

  const toggleExpand = (id: number) => {
    if (expandedStartup === id) {
      setExpandedStartup(null)
    } else {
      setExpandedStartup(id)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتمل":
        return "text-green-500"
      case "قيد التقدم":
        return "text-amber-500"
      default:
        return "text-red-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "مكتمل":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "قيد التقدم":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "pptx":
        return <FileText className="h-4 w-4 text-orange-500" />
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
        <h1 className="text-3xl font-bold">العناية الواجبة</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <FileCheck className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{startups.length}</div>
            <p className="text-muted-foreground">الشركات الناشئة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">82%</div>
            <p className="text-muted-foreground">متوسط جاهزية الاستثمار</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <FileText className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground">تقارير العناية الواجبة</p>
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
                <div key={startup.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 border-b cursor-pointer"
                    onClick={() => toggleExpand(startup.id)}
                  >
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span>{startup.fundingGoal}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4 text-blue-500" />
                              <span>{startup.valuation}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">جاهزية الاستثمار:</span>
                            <div className="w-32 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${startup.readiness}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{startup.readiness}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedStartup === startup.id && (
                    <div className="p-4 bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>فريق العمل</span>
                          </h4>
                          <div className="space-y-2">
                            {startup.team.map((member, index) => (
                              <div key={index} className="flex items-center justify-between border-b pb-2">
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                  <ExternalLink className="h-4 w-4 inline" />
                                </a>
                                <div className="text-right">
                                  <div className="font-medium">{member.name}</div>
                                  <div className="text-sm text-muted-foreground">{member.position}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <h4 className="font-medium mt-6 mb-3 flex items-center gap-2">
                            <BarChart className="h-4 w-4 text-green-500" />
                            <span>المؤشرات الرئيسية</span>
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-3 text-center">
                              <div className="text-sm text-muted-foreground">الإيرادات</div>
                              <div className="font-bold">{startup.metrics.revenue}</div>
                            </div>
                            <div className="border rounded-lg p-3 text-center">
                              <div className="text-sm text-muted-foreground">المستخدمون</div>
                              <div className="font-bold">{startup.metrics.users}</div>
                            </div>
                            <div className="border rounded-lg p-3 text-center">
                              <div className="text-sm text-muted-foreground">معدل النمو</div>
                              <div className="font-bold">{startup.metrics.growth}</div>
                            </div>
                            <div className="border rounded-lg p-3 text-center">
                              <div className="text-sm text-muted-foreground">المدة المتبقية</div>
                              <div className="font-bold">{startup.metrics.runway}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-purple-500" />
                            <span>المستندات</span>
                          </h4>
                          <div className="space-y-2">
                            {startup.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <div className="text-sm text-muted-foreground">{doc.size}</div>
                                  <div className="text-sm text-muted-foreground">{doc.date}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div>{doc.name}</div>
                                  {getDocumentIcon(doc.type)}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <h4 className="font-medium mt-6 mb-3 flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-blue-500" />
                            <span>حالة الامتثال</span>
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(startup.compliance.legal.status)}
                                <span className={getStatusColor(startup.compliance.legal.status)}>
                                  {startup.compliance.legal.status}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">الامتثال القانوني</div>
                                <div className="text-sm text-muted-foreground">{startup.compliance.legal.notes}</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(startup.compliance.financial.status)}
                                <span className={getStatusColor(startup.compliance.financial.status)}>
                                  {startup.compliance.financial.status}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">الامتثال المالي</div>
                                <div className="text-sm text-muted-foreground">{startup.compliance.financial.notes}</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(startup.compliance.technical.status)}
                                <span className={getStatusColor(startup.compliance.technical.status)}>
                                  {startup.compliance.technical.status}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">الامتثال التقني</div>
                                <div className="text-sm text-muted-foreground">{startup.compliance.technical.notes}</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(startup.compliance.market.status)}
                                <span className={getStatusColor(startup.compliance.market.status)}>
                                  {startup.compliance.market.status}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">تحليل السوق</div>
                                <div className="text-sm text-muted-foreground">{startup.compliance.market.notes}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">ملاحظات الموجهين</h4>
                        <div className="space-y-4">
                          {startup.mentorFeedback.map((feedback, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  {renderStars(feedback.rating)}
                                  <span className="text-sm text-muted-foreground ml-1">({feedback.rating})</span>
                                </div>
                                <div className="font-medium">{feedback.mentor}</div>
                              </div>
                              <p className="text-muted-foreground text-right">{feedback.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>تنزيل التقرير الكامل</span>
                        </Button>
                        <Button className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          <span>طلب معلومات إضافية</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد شركات ناشئة</h3>
                <p className="text-muted-foreground mb-4">لم يتم العثور على شركات ناشئة تطابق معايير البحث</p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory("all")
                  }}
                >
                  <Search className="h-4 w-4" />
                  <span>عرض جميع الشركات الناشئة</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
