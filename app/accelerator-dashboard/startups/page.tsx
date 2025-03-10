"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AcceleratorStartups() {
  const { user } = useAuth()
  const router = useRouter()

  // Mock data for startups
  const startups = [
    {
      id: "1",
      name: "TechInnovate",
      logo: "🚀",
      industry: "SaaS",
      stage: "Seed",
      program: "Summer Cohort 2025",
      description: "AI-powered project management platform for remote teams",
      founders: "Sarah Johnson, Michael Chen",
      progress: 75,
    },
    {
      id: "2",
      name: "HealthTrack",
      logo: "🏥",
      industry: "Healthcare",
      stage: "Pre-seed",
      program: "Healthcare Innovation",
      description: "Mobile app for tracking health metrics and medication adherence",
      founders: "Dr. James Wilson, Emma Rodriguez",
      progress: 60,
    },
    {
      id: "3",
      name: "FinFlow",
      logo: "💰",
      industry: "FinTech",
      stage: "Seed",
      program: "FinTech Accelerator",
      description: "Automated financial planning and investment platform for millennials",
      founders: "Alex Thompson, Priya Patel",
      progress: 80,
    },
    {
      id: "4",
      name: "GreenGrow",
      logo: "🌱",
      industry: "AgTech",
      stage: "Series A",
      program: "Summer Cohort 2025",
      description: "Smart farming solutions using IoT and data analytics",
      founders: "Robert Garcia, Lisa Wong",
      progress: 90,
    },
    {
      id: "5",
      name: "EduSpark",
      logo: "📚",
      industry: "EdTech",
      stage: "Seed",
      program: "Winter Cohort 2024",
      description: "Personalized learning platform using AI to adapt to student needs",
      founders: "David Kim, Sophia Martinez",
      progress: 65,
    },
    {
      id: "6",
      name: "RetailAI",
      logo: "🛒",
      industry: "Retail",
      stage: "Pre-seed",
      program: "Summer Cohort 2025",
      description: "AI-powered inventory management and demand forecasting for retailers",
      founders: "Jennifer Lee, Omar Hassan",
      progress: 40,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Startups</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/accelerator-dashboard/startups/invite")}>
            Invite Startup
          </Button>
          <Button onClick={() => router.push("/accelerator-dashboard/startups/applications")}>
            View Applications
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startups.map((startup) => (
          <Card key={startup.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="text-3xl">{startup.logo}</div>
                  <div>
                    <CardTitle>{startup.name}</CardTitle>
                    <CardDescription>{startup.industry} • {startup.stage}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <p className="text-sm">{startup.description}</p>
                <div className="text-sm">
                  <span className="text-muted-foreground">Founders:</span> {startup.founders}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Program:</span> {startup.program}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span>{startup.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${startup.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => router.push(`/accelerator-dashboard/startups/${startup.id}`)}>
                View Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/accelerator-dashboard/startups/${startup.id}/mentor`)}>
                Assign Mentor
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
