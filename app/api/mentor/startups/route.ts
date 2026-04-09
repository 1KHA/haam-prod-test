import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const user = await isAuthenticated(authHeader || undefined)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (user.role !== UserRole.MENTOR && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all cohorts where this mentor is assigned
    const mentorCohorts = await prisma.cohortMentor.findMany({
      where: { userId: user.userId },
      include: { cohort: true },
    })

    const cohortIds = mentorCohorts.map((mc) => mc.cohortId)

    // Get all startups in those cohorts
    const cohortMembers = await prisma.cohortMember.findMany({
      where: { cohortId: { in: cohortIds } },
      include: {
        startup: true,
        cohort: true,
      },
    })

    const startups = cohortMembers.map((member) => ({
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
        endDate: member.cohort.endDate.toISOString(),
      },
    }))

    return NextResponse.json({ startups })
  } catch (error) {
    console.error("Error fetching mentor startups:", error)
    return NextResponse.json({ error: "Failed to fetch startups" }, { status: 500 })
  }
}
