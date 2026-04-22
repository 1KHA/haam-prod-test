"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  MessageSquare, 
  User, 
  Calendar, 
  ThumbsUp, 
  Eye, 
  Send,
  Plus,
  Tag,
  ChevronDown
} from "lucide-react"

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [expandedThread, setExpandedThread] = useState<number | null>(null)

  const toggleThread = (threadId: number) => {
    if (expandedThread === threadId) {
      setExpandedThread(null)
    } else {
      setExpandedThread(threadId)
    }
  }

  // Sample discussion data
  const discussions = [
    {
      id: 1,
      title: "استراتيجيات الاستثمار في الشركات الناشئة في مجال التكنولوجيا المالية",
      author: "أحمد الشمري",
      authorRole: "مستثمر",
      date: "10 مارس 2025",
      category: "استراتيجيات الاستثمار",
      views: 245,
      likes: 32,
      replies: 18,
      content: "أود مناقشة استراتيجيات الاستثمار في الشركات الناشئة في مجال التكنولوجيا المالية. ما هي أفضل الممارسات للتقييم والعناية الواجبة؟ وما هي المؤشرات الرئيسية التي يجب البحث عنها عند تقييم فرص الاستثمار في هذا القطاع؟",
      tags: ["التكنولوجيا المالية", "استراتيجيات الاستثمار", "التقييم"],
      comments: [
        {
          id: 101,
          author: "سارة العتيبي",
          authorRole: "مستثمر ملاك",
          date: "10 مارس 2025",
          content: "من خلال تجربتي، أجد أن التركيز على فريق الإدارة ونموذج الأعمال أهم من التكنولوجيا نفسها. ابحث عن فرق لديها خبرة في القطاع المالي وفهم عميق للتحديات التنظيمية.",
          likes: 8
        },
        {
          id: 102,
          author: "محمد القحطاني",
          authorRole: "مدير صندوق استثماري",
          date: "11 مارس 2025",
          content: "أوافق سارة. أضيف أيضًا أهمية النظر إلى معدل اكتساب العملاء وتكلفة الاكتساب مقابل القيمة العمرية للعميل. هذه المقاييس تعطي مؤشرًا جيدًا عن استدامة النمو.",
          likes: 12
        }
      ]
    },
    {
      id: 2,
      title: "تجارب التخارج الناجحة من الشركات الناشئة",
      author: "نورة السعيد",
      authorRole: "مستثمر",
      date: "5 مارس 2025",
      category: "التخارج",
      views: 189,
      likes: 27,
      replies: 14,
      content: "أود مشاركة تجربتي في التخارج من إحدى الشركات الناشئة في مجال التجارة الإلكترونية. حققنا عائدًا بنسبة 4.5x على الاستثمار بعد 3 سنوات. ما هي تجاربكم وما هي الدروس المستفادة من عمليات التخارج الناجحة؟",
      tags: ["التخارج", "التجارة الإلكترونية", "دراسة حالة"],
      comments: [
        {
          id: 201,
          author: "فهد المالكي",
          authorRole: "مستثمر ملاك",
          date: "6 مارس 2025",
          content: "تهانينا على التخارج الناجح! من تجربتي، وجدت أن التخطيط المبكر للتخارج أمر بالغ الأهمية. من المهم تحديد المشترين المحتملين مبكرًا والعمل على بناء علاقات معهم قبل أن تكون مستعدًا للبيع.",
          likes: 9
        }
      ]
    },
    {
      id: 3,
      title: "تأثير الذكاء الاصطناعي على فرص الاستثمار",
      author: "عبدالله الغامدي",
      authorRole: "مستثمر",
      date: "1 مارس 2025",
      category: "اتجاهات السوق",
      views: 312,
      likes: 45,
      replies: 22,
      content: "كيف ترون تأثير تقنيات الذكاء الاصطناعي على فرص الاستثمار في السنوات القادمة؟ هل هناك قطاعات معينة ستتأثر بشكل أكبر من غيرها؟ وما هي المخاطر والفرص التي يجب أن ننتبه لها كمستثمرين؟",
      tags: ["الذكاء الاصطناعي", "اتجاهات السوق", "التكنولوجيا"],
      comments: [
        {
          id: 301,
          author: "ريم العنزي",
          authorRole: "مستثمر مؤسسي",
          date: "2 مارس 2025",
          content: "أعتقد أن قطاعات الرعاية الصحية والخدمات المالية والتعليم ستشهد تحولات كبيرة بسبب الذكاء الاصطناعي. الشركات التي تستخدم الذكاء الاصطناعي لتحسين كفاءة العمليات وتجربة العملاء ستكون في وضع تنافسي أفضل.",
          likes: 15
        },
        {
          id: 302,
          author: "خالد الدوسري",
          authorRole: "مستثمر ملاك",
          date: "2 مارس 2025",
          content: "أتفق مع ريم. أضيف أيضًا أن هناك فرصًا كبيرة في مجال الأمن السيبراني المتعلق بالذكاء الاصطناعي. مع زيادة اعتماد الشركات على الذكاء الاصطناعي، ستزداد الحاجة إلى حلول أمنية متطورة.",
          likes: 10
        },
        {
          id: 303,
          author: "سلمان الحربي",
          authorRole: "مستثمر",
          date: "3 مارس 2025",
          content: "من المهم أيضًا النظر إلى المخاطر التنظيمية. الحكومات حول العالم تعمل على تطوير أطر تنظيمية للذكاء الاصطناعي، وهذا قد يؤثر على نماذج أعمال بعض الشركات.",
          likes: 7
        }
      ]
    },
    {
      id: 4,
      title: "تقييم فرص الاستثمار في قطاع التكنولوجيا الصحية",
      author: "لمى الزهراني",
      authorRole: "مستثمر",
      date: "25 فبراير 2025",
      category: "القطاعات",
      views: 178,
      likes: 19,
      replies: 11,
      content: "أبحث حاليًا عن فرص استثمارية في قطاع التكنولوجيا الصحية. ما هي أهم الاتجاهات في هذا القطاع؟ وما هي المعايير التي تستخدمونها لتقييم الشركات الناشئة في مجال الرعاية الصحية؟",
      tags: ["التكنولوجيا الصحية", "الرعاية الصحية", "التقييم"],
      comments: []
    },
    {
      id: 5,
      title: "بناء محفظة استثمارية متوازنة للشركات الناشئة",
      author: "طارق السلمي",
      authorRole: "مستثمر",
      date: "20 فبراير 2025",
      category: "إدارة المحفظة",
      views: 203,
      likes: 31,
      replies: 16,
      content: "كيف تبنون محفظة استثمارية متوازنة للشركات الناشئة؟ ما هو التوزيع المثالي بين القطاعات ومراحل النمو المختلفة؟ وكيف تديرون المخاطر في محفظتكم الاستثمارية؟",
      tags: ["إدارة المحفظة", "تنويع الاستثمارات", "إدارة المخاطر"],
      comments: []
    }
  ]

  const filteredDiscussions = discussions.filter(discussion => 
    discussion.title.includes(searchQuery) || 
    discussion.content.includes(searchQuery) ||
    discussion.category.includes(searchQuery) ||
    discussion.tags.some(tag => tag.includes(searchQuery))
  )

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          موضوع جديد
        </Button>
        <h1 className="text-3xl font-bold">المناقشات</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في المناقشات..." 
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
            <TabsTrigger value="my">مناقشاتي</TabsTrigger>
            <TabsTrigger value="popular">الأكثر تفاعلاً</TabsTrigger>
            <TabsTrigger value="all">جميع المناقشات</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map(discussion => (
            <Card key={discussion.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {discussion.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl hover:text-blue-600 cursor-pointer" onClick={() => toggleThread(discussion.id)}>
                    {discussion.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between items-center mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{discussion.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{discussion.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{discussion.replies}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{discussion.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{discussion.author}</span>
                      <span className="text-xs">({discussion.authorRole})</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm mb-3">
                  {discussion.content}
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                  {discussion.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              {expandedThread === discussion.id && (
                <div className="border-t pt-4 px-6 pb-6">
                  <div className="space-y-4 mb-6">
                    {discussion.comments.length > 0 ? (
                      discussion.comments.map(comment => (
                        <div key={comment.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-blue-500" />
                              <span className="text-muted-foreground">{comment.likes}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{comment.date}</span>
                              <span className="font-medium">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">({comment.authorRole})</span>
                            </div>
                          </div>
                          <p className="text-sm text-right">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">لا توجد ردود بعد. كن أول من يشارك في هذه المناقشة!</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button>
                      <Send className="h-4 w-4 ml-2" />
                      إرسال
                    </Button>
                    <div className="relative flex-1">
                      <Input 
                        placeholder="أضف ردك هنا..." 
                        className="w-full" 
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {expandedThread !== discussion.id && (
                <CardFooter className="pt-0">
                  <Button 
                    variant="ghost" 
                    className="mr-auto text-blue-600"
                    onClick={() => toggleThread(discussion.id)}
                  >
                    عرض المناقشة
                    <ChevronDown className="h-4 w-4 mr-1" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد مناقشات مطابقة</h3>
            <p className="text-muted-foreground mb-4">لم نتمكن من العثور على مناقشات تطابق بحثك</p>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء موضوع جديد
            </Button>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right">
        <h3 className="text-lg font-medium text-blue-800 mb-2">مواضيع مقترحة</h3>
        <p className="text-blue-700 mb-4">بناءً على اهتماماتك واستثماراتك، قد تهتم بالمواضيع التالية:</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-md border border-blue-100">
            <Button variant="outline" size="sm">
              عرض المناقشة
            </Button>
            <div className="text-right">
              <h4 className="font-medium">استراتيجيات الاستثمار في شركات الذكاء الاصطناعي</h4>
              <p className="text-sm text-muted-foreground">15 مشاركة • آخر تحديث: أمس</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white p-3 rounded-md border border-blue-100">
            <Button variant="outline" size="sm">
              عرض المناقشة
            </Button>
            <div className="text-right">
              <h4 className="font-medium">تحليل أداء قطاع التكنولوجيا المالية في 2025</h4>
              <p className="text-sm text-muted-foreground">23 مشاركة • آخر تحديث: منذ 3 أيام</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
