"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AcceleratorPrograms() {
  const { user } = useAuth()
  const router = useRouter()

  // Mock data for programs
  const programs = [
    {
      id: "1",
      name: "Summer Cohort 2025",
      description: "3-month intensive program for early-stage startups",
      startDate: "June 1, 2025",
      endDate: "August 31, 2025",
      status: "Upcoming",
      startups: 12,
      mentors: 8,
    },
    {
      id: "2",
      name: "FinTech Accelerator",
      description: "Specialized program for financial technology startups",
      startDate: "April 15, 2025",
      endDate: "October 15, 2025",
      status: "Active",
      startups: 8,
      mentors: 6,
    },
    {
      id: "3",
      name: "Healthcare Innovation",
      description: "Supporting startups in the healthcare and wellness sector",
      startDate: "March 1, 2025",
      endDate: "September 1, 2025",
      status: "Active",
      startups: 10,
      mentors: 7,
    },
    {
      id: "4",
      name: "Winter Cohort 2024",
      description: "3-month intensive program for early-stage startups",
      startDate: "January 1, 2025",
      endDate: "March 31, 2025",
      status: "Completed",
      startups: 15,
      mentors: 9,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programs</h1>
        <Button onClick={() => router.push("/accelerator-dashboard/programs/new")}>
          Create New Program
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programs.map((program) => (
          <Card key={program.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{program.name}</CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  program.status === "Active" ? "bg-green-100 text-green-800" :
                  program.status === "Upcoming" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {program.status}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{program.startDate} - {program.endDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Startups:</span>
                  <span>{program.startups}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mentors:</span>
                  <span>{program.mentors}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => router.push(`/accelerator-dashboard/programs/${program.id}`)}>
                View Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/accelerator-dashboard/programs/${program.id}/edit`)}>
                Edit Program
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
