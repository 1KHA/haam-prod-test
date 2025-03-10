"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter,
  ChevronDown,
  Plus,
  User,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  PaperclipIcon,
  Calendar
} from "lucide-react"

// Mock discussions data
const discussions = [
  {
    id: 1,
    title: "استفسار حول استراتيجية التسويق",
    description: "أحتاج إلى نصائح حول استراتيجية التسويق للمنتج الجديد",
    category: "تسويق",
    status: "مفتوح",
    createdAt: "15 أبريل 2025",
    lastActivity: "قبل 2 ساعة",
    participants: [
      { id: 1, name: "أحمد محمد", role: "مؤسس", avatar: "https://i.pravatar.cc/150?img=1" },
      { id: 2, name: "سارة خالد", role: "موجه", avatar: "https://i.pravatar.cc/150?img=5" }
    ],
    messages: [
      {
        id: 1,
        sender: { id: 1, name: "أحمد محمد", role: "مؤسس", avatar: "https://i.pravatar.cc/150?img=1" },
        content: "مرحبًا، أعمل حاليًا على استراتيجية تسويق لمنتجنا الجديد وأحتاج إلى بعض النصائح. هل يمكنك مساعدتي في تحديد القنوات الأكثر فعالية للوصول إلى جمهورنا المستهدف؟",
        timestamp: "15 أبريل 2025، 10:30 صباحًا"
      },
      {
        id: 2,
        sender: { id: 2, name: "سارة خالد", role: "موجه", avatar: "https://i.pravatar.cc/150?img=5" },
        content: "مرحبًا أحمد، بالتأكيد يمكنني مساعدتك. لتحديد القنوات الأكثر فعالية، يجب أولاً فهم جمهورك المستهدف بشكل جيد. هل يمكنك مشاركة المزيد من المعلومات حول الفئة المستهدفة وخصائصها؟",
        timestamp: "15 أبريل 2025، 11:45 صباحًا"
      },
      {
        id: 3,
        sender: { id: 1, name: "أحمد محمد", role: "مؤسس", avatar: "https://i.pravatar.cc/150?img=1" },
        content: "بالتأكيد، نستهدف الشباب من الفئة العمرية 18-35 سنة، المهتمين بالتكنولوجيا والابتكار. معظمهم من مستخدمي الهواتف الذكية ونشطين على منصات التواصل الاجتماعي، خاصة انستغرام وتيك توك.",
        timestamp: "15 أبريل 2025، 12:30 مساءً"
      },
      {
        id: 4,
        sender: { id: 2, name: "سارة خالد", role: "موجه", avatar: "https://i.pravatar.cc/150?img=5" },
        content: "شكرًا على المعلومات. بناءً على الفئة المستهدفة، أقترح التركيز على استراتيجية تسويق رقمي تشمل:\n\n1. حملات إعلانية مستهدفة على انستغرام وتيك توك\n2. التسويق عبر المؤثرين في مجال التكنولوجيا\n3. محتوى فيديو قصير وجذاب يوضح مميزات المنتج\n4. إطلاق تحديات على تيك توك مرتبطة بالمنتج\n\nهل جربت أيًا من هذه الاستراتيجيات من قبل؟",
        timestamp: "15 أبريل 2025، 2:15 مساءً"
      }
    ]
  },
  {
    id: 2,
    title: "مناقشة خطة التوسع",
    description: "مناقشة خطة التوسع في الأسواق الجديدة",
    category: "استراتيجية",
    status: "مفتوح",
    createdAt: "10 أبريل 2025",
    lastActivity: "قبل يوم",
    participants: [
      { id: 1, name: "أحمد محمد", role: "مؤسس", avatar: "https://i.pravatar.cc/150?img=1" },
      { id: 3, name: "خالد العمري", role: "مستثمر", avatar: "https://i.pravatar.cc/150?img=3" },
      { id: 4, name: "نورة الفهد", role: "موجه", avatar: "https://i.pravatar.cc/150?img=4" }
    ],
    messages: [
      {
        id: 1,
        sender: { id: 1, name: "أحمد محمد", role: "مؤسس", avatar: "https://i.pravatar.cc/150?img=1" },
        content: "مرحبًا، نفكر حاليًا في التوسع إلى أسواق جديدة في المنطقة. هل لديكم أي نصائح أو تجارب سابقة يمكن مشاركتها معنا؟",
        timestamp: "10 أبريل 2025، 9:00 صباحًا"
      },
      {
        id: 2,
        sender: { id: 3, name: "خالد العمري", role: "مستثمر", avatar: "https://i.pravatar.cc/150?img=3" },
        content: "مرحبًا أحمد، فكرة جيدة للتوسع. ما هي الأسواق التي تفكرون فيها تحديدًا؟",
        timestamp: "10 أبريل 2025، 10:30 صباحًا"
      }
    ]
  },
  {
    id: 3,
    title: "تحديات تطوير المنتج",
    description: "مناقشة التحديات التقنية في تطوير المنتج",
    category: "تطوير",
    status: "مغلق",
    createdAt: "5 أبريل 2025",
    lastActivity: "قبل 5 أيام",
    participants: [
      { id: 1, name: "أحمد محمد", role: "مؤسس", avatar: "https://i.pravatar.cc/150?img=1" },
      { id: 5, name: "محمد العلي", role: "موجه", avatar: "https://i.pravatar.cc/150?img=6" }
    ],
    messages: [
      {
        id: 1,
        sender: { id: 1, name: "أحمد محمد", role: "مؤسس", avatar: "https://i.pravatar.cc/150?img=1" },
        content: "نواجه بعض التحديات التقنية في تطوير الواجهة الخلفية للمنتج. هل لديك أي اقتراحات؟",
        timestamp: "5 أبريل 2025، 11:00 صباحًا"
      }
    ]
  }
]

