"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowRight, 
  Calendar, 
  Filter, 
  Plus, 
  Search,
  Clock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Session {
  id: string
  startupId: string
  startupName: string
  date: string
  time: string
  duration: number
  topic: string
  status: string
  notes?: string
  location?: string
  type: "INDIVIDUAL" | "GROUP"
}

export default function MentorSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [completedSessions, setCompletedSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [startupFilter, setStartupFilter] = useState<string | null>(null)
  const [startups, setStartups] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch("/api/mentor/sessions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch sessions")
        }
        
        const data = await response.json()
        
        setSessions(data.sessions || [])
        setUpcomingSessions(data.upcomingSessions || [])
        setCompletedSessions(data.completedSessions || [])
        
        // Extract unique startups for filters
        const uniqueStartups = Array.from(
          new Set(data.sessions.map((s: Session) => s.startupId))
        ).map((startupId) => {
          const session = data.sessions.find((s: Session) => s.startupId === startupId)
          return {
            id: startupId as string,
            name: session?.startupName || "Unknown Startup"
          }
        })
        
        setStartups(uniqueStartups)
      } catch (error) {
        console.error("Error fetching sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSessions()
  }, [])

  // Filter sessions based on search and filters
  const filterSessions = (sessionsList: Session[]) => {
    let filtered = [...sessionsList]
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        session => 
          session.startupName.toLowerCase().includes(query) || 
          session.topic.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(session => session.status === statusFilter)
    }
    
    // Apply startup filter
    if (startupFilter) {
      filtered = filtered.filter(session => session.startupId === startupFilter)
    }
    
    return filtered
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter(null)
    setStartupFilter(null)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">جلسات التوجيه</h1>
        <Button onClick={() => router.push("/mentor-dashboard/sessions/new")}>
          <Plus className="ml-2 h-4 w-4" />
          جلسة جديدة
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث عن جلسة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>الشركة الناشئة</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {startups.map((startup) => (
                <DropdownMenuItem 
                  key={startup.id}
                  onClick={() => setStartupFilter(startup.id)}
                  className={startupFilter === startup.id ? "bg-primary/10" : ""}
                >
                  {startup.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>الحالة</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setStatusFilter("SCHEDULED")}
                className={statusFilter === "SCHEDULED" ? "bg-primary/10" : ""}
              >
                مجدولة
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter("COMPLETED")}
                className={statusFilter === "COMPLETED" ? "bg-primary/10" : ""}
              >
                مكتملة
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter("CANCELLED")}
                className={statusFilter === "CANCELLED" ? "bg-primary/10" : ""}
              >
                ملغاة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(searchQuery || statusFilter || startupFilter) && (
            <Button variant="ghost" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          )}
        </div>
      </div>
      
      {/* Sessions Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">الجلسات القادمة</TabsTrigger>
          <TabsTrigger value="completed">الجلسات المكتملة</TabsTrigger>
          <TabsTrigger value="all">كل الجلسات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {renderSessionsList(filterSessions(upcomingSessions))}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderSessionsList(filterSessions(completedSessions))}
        </TabsContent>
        
        <TabsContent value="all">
          {renderSessionsList(filterSessions(sessions))}
        </TabsContent>
      </Tabs>
    </div>
  )
  
  function renderSessionsList(sessionsList: Session[]) {
    if (sessionsList.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">لا توجد جلسات مطابقة للفلاتر المحددة</p>
          {(searchQuery || statusFilter || startupFilter) && (
            <Button variant="link" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          )}
        </div>
      )
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessionsList.map((session) => (
          <Card key={session.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{session.topic}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{session.date} - {session.time}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">الشركة الناشئة:</span> {session.startupName}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">المدة:</span> {session.duration} دقيقة
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">النوع:</span> {session.type === "INDIVIDUAL" ? "فردية" : "جماعية"}
                </div>
                {session.location && (
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">المكان:</span> {session.location}
                  </div>
                )}
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">الحالة:</span>{" "}
                  <span className={
                    session.status === "SCHEDULED" ? "text-blue-600" :
                    session.status === "COMPLETED" ? "text-green-600" :
                    "text-red-600"
                  }>
                    {session.status === "SCHEDULED" ? "مجدولة" :
                     session.status === "COMPLETED" ? "مكتملة" :
                     "ملغاة"}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <Link 
                  href={`/mentor-dashboard/sessions/${session.id}`} 
                  className="text-primary flex items-center text-sm hover:underline"
                >
                  عرض التفاصيل
                  <ArrowRight className="h-4 w-4 mr-1" />
                </Link>
                
                {session.status === "SCHEDULED" && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/mentor-dashboard/sessions/${session.id}/edit`)}
                    >
                      تعديل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/mentor-dashboard/feedback/new?sessionId=${session.id}`)}
                    >
                      <Clock className="h-4 w-4 ml-1" />
                      بدء
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}
