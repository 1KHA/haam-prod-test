"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  HelpCircle, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Search,
  ArrowRight,
  FileText,
  Phone,
  Mail,
  Send,
  AlertCircle
} from "lucide-react"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("tickets")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  
  // Mock data for support tickets
  const [tickets, setTickets] = useState([
    {
      id: "1",
      title: "مشكلة في تسجيل الدخول",
      description: "لا أستطيع تسجيل الدخول إلى حسابي. تظهر رسالة خطأ عند إدخال بيانات الدخول.",
      createdAt: "10 مارس 2025",
      status: "in_progress",
      category: "technical",
      priority: "high",
      messages: [
        {
          id: "m1",
          sender: "user",
          content: "لا أستطيع تسجيل الدخول إلى حسابي. تظهر رسالة خطأ عند إدخال بيانات الدخول.",
          timestamp: "10 مارس 2025، 10:30 صباحاً"
        },
        {
          id: "m2",
          sender: "support",
          content: "مرحباً، شكراً لتواصلك معنا. هل يمكنك مشاركة رسالة الخطأ التي تظهر لك؟",
          timestamp: "10 مارس 2025، 11:15 صباحاً"
        },
        {
          id: "m3",
          sender: "user",
          content: "الرسالة هي: 'بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.'",
          timestamp: "10 مارس 2025، 11:30 صباحاً"
        },
        {
          id: "m4",
          sender: "support",
          content: "شكراً للمعلومات. هل حاولت استخدام خيار 'نسيت كلمة المرور'؟ سنقوم بفحص المشكلة ونعود إليك قريباً.",
          timestamp: "10 مارس 2025، 11:45 صباحاً"
        }
      ]
    },
    {
      id: "2",
      title: "استفسار حول برنامج المسرع",
      description: "أرغب في معرفة المزيد عن برنامج المسرع وكيفية الاستفادة منه لشركتي الناشئة.",
      createdAt: "5 مارس 2025",
      status: "resolved",
      category: "program",
      priority: "medium",
      messages: [
        {
          id: "m1",
          sender: "user",
          content: "أرغب في معرفة المزيد عن برنامج المسرع وكيفية الاستفادة منه لشركتي الناشئة.",
          timestamp: "5 مارس 2025، 2:00 مساءً"
        },
        {
          id: "m2",
          sender: "support",
          content: "مرحباً، يسعدنا اهتمامك ببرنامج المسرع. برنامجنا يقدم الدعم للشركات الناشئة من خلال التوجيه، والتمويل، والموارد، وفرص التواصل. هل هناك جانب معين ترغب في معرفة المزيد عنه؟",
          timestamp: "5 مارس 2025، 3:30 مساءً"
        }
      ]
    },
    {
      id: "3",
      title: "طلب معلومات عن التمويل",
      description: "أحتاج إلى معلومات حول خيارات التمويل المتاحة وكيفية التقديم.",
      createdAt: "1 مارس 2025",
      status: "closed",
      category: "financial",
      priority: "medium",
      messages: [
        {
          id: "m1",
          sender: "user",
          content: "أحتاج إلى معلومات حول خيارات التمويل المتاحة وكيفية التقديم.",
          timestamp: "1 مارس 2025، 9:00 صباحاً"
        }
      ]
    }
  ])

  // Mock data for FAQs
  const [faqs, setFaqs] = useState([
    {
      id: "1",
      question: "ما هو برنامج مسرع الأعمال؟",
      answer: "برنامج مسرع الأعمال هو برنامج مكثف يهدف إلى دعم الشركات الناشئة في مراحلها الأولى. يقدم البرنامج التوجيه، والتمويل، والموارد، وفرص التواصل لمساعدة الشركات الناشئة على النمو وتحقيق النجاح.",
      category: "general"
    },
    {
      id: "2",
      question: "كيف يمكنني التقديم لبرنامج المسرع؟",
      answer: "يمكنك التقديم لبرنامج المسرع من خلال صفحة 'التقديم للبرامج' في لوحة التحكم. ستحتاج إلى تقديم معلومات عن شركتك الناشئة، وفريق العمل، والمنتج، وخطة العمل.",
      category: "program"
    },
    {
      id: "3",
      question: "ما هي خيارات التمويل المتاحة؟",
      answer: "هناك عدة خيارات للتمويل متاحة: تمويل أولي للشركات الناشئة في مراحلها الأولى، تمويل المرحلة A للشركات التي لديها منتج قابل للتطبيق ونمو أولي، تمويل المرحلة B للشركات التي تسعى للتوسع، ومنح لمشاريع محددة.",
      category: "financial"
    }
  ])

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "technical",
    priority: "medium"
  })

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket => {
    return ticket.title.includes(searchQuery) || 
           ticket.description.includes(searchQuery)
  })

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(faq => {
    return faq.question.includes(searchQuery) || 
           faq.answer.includes(searchQuery)
  })

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null

  const handleCreateTicket = () => {
    const id = Math.random().toString(36).substring(2, 9)
    const now = new Date().toLocaleDateString('ar-SA')
    const newTicketObj = {
      id,
      ...newTicket,
      createdAt: now,
      status: "open",
      messages: [
        {
          id: `m${id}-1`,
          sender: "user",
          content: newTicket.description,
          timestamp: `${now}، ${new Date().toLocaleTimeString('ar-SA')}`
        }
      ]
    }

    setTickets([newTicketObj, ...tickets])
    setNewTicket({
      title: "",
      description: "",
      category: "technical",
      priority: "medium"
    })
    setIsCreatingTicket(false)
    setSelectedTicketId(id)
  }

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return

    const now = new Date()
    const timestamp = `${now.toLocaleDateString('ar-SA')}، ${now.toLocaleTimeString('ar-SA')}`
    
    const updatedTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: "user",
          content: newMessage,
          timestamp
        }
      ]
    }

    setTickets(tickets.map(ticket => 
      ticket.id === selectedTicket.id ? updatedTicket : ticket
    ))
    
    setNewMessage("")
  }

  const handleCloseTicket = (ticketId: string) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: "closed" } 
        : ticket
    ))
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "technical":
        return "تقني"
      case "financial":
        return "مالي"
      case "program":
        return "برنامج"
      case "general":
        return "عام"
      default:
        return "أخرى"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "عالية"
      case "medium":
        return "متوسطة"
      case "low":
        return "منخفضة"
      default:
        return "غير محدد"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "open":
        return <MessageCircle className="h-5 w-5 text-amber-500" />
      case "closed":
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "resolved":
        return "تم الحل"
      case "in_progress":
        return "قيد المعالجة"
      case "open":
        return "مفتوحة"
      case "closed":
        return "مغلقة"
      default:
        return "غير معروف"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "open":
        return "bg-amber-100 text-amber-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => {
            setIsCreatingTicket(true)
            setSelectedTicketId(null)
          }}
          className="flex items-center gap-2"
          disabled={isCreatingTicket}
        >
          <Plus className="h-4 w-4" />
          إنشاء تذكرة دعم
        </Button>
        <h1 className="text-3xl font-bold">الدعم والمساعدة</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="contact">اتصل بنا</TabsTrigger>
          <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
          <TabsTrigger value="tickets">تذاكر الدعم</TabsTrigger>
        </TabsList>

        <div className="relative w-full md:w-64 mb-4">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث..." 
            className="pr-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <TabsContent value="tickets">
          {isCreatingTicket ? (
            <Card>
              <CardHeader>
                <CardTitle>إنشاء تذكرة دعم جديدة</CardTitle>
                <CardDescription>أدخل تفاصيل المشكلة أو الاستفسار</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان التذكرة</Label>
                    <Input 
                      id="title" 
                      value={newTicket.title} 
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                      placeholder="أدخل عنوان موجز للمشكلة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف المشكلة</Label>
                    <Textarea 
                      id="description" 
                      rows={4} 
                      value={newTicket.description} 
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      placeholder="اشرح المشكلة أو الاستفسار بالتفصيل"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">الفئة</Label>
                      <select 
                        id="category" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newTicket.category} 
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                      >
                        <option value="technical">تقني</option>
                        <option value="financial">مالي</option>
                        <option value="program">برنامج</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">الأولوية</Label>
                      <select 
                        id="priority" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newTicket.priority} 
                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                      >
                        <option value="high">عالية</option>
                        <option value="medium">متوسطة</option>
                        <option value="low">منخفضة</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatingTicket(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleCreateTicket}
                  disabled={!newTicket.title || !newTicket.description}
                >
                  إنشاء التذكرة
                </Button>
              </CardFooter>
            </Card>
          ) : selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedTicketId(null)}
                  >
                    العودة للقائمة
                  </Button>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getStatusIcon(selectedTicket.status)}
                      <CardTitle>{selectedTicket.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      {getCategoryText(selectedTicket.category)} • 
                      <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                        {getPriorityText(selectedTicket.priority)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusText(selectedTicket.status)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      تم الإنشاء: {selectedTicket.createdAt}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    {selectedTicket.messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTicket.status !== "closed" && (
                    <div className="flex gap-2 mt-6">
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4 ml-2" />
                        إرسال
                      </Button>
                      <Textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {selectedTicket.status !== "closed" && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    className="text-red-500 hover:text-red-500"
                  >
                    إغلاق التذكرة
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                            {getStatusText(ticket.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <CardTitle className="text-lg">{ticket.title}</CardTitle>
                          <CardDescription className="mt-1">{getCategoryText(ticket.category)}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-right line-clamp-2">{ticket.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          عرض التفاصيل
                          <ArrowRight className="h-4 w-4 mr-2" />
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          {ticket.createdAt}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">لا توجد تذاكر متطابقة مع البحث</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faq">
          <div className="space-y-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <Card key={faq.id}>
                  <CardHeader>
                    <div className="flex items-center justify-end gap-2">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription className="mt-1">{getCategoryText(faq.category)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-right">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">لا توجد أسئلة متطابقة مع البحث</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>اتصل بنا</CardTitle>
              <CardDescription>يمكنك التواصل معنا من خلال القنوات التالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="font-medium">البريد الإلكتروني</p>
                    <p className="text-muted-foreground">support@haam.app</p>
                  </div>
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="font-medium">الهاتف</p>
                    <p className="text-muted-foreground">+966 12 345 6789</p>
                  </div>
                  <Phone className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="font-medium">ساعات العمل</p>
                    <p className="text-muted-foreground">الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً</p>
                  </div>
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
