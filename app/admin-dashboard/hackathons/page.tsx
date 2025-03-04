"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Code,
  Layers
} from "lucide-react"

export default function AdminHackathonsPage() {
  const [activeTab, setActiveTab] = useState("active")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Mock data for hackathons
  const activeHackathons = [
    {
      id: 1,
      name: "هاكاثون الذكاء الاصطناعي 2025",
      startDate: "15 مارس 2025",
      endDate: "17 مارس 2025",
      participants: 120,
      teams: 30,
      submissions: 28,
      status: "جاري"
    },
    {
      id: 2,
      name: "هاكاثون التقنية المالية",
      startDate: "5 أبريل 2025",
      endDate: "7 أبريل 2025",
      participants: 80,
      teams: 20,
      submissions: 0,
      status: "قريباً"
    }
  ]

  const pastHackathons = [
    {
      id: 3,
      name: "هاكاثون التقنيات الصحية 2024",
      startDate: "10 فبراير 2024",
      endDate: "12 فبراير 2024",
      participants: 150,
      teams: 35,
      submissions: 32,
      status: "مكتمل",
      winner: "فريق هيلث تك"
    },
    {
      id: 4,
      name: "هاكاثون التعليم التقني 2024",
      startDate: "5 يناير 2024",
      endDate: "7 يناير 2024",
      participants: 100,
      teams: 25,
      submissions: 23,
      status: "مكتمل",
      winner: "فريق إيدو تك"
    }
  ]

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة هاكاثون جديد</span>
        </Button>
        <h1 className="text-3xl font-bold">إدارة الهاكاثونات</h1>
      </div>

      <div className="flex justify-end gap-4 mb-6">
        <div className="relative w-64">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث عن هاكاثون..." className="pr-8 w-full" />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>تصفية</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="past">الهاكاثونات السابقة</TabsTrigger>
          <TabsTrigger value="active">الهاكاثونات النشطة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeHackathons.map((hackathon, index) => (
              <motion.div 
                key={hackathon.id}
                variants={cardVariants} 
                initial="hidden" 
                animate="visible" 
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 text-xs rounded-full ${hackathon.status === "جاري" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                        {hackathon.status}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{hackathon.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-end gap-8">
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ النهاية</p>
                          <p className="font-medium">{hackathon.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ البداية</p>
                          <p className="font-medium">{hackathon.startDate}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <Users className="h-5 w-5 mb-1 text-primary" />
                          <span className="text-lg font-bold">{hackathon.participants}</span>
                          <span className="text-xs text-muted-foreground">مشارك</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <Layers className="h-5 w-5 mb-1 text-primary" />
                          <span className="text-lg font-bold">{hackathon.teams}</span>
                          <span className="text-xs text-muted-foreground">فريق</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <Code className="h-5 w-5 mb-1 text-primary" />
                          <span className="text-lg font-bold">{hackathon.submissions}</span>
                          <span className="text-xs text-muted-foreground">مشروع</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">تعديل</Button>
                        <Button variant="default" size="sm">عرض التفاصيل</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="past">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastHackathons.map((hackathon, index) => (
              <motion.div 
                key={hackathon.id}
                variants={cardVariants} 
                initial="hidden" 
                animate="visible" 
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {hackathon.status}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{hackathon.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-end gap-8">
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ النهاية</p>
                          <p className="font-medium">{hackathon.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ البداية</p>
                          <p className="font-medium">{hackathon.startDate}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <Users className="h-5 w-5 mb-1 text-primary" />
                          <span className="text-lg font-bold">{hackathon.participants}</span>
                          <span className="text-xs text-muted-foreground">مشارك</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <Layers className="h-5 w-5 mb-1 text-primary" />
                          <span className="text-lg font-bold">{hackathon.teams}</span>
                          <span className="text-xs text-muted-foreground">فريق</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <Code className="h-5 w-5 mb-1 text-primary" />
                          <span className="text-lg font-bold">{hackathon.submissions}</span>
                          <span className="text-xs text-muted-foreground">مشروع</span>
                        </div>
                      </div>
                      
                      <div className="border-r-4 border-green-500 pr-4 py-2 mt-4">
                        <h3 className="font-bold">الفائز: {hackathon.winner}</h3>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">تصدير التقرير</Button>
                        <Button variant="default" size="sm">عرض التفاصيل</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
