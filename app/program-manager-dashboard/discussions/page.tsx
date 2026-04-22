"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Plus, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users, 
  Clock,
  Heart,
  Reply,
  Pin,
  Flag,
  ThumbsUp,
  Send
} from "lucide-react"

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [newComment, setNewComment] = useState("")

  const discussions = [
    {
      id: 1,
      title: "استراتيجيات التسويق للشركات الناشئة في مجال التقنية",
      author: "أحمد المالكي",
      authorRole: "مدير برنامج",
      date: "2025/03/15",
      category: "marketing",
      content: "ما هي أفضل استراتيجيات التسويق للشركات الناشئة في مجال التقنية؟ نحن نعمل على تطوير دليل إرشادي للشركات الناشئة في برامجنا، ونود مشاركة الخبرات والتجارب في هذا المجال.",
      likes: 15,
      replies: 8,
      isPinned: true,
      isAnnouncement: false,
      tags: ["تسويق", "شركات ناشئة", "تقنية"]
    },
    {
      id: 2,
      title: "إعلان: ورشة عمل حول جمع التمويل - 20 أبريل 2025",
      author: "سارة العتيبي",
      authorRole: "مديرة برنامج",
      date: "2025/03/20",
      category: "announcement",
      content: "نود دعوتكم لحضور ورشة عمل حول استراتيجيات جمع التمويل للشركات الناشئة، والتي ستقام يوم 20 أبريل 2025 من الساعة 10 صباحاً حتى 2 ظهراً في قاعة المؤتمرات الرئيسية. سيقدم الورشة مجموعة من المستثمرين ورواد الأعمال الناجحين.",
      likes: 25,
      replies: 5,
      isPinned: true,
      isAnnouncement: true,
      tags: ["ورشة عمل", "تمويل", "مستثمرين"]
    },
    {
      id: 3,
      title: "تحديات التوسع الجغرافي للشركات الناشئة",
      author: "خالد الدوسري",
      authorRole: "موجه",
      date: "2025/03/18",
      category: "growth",
      content: "ما هي أبرز التحديات التي تواجه الشركات الناشئة عند التوسع جغرافياً؟ وما هي الاستراتيجيات الناجحة للتغلب على هذه التحديات؟ أود مشاركة تجربتي في هذا المجال ومعرفة تجارب الآخرين.",
      likes: 10,
      replies: 12,
      isPinned: false,
      isAnnouncement: false,
      tags: ["توسع", "نمو", "استراتيجية"]
    },
    {
      id: 4,
      title: "أفضل الممارسات لإدارة فريق العمل عن بعد",
      author: "نورة القحطاني",
      authorRole: "مديرة برنامج",
      date: "2025/03/10",
      category: "management",
      content: "مع تزايد اعتماد الشركات الناشئة على العمل عن بعد، ما هي أفضل الممارسات لإدارة فريق العمل بفعالية؟ كيف يمكن الحفاظ على التواصل الفعال وروح الفريق في بيئة العمل عن بعد؟",
      likes: 18,
      replies: 15,
      isPinned: false,
      isAnnouncement: false,
      tags: ["إدارة", "عمل عن بعد", "فريق"]
    },
    {
      id: 5,
      title: "استطلاع: احتياجات الشركات الناشئة من برامج المسرعات",
      author: "فهد العنزي",
      authorRole: "مدير برنامج",
      date: "2025/03/05",
      category: "survey",
      content: "نحن نعمل على تطوير برامجنا لتلبية احتياجات الشركات الناشئة بشكل أفضل. نود معرفة آرائكم حول أهم الخدمات والدعم الذي تحتاجه الشركات الناشئة من برامج المسرعات والحاضنات. يرجى مشاركة أفكاركم واقتراحاتكم.",
      likes: 22,
      replies: 30,
      isPinned: false,
      isAnnouncement: false,
      tags: ["استطلاع", "تطوير", "مسرعات"]
    }
  ]

  const comments = [
    {
      id: 1,
      discussionId: 1,
      author: "محمد السالم",
      authorRole: "مؤسس شركة ناشئة",
      date: "2025/03/16",
      content: "من تجربتي، وجدت أن التسويق عبر المحتوى هو أكثر الاستراتيجيات فعالية للشركات الناشئة في مجال التقنية. إنشاء محتوى قيم يعالج مشكلات العملاء المستهدفين يساعد في بناء المصداقية وجذب العملاء المحتملين.",
      likes: 8
    },
    {
      id: 2,
      discussionId: 1,
      author: "سارة العتيبي",
      authorRole: "مديرة برنامج",
      date: "2025/03/16",
      content: "أتفق مع محمد. بالإضافة إلى ذلك، التسويق عبر وسائل التواصل الاجتماعي مهم جداً، خاصة LinkedIn للشركات التي تستهدف قطاع الأعمال (B2B) وInstagram/TikTok للشركات التي تستهدف المستهلكين (B2C).",
      likes: 5
    },
    {
      id: 3,
      discussionId: 1,
      author: "أحمد الشمري",
      authorRole: "موجه",
      date: "2025/03/17",
      content: "لا تنسوا أهمية التسويق بالعلاقات والشراكات الاستراتيجية. بناء علاقات مع الشركات الأخرى في نفس المجال أو المجالات المكملة يمكن أن يفتح أبواباً كثيرة للشركات الناشئة.",
      likes: 7
    },
    {
      id: 4,
      discussionId: 2,
      author: "فيصل العمري",
      authorRole: "مؤسس شركة ناشئة",
      date: "2025/03/20",
      content: "شكراً على هذه الدعوة. هل سيتم تسجيل الورشة لمن لا يستطيع الحضور؟",
      likes: 3
    },
    {
      id: 5,
      discussionId: 2,
      author: "سارة العتيبي",
      authorRole: "مديرة برنامج",
      date: "2025/03/20",
      content: "نعم، سيتم تسجيل الورشة وإتاحتها للمشاركين في البرنامج بعد انتهاء الفعالية.",
      likes: 4
    }
  ]

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.includes(searchQuery) || 
                          discussion.content.includes(searchQuery) ||
                          discussion.author.includes(searchQuery) ||
                          discussion.tags.some(tag => tag.includes(searchQuery))
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "announcements") return matchesSearch && discussion.isAnnouncement
    if (activeTab === "marketing") return matchesSearch && discussion.category === "marketing"
    if (activeTab === "growth") return matchesSearch && discussion.category === "growth"
    if (activeTab === "management") return matchesSearch && discussion.category === "management"
    if (activeTab === "survey") return matchesSearch && discussion.category === "survey"
    
    return matchesSearch
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "marketing": return "bg-blue-100 text-blue-800"
      case "announcement": return "bg-red-100 text-red-800"
      case "growth": return "bg-green-100 text-green-800"
      case "management": return "bg-purple-100 text-purple-800"
      case "survey": return "bg-amber-100 text-amber-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "marketing": return "تسويق"
      case "announcement": return "إعلان"
      case "growth": return "نمو"
      case "management": return "إدارة"
      case "survey": return "استطلاع"
      default: return "عام"
    }
  }

  const getDiscussionComments = (discussionId: number) => {
    return comments.filter(comment => comment.discussionId === discussionId)
  }

  const announcementsCount = discussions.filter(discussion => discussion.isAnnouncement).length
  const totalReplies = discussions.reduce((acc, discussion) => acc + discussion.replies, 0)

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المناقشات</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إنشاء موضوع جديد</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{discussions.length}</div>
            <p className="text-muted-foreground">إجمالي المواضيع</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Reply className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{totalReplies}</div>
            <p className="text-muted-foreground">إجمالي الردود</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Pin className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{announcementsCount}</div>
            <p className="text-muted-foreground">الإعلانات</p>
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
            <CardTitle>المناقشات</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="survey">استطلاعات</TabsTrigger>
              <TabsTrigger value="management">إدارة</TabsTrigger>
              <TabsTrigger value="growth">نمو</TabsTrigger>
              <TabsTrigger value="marketing">تسويق</TabsTrigger>
              <TabsTrigger value="announcements">إعلانات</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            {filteredDiscussions.map((discussion) => (
              <div key={discussion.id} className="border rounded-lg overflow-hidden mt-4">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {discussion.isPinned && <Pin className="h-4 w-4 text-red-500" />}
                      <div className={`px-3 py-1 rounded-full text-xs ${getCategoryColor(discussion.category)}`}>
                        {getCategoryText(discussion.category)}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">{discussion.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{discussion.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-sm font-medium">{discussion.author}</div>
                      <div className="text-xs text-muted-foreground">({discussion.authorRole})</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-muted-foreground">{discussion.content}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {discussion.tags.map((tag, index) => (
                      <div key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-muted-foreground">{discussion.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">{discussion.replies}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Flag className="h-4 w-4" />
                        <span>إبلاغ</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>إعجاب</span>
                      </Button>
                      <Button variant="default" size="sm" className="flex items-center gap-1">
                        <Reply className="h-4 w-4" />
                        <span>رد</span>
                      </Button>
                    </div>
                  </div>
                  
                  {getDiscussionComments(discussion.id).length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">التعليقات ({getDiscussionComments(discussion.id).length})</h4>
                      <div className="space-y-4">
                        {getDiscussionComments(discussion.id).map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <div className="text-xs text-muted-foreground">{comment.date}</div>
                              <div className="flex items-center gap-1">
                                <div className="text-sm font-medium">{comment.author}</div>
                                <div className="text-xs text-muted-foreground">({comment.authorRole})</div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-muted-foreground">{comment.likes}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">رد</Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">إعجاب</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button variant="default" size="sm" className="flex items-center gap-1">
                          <Send className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder="أضف تعليقاً..."
                          className="text-right"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredDiscussions.length === 0 && (
              <div className="text-center p-8 border rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد مناقشات</h3>
                <p className="text-muted-foreground mb-4">لم يتم العثور على مناقشات تطابق معايير البحث</p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveTab("all")
                  }}
                >
                  <Search className="h-4 w-4" />
                  <span>عرض جميع المناقشات</span>
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
