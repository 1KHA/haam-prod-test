"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  FileText,
  Send,
  Plus,
  ChevronDown
} from "lucide-react"

export default function FeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [expandedFeedback, setExpandedFeedback] = useState<number | null>(null)

  const feedbacks = [
    {
      id: 1,
      startupName: "تك سوليوشنز",
      startupLogo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      sessionDate: "2025/03/01",
      sessionTopic: "مراجعة خطة التسويق",
      status: "pending",
      notes: "",
      rating: 0
    },
    {
      id: 2,
      startupName: "هيلث تك",
      startupLogo: "https://placehold.co/100x100/10B981/FFFFFF?text=HT",
      sessionDate: "2025/02/25",
      sessionTopic: "استراتيجية جمع التمويل",
      status: "completed",
      notes: "فريق متحمس ولديه فهم جيد للسوق المستهدف. يحتاجون إلى تحسين خطة التمويل وتحديد المستثمرين المحتملين بشكل أفضل.",
      rating: 4
    },
    {
      id: 3,
      startupName: "فينتك",
      startupLogo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=FT",
      sessionDate: "2025/02/20",
      sessionTopic: "تطوير المنتج",
      status: "completed",
      notes: "المنتج يعالج مشكلة حقيقية في السوق، لكن يحتاج إلى تحسين تجربة المستخدم وتبسيط عملية التسجيل.",
      rating: 3
    },
    {
      id: 4,
      startupName: "تك سوليوشنز",
      startupLogo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=TS",
      sessionDate: "2025/02/15",
      sessionTopic: "استراتيجية النمو",
      status: "completed",
      notes: "استراتيجية النمو واضحة ومدروسة جيداً. يحتاجون إلى التركيز أكثر على اكتساب العملاء وتحسين معدل الاحتفاظ بهم.",
      rating: 5
    }
  ]

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.startupName.includes(searchQuery) || 
                          feedback.sessionTopic.includes(searchQuery)
    
    if (activeTab === "pending") {
      return matchesSearch && feedback.status === "pending"
    }
    if (activeTab === "completed") {
      return matchesSearch && feedback.status === "completed"
    }
    
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const toggleExpand = (id: number) => {
    if (expandedFeedback === id) {
      setExpandedFeedback(null)
    } else {
      setExpandedFeedback(id)
    }
  }

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
      />
    ))
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">التقييمات والملاحظات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">{feedbacks.filter(f => f.status === "pending").length}</div>
            <p className="text-muted-foreground">بانتظار التقييم</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{feedbacks.filter(f => f.status === "completed").length}</div>
            <p className="text-muted-foreground">تقييمات مكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Star className="h-8 w-8 text-blue-500 mb-2 fill-blue-500" />
            <div className="text-2xl font-bold">
              {feedbacks.filter(f => f.status === "completed").length > 0 
                ? (feedbacks.filter(f => f.status === "completed").reduce((acc, curr) => acc + curr.rating, 0) / 
                   feedbacks.filter(f => f.status === "completed").length).toFixed(1)
                : "0.0"}
            </div>
            <p className="text-muted-foreground">متوسط التقييم</p>
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
              <TabsTrigger value="completed">مكتملة</TabsTrigger>
              <TabsTrigger value="pending">بانتظار التقييم</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <div className="space-y-4">
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            بانتظار التقييم
                          </div>
                          <div className="flex items-center gap-4">
                            <h3 className="font-bold text-lg">{feedback.startupName}</h3>
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src={feedback.startupLogo} 
                                alt={`شعار ${feedback.startupName}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">تاريخ الجلسة</div>
                            <div className="font-medium">{formatDate(feedback.sessionDate)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">موضوع الجلسة</div>
                            <div className="font-medium">{feedback.sessionTopic}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">التقييم</div>
                            <div className="flex gap-1 justify-end">
                              {renderStars(0)}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">الملاحظات والتوصيات</div>
                            <Textarea 
                              placeholder="أضف ملاحظاتك وتوصياتك هنا..."
                              className="min-h-[100px] text-right"
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              <span>إرسال التقييم</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد تقييمات بانتظار المراجعة</h3>
                    <p className="text-muted-foreground mb-4">لقد أكملت جميع التقييمات المطلوبة</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="space-y-4">
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className="p-4 border-b cursor-pointer"
                        onClick={() => toggleExpand(feedback.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {renderStars(feedback.rating)}
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedFeedback === feedback.id ? "rotate-180" : ""}`} />
                          </div>
                          <div className="flex items-center gap-4">
                            <h3 className="font-bold text-lg">{feedback.startupName}</h3>
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img 
                                src={feedback.startupLogo} 
                                alt={`شعار ${feedback.startupName}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {expandedFeedback === feedback.id && (
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">تاريخ الجلسة</div>
                              <div className="font-medium">{formatDate(feedback.sessionDate)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">موضوع الجلسة</div>
                              <div className="font-medium">{feedback.sessionTopic}</div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="text-sm text-muted-foreground">الملاحظات والتوصيات</div>
                            <p className="text-muted-foreground">{feedback.notes}</p>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button variant="outline" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>تعديل التقييم</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد تقييمات مكتملة</h3>
                    <p className="text-muted-foreground mb-4">لم يتم العثور على تقييمات مكتملة تطابق معايير البحث</p>
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
