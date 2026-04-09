"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, Calendar, Loader2 } from "lucide-react"

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  description: string
  teamSize: number
  status: string
  cohort: {
    id: string
    name: string
    startDate: string
    endDate: string
  }
}

export default function MentorStartupsPage() {
  const router = useRouter()
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchStartups = async () => {
      const token = localStorage.getItem("token")
      setLoading(true)
      try {
        const res = await fetch("/api/mentor/startups", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setStartups(data.startups || [])
        }
      } catch {
        // handled silently
      } finally {
        setLoading(false)
      }
    }
    fetchStartups()
  }, [])

  const filteredStartups = startups.filter((s) => {
    const matchesSearch =
      s.name.includes(searchQuery) ||
      s.industry.includes(searchQuery) ||
      s.stage.includes(searchQuery)
    if (activeTab === "all") return matchesSearch
    return matchesSearch && s.stage.toLowerCase() === activeTab
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-green-100 text-green-800">نشط</Badge>
      case "PENDING": return <Badge variant="outline">قيد المراجعة</Badge>
      case "REJECTED": return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold">الشركات الناشئة</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{startups.length}</div>
            <p className="text-muted-foreground">إجمالي الشركات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{startups.filter((s) => s.status === "APPROVED").length}</div>
            <p className="text-muted-foreground">شركات نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {startups.reduce((sum, s) => sum + (s.teamSize || 0), 0)}
            </div>
            <p className="text-muted-foreground">إجمالي أعضاء الفرق</p>
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
              <TabsTrigger value="growth">نمو</TabsTrigger>
              <TabsTrigger value="mvp">MVP</TabsTrigger>
              <TabsTrigger value="idea">فكرة</TabsTrigger>
              <TabsTrigger value="all">الكل</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredStartups.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">لا توجد شركات ناشئة</div>
            ) : (
              filteredStartups.map((startup) => (
                <div key={startup.id} className="border rounded-lg overflow-hidden mt-4">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(startup.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{startup.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">المجال</div>
                        <div className="font-medium">{startup.industry}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">المرحلة</div>
                        <div className="font-medium">{startup.stage}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">الدفعة</div>
                        <div className="font-medium">{startup.cohort.name}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground">الوصف</div>
                      <p className="text-muted-foreground text-sm">{startup.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">حجم الفريق</div>
                        <div className="font-medium">{startup.teamSize} أشخاص</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">تاريخ انتهاء الدفعة</div>
                        <div className="font-medium">{new Date(startup.cohort.endDate).toLocaleDateString("ar-SA")}</div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/mentor-dashboard/sessions/new?startupId=${startup.id}`)}
                      >
                        جدولة جلسة
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
