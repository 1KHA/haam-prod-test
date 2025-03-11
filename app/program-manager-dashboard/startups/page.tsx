"use client"

import { useState } from "react"
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
  AlertCircle 
} from "lucide-react"

export default function StartupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const startups = [
    {
      id: 1,
      name: "تك سوليوشنز",
      industry: "تقنية مالية",
      cohort: "مسرع التقنية المالية",
      stage: "متقدم",
      progress: 85,
      team: 6,
      funding: "500,000 ريال",
      status: "active"
    },
    {
      id: 2,
      name: "باي تك",
      industry: "تقنية مالية",
      cohort: "مسرع التقنية المالية",
      stage: "متوسط",
      progress: 60,
      team: 4,
      funding: "300,000 ريال",
      status: "active"
    },
    {
      id: 3,
      name: "فينتك",
      industry: "تقنية مالية",
      cohort: "مسرع التقنية المالية",
      stage: "متوسط",
      progress: 55,
      team: 5,
      funding: "250,000 ريال",
      status: "active"
    },
    {
      id: 4,
      name: "هيلث تك",
      industry: "تقنيات صحية",
      cohort: "مسرع التقنيات الصحية",
      stage: "متقدم",
      progress: 80,
      team: 7,
      funding: "600,000 ريال",
      status: "active"
    },
    {
      id: 5,
      name: "ميديكال إيه آي",
      industry: "تقنيات صحية",
      cohort: "مسرع التقنيات الصحية",
      stage: "متوسط",
      progress: 65,
      team: 5,
      funding: "400,000 ريال",
      status: "active"
    },
    {
      id: 6,
      name: "دوكتور أونلاين",
      industry: "تقنيات صحية",
      cohort: "مسرع التقنيات الصحية",
      stage: "متأخر",
      progress: 30,
      team: 4,
      funding: "200,000 ريال",
      status: "at-risk"
    },
    {
      id: 7,
      name: "إيدو تك",
      industry: "تقنيات تعليمية",
      cohort: "حاضنة التقنيات الناشئة",
      stage: "مبكر",
      progress: 40,
      team: 3,
      funding: "150,000 ريال",
      status: "active"
    },
    {
      id: 8,
      name: "سمارت ليرن",
      industry: "تقنيات تعليمية",
      cohort: "حاضنة التقنيات الناشئة",
      stage: "مبكر",
      progress: 35,
      team: 3,
      funding: "100,000 ريال",
      status: "active"
    }
  ]

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.includes(searchQuery) || 
                          startup.industry.includes(searchQuery) ||
                          startup.cohort.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "at-risk") return matchesSearch && startup.status === "at-risk"
    if (activeTab === "fintech") return matchesSearch && startup.industry === "تقنية مالية"
    if (activeTab === "healthtech") return matchesSearch && startup.industry === "تقنيات صحية"
    if (activeTab === "edutech") return matchesSearch && startup.industry === "تقنيات تعليمية"
    
    return matchesSearch
  })

  const getStatusColor = (status: string, progress: number) => {
    if (status === "at-risk") return "bg-red-500"
    if (progress >= 75) return "bg-green-500"
    if (progress >= 50) return "bg-amber-500"
    return "bg-blue-500"
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة شركة ناشئة</span>
        </Button>
        <h1 className="text-3xl font-bold">إدارة الشركات الناشئة</h1>
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
              <TabsTrigger value="edutech">تقنيات تعليمية</TabsTrigger>
              <TabsTrigger value="healthtech">تقنيات صحية</TabsTrigger>
              <TabsTrigger value="fintech">تقنية مالية</TabsTrigger>
              <TabsTrigger value="at-risk">تحتاج اهتمام</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStartups.map((startup) => (
                  <div key={startup.id} className="border rounded-lg overflow-hidden">
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
                          <div className="font-medium">{startup.team} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التمويل</div>
                          <div className="font-medium">{startup.funding}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">المزيد</Button>
                        <Button variant="default" size="sm">إدارة</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="at-risk" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStartups.map((startup) => (
                  <div key={startup.id} className="border rounded-lg overflow-hidden">
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
                          <div className="font-medium">{startup.team} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التمويل</div>
                          <div className="font-medium">{startup.funding}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">المزيد</Button>
                        <Button variant="default" size="sm">إدارة</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="fintech" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStartups.map((startup) => (
                  <div key={startup.id} className="border rounded-lg overflow-hidden">
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
                          <div className="font-medium">{startup.team} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التمويل</div>
                          <div className="font-medium">{startup.funding}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">المزيد</Button>
                        <Button variant="default" size="sm">إدارة</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="healthtech" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStartups.map((startup) => (
                  <div key={startup.id} className="border rounded-lg overflow-hidden">
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
                          <div className="font-medium">{startup.team} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التمويل</div>
                          <div className="font-medium">{startup.funding}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">المزيد</Button>
                        <Button variant="default" size="sm">إدارة</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="edutech" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStartups.map((startup) => (
                  <div key={startup.id} className="border rounded-lg overflow-hidden">
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
                          <div className="font-medium">{startup.team} أعضاء</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">التمويل</div>
                          <div className="font-medium">{startup.funding}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">المزيد</Button>
                        <Button variant="default" size="sm">إدارة</Button>
                      </div>
                    </div>
                  </div>
                ))}
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
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 ml-2 text-red-500" />
                  <div>
                    <div className="font-medium">عرض النموذج الأولي</div>
                    <div className="text-sm text-muted-foreground">شركة باي تك</div>
                  </div>
                </div>
                <div className="text-sm">خلال 3 أيام</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 ml-2 text-amber-500" />
                  <div>
                    <div className="font-medium">اختبار المستخدمين</div>
                    <div className="text-sm text-muted-foreground">شركة ميديكال إيه آي</div>
                  </div>
                </div>
                <div className="text-sm">خلال 5 أيام</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                  <div>
                    <div className="font-medium">عرض خطة التسويق</div>
                    <div className="text-sm text-muted-foreground">شركة تك سوليوشنز</div>
                  </div>
                </div>
                <div className="text-sm">خلال أسبوع</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                  <div>
                    <div className="font-medium">تقديم تقرير التقدم</div>
                    <div className="text-sm text-muted-foreground">شركة هيلث تك</div>
                  </div>
                </div>
                <div className="text-sm">خلال 10 أيام</div>
              </div>
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
                <div className="text-3xl font-bold">8</div>
                <p className="text-muted-foreground">شركات نشطة</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">3</div>
                <p className="text-muted-foreground">دفعات</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">56%</div>
                <p className="text-muted-foreground">متوسط التقدم</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">2.5M</div>
                <p className="text-muted-foreground">إجمالي التمويل (ريال)</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-bold mb-3">توزيع الشركات حسب المجال</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">37.5%</div>
                    <div className="text-sm font-medium">تقنية مالية</div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "37.5%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">37.5%</div>
                    <div className="text-sm font-medium">تقنيات صحية</div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "37.5%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">25%</div>
                    <div className="text-sm font-medium">تقنيات تعليمية</div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