// Mock mentors data
const mentors = [
  {
    id: 2,
    name: "سارة خالد",
    role: "موجه",
    specialty: "تسويق رقمي",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "متاح"
  },
  {
    id: 4,
    name: "نورة الفهد",
    role: "موجه",
    specialty: "استراتيجية الأعمال",
    avatar: "https://i.pravatar.cc/150?img=4",
    status: "متاح"
  },
  {
    id: 5,
    name: "محمد العلي",
    role: "موجه",
    specialty: "تطوير البرمجيات",
    avatar: "https://i.pravatar.cc/150?img=6",
    status: "مشغول"
  },
  {
    id: 6,
    name: "فهد الأحمد",
    role: "موجه",
    specialty: "تمويل الشركات الناشئة",
    avatar: "https://i.pravatar.cc/150?img=7",
    status: "متاح"
  }
]

export default function DiscussionsPage() {
  const [activeTab, setActiveTab] = useState("discussions")
  const [activeDiscussion, setActiveDiscussion] = useState<number | null>(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    description: "",
    category: ""
  })

  const filteredDiscussions = discussions.filter(discussion => {
    return discussion.title.includes(searchQuery) || 
           discussion.description.includes(searchQuery) ||
           discussion.category.includes(searchQuery)
  })

  const currentDiscussion = discussions.find(d => d.id === activeDiscussion)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewDiscussion(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateDiscussion = () => {
    console.log("Creating new discussion:", newDiscussion)
    setNewDiscussion({
      title: "",
      description: "",
      category: ""
    })
    setShowNewDiscussion(false)
  }

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return
    console.log("Sending message:", newMessage)
    setNewMessage("")
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setShowNewDiscussion(!showNewDiscussion)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>{showNewDiscussion ? "إلغاء" : "بدء مناقشة جديدة"}</span>
        </Button>
        <h1 className="text-3xl font-bold">المناقشات</h1>
      </div>

      {showNewDiscussion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>بدء مناقشة جديدة</CardTitle>
              <CardDescription>أدخل تفاصيل المناقشة الجديدة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">عنوان المناقشة</label>
                  <Input
                    id="title"
                    name="title"
                    value={newDiscussion.title}
                    onChange={handleInputChange}
                    placeholder="أدخل عنوانًا موجزًا للمناقشة"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">وصف المناقشة</label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newDiscussion.description}
                    onChange={handleInputChange}
                    placeholder="اشرح موضوع المناقشة بالتفصيل"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">التصنيف</label>
                  <Input
                    id="category"
                    name="category"
                    value={newDiscussion.category}
                    onChange={handleInputChange}
                    placeholder="مثال: تسويق، تطوير، استراتيجية، تمويل"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleCreateDiscussion}>
                    <MessageSquare className="h-4 w-4 ml-2" />
                    بدء المناقشة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="mentors">الموجهون</TabsTrigger>
          <TabsTrigger value="discussions">المناقشات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المناقشات..."
                  className="pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <span className="text-xs">تصفية</span>
                </Button>
                <h3 className="text-sm font-medium">المناقشات ({filteredDiscussions.length})</h3>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredDiscussions.map(discussion => (
                  <div
                    key={discussion.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeDiscussion === discussion.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => setActiveDiscussion(discussion.id)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        discussion.status === "مفتوح"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {discussion.status}
                      </span>
                      <h3 className="font-medium text-sm">{discussion.title}</h3>
                    </div>
                    <p className="text-xs mb-2 line-clamp-2">{discussion.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>{discussion.lastActivity}</span>
                      <span>{discussion.category}</span>
                    </div>
                  </div>
                ))}
                
                {filteredDiscussions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد مناقشات تطابق معايير البحث</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              {currentDiscussion ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          currentDiscussion.status === "مفتوح"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {currentDiscussion.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <CardTitle>{currentDiscussion.title}</CardTitle>
                        <div className="flex items-center justify-end mt-1">
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full ml-2">
                            {currentDiscussion.category}
                          </span>
                          <Calendar className="h-3 w-3 ml-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{currentDiscussion.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-2">
                      <span className="text-xs text-muted-foreground ml-2">المشاركون:</span>
                      <div className="flex -space-x-2 space-x-reverse">
                        {currentDiscussion.participants.map(participant => (
                          <div key={participant.id} className="relative">
                            <img
                              src={participant.avatar}
                              alt={participant.name}
                              className="w-6 h-6 rounded-full border-2 border-background"
                              title={`${participant.name} (${participant.role})`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto p-0">
                    <div className="p-4 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                      {currentDiscussion.messages.map(message => (
                        <div key={message.id} className="flex gap-3">
                          <img
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                              <div className="flex items-center">
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full ml-1">
                                  {message.sender.role}
                                </span>
                                <span className="font-medium">{message.sender.name}</span>
                              </div>
                            </div>
                            <div className="mt-1 text-sm whitespace-pre-line">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  {currentDiscussion.status === "مفتوح" && (
                    <CardFooter className="border-t p-3">
                      <div className="flex w-full gap-2">
                        <Button variant="ghost" size="icon">
                          <PaperclipIcon className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder="اكتب رسالتك هنا..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-grow"
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4 ml-2" />
                          إرسال
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">اختر مناقشة للعرض</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="mentors">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">الموجهون المتاحون</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.filter(m => m.status === "متاح").map((mentor, index) => (
                  <motion.div
                    key={mentor.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {mentor.status}
                          </span>
                          <div className="text-right">
                            <CardTitle>{mentor.name}</CardTitle>
                            <CardDescription>{mentor.specialty}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted-foreground ml-1" />
                          <span className="text-sm text-muted-foreground">متاح للمساعدة</span>
                        </div>
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="w-12 h-12 rounded-full"
                        />
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">
                          <MessageSquare className="h-4 w-4 ml-2" />
                          بدء محادثة
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">جميع الموجهين</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">التخصص</th>
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentors.map(mentor => (
                      <tr key={mentor.id} className="border-b">
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            mentor.status === "متاح"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {mentor.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{mentor.specialty}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="text-right">
                              <div className="font-medium">{mentor.name}</div>
                              <div className="text-xs text-muted-foreground">{mentor.role}</div>
                            </div>
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="w-8 h-8 rounded-full"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 ml-1" />
                            <span className="text-xs">محادثة</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
