"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Target, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Search,
  ArrowRight,
  BarChart,
  PieChart,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { UserRole } from "@prisma/client"

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  status: "completed" | "in_progress" | "upcoming" | "overdue"
  progress: number
  category: "product" | "business" | "funding" | "team" | "other"
  priority: "high" | "medium" | "low"
}

export default function MilestonesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false)
  
  // Mock data for milestones
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      title: "إطلاق النسخة التجريبية",
      description: "إطلاق النسخة التجريبية من المنتج للمستخدمين المبكرين للحصول على التعليقات والملاحظات.",
      dueDate: "15 أبريل 2025",
      status: "in_progress",
      progress: 75,
      category: "product",
      priority: "high"
    },
    {
      id: "2",
      title: "تأمين تمويل المرحلة الأولى",
      description: "تأمين تمويل بقيمة 500,000 ريال للمرحلة الأولى من تطوير المنتج.",
      dueDate: "30 مارس 2025",
      status: "completed",
      progress: 100,
      category: "funding",
      priority: "high"
    },
    {
      id: "3",
      title: "توظيف فريق التطوير",
      description: "توظيف 3 مطورين و2 مصممين لفريق تطوير المنتج.",
      dueDate: "10 فبراير 2025",
      status: "completed",
      progress: 100,
      category: "team",
      priority: "medium"
    },
    {
      id: "4",
      title: "إعداد خطة التسويق",
      description: "إعداد خطة تسويق شاملة للمنتج، تتضمن استراتيجيات التسويق الرقمي والتقليدي.",
      dueDate: "20 مايو 2025",
      status: "upcoming",
      progress: 0,
      category: "business",
      priority: "medium"
    },
    {
      id: "5",
      title: "الوصول إلى 1000 مستخدم",
      description: "الوصول إلى 1000 مستخدم نشط للمنتج.",
      dueDate: "30 يونيو 2025",
      status: "upcoming",
      progress: 0,
      category: "business",
      priority: "high"
    },
    {
      id: "6",
      title: "تطوير واجهة المستخدم",
      description: "تطوير واجهة مستخدم جديدة للمنتج بناءً على تعليقات المستخدمين.",
      dueDate: "5 مارس 2025",
      status: "overdue",
      progress: 60,
      category: "product",
      priority: "high"
    }
  ])

  // New milestone form state
  const [newMilestone, setNewMilestone] = useState<Omit<Milestone, "id" | "status" | "progress">>({
    title: "",
    description: "",
    dueDate: "",
    category: "product",
    priority: "medium"
  })

  // Filter milestones based on search query and active tab
  const filteredMilestones = milestones.filter(milestone => {
    const matchesSearch = milestone.title.includes(searchQuery) || 
                          milestone.description.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "completed") return matchesSearch && milestone.status === "completed"
    if (activeTab === "in_progress") return matchesSearch && milestone.status === "in_progress"
    if (activeTab === "upcoming") return matchesSearch && milestone.status === "upcoming"
    if (activeTab === "overdue") return matchesSearch && milestone.status === "overdue"
    
    return matchesSearch
  })

  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId) || null

  // Calculate milestone statistics
  const totalMilestones = milestones.length
  const completedMilestones = milestones.filter(m => m.status === "completed").length
  const inProgressMilestones = milestones.filter(m => m.status === "in_progress").length
  const overdueMilestones = milestones.filter(m => m.status === "overdue").length
  const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  const handleCreateMilestone = () => {
    const id = Math.random().toString(36).substring(2, 9)
    const newMilestoneObj: Milestone = {
      id,
      ...newMilestone,
      status: "upcoming",
      progress: 0
    }

    setMilestones([...milestones, newMilestoneObj])
    setNewMilestone({
      title: "",
      description: "",
      dueDate: "",
      category: "product",
      priority: "medium"
    })
    setIsCreatingMilestone(false)
    setSelectedMilestoneId(id)
  }

  const handleUpdateMilestoneStatus = (milestoneId: string, newStatus: Milestone["status"], newProgress: number) => {
    setMilestones(milestones.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, status: newStatus, progress: newProgress } 
        : milestone
    ))
  }

  const handleDeleteMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter(milestone => milestone.id !== milestoneId))
    setSelectedMilestoneId(null)
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case "product":
        return "المنتج"
      case "business":
        return "الأعمال"
      case "funding":
        return "التمويل"
      case "team":
        return "الفريق"
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
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "upcoming":
        return <Calendar className="h-5 w-5 text-amber-500" />
      case "overdue":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتملة"
      case "in_progress":
        return "قيد التنفيذ"
      case "upcoming":
        return "قادمة"
      case "overdue":
        return "متأخرة"
      default:
        return "غير معروف"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "upcoming":
        return "bg-amber-100 text-amber-800"
      case "overdue":
        return "bg-red-100 text-red-800"
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
    <RouteGuard
      requiredPermission={{ category: 'startups', action: 'view' }}
      requiredRole={UserRole.ENTREPRENEUR}
    >
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => {
            setIsCreatingMilestone(true)
            setSelectedMilestoneId(null)
          }}
          className="flex items-center gap-2"
          disabled={isCreatingMilestone}
        >
          <Plus className="h-4 w-4" />
          إضافة مرحلة جديدة
        </Button>
        <h1 className="text-3xl font-bold">المراحل والتقدم</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المراحل</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMilestones}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المراحل المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMilestones}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المراحل قيد التنفيذ</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressMilestones}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الإكمال</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="overdue">متأخرة</TabsTrigger>
          <TabsTrigger value="upcoming">قادمة</TabsTrigger>
          <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
          <TabsTrigger value="completed">مكتملة</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث..." 
              className="pr-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {overdueMilestones > 0 && (
              <span className="text-red-500 font-medium ml-2">
                {overdueMilestones} مراحل متأخرة
              </span>
            )}
          </div>
        </div>

        <TabsContent value={activeTab}>
          {isCreatingMilestone ? (
            <Card>
              <CardHeader>
                <CardTitle>إضافة مرحلة جديدة</CardTitle>
                <CardDescription>أدخل تفاصيل المرحلة الجديدة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان المرحلة</Label>
                    <Input 
                      id="title" 
                      value={newMilestone.title} 
                      onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                      placeholder="أدخل عنوان المرحلة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف المرحلة</Label>
                    <Textarea 
                      id="description" 
                      rows={4} 
                      value={newMilestone.description} 
                      onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                      placeholder="اشرح تفاصيل المرحلة والأهداف المطلوبة"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                      <Input 
                        id="dueDate" 
                        type="date" 
                        value={newMilestone.dueDate} 
                        onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">الفئة</Label>
                      <select 
                        id="category" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newMilestone.category} 
                        onChange={(e) => setNewMilestone({...newMilestone, category: e.target.value as any})}
                      >
                        <option value="product">المنتج</option>
                        <option value="business">الأعمال</option>
                        <option value="funding">التمويل</option>
                        <option value="team">الفريق</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">الأولوية</Label>
                      <select 
                        id="priority" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newMilestone.priority} 
                        onChange={(e) => setNewMilestone({...newMilestone, priority: e.target.value as any})}
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
                  onClick={() => setIsCreatingMilestone(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleCreateMilestone}
                  disabled={!newMilestone.title || !newMilestone.description || !newMilestone.dueDate}
                >
                  إضافة المرحلة
                </Button>
              </CardFooter>
            </Card>
          ) : selectedMilestone ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMilestoneId(null)}
                  >
                    العودة للقائمة
                  </Button>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getStatusIcon(selectedMilestone.status)}
                      <CardTitle>{selectedMilestone.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      {getCategoryText(selectedMilestone.category)} • 
                      <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${getPriorityColor(selectedMilestone.priority)}`}>
                        {getPriorityText(selectedMilestone.priority)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-right">وصف المرحلة</h3>
                    <p className="text-right">{selectedMilestone.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">تاريخ الاستحقاق</p>
                          <p className="text-sm text-muted-foreground">{selectedMilestone.dueDate}</p>
                        </div>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">الحالة</p>
                          <p className="text-sm text-muted-foreground">{getStatusText(selectedMilestone.status)}</p>
                        </div>
                        {getStatusIcon(selectedMilestone.status)}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">نسبة الإنجاز</p>
                          <p className="text-sm text-muted-foreground">{selectedMilestone.progress}%</p>
                        </div>
                        <Target className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">الأولوية</p>
                          <p className="text-sm text-muted-foreground">{getPriorityText(selectedMilestone.priority)}</p>
                        </div>
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        selectedMilestone.status === "completed" ? "bg-green-500" :
                        selectedMilestone.status === "in_progress" ? "bg-blue-500" :
                        selectedMilestone.status === "overdue" ? "bg-red-500" :
                        "bg-amber-500"
                      }`}
                      style={{ width: `${selectedMilestone.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteMilestone(selectedMilestone.id)}
                  className="text-red-500 hover:text-red-500"
                >
                  حذف المرحلة
                </Button>
                {selectedMilestone.status === "upcoming" && (
                  <Button 
                    onClick={() => handleUpdateMilestoneStatus(selectedMilestone.id, "in_progress", 10)}
                  >
                    بدء العمل
                  </Button>
                )}
                {selectedMilestone.status === "in_progress" && (
                  <Button 
                    onClick={() => handleUpdateMilestoneStatus(selectedMilestone.id, "completed", 100)}
                  >
                    إكمال المرحلة
                  </Button>
                )}
                {selectedMilestone.status === "overdue" && (
                  <Button 
                    onClick={() => handleUpdateMilestoneStatus(selectedMilestone.id, "in_progress", selectedMilestone.progress)}
                  >
                    استئناف العمل
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredMilestones.map((milestone) => (
                <Card key={milestone.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(milestone.status)}`}>
                          {getStatusText(milestone.status)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(milestone.priority)}`}>
                          {getPriorityText(milestone.priority)}
                        </span>
                      </div>
                      <div className="text-right">
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <CardDescription className="mt-1">{getCategoryText(milestone.category)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-right line-clamp-2">{milestone.description}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                        <span className="text-sm text-muted-foreground">تاريخ الاستحقاق: {milestone.dueDate}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            milestone.status === "completed" ? "bg-green-500" :
                            milestone.status === "in_progress" ? "bg-blue-500" :
                            milestone.status === "overdue" ? "bg-red-500" :
                            "bg-amber-500"
                          }`}
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedMilestoneId(milestone.id)}
                      >
                        عرض التفاصيل
                        <ArrowRight className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredMilestones.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">لا توجد مراحل متطابقة مع البحث</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </RouteGuard>
  )
}
