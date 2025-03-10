"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  BarChart,
  TrendingUp,
  Flag
} from "lucide-react"

// Mock milestones data
const milestones = [
  {
    id: 1,
    title: "تطوير النموذج الأولي",
    description: "تطوير نموذج أولي قابل للاستخدام من المنتج",
    dueDate: "15 فبراير 2025",
    completedDate: "15 فبراير 2025",
    status: "مكتمل",
    category: "تطوير المنتج",
    progress: 100,
    tasks: [
      { id: 1, title: "تصميم واجهة المستخدم", completed: true },
      { id: 2, title: "تطوير الواجهة الخلفية", completed: true },
      { id: 3, title: "اختبار النموذج الأولي", completed: true }
    ],
    feedback: "تم تطوير النموذج الأولي بنجاح وفي الوقت المحدد. النموذج يلبي المتطلبات الأساسية ويمكن استخدامه للاختبار مع المستخدمين."
  },
  {
    id: 2,
    title: "اختبار المستخدمين",
    description: "إجراء اختبارات المستخدمين وجمع الملاحظات",
    dueDate: "15 مارس 2025",
    completedDate: "1 مارس 2025",
    status: "مكتمل",
    category: "تطوير المنتج",
    progress: 100,
    tasks: [
      { id: 4, title: "تحديد مجموعة المستخدمين للاختبار", completed: true },
      { id: 5, title: "إجراء جلسات الاختبار", completed: true },
      { id: 6, title: "تحليل نتائج الاختبار", completed: true },
      { id: 7, title: "تحديد التحسينات المطلوبة", completed: true }
    ],
    feedback: "تم إجراء اختبارات المستخدمين بنجاح وقبل الموعد المحدد. تم جمع ملاحظات قيمة من المستخدمين وتحديد مجالات التحسين."
  },
  {
    id: 3,
    title: "إطلاق النسخة التجريبية",
    description: "إطلاق النسخة التجريبية من المنتج للمستخدمين",
    dueDate: "15 أبريل 2025",
    completedDate: "15 مارس 2025",
    status: "مكتمل",
    category: "تطوير المنتج",
    progress: 100,
    tasks: [
      { id: 8, title: "تنفيذ التحسينات بناءً على ملاحظات المستخدمين", completed: true },
      { id: 9, title: "إعداد بيئة الإطلاق", completed: true },
      { id: 10, title: "إطلاق النسخة التجريبية", completed: true },
      { id: 11, title: "مراقبة أداء النسخة التجريبية", completed: true }
    ],
    feedback: "تم إطلاق النسخة التجريبية بنجاح وقبل الموعد المحدد بشهر. النسخة التجريبية تعمل بشكل جيد وتم استقبالها بشكل إيجابي من قبل المستخدمين."
  },
  {
    id: 4,
    title: "الوصول إلى 1000 مستخدم",
    description: "الوصول إلى 1000 مستخدم نشط للنسخة التجريبية",
    dueDate: "15 مايو 2025",
    completedDate: "15 أبريل 2025",
    status: "مكتمل",
    category: "نمو",
    progress: 100,
    tasks: [
      { id: 12, title: "تنفيذ استراتيجية التسويق", completed: true },
      { id: 13, title: "إطلاق حملة على وسائل التواصل الاجتماعي", completed: true },
      { id: 14, title: "تنفيذ برنامج الإحالة", completed: true }
    ],
    feedback: "تم تحقيق هدف الوصول إلى 1000 مستخدم نشط قبل الموعد المحدد بشهر. استراتيجية التسويق وبرنامج الإحالة كانا فعالين جدًا في جذب المستخدمين."
  },
  {
    id: 5,
    title: "إطلاق الميزات الجديدة",
    description: "تطوير وإطلاق مجموعة من الميزات الجديدة بناءً على ملاحظات المستخدمين",
    dueDate: "15 مايو 2025",
    completedDate: null,
    status: "جاري",
    category: "تطوير المنتج",
    progress: 60,
    tasks: [
      { id: 15, title: "تحديد الميزات ذات الأولوية", completed: true },
      { id: 16, title: "تصميم الميزات الجديدة", completed: true },
      { id: 17, title: "تطوير الميزات الجديدة", completed: false },
      { id: 18, title: "اختبار الميزات الجديدة", completed: false },
      { id: 19, title: "إطلاق الميزات الجديدة", completed: false }
    ],
    feedback: ""
  },
  {
    id: 6,
    title: "تحقيق إيرادات شهرية بقيمة 50,000 ريال",
    description: "تحقيق إيرادات شهرية بقيمة 50,000 ريال من خلال الاشتراكات المدفوعة",
    dueDate: "30 يونيو 2025",
    completedDate: null,
    status: "قادم",
    category: "مالية",
    progress: 0,
    tasks: [
      { id: 20, title: "إطلاق نموذج الاشتراك المدفوع", completed: false },
      { id: 21, title: "تنفيذ استراتيجية تحويل المستخدمين المجانيين إلى مدفوعين", completed: false },
      { id: 22, title: "تحسين معدل الاحتفاظ بالمستخدمين", completed: false }
    ],
    feedback: ""
  }
]

