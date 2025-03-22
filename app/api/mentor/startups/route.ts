import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

// GET /api/mentor/startups - Get startups assigned to the mentor
export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    // Check if user is authenticated
    const userData = await isAuthenticated(authHeader || undefined);
    
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userData.userId },
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    if (user.role !== UserRole.MENTOR) {
      return NextResponse.json({ error: "User is not a mentor" }, { status: 403 })
    }
    
    // Get cohorts where the user is a mentor
    const cohortMentorships = await prisma.cohortMentor.findMany({
      where: { userId: user.id },
      include: { cohort: true }
    })
    
    const cohortIds = cohortMentorships.map(cm => cm.cohortId)
    
    // Get startups in those cohorts
    const cohortMembers = await prisma.cohortMember.findMany({
      where: { 
        cohortId: { in: cohortIds },
        status: "ACTIVE" 
      },
      include: {
        startup: true,
        cohort: true
      }
    })
    
    // Format the response
    const startups = cohortMembers.map(member => ({
      id: member.startup.id,
      name: member.startup.name,
      industry: member.startup.industry,
      stage: member.startup.stage,
      description: member.startup.description,
      teamSize: member.startup.teamSize,
      status: member.startup.status,
      cohort: {
        id: member.cohort.id,
        name: member.cohort.name,
        startDate: member.cohort.startDate,
        endDate: member.cohort.endDate
      }
    }))
    
    // Define interfaces for session and feedback
    interface MentorSession {
      id: string
      startupId: string
      startupName: string
      date: string
      time: string
      duration: number
      topic: string
      status: string
    }
    
    interface MentorFeedback {
      id: string
      startupId: string
      startupName: string
      date: string
      rating: number
      comment: string
    }
    
    // Get upcoming sessions (this would be implemented in a real system)
    const upcomingSessions: MentorSession[] = []
    
    // Get recent feedback (this would be implemented in a real system)
    const recentFeedback: MentorFeedback[] = []
    
    return NextResponse.json({
      startups,
      upcomingSessions,
      recentFeedback,
      stats: {
        total: startups.length,
        byIndustry: startups.reduce((acc, startup) => {
          acc[startup.industry] = (acc[startup.industry] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        byStage: startups.reduce((acc, startup) => {
          acc[startup.stage] = (acc[startup.stage] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    })
  } catch (error) {
    console.error("Error fetching mentor startups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
