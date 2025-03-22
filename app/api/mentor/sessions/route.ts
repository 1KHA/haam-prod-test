import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/auth"

// Define the Session model
interface Session {
  id: string
  startupId: string
  startupName: string
  mentorId: string
  date: string
  time: string
  duration: number
  topic: string
  status: string
  notes?: string
  location?: string
  type: "INDIVIDUAL" | "GROUP"
}

export async function GET(req: NextRequest) {
  try {
    // Get the token from the request headers
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.split(" ")[1]
    
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
    
    // In a real implementation, we would have a sessions table in the database
    // For now, we'll create mock data based on the startups the mentor is assigned to
    
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
        startup: true
      }
    })
    
    // Create mock sessions data
    const today = new Date()
    const sessions: Session[] = []
    const upcomingSessions: Session[] = []
    const completedSessions: Session[] = []
    
    cohortMembers.forEach((member, index) => {
      // Create a few upcoming sessions
      const upcomingDate1 = new Date(today)
      upcomingDate1.setDate(today.getDate() + 2 + index)
      
      const upcomingDate2 = new Date(today)
      upcomingDate2.setDate(today.getDate() + 7 + index)
      
      // Create a few completed sessions
      const completedDate1 = new Date(today)
      completedDate1.setDate(today.getDate() - 5 - index)
      
      const completedDate2 = new Date(today)
      completedDate2.setDate(today.getDate() - 12 - index)
      
      // Add upcoming sessions
      const upcomingSession1: Session = {
        id: `upcoming-${index}-1`,
        startupId: member.startup.id,
        startupName: member.startup.name,
        mentorId: user.id,
        date: upcomingDate1.toISOString().split('T')[0],
        time: "10:00 AM",
        duration: 60,
        topic: "Weekly Progress Review",
        status: "SCHEDULED",
        notes: "Discuss progress on MVP development",
        location: "Online (Zoom)",
        type: "INDIVIDUAL"
      }
      
      const upcomingSession2: Session = {
        id: `upcoming-${index}-2`,
        startupId: member.startup.id,
        startupName: member.startup.name,
        mentorId: user.id,
        date: upcomingDate2.toISOString().split('T')[0],
        time: "2:00 PM",
        duration: 90,
        topic: "Pitch Deck Review",
        status: "SCHEDULED",
        notes: "Prepare for investor presentation",
        location: "Innovation Hub, Room 3",
        type: "INDIVIDUAL"
      }
      
      // Add completed sessions
      const completedSession1: Session = {
        id: `completed-${index}-1`,
        startupId: member.startup.id,
        startupName: member.startup.name,
        mentorId: user.id,
        date: completedDate1.toISOString().split('T')[0],
        time: "11:00 AM",
        duration: 60,
        topic: "Business Model Canvas",
        status: "COMPLETED",
        notes: "Reviewed and refined business model",
        location: "Online (Zoom)",
        type: "INDIVIDUAL"
      }
      
      const completedSession2: Session = {
        id: `completed-${index}-2`,
        startupId: member.startup.id,
        startupName: member.startup.name,
        mentorId: user.id,
        date: completedDate2.toISOString().split('T')[0],
        time: "3:00 PM",
        duration: 45,
        topic: "Marketing Strategy",
        status: "COMPLETED",
        notes: "Discussed go-to-market strategy",
        location: "Innovation Hub, Room 2",
        type: "GROUP"
      }
      
      // Add to respective arrays
      upcomingSessions.push(upcomingSession1, upcomingSession2)
      completedSessions.push(completedSession1, completedSession2)
      sessions.push(upcomingSession1, upcomingSession2, completedSession1, completedSession2)
    })
    
    // Calculate total mentoring hours
    const totalHours = completedSessions.reduce((total, session) => total + session.duration / 60, 0)
    
    return NextResponse.json({
      sessions,
      upcomingSessions,
      completedSessions,
      stats: {
        totalSessions: sessions.length,
        upcomingSessions: upcomingSessions.length,
        completedSessions: completedSessions.length,
        totalHours: Math.round(totalHours * 10) / 10 // Round to 1 decimal place
      }
    })
  } catch (error) {
    console.error("Error fetching mentor sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the token from the request headers
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.split(" ")[1]
    
    // Get the user from the database based on the token
    const user = await prisma.user.findFirst({
      where: {
        role: UserRole.MENTOR
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Parse the request body
    const data = await req.json()
    
    // Validate required fields
    if (!data.startupId || !data.date || !data.time || !data.duration || !data.topic) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // In a real implementation, we would create a new session in the database
    // For now, we'll just return a success message with the mock data
    
    // Get the startup details
    const startup = await prisma.startup.findUnique({
      where: {
        id: data.startupId
      }
    })
    
    if (!startup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      )
    }
    
    // Create a new session object
    const newSession: Session = {
      id: `new-${Date.now()}`,
      startupId: data.startupId,
      startupName: startup.name,
      mentorId: user.id,
      date: data.date,
      time: data.time,
      duration: data.duration,
      topic: data.topic,
      status: "SCHEDULED",
      notes: data.notes,
      location: data.location,
      type: data.type || "INDIVIDUAL"
    }
    
    return NextResponse.json({
      success: true,
      message: "Session scheduled successfully",
      session: newSession
    })
  } catch (error) {
    console.error("Error creating mentor session:", error)
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    )
  }
}
