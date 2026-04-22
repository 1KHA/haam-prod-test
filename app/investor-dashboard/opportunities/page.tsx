"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  Tag,
  ChevronRight,
  Star,
  StarOff,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Briefcase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building,
  MapPin,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock
} from "lucide-react"

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [favoriteOpportunities, setFavoriteOpportunities] = useState<number[]>([1, 3])

  const toggleFavorite = (opportunityId: number) => {
    if (favoriteOpportunities.includes(opportunityId)) {
      setFavoriteOpportunities(favoriteOpportunities.filter(id => id !== opportunityId))
    } else {
      setFavoriteOpportunities([...favoriteOpportunities, opportunityId])
    }
  }

  // Sample opportunities data
  const opportunities = [
    {
      id: 1,
      name: "تك سمارت",
      sector: "التكنولوجيا المالية",
      stage: "جولة أولى",
      location: "الرياض",
      fundingGoal: "5,000,000 ريال",
      minInvestment: "250,000 ريال",
      equity: "10%",
      deadline: "15 أبريل 2025",
      description: "منصة تكنولوجيا مالية تقدم حلولًا مبتكرة للمدفوعات الرقمية والتحويلات المالية. تستهدف الشركة قطاع الشركات الصغيرة والمتوسطة وتوفر حلولًا سهلة الاستخدام وبتكلفة منخفضة.",
      traction: "10,000 مستخدم نشط، نمو شهري بنسبة 15%",
      team: "5 مؤسسين، خبرة في القطاع المالي والتكنولوجي",
      tags: ["التكنولوجيا المالية", "المدفوعات", "التحويلات المالية"],
      image: "https://placehold.co/600x400/e9ecef/495057?text=تك+سمارت"
    },
    {
      id: 2,
      name: "هيلث تك",
      sector: "التكنولوجيا الصحية",
      stage: "تمويل أولي",
      location: "جدة",
      fundingGoal: "3,000,000 ريال",
      minInvestment: "100,000 ريال",
      equity: "15%",
      deadline: "30 أبريل 2025",
      description: "منصة رعاية صحية رقمية تربط المرضى بالأطباء عبر الإنترنت. توفر استشارات طبية عن بعد، وصفات طبية إلكترونية، ومتابعة للحالات المزمنة.",
      traction: "5,000 مستخدم، 200 طبيب مسجل",
      team: "3 مؤسسين، خلفية طبية وتقنية",
      tags: ["التكنولوجيا الصحية", "الرعاية الصحية عن بعد", "الاستشارات الطبية"],
      image: "https://placehold.co/600x400/e9ecef/495057?text=هيلث+تك"
    },
    {
      id: 3,
      name: "إيكو سمارت",
      sector: "التكنولوجيا الخضراء",
      stage: "جولة ثانية",
      location: "الدمام",
      fundingGoal: "10,000,000 ريال",
      minInvestment: "500,000 ريال",
      equity: "8%",
      deadline: "10 مايو 2025",
      description: "شركة تطور حلولًا ذكية لإدارة الطاقة في المباني التجارية والسكنية. تستخدم الذكاء الاصطناعي لتحسين كفاءة استهلاك الطاقة وتقليل البصمة الكربونية.",
      traction: "20 عميل تجاري، توفير 30% من استهلاك الطاقة",
      team: "4 مؤسسين، خبرة في هندسة الطاقة والذكاء الاصطناعي",
      tags: ["التكنولوجيا الخضراء", "إدارة الطاقة", "المباني الذكية"],
      image: "https://placehold.co/600x400/e9ecef/495057?text=إيكو+سمارت"
    },
    {
      id: 4,
      name: "فود تك",
      sector: "تكنولوجيا الأغذية",
      stage: "تمويل أولي",
      location: "الرياض",
      fundingGoal: "2,500,000 ريال",
      minInvestment: "100,000 ريال",
      equity: "12%",
      deadline: "20 مايو 2025",
      description: "منصة لتوصيل المكونات الطازجة ووصفات الطعام إلى المنازل. تركز على الأطعمة الصحية والمستدامة وتستهدف الأسر المهتمة بالصحة والاستدامة.",
      traction: "2,000 اشتراك شهري، معدل احتفاظ 80%",
      team: "3 مؤسسين، خبرة في قطاع الأغذية والتجارة الإلكترونية",
      tags: ["تكنولوجيا الأغذية", "التوصيل", "الاستدامة"],
      image: "https://placehold.co/600x400/e9ecef/495057?text=فود+تك"
    },
    {
      id: 5,
      name: "إيدو تك",
      sector: "تكنولوجيا التعليم",
      stage: "جولة أولى",
      location: "جدة",
      fundingGoal: "4,000,000 ريال",
      minInvestment: "200,000 ريال",
      equity: "10%",
      deadline: "5 يونيو 2025",
      description: "منصة تعليمية تفاعلية للأطفال والمراهقين. توفر دورات في البرمجة والعلوم والرياضيات بطريقة ممتعة وتفاعلية.",
      traction: "15,000 مستخدم، نمو شهري بنسبة 20%",
      team: "4 مؤسسين، خلفية في التعليم وتطوير البرمجيات",
      tags: ["تكنولوجيا التعليم", "التعلم التفاعلي", "البرمجة للأطفال"],
      image: "https://placehold.co/600x400/e9ecef/495057?text=إيدو+تك"
    }
  ]

  const filteredOpportunities = opportunities.filter(opportunity => 
    opportunity.name.includes(searchQuery) || 
    opportunity.description.includes(searchQuery) ||
    opportunity.sector.includes(searchQuery) ||
    opportunity.tags.some(tag => tag.includes(searchQuery))
  )

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">الفرص الاستثمارية</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن فرص استثمارية..." 
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommended">موصى بها</TabsTrigger>
            <TabsTrigger value="favorites">المفضلة</TabsTrigger>
            <TabsTrigger value="all">جميع الفرص</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpportunities.length > 0 ? (
          filteredOpportunities.map(opportunity => (
            <Card key={opportunity.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <img 
                  src={opportunity.image} 
                  alt={opportunity.name} 
                  className="h-full w-full object-cover"
                />
                <button 
                  className="absolute top-2 left-2 p-1 bg-white rounded-full"
                  onClick={() => toggleFavorite(opportunity.id)}
                >
                  {favoriteOpportunities.includes(opportunity.id) ? (
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {opportunity.sector}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                      {opportunity.stage}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{opportunity.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {opportunity.description}
                </CardDescription>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-medium">{opportunity.fundingGoal}</span>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">{opportunity.minInvestment}</span>
                      <span className="text-xs text-muted-foreground">الحد الأدنى</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">{opportunity.equity}</span>
                      <span className="text-xs text-muted-foreground">الحصة</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">{opportunity.location}</span>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">{opportunity.team}</span>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">{opportunity.deadline}</span>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1 text-right">الجذب</div>
                  <div className="text-sm text-muted-foreground">{opportunity.traction}</div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {opportunity.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  طلب معلومات
                </Button>
                <Button>
                  عرض التفاصيل
                  <ChevronRight className="h-4 w-4 mr-1" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground">لا توجد فرص استثمارية مطابقة لبحثك</p>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right">
        <h3 className="text-lg font-medium text-blue-800 mb-2">فرص موصى بها</h3>
        <p className="text-blue-700 mb-4">بناءً على استراتيجية الاستثمار الخاصة بك، قد تهتم بالفرص التالية:</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-md border border-blue-100">
            <Button variant="outline" size="sm">
              عرض التفاصيل
            </Button>
            <div className="text-right">
              <h4 className="font-medium">سمارت لوجيستكس</h4>
              <p className="text-sm text-muted-foreground">التكنولوجيا اللوجستية • جولة أولى • 6,000,000 ريال</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white p-3 rounded-md border border-blue-100">
            <Button variant="outline" size="sm">
              عرض التفاصيل
            </Button>
            <div className="text-right">
              <h4 className="font-medium">روبوتكس</h4>
              <p className="text-sm text-muted-foreground">الروبوتات والذكاء الاصطناعي • تمويل أولي • 4,000,000 ريال</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
