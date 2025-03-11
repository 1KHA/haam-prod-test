"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  UserCheck,
  Calendar,
  FileText
} from "lucide-react"

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  const applications = [
    {
      id: 1,
      companyName: "تك إنوفيشن",
      industry: "تقنية مالية",
      program: "مسرع التقنية المالية",
      submissionDate: "2025/03/01",
      status: "pending",
      score: 0,
      teamSize: 5,
      stage: "بذرة",
      reviewers: []
    },
    {
      id: 2,
      companyName: "هيلث بلس",
      industry: "تقنيات صحية",
      program: "مسرع التقنيات الصحية",
      submissionDate: "2025/03/02",
      status: "in-review",
      score: 3.5,
      teamSize: 4,
      stage: "بذرة",
      reviewers: ["أحمد محمد", "سارة الأحمد"]
    },
    {
      id: 3,
      companyName: "سمارت إديو",
      industry: "تقنيات تعليمية",
      program: "حاضنة التقنيات الناشئة",
      submissionDate: "2025/03/03",
      status: "approved",
      score: 4.2,
      teamSize: 3,
      stage: "بذرة",
      reviewers: ["محمد السالم", "خالد العمري", "نورة الغامدي"]
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
      reviewers: ["فهد العتيبي", "سارة الأحمد"]
    },
    {
      id: 5,
      companyName: "فود تك",
      industry: "تقنيات غذائية",
      program: "حاضنة التقنيات الناشئة",
      submissionDate: "2025/03/05",
      status: "pending",
      score: 0,
      teamSize: 3,
      stage: "فكرة",
      reviewers: []
    },
    {
      id: 6,
      companyName: "سيكيور تك",
      industry: "أمن سيبراني",
      program: "مسرع التقنية المالية",
      submissionDate: "2025/03/06",
      status: "in-review",
      score: 3.8,
      teamSize: 6,
      stage: "بذرة",
      reviewers: ["خالد العمري", "نورة الغامدي"]
    },
    {
      id: 7,
      companyName: "إنرجي سوليوشنز",
      industry: "تقنيات الطاقة",
      program: "حاضنة التقنيات الناشئة",
      submissionDate: "2025/03/07",
      status: "approved",
      score: 4.5,
      teamSize: 5,
      stage: "بذرة",
      reviewers: ["محمد السالم", "سارة الأحمد", "فهد العتيبي"]
    },
    {
      id: 8,
      companyName: "سمارت هوم",
      industry: "إنترنت الأشياء",
      program: "مسرع التقنيات الصحية",
      submissionDate: "2025/03/08",
      status: "rejected",
      score: 1.8,
      teamSize: 4,
      stage: "فكرة",
      reviewers: ["أحمد محمد", "خالد العمري"]
    }
  ]

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.companyName.includes(searchQuery) || 
                          app.industry.includes(searchQuery) ||
                          app.program.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "pending") return matchesSearch && app.status === "pending"
    if (activeTab === "in-review") return matchesSearch && app.status === "in-review"
    if (activeTab === "approved") return matchesSearch && app.status === "approved"
    if (activeTab === "rejected") return matchesSearch && app.status === "rejected"
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-500"
      case "in-review": return "bg-amber-500"
      case "approved": return "bg-green-500"
      case "rejected": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "قيد الانتظار"
      case "in-review": return "قيد المراجعة"
      case "approved": return "مقبول"
      case "rejected": return "مرفوض"
      default: return "غير معروف"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-5 w-5 text-blue-500" />
      case "in-review": return <FileCheck className="h-5 w-5 text-amber-500" />
      case "approved": return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected": return <XCircle className="h-5 w-5 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>تصدير التقرير</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>تنزيل البيانات</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">مراجعة الطلبات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{applications.filter(app => app.status === "pending").length}</div>
            <p className="text-muted-foreground">قيد الانتظار</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <FileCheck className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold">{applications.filter(app => app.status === "in-review").length}</div>
            <p className="text-muted-foreground">قيد المراجعة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{applications.filter(app => app.status === "approved").length}</div>
            <p className="text-muted-foreground">مقبول</p>
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
            <CardTitle>طلبات الانضمام</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="rejected">مرفوض</TabsTrigger>
              <TabsTrigger value="approved">مقبول</TabsTrigger>
              <TabsTrigger value="in-review">قيد المراجعة</TabsTrigger>
              <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          application.status === "pending" ? "bg-blue-100 text-blue-800" :
                          application.status === "in-review" ? "bg-amber-100 text-amber-800" :
                          application.status === "approved" ? "bg-green-100 text-green-800" :
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
                          <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                          <div className="font-medium">{application.submissionDate}</div>
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
                          <div className="text-sm text-muted-foreground">التقييم</div>
                          <div className="flex items-center">
                            {application.status === "pending" ? (
                              <span className="text-muted-foreground">لم يتم التقييم بعد</span>
                            ) : (
                              <>
                                <div className="font-medium ml-1">{application.score}/5</div>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`h-4 w-4 ${star <= Math.round(application.score) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {application.reviewers.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground mb-1">المراجعون</div>
                          <div className="flex flex-wrap gap-2">
                            {application.reviewers.map((reviewer, index) => (
                              <div key={index} className="bg-muted px-3 py-1 rounded-full text-xs flex items-center">
                                <UserCheck className="h-3 w-3 ml-1" />
                                {reviewer}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-4">
                        {application.status === "pending" && (
                          <>
                            <Button variant="outline" size="sm">تعيين مراجعين</Button>
                            <Button variant="default" size="sm">بدء المراجعة</Button>
                          </>
                        )}
                        {application.status === "in-review" && (
                          <>
                            <Button variant="outline" size="sm">إضافة ملاحظات</Button>
                            <div className="flex gap-2">
                              <Button variant="destructive" size="sm">رفض</Button>
                              <Button variant="default" size="sm">قبول</Button>
                            </div>
                          </>
                        )}
                        {(application.status === "approved" || application.status === "rejected") && (
                          <>
                            <Button variant="outline" size="sm">عرض التفاصيل</Button>
                            <Button variant="default" size="sm">عرض التقييم</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          application.status === "pending" ? "bg-blue-100 text-blue-800" :
                          application.status === "in-review" ? "bg-amber-100 text-amber-800" :
                          application.status === "approved" ? "bg-green-100 text-green-800" :
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
                          <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                          <div className="font-medium">{application.submissionDate}</div>
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
                          <div className="text-sm text-muted-foreground">التقييم</div>
                          <div className="flex items-center">
                            {application.status === "pending" ? (
                              <span className="text-muted-foreground">لم يتم التقييم بعد</span>
                            ) : (
                              <>
                                <div className="font-medium ml-1">{application.score}/5</div>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`h-4 w-4 ${star <= Math.round(application.score) ? "text-amber-500 fill-amber-500" : "text-muted"}`} 
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">تعيين مراجعين</Button>
                        <Button variant="default" size="sm">بدء المراجعة</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="in-review" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          application.status === "pending" ? "bg-blue-100 text-blue-800" :
                          application.status === "in-review" ? "bg-amber-100 text-amber-800" :
                          application.status === "approved" ? "bg-green-100 text-green-800" :
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
                          <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                          <div className="font-medium">{application.submissionDate}</div>
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
                      
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-1">المراجعون</div>
                        <div className="flex flex-wrap gap-2">
                          {application.reviewers.map((reviewer, index) => (
                            <div key={index} className="bg-muted px-3 py-1 rounded-full text-xs flex items-center">
                              <UserCheck className="h-3 w-3 ml-1" />
                              {reviewer}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">إضافة ملاحظات</Button>
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
            
            <TabsContent value="approved" className="mt-0">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          application.status === "pending" ? "bg-blue-100 text-blue-800" :
                          application.status === "in-review" ? "bg-amber-100 text-amber-800" :
                          application.status === "approved" ? "bg-green-100 text-green-800" :
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
                          <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                          <div className="font-medium">{application.submissionDate}</div>
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
                      
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-1">المراجعون</div>
                        <div className="flex flex-wrap gap-2">
                          {application.reviewers.map((reviewer, index) => (
                            <div key={index} className="bg-muted px-3 py-1 rounded-full text-xs flex items-center">
                              <UserCheck className="h-3 w-3 ml-1" />
                              {reviewer}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">عرض التفاصيل</Button>
                        <Button variant="default" size="sm">عرض التقييم</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
