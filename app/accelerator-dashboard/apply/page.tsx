"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Check, 
  X, 
  AlertCircle,
  Clock as ClockIcon,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from "lucide-react"

type ApplicationStatus = "pending" | "accepted" | "rejected"

interface Program {
  id: string
  name: string
  description: string
  deadline: string
  duration: string
  requirements: string[]
  benefits: string[]
  status: "open" | "closed"
}

interface Application {
  id: string
  programId: string
  programName: string
  submissionDate: string
  status: ApplicationStatus
  feedback?: string
}

export default function ApplyPage() {
  const [activeTab, setActiveTab] = useState("available")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [applicationData, setApplicationData] = useState({
    companyDescription: "",
    teamSize: "",
    foundingDate: "",
    currentStage: "",
    fundingRaised: "",
    problemStatement: "",
    solution: "",
    targetMarket: "",
    businessModel: "",
    competitiveAdvantage: "",
    goals: ""
  })
  
  // Mock data for programs
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "1",
      name: "برنامج مسرع الأعمال التقني 2025",
      description: "برنامج مكثف لمدة 3 أشهر للشركات الناشئة في مجال التكنولوجيا. يوفر البرنامج التمويل والإرشاد والتوجيه والوصول إلى شبكة من المستثمرين والخبراء.",
      deadline: "15 أبريل 2025",
      duration: "3 أشهر",
      requirements: [
        "شركة ناشئة في مجال التكنولوجيا",
        "فريق عمل متكامل",
        "نموذج أولي للمنتج",
        "خطة عمل واضحة"
      ],
      benefits: [
        "تمويل أولي بقيمة 50,000 ريال",
        "مساحة عمل مشتركة",
        "إرشاد وتوجيه من خبراء في المجال",
        "الوصول إلى شبكة من المستثمرين",
        "فرصة للمشاركة في يوم العرض"
      ],
      status: "open"
    },
    {
      id: "2",
      name: "برنامج التقنية المالية",
      description: "برنامج متخصص للشركات الناشئة في مجال التكنولوجيا المالية. يهدف البرنامج إلى دعم الشركات الناشئة في تطوير حلول مبتكرة في مجال الخدمات المالية.",
      deadline: "30 مارس 2025",
      duration: "6 أشهر",
      requirements: [
        "شركة ناشئة في مجال التكنولوجيا المالية",
        "فريق عمل متكامل",
        "نموذج أولي للمنتج",
        "خطة عمل واضحة"
      ],
      benefits: [
        "تمويل أولي بقيمة 100,000 ريال",
        "مساحة عمل مشتركة",
        "إرشاد وتوجيه من خبراء في المجال",
        "الوصول إلى شبكة من المستثمرين",
        "فرصة للمشاركة في يوم العرض"
      ],
      status: "open"
    },
    {
      id: "3",
      name: "برنامج ابتكار الرعاية الصحية",
      description: "برنامج متخصص للشركات الناشئة في مجال الرعاية الصحية. يهدف البرنامج إلى دعم الشركات الناشئة في تطوير حلول مبتكرة في مجال الرعاية الصحية.",
      deadline: "10 مايو 2025",
      duration: "4 أشهر",
      requirements: [
        "شركة ناشئة في مجال الرعاية الصحية",
        "فريق عمل متكامل",
        "نموذج أولي للمنتج",
        "خطة عمل واضحة"
      ],
      benefits: [
        "تمويل أولي بقيمة 75,000 ريال",
        "مساحة عمل مشتركة",
        "إرشاد وتوجيه من خبراء في المجال",
        "الوصول إلى شبكة من المستثمرين",
        "فرصة للمشاركة في يوم العرض"
      ],
      status: "open"
    },
    {
      id: "4",
      name: "برنامج الاستدامة والطاقة المتجددة",
      description: "برنامج متخصص للشركات الناشئة في مجال الاستدامة والطاقة المتجددة. يهدف البرنامج إلى دعم الشركات الناشئة في تطوير حلول مبتكرة في مجال الاستدامة والطاقة المتجددة.",
      deadline: "20 يونيو 2025",
      duration: "5 أشهر",
      requirements: [
        "شركة ناشئة في مجال الاستدامة والطاقة المتجددة",
        "فريق عمل متكامل",
        "نموذج أولي للمنتج",
        "خطة عمل واضحة"
      ],
      benefits: [
        "تمويل أولي بقيمة 80,000 ريال",
        "مساحة عمل مشتركة",
        "إرشاد وتوجيه من خبراء في المجال",
        "الوصول إلى شبكة من المستثمرين",
        "فرصة للمشاركة في يوم العرض"
      ],
      status: "closed"
    }
  ])

  // Mock data for applications
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      programId: "2",
      programName: "برنامج التقنية المالية",
      submissionDate: "15 فبراير 2025",
      status: "accepted",
      feedback: "تم قبول طلبك للمشاركة في البرنامج. سيتم التواصل معك قريباً لإكمال إجراءات الانضمام."
    },
    {
      id: "2",
      programId: "3",
      programName: "برنامج ابتكار الرعاية الصحية",
      submissionDate: "20 فبراير 2025",
      status: "pending"
    }
  ])

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.includes(searchQuery) || 
                          program.description.includes(searchQuery)
    
    if (activeTab === "available") return matchesSearch && program.status === "open"
    return matchesSearch
  })

  const handleApplyClick = (program: Program) => {
    setSelectedProgram(program)
    setIsApplying(true)
  }

  const handleSubmitApplication = () => {
    if (!selectedProgram) return

    const newApplication: Application = {
      id: Math.random().toString(36).substring(2, 9),
      programId: selectedProgram.id,
      programName: selectedProgram.name,
      submissionDate: new Date().toLocaleDateString('ar-SA'),
      status: "pending"
    }

    setApplications([...applications, newApplication])
    setIsApplying(false)
    setSelectedProgram(null)
    setApplicationData({
      companyDescription: "",
      teamSize: "",
      foundingDate: "",
      currentStage: "",
      fundingRaised: "",
      problemStatement: "",
      solution: "",
      targetMarket: "",
      businessModel: "",
      competitiveAdvantage: "",
      goals: ""
    })

    alert("تم تقديم طلبك بنجاح")
  }

  const handleCancelApplication = () => {
    setIsApplying(false)
    setSelectedProgram(null)
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return "قيد المراجعة"
      case "accepted":
        return "تم القبول"
      case "rejected":
        return "تم الرفض"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">التقديم للبرامج</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="applications">طلباتي</TabsTrigger>
          <TabsTrigger value="all">جميع البرامج</TabsTrigger>
          <TabsTrigger value="available">البرامج المتاحة</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
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
              البرامج المتاحة: {programs.filter(p => p.status === "open").length}
            </div>
          </div>

          {isApplying && selectedProgram ? (
            <Card>
              <CardHeader>
                <CardTitle>التقديم لبرنامج: {selectedProgram.name}</CardTitle>
                <CardDescription>يرجى تعبئة النموذج التالي للتقديم للبرنامج</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company-description">وصف الشركة الناشئة</Label>
                  <Textarea 
                    id="company-description" 
                    rows={3} 
                    placeholder="قدم وصفاً مختصراً لشركتك الناشئة"
                    value={applicationData.companyDescription}
                    onChange={(e) => setApplicationData({...applicationData, companyDescription: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-size">حجم الفريق</Label>
                    <Input 
                      id="team-size" 
                      placeholder="عدد أعضاء الفريق"
                      value={applicationData.teamSize}
                      onChange={(e) => setApplicationData({...applicationData, teamSize: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founding-date">تاريخ التأسيس</Label>
                    <Input 
                      id="founding-date" 
                      placeholder="تاريخ تأسيس الشركة"
                      value={applicationData.foundingDate}
                      onChange={(e) => setApplicationData({...applicationData, foundingDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-stage">المرحلة الحالية</Label>
                    <Input 
                      id="current-stage" 
                      placeholder="مرحلة الشركة الناشئة الحالية"
                      value={applicationData.currentStage}
                      onChange={(e) => setApplicationData({...applicationData, currentStage: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="funding-raised">التمويل المحصل</Label>
                    <Input 
                      id="funding-raised" 
                      placeholder="مقدار التمويل الذي تم الحصول عليه"
                      value={applicationData.fundingRaised}
                      onChange={(e) => setApplicationData({...applicationData, fundingRaised: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="problem-statement">المشكلة التي تحلها</Label>
                  <Textarea 
                    id="problem-statement" 
                    rows={3} 
                    placeholder="ما هي المشكلة التي تحاول حلها؟"
                    value={applicationData.problemStatement}
                    onChange={(e) => setApplicationData({...applicationData, problemStatement: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">الحل المقترح</Label>
                  <Textarea 
                    id="solution" 
                    rows={3} 
                    placeholder="كيف يحل منتجك أو خدمتك هذه المشكلة؟"
                    value={applicationData.solution}
                    onChange={(e) => setApplicationData({...applicationData, solution: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-market">السوق المستهدف</Label>
                    <Textarea 
                      id="target-market" 
                      rows={3} 
                      placeholder="من هم عملاؤك المستهدفون؟"
                      value={applicationData.targetMarket}
                      onChange={(e) => setApplicationData({...applicationData, targetMarket: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-model">نموذج العمل</Label>
                    <Textarea 
                      id="business-model" 
                      rows={3} 
                      placeholder="كيف ستحقق الإيرادات؟"
                      value={applicationData.businessModel}
                      onChange={(e) => setApplicationData({...applicationData, businessModel: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitive-advantage">الميزة التنافسية</Label>
                  <Textarea 
                    id="competitive-advantage" 
                    rows={3} 
                    placeholder="ما الذي يميزك عن المنافسين؟"
                    value={applicationData.competitiveAdvantage}
                    onChange={(e) => setApplicationData({...applicationData, competitiveAdvantage: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">أهدافك من البرنامج</Label>
                  <Textarea 
                    id="goals" 
                    rows={3} 
                    placeholder="ما الذي تأمل في تحقيقه من خلال المشاركة في هذا البرنامج؟"
                    value={applicationData.goals}
                    onChange={(e) => setApplicationData({...applicationData, goals: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>المستندات المطلوبة</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">خطة العمل</p>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 ml-2" />
                        رفع الملف
                      </Button>
                    </div>
                    <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">العرض التقديمي</p>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 ml-2" />
                        رفع الملف
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelApplication}>
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
                <Button onClick={handleSubmitApplication}>
                  <Check className="h-4 w-4 ml-2" />
                  تقديم الطلب
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {program.status === "open" ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">متاح</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">مغلق</span>
                        )}
                      </div>
                      <div className="text-right">
                        <CardTitle>{program.name}</CardTitle>
                        <CardDescription className="mt-1">{program.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">الموعد النهائي للتقديم</p>
                            <p className="text-sm text-muted-foreground">{program.deadline}</p>
                          </div>
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-right">
                            <p className="text-sm font-medium">مدة البرنامج</p>
                            <p className="text-sm text-muted-foreground">{program.duration}</p>
                          </div>
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-right">
                          <p className="text-sm font-medium mb-2">المتطلبات</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {program.requirements.map((req, index) => (
                              <li key={index} className="flex items-center justify-end gap-2">
                                <span>{req}</span>
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm font-medium mb-2 text-right">المميزات</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {program.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center justify-end gap-2">
                            <span>{benefit}</span>
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      onClick={() => handleApplyClick(program)}
                      disabled={program.status === "closed" || applications.some(app => app.programId === program.id)}
                    >
                      {applications.some(app => app.programId === program.id) ? "تم التقديم" : "تقديم طلب"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {filteredPrograms.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">لا توجد برامج متاحة حالياً</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
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
              إجمالي البرامج: {programs.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredPrograms.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {program.status === "open" ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">متاح</span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">مغلق</span>
                      )}
                    </div>
                    <div className="text-right">
                      <CardTitle>{program.name}</CardTitle>
                      <CardDescription className="mt-1">{program.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">الموعد النهائي للتقديم</p>
                          <p className="text-sm text-muted-foreground">{program.deadline}</p>
                        </div>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium">مدة البرنامج</p>
                          <p className="text-sm text-muted-foreground">{program.duration}</p>
                        </div>
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-right">
                        <p className="text-sm font-medium mb-2">المتطلبات</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {program.requirements.map((req, index) => (
                            <li key={index} className="flex items-center justify-end gap-2">
                              <span>{req}</span>
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-2 text-right">المميزات</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {program.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center justify-end gap-2">
                          <span>{benefit}</span>
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={() => handleApplyClick(program)}
                    disabled={program.status === "closed" || applications.some(app => app.programId === program.id)}
                  >
                    {applications.some(app => app.programId === program.id) ? "تم التقديم" : "تقديم طلب"}
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {filteredPrograms.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">لا توجد برامج متطابقة مع البحث</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center justify-between">
            <div></div>
            <div className="text-sm text-muted-foreground">
              إجمالي الطلبات: {applications.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      <span className={`text-sm font-medium ${
                        application.status === "accepted" ? "text-green-600" : 
                        application.status === "rejected" ? "text-red-600" : 
                        "text-yellow-600"
                      }`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <CardTitle>{application.programName}</CardTitle>
                      <CardDescription className="mt-1">تاريخ التقديم: {application.submissionDate}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {application.feedback && (
                  <CardContent>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <p className="text-sm font-medium">ملاحظات</p>
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-right">{application.feedback}</p>
                    </div>
                  </CardContent>
                )}
                <CardFooter className="flex justify-end">
                  <Button variant="outline">
                    عرض التفاصيل
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">لا توجد طلبات مقدمة</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
