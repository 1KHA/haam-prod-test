"use client"

import { useState, useEffect } from "react"
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
  FileText,
  Loader2
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

interface Application {
  id: string
  companyName: string
  industry: string
  program: string
  submissionDate: string
  status: string
  score: number
  teamSize: number
  stage: string
  reviewers: string[]
  cohortId: string | null
  founder: {
    name: string
    email: string
  }
}

interface ApplicationStats {
  pendingCount: number
  inReviewCount: number
  activeCount: number
  rejectedCount: number
  totalCount: number
}

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    pendingCount: 0,
    inReviewCount: 0,
    activeCount: 0,
    rejectedCount: 0,
    totalCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch applications
  useEffect(() => {
    if (!token) return;
    
    const fetchApplications = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/program-manager/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        
        // Map the API response to our application interface
        const mappedApplications = data.applications.map((app: any) => ({
          id: app.id,
          companyName: app.companyName,
          industry: app.industry,
          program: app.program,
          submissionDate: new Date(app.submissionDate).toLocaleDateString('ar-SA'),
          status: app.status === "PENDING" ? "pending" : 
                 app.status === "IN_REVIEW" ? "in-review" : 
                 app.status === "ACTIVE" ? "approved" : 
                 app.status === "REJECTED" ? "rejected" : "pending",
          score: app.score || 0,
          teamSize: app.teamSize || 0,
          stage: app.stage || "بذرة",
          reviewers: app.reviewers || [],
          cohortId: app.cohortId,
          founder: app.founder
        }));
        
        setApplications(mappedApplications);
        setStats({
          pendingCount: data.stats.pendingCount,
          inReviewCount: data.stats.inReviewCount,
          activeCount: data.stats.activeCount,
          rejectedCount: data.stats.rejectedCount,
          totalCount: data.stats.totalCount
        });
      } catch (error) {
        console.error('Error fetching applications:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات الطلبات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [token]);
  
  // Handle status update
  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    if (!token) return;
    
    try {
      // Map UI status to API status
      const apiStatus = newStatus === "in-review" ? "IN_REVIEW" : 
                        newStatus === "approved" ? "ACTIVE" : 
                        newStatus === "rejected" ? "REJECTED" : "PENDING";
      
      const response = await fetch(`/api/program-manager/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: apiStatus,
          cohortId: applications.find(app => app.id === applicationId)?.cohortId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      // Update the application in the local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      // Update stats
      if (newStatus === "in-review") {
        setStats(prev => ({
          ...prev,
          pendingCount: prev.pendingCount - 1,
          inReviewCount: prev.inReviewCount + 1
        }));
      } else if (newStatus === "approved") {
        setStats(prev => ({
          ...prev,
          inReviewCount: prev.inReviewCount - 1,
          activeCount: prev.activeCount + 1
        }));
      } else if (newStatus === "rejected") {
        setStats(prev => ({
          ...prev,
          inReviewCount: prev.inReviewCount - 1,
          rejectedCount: prev.rejectedCount + 1
        }));
      }
      
      showAdminToast({
        title: "تم بنجاح",
        description: "تم تحديث حالة الطلب بنجاح"
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive"
      });
    }
  };

  const filteredApplications = applications.filter((app: Application) => {
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
        <h1 className="text-3xl font-bold">مراجعة الطلبات</h1>
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
      </div>

      {!token ? (
        <div className="flex justify-center items-center py-8">
          <p>يجب تسجيل الدخول أولاً</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mr-2">جاري التحميل...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Clock className="h-8 w-8 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{stats.pendingCount}</div>
                <p className="text-muted-foreground">قيد الانتظار</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <FileCheck className="h-8 w-8 text-amber-500 mb-2" />
                <div className="text-2xl font-bold">{stats.inReviewCount}</div>
                <p className="text-muted-foreground">قيد المراجعة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <div className="text-2xl font-bold">{stats.activeCount}</div>
                <p className="text-muted-foreground">مقبول</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <XCircle className="h-8 w-8 text-red-500 mb-2" />
                <div className="text-2xl font-bold">{stats.rejectedCount}</div>
                <p className="text-muted-foreground">مرفوض</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

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
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, "in-review")}
                        >
                          بدء المراجعة
                        </Button>
                          </>
                        )}
                        {application.status === "in-review" && (
                          <>
                        <Button variant="outline" size="sm">إضافة ملاحظات</Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, "rejected")}
                          >
                            رفض
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, "approved")}
                          >
                            قبول
                          </Button>
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
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, "in-review")}
                        >
                          بدء المراجعة
                        </Button>
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
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, "rejected")}
                          >
                            رفض
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStatusUpdate(application.id, "approved")}
                          >
                            قبول
                          </Button>
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