// Mock KPIs data
const kpis = [
  {
    id: 1,
    name: "عدد المستخدمين النشطين",
    current: 1250,
    target: 5000,
    unit: "مستخدم",
    progress: 25,
    trend: "+20%",
    category: "نمو"
  },
  {
    id: 2,
    name: "معدل الاحتفاظ بالمستخدمين",
    current: 65,
    target: 80,
    unit: "%",
    progress: 81,
    trend: "+5%",
    category: "نمو"
  },
  {
    id: 3,
    name: "الإيرادات الشهرية",
    current: 15000,
    target: 50000,
    unit: "ريال",
    progress: 30,
    trend: "+25%",
    category: "مالية"
  },
  {
    id: 4,
    name: "تكلفة اكتساب العميل",
    current: 200,
    target: 100,
    unit: "ريال",
    progress: 50,
    trend: "-10%",
    category: "مالية"
  }
]

export default function MilestonesPage() {
  const [activeTab, setActiveTab] = useState("milestones")
  const [showNewMilestone, setShowNewMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
    category: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewMilestone(prev => ({ ...prev, [name]: value }))
  }

  const handleAddMilestone = () => {
    // In a real app, this would send the milestone to the server
    console.log("Adding milestone:", newMilestone)
    setNewMilestone({
      title: "",
      description: "",
      dueDate: "",
      category: ""
    })
    setShowNewMilestone(false)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setShowNewMilestone(!showNewMilestone)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>{showNewMilestone ? "إلغاء" : "إضافة مرحلة جديدة"}</span>
        </Button>
        <h1 className="text-3xl font-bold">المراحل والأهداف</h1>
      </div>

      {showNewMilestone && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>إضافة مرحلة جديدة</CardTitle>
              <CardDescription>أدخل تفاصيل المرحلة الجديدة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">عنوان المرحلة</label>
                  <Input
                    id="title"
                    name="title"
                    value={newMilestone.title}
                    onChange={handleInputChange}
                    placeholder="مثال: إطلاق النسخة النهائية"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">وصف المرحلة</label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newMilestone.description}
                    onChange={handleInputChange}
                    placeholder="وصف تفصيلي للمرحلة وأهدافها"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="dueDate" className="text-sm font-medium">تاريخ الاستحقاق</label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">التصنيف</label>
                  <Input
                    id="category"
                    name="category"
                    value={newMilestone.category}
                    onChange={handleInputChange}
                    placeholder="مثال: تطوير المنتج، نمو، مالية"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAddMilestone}>
                    <Target className="h-4 w-4 ml-2" />
                    إضافة المرحلة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="kpis">مؤشرات الأداء</TabsTrigger>
          <TabsTrigger value="milestones">المراحل</TabsTrigger>
        </TabsList>
        
        <TabsContent value="milestones">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">تقدم المشروع</h2>
              <div className="bg-muted p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">4/6 مراحل مكتملة</span>
                  <span className="text-sm font-medium">67%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "67%" }}></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">4</div>
                    <div className="text-xs text-muted-foreground">مكتملة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">1</div>
                    <div className="text-xs text-muted-foreground">جارية</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">1</div>
                    <div className="text-xs text-muted-foreground">قادمة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">متأخرة</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">المراحل المكتملة</h2>
              <div className="space-y-4">
                {milestones.filter(m => m.status === "مكتمل").map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col items-end">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {milestone.status}
                            </span>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{milestone.completedDate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <CardTitle>{milestone.title}</CardTitle>
                            <CardDescription className="mt-1">{milestone.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">الموعد النهائي: {milestone.dueDate}</span>
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">{milestone.category}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full" 
                                style={{ width: `${milestone.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">المهام</h4>
                            <div className="space-y-2">
                              {milestone.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between">
                                  <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                  <span className="text-sm">{task.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {milestone.feedback && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">ملاحظات</h4>
                              <p className="text-sm text-muted-foreground">{milestone.feedback}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">المراحل الجارية والقادمة</h2>
              <div className="space-y-4">
                {milestones.filter(m => m.status !== "مكتمل").map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col items-end">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              milestone.status === "جاري" ? "bg-blue-100 text-blue-800" : 
                              "bg-amber-100 text-amber-800"
                            }`}>
                              {milestone.status}
                            </span>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{milestone.dueDate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <CardTitle>{milestone.title}</CardTitle>
                            <CardDescription className="mt-1">{milestone.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">{milestone.progress}% مكتمل</span>
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">{milestone.category}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  milestone.status === "جاري" ? "bg-blue-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${milestone.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">المهام</h4>
                            <div className="space-y-2">
                              {milestone.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between">
                                  {task.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                  ) : (
                                    <div className="h-4 w-4 border border-muted-foreground rounded-full ml-2"></div>
                                  )}
                                  <span className="text-sm">{task.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex gap-2 w-full">
                          {milestone.status === "جاري" && (
                            <Button className="flex-1">
                              <CheckCircle className="h-4 w-4 ml-2" />
                              تحديث التقدم
                            </Button>
                          )}
                          <Button variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="kpis">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">مؤشرات الأداء الرئيسية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {kpis.map((kpi, index) => (
                  <motion.div
                    key={kpi.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            {kpi.trend.startsWith("+") ? (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-red-500 transform rotate-180" />
                            )}
                            <span className={`text-sm ml-1 ${
                              kpi.trend.startsWith("+") ? "text-green-500" : "text-red-500"
                            }`}>
                              {kpi.trend}
                            </span>
                          </div>
                          <div className="text-right">
                            <CardTitle>{kpi.name}</CardTitle>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">{kpi.category}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-3xl font-bold">{kpi.current}</div>
                              <div className="text-xs text-muted-foreground">الحالي</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-muted-foreground">{kpi.target}</div>
                              <div className="text-xs text-muted-foreground">الهدف</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold">{kpi.unit}</div>
                              <div className="text-xs text-muted-foreground">الوحدة</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">{kpi.progress}% من الهدف</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${kpi.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" className="flex-1">
                            <BarChart className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>إضافة مؤشر أداء جديد</CardTitle>
                <CardDescription>أضف مؤشر أداء جديد لتتبع تقدم شركتك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="kpi-name" className="text-sm font-medium">اسم المؤشر</label>
                      <Input
                        id="kpi-name"
                        placeholder="مثال: معدل تحويل المستخدمين"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="kpi-category" className="text-sm font-medium">التصنيف</label>
                      <Input
                        id="kpi-category"
                        placeholder="مثال: نمو، مالية، تسويق"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="kpi-current" className="text-sm font-medium">القيمة الحالية</label>
                      <Input
                        id="kpi-current"
                        type="number"
                        placeholder="القيمة الحالية للمؤشر"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="kpi-target" className="text-sm font-medium">القيمة المستهدفة</label>
                      <Input
                        id="kpi-target"
                        type="number"
                        placeholder="القيمة المستهدفة للمؤشر"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="kpi-unit" className="text-sm font-medium">وحدة القياس</label>
                      <Input
                        id="kpi-unit"
                        placeholder="مثال: %، ريال، مستخدم"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="kpi-date" className="text-sm font-medium">تاريخ الهدف</label>
                      <Input
                        id="kpi-date"
                        type="date"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة مؤشر الأداء
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
