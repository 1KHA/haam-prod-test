"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Loader2
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

interface Founder {
  id: string
  name: string
  email: string
}

interface TeamMember {
  id: string
  name: string
  position: string
  email: string
  phone: string
  avatar: string | null
  department: string
}

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  status: string
  progress: number
}

interface Mentor {
  id: string
  name: string
  expertise: string
  avatar: string | null
  nextSession: string
}

interface FundingRound {
  id: string
  type: string
  amount: string
  date: string
  source: string
}

interface Funding {
  total: string
  rounds: FundingRound[]
}

interface Cohort {
  id: string
  name: string
  program: string
  startDate: string
  endDate: string
  status: string
}

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  description: string
  problem: string
  solution: string
  targetMarket: string | null
  businessModel: string | null
  competitiveAdvantage: string | null
  teamSize: number
  fundingNeeds: string | null
  pitchDeckUrl: string | null
  status: string
  progress: number
  cohort: Cohort | null
  funding: Funding
  createdAt: string
  updatedAt: string
  founder: Founder
  team: TeamMember[]
  milestones: Milestone[]
  mentors: Mentor[]
}

export default function StartupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch startup data
  useEffect(() => {
    if (!token) return;
    
    const fetchStartup = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/program-manager/startups/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch startup details');
        }
        
        const data = await response.json();
        setStartup(data);
      } catch (error) {
        console.error('Error fetching startup details:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات الشركة الناشئة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStartup();
  }, [token, params.id]);

  if (!token) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>يجب تسجيل الدخول أولاً</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mr-2">جاري التحميل...</p>
      </div>
    );
  }
  
  if (!startup) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>لم يتم العثور على بيانات الشركة الناشئة</p>
      </div>
    );
  }

  const getStatusColor = (status: string, progress: number) => {
    if (status === "at-risk") return "bg-red-500"
    if (progress >= 75) return "bg-green-500"
    if (progress >= 50) return "bg-amber-500"
    return "bg-blue-500"
  }
  
  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-500"
      case "completed": return "text-green-500"
      case "not-started": return "text-muted-foreground"
      default: return "text-muted-foreground"
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>العودة</span>
        </Button>
        <h1 className="text-3xl font-bold">{startup.name}</h1>
      </div>
      
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(startup.status, startup.progress)}`}></div>
                <span className="text-sm font-medium">
                  {startup.status === "at-risk" ? "تحتاج اهتمام" : "نشطة"}
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{startup.name}</h2>
              <div className="text-muted-foreground mb-4">{startup.industry}</div>
              <p className="mb-4">{startup.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">المرحلة</div>
                  <div className="font-medium">{startup.stage}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">حجم الفريق</div>
                  <div className="font-medium">{startup.teamSize} أعضاء</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">المجموعة</div>
                  <div className="font-medium">{startup.cohort ? startup.cohort.name : "غير محدد"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">البرنامج</div>
                  <div className="font-medium">{startup.cohort ? startup.cohort.program : "غير محدد"}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-between md:w-64">
              <div>
                <div className="text-sm font-medium mb-1">التقدم العام</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getStatusColor(startup.status, startup.progress)}`} 
                      style={{ width: `${startup.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{startup.progress}%</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => router.push(`/program-manager-dashboard/startups/${startup.id}/edit`)}
                >
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل الشركة
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/program-manager-dashboard/startups/${startup.id}/milestones`)}
                >
                  إدارة المراحل
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="mentors">المرشدين</TabsTrigger>
          <TabsTrigger value="funding">التمويل</TabsTrigger>
          <TabsTrigger value="team">الفريق</TabsTrigger>
          <TabsTrigger value="milestones">المراحل</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>المشكلة</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{startup.problem}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>الحل</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{startup.solution}</p>
              </CardContent>
            </Card>
            
            {startup.targetMarket && (
              <Card>
                <CardHeader>
                  <CardTitle>السوق المستهدف</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{startup.targetMarket}</p>
                </CardContent>
              </Card>
            )}
            
            {startup.businessModel && (
              <Card>
                <CardHeader>
                  <CardTitle>نموذج العمل</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{startup.businessModel}</p>
                </CardContent>
              </Card>
            )}
            
            {startup.competitiveAdvantage && (
              <Card>
                <CardHeader>
                  <CardTitle>الميزة التنافسية</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{startup.competitiveAdvantage}</p>
                </CardContent>
              </Card>
            )}
            
            {startup.fundingNeeds && (
              <Card>
                <CardHeader>
                  <CardTitle>احتياجات التمويل</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{startup.fundingNeeds}</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {startup.pitchDeckUrl && (
            <Card>
              <CardHeader>
                <CardTitle>عرض الشركة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline"
                    onClick={() => startup.pitchDeckUrl && window.open(startup.pitchDeckUrl, '_blank')}
                  >
                    عرض العرض التقديمي
                  </Button>
                  <p className="text-muted-foreground">رابط العرض التقديمي للشركة</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Button 
                onClick={() => router.push(`/program-manager-dashboard/startups/${startup.id}/milestones/new`)}
              >
                إضافة مرحلة جديدة
              </Button>
              <CardTitle>المراحل الرئيسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {startup.milestones.length > 0 ? (
                  startup.milestones.map((milestone) => (
                    <div key={milestone.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className={`${getMilestoneStatusColor(milestone.status)}`}>
                            {milestone.status === "pending" && <Clock className="h-5 w-5" />}
                            {milestone.status === "completed" && <CheckCircle className="h-5 w-5" />}
                            {milestone.status === "not-started" && <AlertCircle className="h-5 w-5" />}
                          </div>
                          <h3 className="font-bold text-lg">{milestone.title}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="mb-4">{milestone.description}</p>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">{milestone.progress}%</span>
                          <span className="text-sm font-medium">التقدم</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between mt-4">
                          <div className="text-sm text-muted-foreground">
                            تاريخ الاستحقاق: {formatDate(milestone.dueDate)}
                          </div>
                          <div className="text-sm font-medium">
                            {milestone.status === "pending" && "قيد التنفيذ"}
                            {milestone.status === "completed" && "مكتمل"}
                            {milestone.status === "not-started" && "لم يبدأ بعد"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد مراحل مضافة بعد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المؤسس</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium">{startup.founder.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium">{startup.founder.name}</div>
                    <div className="text-sm text-muted-foreground">{startup.founder.email}</div>
                  </div>
                </div>
                <div>
                  <Button variant="outline" size="sm">التواصل</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Button>إضافة عضو فريق</Button>
              <CardTitle>أعضاء الفريق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {startup.team.length > 0 ? (
                  startup.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-medium">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.position}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm">{member.email}</div>
                        <div className="text-sm text-muted-foreground">{member.phone}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا يوجد أعضاء فريق مضافين بعد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Funding Tab */}
        <TabsContent value="funding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ملخص التمويل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <Button variant="outline">إضافة جولة تمويل</Button>
                <div>
                  <div className="text-sm text-muted-foreground">إجمالي التمويل</div>
                  <div className="text-2xl font-bold">{startup.funding.total}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>جولات التمويل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {startup.funding.rounds.length > 0 ? (
                  startup.funding.rounds.map((round) => (
                    <div key={round.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{round.amount}</div>
                        <div className="text-sm text-muted-foreground">{round.source}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="font-medium">{round.type}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(round.date)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد جولات تمويل مضافة بعد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Button>إضافة مرشد</Button>
              <CardTitle>المرشدين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {startup.mentors.length > 0 ? (
                  startup.mentors.map((mentor) => (
                    <div key={mentor.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-medium">{mentor.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{mentor.name}</div>
                          <div className="text-sm text-muted-foreground">{mentor.expertise}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm">الجلسة القادمة</div>
                        <div className="text-sm font-medium">{formatDate(mentor.nextSession)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا يوجد مرشدين مضافين بعد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
