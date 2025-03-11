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
  MessageSquare, 
  Users, 
  User, 
  Send,
  Plus,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Clock,
  Share2
} from "lucide-react"

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [expandedDiscussion, setExpandedDiscussion] = useState<number | null>(1)
  const [newReply, setNewReply] = useState("")

  const discussions = [
    {
      id: 1,
      title: "استراتيجيات النمو للشركات الناشئة في مجال التكنولوجيا المالية",
      content: "أود مناقشة أفضل استراتيجيات النمو للشركات الناشئة في مجال التكنولوجيا المالية. ما هي التحديات الرئيسية التي تواجهها هذه الشركات وكيف يمكن التغلب عليها؟",
      author: {
        name: "أحمد محمد",
        avatar: "https://placehold.co/100x100/4F46E5/FFFFFF?text=AM",
        role: "موجه"
      },
      date: "2025/03/01",
      category: "growth",
      replies: [
        {
          id: 101,
          content: "من خلال تجربتي، أعتقد أن أحد أكبر التحديات هو الامتثال للوائح المالية المتغيرة باستمرار. أنصح بتخصيص موارد كافية للشؤون القانونية والامتثال منذ البداية.",
          author: {
            name: "سارة الخالدي",
            avatar: "https://placehold.co/100x100/10B981/FFFFFF?text=SK",
            role: "موجه"
          },
          date: "2025/03/02",
          likes: 5
        },
        {
          id: 102,
          content: "أتفق مع سارة. بالإضافة إلى ذلك، أعتقد أن بناء الثقة مع العملاء يمثل تحدياً كبيراً في مجال التكنولوجيا المالية. يجب التركيز على أمان البيانات والشفافية في جميع العمليات.",
          author: {
            name: "محمد العمري",
            avatar: "https://placehold.co/100x100/F59E0B/FFFFFF?text=MA",
            role: "مؤسس شركة ناشئة"
          },
          date: "2025/03/03",
          likes: 3
        }
      ],
      views: 120,
      likes: 15
    },
    {
      id: 2,
      title: "أفضل الممارسات لإدارة فريق عمل عن بعد",
      content: "نحن نتوسع ونفكر في توظيف فريق عمل عن بعد. ما هي أفضل الممارسات لإدارة فريق عمل موزع جغرافياً؟ وما هي الأدوات التي تنصحون باستخدامها؟",
      author: {
        name: "فهد الدوسري",
        avatar: "https://placehold.co/100x100/EC4899/FFFFFF?text=FD",
        role: "مؤسس شركة ناشئة"
      },
      date: "2025/02/25",
      category: "management",
      replies: [
        {
          id: 201,
          content: "من تجربتي، أنصح باستخدام أدوات إدارة المشاريع مثل Asana أو Trello، بالإضافة إلى أدوات التواصل مثل Slack. كما أنصح بعقد اجتماعات دورية قصيرة للفريق بأكمله.",
          author: {
            name: "نورة العتيبي",
            avatar: "https://placehold.co/100x100/8B5CF6/FFFFFF?text=NA",
            role: "موجه"
          },
          date: "2025/02/26",
          likes: 7
        }
      ],
      views: 85,
      likes: 10
    },
    {
      id: 3,
      title: "استراتيجيات التسويق للشركات الناشئة بميزانية محدودة",
      content: "نحن شركة ناشئة بميزانية محدودة. ما هي أفضل استراتيجيات التسويق التي يمكننا اتباعها لتحقيق أقصى تأثير بأقل تكلفة؟",
      author: {
        name: "خالد السعيد",
        avatar: "https://placehold.co/100x100/EF4444/FFFFFF?text=KS",
        role: "مؤسس شركة ناشئة"
      },
      date: "2025/02/20",
      category: "marketing",
      replies: [],
      views: 65,
      likes: 8
    }
  ]

  const categories = [
    { id: "all", name: "جميع المواضيع" },
    { id: "growth", name: "النمو" },
    { id: "marketing", name: "التسويق" },
    { id: "funding", name: "التمويل" },
    { id: "management", name: "الإدارة" },
    { id: "product", name: "المنتج" }
  ]

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.includes(searchQuery) || 
                          discussion.content.includes(searchQuery)
    
    const matchesCategory = activeTab === "all" || discussion.category === activeTab
    
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const toggleExpand = (id: number) => {
    if (expandedDiscussion === id) {
      setExpandedDiscussion(null)
    } else {
      setExpandedDiscussion(id)
    }
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit the reply to the server
    setNewReply("")
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>موضوع جديد</span>
        </Button>
        <h1 className="text-3xl font-bold">المناقشات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{discussions.length}</div>
            <p className="text-muted-foreground">المواضيع</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Reply className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {discussions.reduce((acc, curr) => acc + curr.replies.length, 0)}
            </div>
            <p className="text-muted-foreground">الردود</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {new Set([
                ...discussions.map(d => d.author.name),
                ...discussions.flatMap(d => d.replies.map(r => r.author.name))
              ]).size}
            </div>
            <p className="text-muted-foreground">المشاركون</p>
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
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {filteredDiscussions.length > 0 ? (
                  filteredDiscussions.map((discussion) => (
                    <div key={discussion.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className="p-4 border-b cursor-pointer"
                        onClick={() => toggleExpand(discussion.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img 
                                src={discussion.author.avatar} 
                                alt={`صورة ${discussion.author.name}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">{discussion.author.role}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(discussion.date)}</span>
                              </div>
                              <h3 className="font-bold text-lg">{discussion.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{discussion.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>{discussion.replies.length}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{discussion.likes}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span>{discussion.views}</span>
                                </div>
                              </div>
                              <div className="text-sm font-medium">{discussion.author.name}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {expandedDiscussion === discussion.id && (
                        <div className="p-4 bg-muted/20">
                          <div className="mb-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                  <img 
                                    src={discussion.author.avatar} 
                                    alt={`صورة ${discussion.author.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground">{discussion.author.role}</div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDate(discussion.date)}</span>
                                  </div>
                                  <div className="font-medium">{discussion.author.name}</div>
                                </div>
                                <p className="text-muted-foreground mb-4">{discussion.content}</p>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>إعجاب ({discussion.likes})</span>
                                  </Button>
                                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <Share2 className="h-4 w-4" />
                                    <span>مشاركة</span>
                                  </Button>
                                  <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {discussion.replies.length > 0 && (
                            <div className="space-y-4 mb-6 border-t pt-4">
                              <h4 className="font-medium text-right">الردود ({discussion.replies.length})</h4>
                              {discussion.replies.map(reply => (
                                <div key={reply.id} className="flex items-start gap-4">
                                  <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                      <img 
                                        src={reply.author.avatar} 
                                        alt={`صورة ${reply.author.name}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="text-xs text-muted-foreground">{reply.author.role}</div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDate(reply.date)}</span>
                                      </div>
                                      <div className="font-medium">{reply.author.name}</div>
                                    </div>
                                    <p className="text-muted-foreground mb-4">{reply.content}</p>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>إعجاب ({reply.likes})</span>
                                      </Button>
                                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <Reply className="h-4 w-4" />
                                        <span>رد</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="border-t pt-4">
                            <h4 className="font-medium text-right mb-2">إضافة رد</h4>
                            <form onSubmit={handleReplySubmit}>
                              <Textarea 
                                placeholder="اكتب ردك هنا..."
                                className="min-h-[100px] text-right mb-2"
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                              />
                              <div className="flex justify-end">
                                <Button 
                                  type="submit" 
                                  className="flex items-center gap-2"
                                  disabled={!newReply.trim()}
                                >
                                  <Send className="h-4 w-4" />
                                  <span>إرسال الرد</span>
                                </Button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
