import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Get the token from the request headers
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.split(" ")[1]
    
    // Verify the token and get the user
    // In a real implementation, you would verify the JWT token
    // For now, we'll just get the user from localStorage on the client side
    
    // Get the user from the database based on the token
    // This is a simplified example - in a real app, you would decode the JWT
    const user = await prisma.user.findFirst({
      where: {
        role: UserRole.MENTOR
      },
      include: {
        mentorProfile: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get all cohorts where the user is a mentor
    const mentorCohorts = await prisma.cohortMentor.findMany({
      where: {
        userId: user.id
      },
      include: {
        cohort: true
      }
    })
    
    const cohortIds = mentorCohorts.map(mc => mc.cohortId)
    
    // Get all startups in those cohorts
    const cohortMembers = await prisma.cohortMember.findMany({
      where: {
        cohortId: {
          in: cohortIds
        }
      },
      include: {
        startup: true,
        cohort: true
      }
    })
    
    // Format the startups data
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
        startDate: member.cohort.startDate.toISOString(),
        endDate: member.cohort.endDate.toISOString()
      }
    }))
    
    return NextResponse.json({ startups })
  } catch (error) {
    console.error("Error fetching mentor startups:", error)
    return NextResponse.json(
      { error: "Failed to fetch startups" },
      { status: 500 }
    )
  }
}
