"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Star, 
  BarChart, 
  ThumbsUp,
  ThumbsDown,
  Users,
  Calendar,
  ArrowUpRight
} from "lucide-react"

export default function FeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const feedbackItems = [
    {
      id: 1,
      type: "mentor",
      fromName: "أحمد الشمري",
      fromRole: "موجه",
      toName: "شركة تك سوليوشنز",
      toRole: "شركة ناشئة",
      date: "2025/03/10",
      session: "جلسة استشارية حول استراتيجية التسويق",
      rating: 4,
      strengths: "فريق متحمس ومتعاون، لديهم فهم جيد للسوق المستهدف، المنتج يحل مشكلة حقيقية",
      improvements: "يحتاجون إلى تحسين خطة التسويق، وتوضيح نموذج الإيرادات بشكل أفضل",
      comments: "أرى إمكانيات كبيرة لهذه الشركة، لكنهم بحاجة إلى تركيز أكبر على استراتيجية التسويق والمبيعات"
    },
    {
      id: 2,
      type: "startup",
      fromName: "شركة هيلث تك",
      fromRole: "شركة ناشئة",
      toName: "د. سارة العتيبي",
      toRole: "موجهة",
      date: "2025/03/08",
      session: "جلسة مراجعة خطة العمل",
      rating: 5,
      strengths: "خبرة ممتازة في المجال الصحي، تقديم نصائح عملية وقابلة للتطبيق، متابعة مستمرة",
      improvements: "لا توجد ملاحظات للتحسين",
      comments: "استفدنا كثيراً من خبرة د. سارة في مجال التقنيات الصحية، وساعدتنا في تحديد الفرص والتحديات في السوق"
    },
    {
      id: 3,
      type: "program",
      fromName: "شركة فينتك",
      fromRole: "شركة ناشئة",
      toName: "برنامج مسرعة التقنية المالية",
      toRole: "برنامج",
      date: "2025/03/05",
      rating: 4,
      strengths: "محتوى تعليمي ممتاز، موجهين ذوي خبرة عالية، فرص تواصل مع مستثمرين",
      improvements: "نحتاج المزيد من الجلسات الفردية مع الموجهين، وورش عمل أكثر تخصصاً في مجال التقنية المالية",
      comments: "البرنامج ممتاز بشكل عام، ونقدر الجهود المبذولة لدعم الشركات الناشئة في مجال التقنية المالية"
    },
    {
      id: 4,
      type: "event",
      fromName: "شركة باي تك",
      fromRole: "شركة ناشئة",
      toName: "ورشة عمل: استراتيجيات التسويق الرقمي",
      toRole: "فعالية",
      date: "2025/03/01",
      rating: 3,
      strengths: "محتوى مفيد، متحدث ذو خبرة، تنظيم جيد",
      improvements: "نحتاج إلى أمثلة أكثر تخصصاً في مجال التقنية المالية، وقت أطول للأسئلة والنقاش",
      comments: "الورشة كانت مفيدة، لكن نتمنى أن تكون أكثر تخصصاً في المستقبل"
    },
    {
      id: 5,
      type: "mentor",
      fromName: "م. خالد الدوسري",
      fromRole: "موجه",
      toName: "شركة ميديكال إيه آي",
      toRole: "شركة ناشئة",
      date: "2025/02/25",
      session: "جلسة تقنية حول الذكاء الاصطناعي",
      rating: 2,
      strengths: "فكرة مبتكرة، فريق تقني قوي",
      improvements: "يحتاجون إلى تحسين فهمهم للجوانب التنظيمية في القطاع الصحي، وتطوير خطة أعمال أكثر واقعية",
      comments: "الفريق يركز كثيراً على الجوانب التقنية ويهمل الجوانب التجارية والتنظيمية، مما قد يشكل تحدياً كبيراً في المستقبل"
    }
  ]

  const filteredFeedback = feedbackItems.filter(item => {
    const matchesSearch = item.fromName.includes(searchQuery) || 
                          item.toName.includes(searchQuery) ||
                          (item.session && item.session.includes(searchQuery)) ||
                          item.comments.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "mentor") return matchesSearch && item.type === "mentor"
    if (activeTab === "startup") return matchesSearch && item.type === "startup"
    if (activeTab === "program") return matchesSearch && item.type === "program"
    if (activeTab === "event") return matchesSearch && item.type === "event"
    
    return matchesSearch
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "mentor": return "bg-blue-100 text-blue-800"
      case "startup": return "bg-green-100 text-green-800"
      case "program": return "bg-purple-100 text-purple-800"
      case "event": return "bg-amber-100 text-amber-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "mentor": return "تقييم موجه"
      case "startup": return "تقييم شركة ناشئة"
      case "program": return "تقييم برنامج"
      case "event": return "تقييم فعالية"
      default: return "غير معروف"
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500"
    if (rating >= 3) return "text-amber-500"
    return "text-red-500"
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? getRatingColor(rating) : "text-gray-300"}`}
            fill={star <= rating ? "currentColor" : "none"}
          />
        ))}
      </div>
    )
  }

  const averageRating = feedbackItems.reduce((acc, item) => acc + item.rating, 0) / feedbackItems.length
  const mentorFeedbackCount = feedbackItems.filter(item => item.type === "mentor").length
  const startupFeedbackCount = feedbackItems.filter(item => item.type === "startup").length

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">التقييم والملاحظات</h1>
        <Button className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>إنشاء نموذج تقييم جديد</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Star className={`h-8 w-8 mb-2 ${getRatingColor(averageRating)}`} fill="currentColor" />
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-muted-foreground">متوسط التقييم</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{mentorFeedbackCount}</div>
            <p className="text-muted-foreground">تقييمات الموجهين</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{startupFeedbackCount}</div>
            <p className="text-muted-foreground">تقييمات الشركات الناشئة</p>
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
            <CardTitle>التقييمات والملاحظات</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="event">فعاليات</TabsTrigger>
              <TabsTrigger value="program">برامج</TabsTrigger>
              <TabsTrigger value="startup">شركات ناشئة</TabsTrigger>
              <TabsTrigger value="mentor">موجهين</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredFeedback.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(item.rating)}
                      <div className={`px-3 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                        {getTypeText(item.type)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">{item.date}</div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between mb-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">إلى</div>
                      <div className="font-medium">{item.toName}</div>
                      <div className="text-xs text-muted-foreground">{item.toRole}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">من</div>
                      <div className="font-medium">{item.fromName}</div>
                      <div className="text-xs text-muted-foreground">{item.fromRole}</div>
                    </div>
                  </div>
                  
                  {item.session && (
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground">الجلسة</div>
                      <div className="font-medium">{item.session}</div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <div className="text-sm font-medium">نقاط القوة</div>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.strengths}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <div className="text-sm font-medium">مجالات التحسين</div>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.improvements}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1">ملاحظات إضافية</div>
                    <p className="text-sm text-muted-foreground">{item.comments}</p>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm">عرض التفاصيل الكاملة</Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">إضافة رد</Button>
                      <Button variant="default" size="sm">متابعة</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredFeedback.length === 0 && (
              <div className="text-center p-8 border rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد تقييمات</h3>
                <p className="text-muted-foreground mb-4">لم يتم العثور على تقييمات تطابق معايير البحث</p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveTab("all")
                  }}
                >
                  <Search className="h-4 w-4" />
                  <span>عرض جميع التقييمات</span>
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
