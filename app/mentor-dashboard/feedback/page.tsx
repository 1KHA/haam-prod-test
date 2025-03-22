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
  Star,
  MessageSquare
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

interface Feedback {
  id: string
  startupId: string
  startupName: string
  sessionId?: string
  sessionTopic?: string
  date: string
  rating: number
  content: string
  category: string
  status: string
}

export default function MentorFeedbackPage() {
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [startupFilter, setStartupFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [startups, setStartups] = useState<{id: string, name: string}[]>([])
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch("/api/mentor/feedback", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch feedback")
        }
        
        const data = await response.json()
        
        setFeedback(data.feedback || [])
        
        // Extract unique startups for filters
        const uniqueStartups = Array.from(
          new Set(data.feedback.map((f: Feedback) => f.startupId))
        ).map((startupId) => {
          const feedbackItem = data.feedback.find((f: Feedback) => f.startupId === startupId)
          return {
            id: startupId as string,
            name: feedbackItem?.startupName || "Unknown Startup"
          }
        })
        
        setStartups(uniqueStartups)
        
        // Extract unique categories for filters
        const uniqueCategories = Array.from(
          new Set(data.feedback.map((f: Feedback) => f.category))
        )
        
        setCategories(uniqueCategories as string[])
      } catch (error) {
        console.error("Error fetching feedback:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFeedback()
  }, [])

  // Filter feedback based on search and filters
  const filteredFeedback = () => {
    let filtered = [...feedback]
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item => 
          item.startupName.toLowerCase().includes(query) || 
          item.content.toLowerCase().includes(query) ||
          (item.sessionTopic && item.sessionTopic.toLowerCase().includes(query))
      )
    }
    
    // Apply startup filter
    if (startupFilter) {
      filtered = filtered.filter(item => item.startupId === startupFilter)
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }
    
    return filtered
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setStartupFilter(null)
    setCategoryFilter(null)
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
        />
      ))
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الملاحظات والتقييمات</h1>
        <Button onClick={() => router.push("/mentor-dashboard/feedback/new")}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة ملاحظات
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث في الملاحظات..."
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
                <span>التصنيف</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {categories.map((category) => (
                <DropdownMenuItem 
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={categoryFilter === category ? "bg-primary/10" : ""}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(searchQuery || startupFilter || categoryFilter) && (
            <Button variant="ghost" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          )}
        </div>
      </div>
      
      {/* Feedback List */}
      {filteredFeedback().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedback().map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.startupName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{item.date}</span>
                    </CardDescription>
                  </div>
                  <div className="flex">{renderStars(item.rating)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {item.sessionTopic && (
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">الجلسة:</span> {item.sessionTopic}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">التصنيف:</span> {item.category}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    <span className="font-medium">الحالة:</span>{" "}
                    <span className={
                      item.status === "DRAFT" ? "text-yellow-600" :
                      item.status === "PUBLISHED" ? "text-green-600" :
                      "text-blue-600"
                    }>
                      {item.status === "DRAFT" ? "مسودة" :
                       item.status === "PUBLISHED" ? "منشورة" :
                       "قيد المراجعة"}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-3">{item.content}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <Link 
                    href={`/mentor-dashboard/feedback/${item.id}`} 
                    className="text-primary flex items-center text-sm hover:underline"
                  >
                    عرض التفاصيل
                    <ArrowRight className="h-4 w-4 mr-1" />
                  </Link>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/mentor-dashboard/feedback/${item.id}/edit`)}
                    >
                      تعديل
                    </Button>
                    {item.status === "DRAFT" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Publish feedback logic
                          console.log("Publishing feedback:", item.id)
                        }}
                      >
                        <MessageSquare className="h-4 w-4 ml-1" />
                        نشر
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">لا توجد ملاحظات مطابقة للفلاتر المحددة</p>
          {(searchQuery || startupFilter || categoryFilter) && (
            <Button variant="link" onClick={clearFilters}>
              مسح الفلاتر
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
