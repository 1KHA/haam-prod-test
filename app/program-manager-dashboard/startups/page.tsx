"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

interface Startup {
  id: string
  name: string
  industry: string
  cohort: string
  cohortId: string | null
  stage: string
  progress: number
  teamSize: number
  funding: string
  status: string
}

interface Milestone {
  id: string
  title: string
  startupName: string
  dueIn: string
  status: string
}

interface Cohort {
  id: string
  name: string
  status: string
}

interface Stats {
  total: number
  active: number
  atRisk: number
  avgProgress: number
  totalFunding: number
  industries: Record<string, number>
}

interface StartupsData {
  startups: Startup[]
  cohorts: Cohort[]
  milestones: Milestone[]
  stats: Stats
}

export default function StartupsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [data, setData] = useState<StartupsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch startups data
  useEffect(() => {
    if (!token) return;
    
    const fetchStartups = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/program-manager/startups', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch startups');
        }
        
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching startups:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات الشركات الناشئة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStartups();
  }, [token]);

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
  
  if (!data) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>لم يتم العثور على بيانات</p>
      </div>
    );
  }

  const filteredStartups = data.startups.filter(startup => {
    const matchesSearch = 
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      startup.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.cohort.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "at-risk") return matchesSearch && startup.status === "at-risk"
    
    // Filter by industry
    return matchesSearch && startup.industry.toLowerCase().includes(activeTab.toLowerCase())
  })

  const getStatusColor = (status: string, progress: number) => {
    if (status === "at-risk") return "bg-red-500"
    if (progress >= 75) return "bg-green-500"
    if (progress >= 50) return "bg-amber-500"
    return "bg-blue-500"
  }

  // Get unique industries for tabs
  const industries = Object.keys(data.stats.industries || {});

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button 
          className="flex items-center gap-2"
          onClick={() => router.push('/program-manager-dashboard/startups/new')}
        >
          <Plus className="h-4 w-4" />
          <span>إضافة شركة ناشئة</span>
        </Button>
        <h1 className="text-3xl font-bold">إدارة الشركات الناشئة</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الشركات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الشركات النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الشركات المعرضة للخطر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.atRisk}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقدم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.avgProgress}%</div>
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
            <CardTitle>الشركات الناشئة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              {industries.map(industry => (
                <TabsTrigger key={industry} value={industry}>{industry}</TabsTrigger>
              ))}
              <TabsTrigger value="at-risk">تحتاج اهتمام</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStartups.length > 0 ? (
                  filteredStartups.map((startup) => (
                    <div 
                      key={startup.id} 
                      className="border rounded-lg overflow-hidden hover:border-primary cursor-pointer"
                      onClick={() => router.push(`/program-manager-dashboard/startups/${startup.id}`)}
                    >
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(startup.status, startup.progress)}`}></div>
                          <h3 className="font-bold text-lg">{startup.name}</h3>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{startup.industry}</div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">{startup.progress}%</span>
                          <span className="text-sm font-medium">التقدم العام</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getStatusColor(startup.status, startup.progress)}`} 
                            style={{ width: `${startup.progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <div className="text-sm text-muted-foreground">الدفعة</div>
                            <div className="font-medium">{startup.cohort}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">المرحلة</div>
                            <div className="font-medium">{startup.stage}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">حجم الفريق</div>
                            <div className="font-medium">{startup.teamSize} أعضاء</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">التمويل</div>
                            <div className="font-medium">{startup.funding}</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/program-manager-dashboard/startups/${startup.id}`);
                            }}
                          >
                            المزيد
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/program-manager-dashboard/startups/${startup.id}/edit`);
                            }}
                          >
                            إدارة
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-8 text-center">
                    <p className="text-muted-foreground">لم يتم العثور على شركات ناشئة</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المراحل الرئيسية القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    {milestone.status === "urgent" && (
                      <AlertCircle className="h-5 w-5 ml-2 text-red-500" />
                    )}
                    {milestone.status === "upcoming" && (
                      <Clock className="h-5 w-5 ml-2 text-amber-500" />
                    )}
                    {milestone.status === "normal" && (
                      <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                    )}
                    <div>
                      <div className="font-medium">{milestone.title}</div>
                      <div className="text-sm text-muted-foreground">{milestone.startupName}</div>
                    </div>
                  </div>
                  <div className="text-sm">{milestone.dueIn}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الشركات الناشئة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{data.stats.active}</div>
                <p className="text-muted-foreground">شركات نشطة</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{data.cohorts.length}</div>
                <p className="text-muted-foreground">دفعات</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{data.stats.avgProgress}%</div>
                <p className="text-muted-foreground">متوسط التقدم</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{(data.stats.totalFunding / 1000000).toFixed(1)}M</div>
                <p className="text-muted-foreground">إجمالي التمويل (ريال)</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-bold mb-3">توزيع الشركات حسب المجال</h3>
              <div className="space-y-3">
                {industries.map(industry => {
                  const count = data.stats.industries[industry];
                  const percentage = Math.round((count / data.stats.total) * 100);
                  
                  return (
                    <div key={industry}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm">{percentage}%</div>
                        <div className="text-sm font-medium">{industry}</div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
