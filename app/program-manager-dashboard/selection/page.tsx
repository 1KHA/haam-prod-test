"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  UserCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Calendar,
  FileText,
  Users,
  ArrowUpDown,
  Mail
} from "lucide-react"

export default function SelectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("shortlisted")

  const applications = [
    {
      id: 1,
      companyName: "تك إنوفيشن",
      industry: "تقنية مالية",
      program: "مسرع التقنية المالية",
      submissionDate: "2025/03/01",
      status: "shortlisted",
      score: 4.2,
      teamSize: 5,
      stage: "بذرة",
      interviewDate: "2025/03/15",
      interviewTime: "10:00 ص",
      interviewStatus: "scheduled"
    },
    {
      id: 2,
      companyName: "هيلث بلس",
      industry: "تقنيات صحية",
      program: "مسرع التقنيات الصحية",
      submissionDate: "2025/03/02",
      status: "shortlisted",
      score: 3.8,
      teamSize: 4,
      stage: "بذرة",
      interviewDate: "2025/03/16",
      interviewTime: "11:30 ص",
      interviewStatus: "scheduled"
    },
    {
      id: 3,
      companyName: "سمارت إديو",
      industry: "تقنيات تعليمية",
      program: "حاضنة التقنيات الناشئة",
      submissionDate: "2025/03/03",
      status: "selected",
      score: 4.5,
      teamSize: 3,
      stage: "بذرة",
      interviewDate: "2025/03/10",
      interviewTime: "1:00 م",
      interviewStatus: "completed"
    },
    {
      id: 4,
      companyName: "إي-كوميرس بلس",
      industry: "تجارة إلكترونية",
      program: "مسرع التقنية المالية",
      submissionDate: "2025/03/04",
      status: "rejected",
      score: 2.1,
      teamSize: 4,
      stage: "بذرة",
      interviewDate: "2025/03/12",
      interviewTime: "3:00 م",
      interviewStatus: "completed"
    },
    {
      id: 5,
      companyName: "سيكيور تك",
      industry: "أمن سيبراني",
      program: "مسرع التقنية المالية",
      submissionDate: "2025/03/06",
      status: "shortlisted",
      score: 3.9,
      teamSize: 6,
      stage: "بذرة",
      interviewDate: "2025/03/18",
      interviewTime: "9:30 ص",
      interviewStatus: "scheduled"
    },
    {
      id: 6,
      companyName: "إنرجي سوليوشنز",
      industry: "تقنيات الطاقة",
      program: "حاضنة التقنيات الناشئة",
      submissionDate: "2025/03/07",
      status: "selected",
      score: 4.7,
      teamSize: 5,
      stage: "بذرة",
      interviewDate: "2025/03/11",
      interviewTime: "2:00 م",
      interviewStatus: "completed"
    },
    {
      id: 7,
      companyName: "فينتك",
      industry: "تقنية مالية",
      program: "مسرع التقنية المالية",
      submissionDate: "2025/03/05",
      status: "selected",
      score: 4.3,
      teamSize: 4,
      stage: "بذرة",
      interviewDate: "2025/03/09",
      interviewTime: "11:00 ص",
      interviewStatus: "completed"
    },
    {
      id: 8,
      companyName: "ميديكال إيه آي",
      industry: "تقنيات صحية",
      program: "مسرع التقنيات الصحية",
      submissionDate: "2025/03/08",
      status: "shortlisted",
      score: 4.0,
      teamSize: 5,
      stage: "بذرة",
      interviewDate: "2025/03/17",
      interviewTime: "10:30 ص",
      interviewStatus: "scheduled"
    }
  ]

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.companyName.includes(searchQuery) || 
                          app.industry.includes(searchQuery) ||
                          app.program.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "shortlisted") return matchesSearch && app.status === "shortlisted"
    if (activeTab === "selected") return matchesSearch && app.status === "selected"
    if (activeTab === "rejected") return matchesSearch && app.status === "rejected"
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted": return "bg-amber-500"
      case "selected": return "bg-green-500"
      case "rejected": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "shortlisted": return "مرشح للمقابلة"
      case "selected": return "تم القبول"
      case "rejected": return "مرفوض"
      default: return "غير معروف"
    }
  }

  const getInterviewStatusText = (status: string) => {
    switch (status) {
      case "scheduled": return "مجدولة"
      case "completed": return "تمت"
      case "cancelled": return "ملغية"
      default: return "غير معروف"
    }
  }

  const getInterviewStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "text-amber-500"
      case "completed": return "text-green-500"
      case "cancelled": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>جدول المقابلات</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>إرسال إشعارات</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">اختيار المتقدمين</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserCheck className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">{applications.filter(app => app.status === "shortlisted").length}</div>
            <p className="text-muted-foreground">مرشح للمقابلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{applications.filter(app => app.status === "selected").length}</div>
            <p className="text-muted-foreground">تم القبول</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{applications.filter(app => app.status === "rejected").length}</div>
            <p className="text-muted-foreground">مرفوض</p>
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
            <CardTitle>المتقدمون المرشحون</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="rejected">مرفوض</TabsTrigger>
              <TabsTrigger value="selected">تم القبول</TabsTrigger>
              <TabsTrigger value="shortlisted">مرشح للمقابلة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          application.status === "shortlisted" ? "bg-amber-100 text-amber-800" :
                          application.status === "selected" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {getStatusText(application.status)}
                        </div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-lg ml-2">{application.companyName}</h3>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(application.status)}`}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">المجال</div>
                          <div className="font-medium">{application.industry}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">البرنامج</div>
                          <div className="font-medium">{application.program}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التقييم</div>
                          <div className="flex items-center">
                            <div className="font-medium ml-1">{application.score}/5</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= Math.round(application.score) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">حجم الفريق</div>
                          <div className="font-medium">{application.teamSize} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">المرحلة</div>
                          <div className="font-medium">{application.stage}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                          <div className="font-medium">{application.submissionDate}</div>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`text-sm ${getInterviewStatusColor(application.interviewStatus)}`}>
                            {getInterviewStatusText(application.interviewStatus)}
                          </div>
                          <div className="text-sm font-medium">المقابلة</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm">{application.interviewTime}</div>
                          <div className="text-sm">{application.interviewDate}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        {application.status === "shortlisted" && (
                          <>
                            <Button variant="outline" size="sm">تعديل المقابلة</Button>
                            <div className="flex gap-2">
                              <Button variant="destructive" size="sm">رفض</Button>
                              <Button variant="default" size="sm">قبول</Button>
                            </div>
                          </>
                        )}
                        {application.status === "selected" && (
                          <>
                            <Button variant="outline" size="sm">عرض التفاصيل</Button>
                            <Button variant="default" size="sm">إرسال معلومات البرنامج</Button>
                          </>
                        )}
                        {application.status === "rejected" && (
                          <>
                            <Button variant="outline" size="sm">عرض التفاصيل</Button>
                            <Button variant="default" size="sm">إعادة النظر</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="shortlisted" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          application.status === "shortlisted" ? "bg-amber-100 text-amber-800" :
                          application.status === "selected" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {getStatusText(application.status)}
                        </div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-lg ml-2">{application.companyName}</h3>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(application.status)}`}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">المجال</div>
                          <div className="font-medium">{application.industry}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">البرنامج</div>
                          <div className="font-medium">{application.program}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التقييم</div>
                          <div className="flex items-center">
                            <div className="font-medium ml-1">{application.score}/5</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= Math.round(application.score) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">حجم الفريق</div>
                          <div className="font-medium">{application.teamSize} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">المرحلة</div>
                          <div className="font-medium">{application.stage}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                          <div className="font-medium">{application.submissionDate}</div>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`text-sm ${getInterviewStatusColor(application.interviewStatus)}`}>
                            {getInterviewStatusText(application.interviewStatus)}
                          </div>
                          <div className="text-sm font-medium">المقابلة</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm">{application.interviewTime}</div>
                          <div className="text-sm">{application.interviewDate}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">تعديل المقابلة</Button>
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm">رفض</Button>
                          <Button variant="default" size="sm">قبول</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="selected" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          application.status === "shortlisted" ? "bg-amber-100 text-amber-800" :
                          application.status === "selected" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {getStatusText(application.status)}
                        </div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-lg ml-2">{application.companyName}</h3>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(application.status)}`}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">المجال</div>
                          <div className="font-medium">{application.industry}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">البرنامج</div>
                          <div className="font-medium">{application.program}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التقييم</div>
                          <div className="flex items-center">
                            <div className="font-medium ml-1">{application.score}/5</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= Math.round(application.score) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">حجم الفريق</div>
                          <div className="font-medium">{application.teamSize} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">المرحلة</div>
                          <div className="font-medium">{application.stage}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                          <div className="font-medium">{application.submissionDate}</div>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`text-sm ${getInterviewStatusColor(application.interviewStatus)}`}>
                            {getInterviewStatusText(application.interviewStatus)}
                          </div>
                          <div className="text-sm font-medium">المقابلة</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm">{application.interviewTime}</div>
                          <div className="text-sm">{application.interviewDate}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">عرض التفاصيل</Button>
                        <Button variant="default" size="sm">إرسال معلومات البرنامج</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          application.status === "shortlisted" ? "bg-amber-100 text-amber-800" :
                          application.status === "selected" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {getStatusText(application.status)}
                        </div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-lg ml-2">{application.companyName}</h3>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(application.status)}`}></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">المجال</div>
                          <div className="font-medium">{application.industry}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">البرنامج</div>
                          <div className="font-medium">{application.program}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التقييم</div>
                          <div className="flex items-center">
                            <div className="font-medium ml-1">{application.score}/5</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= Math.round(application.score) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">حجم الفريق</div>
                          <div className="font-medium">{application.teamSize} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">المرحلة</div>
                          <div className="font-medium">{application.stage}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                          <div className="font-medium">{application.submissionDate}</div>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`text-sm ${getInterviewStatusColor(application.interviewStatus)}`}>
                            {getInterviewStatusText(application.interviewStatus)}
                          </div>
                          <div className="text-sm font-medium">المقابلة</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm">{application.interviewTime}</div>
                          <div className="text-sm">{application.interviewDate}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">عرض التفاصيل</Button>
                        <Button variant="default" size="sm">إعادة النظر</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>جدول المقابلات القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications
              .filter(app => app.status === "shortlisted" && app.interviewStatus === "scheduled")
              .sort((a, b) => a.interviewDate.localeCompare(b.interviewDate))
              .map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 ml-2 text-amber-500" />
                    <div>
                      <div className="font-medium">{application.companyName}</div>
                      <div className="text-sm text-muted-foreground">{application.industry}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div>{application.interviewDate}</div>
                    <div>{application.interviewTime}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
