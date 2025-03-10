"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AcceleratorDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  // Mock data for the dashboard
  const stats = [
    { title: "Active Programs", value: 3, icon: "🚀" },
    { title: "Startups", value: 24, icon: "💼" },
    { title: "Mentors", value: 18, icon: "👨‍🏫" },
    { title: "Upcoming Events", value: 5, icon: "📅" },
  ]

  const recentActivities = [
    { id: 1, type: "Startup", name: "TechInnovate", action: "joined your program", time: "2 hours ago" },
    { id: 2, type: "Event", name: "Pitch Day", action: "is scheduled", time: "1 day ago" },
    { id: 3, type: "Mentor", name: "John Smith", action: "added feedback", time: "2 days ago" },
    { id: 4, type: "Program", name: "Summer Cohort", action: "applications closing soon", time: "3 days ago" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <Button onClick={() => router.push("/accelerator-dashboard/programs/new")}>
          Create New Program
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your accelerator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {activity.type === "Startup" && "💼"}
                    {activity.type === "Event" && "📅"}
                    {activity.type === "Mentor" && "👨‍🏫"}
                    {activity.type === "Program" && "🚀"}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      <span className="font-bold">{activity.name}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for accelerator managers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start" onClick={() => router.push("/accelerator-dashboard/programs")}>
                <span className="mr-2">🚀</span> Manage Programs
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push("/accelerator-dashboard/startups")}>
                <span className="mr-2">💼</span> View Startups
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push("/accelerator-dashboard/events/new")}>
                <span className="mr-2">📅</span> Schedule Event
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push("/accelerator-dashboard/mentors")}>
                <span className="mr-2">👨‍🏫</span> Assign Mentors
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push("/accelerator-dashboard/resources/new")}>
                <span className="mr-2">📚</span> Add Resource
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push("/accelerator-dashboard/reports")}>
                <span className="mr-2">📈</span> Generate Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
