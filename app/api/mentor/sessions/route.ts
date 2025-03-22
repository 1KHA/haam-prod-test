import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

// Define interfaces for session data
interface MentorSession {
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

// GET /api/mentor/sessions - Get mentor sessions
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
    
    // In a real implementation, we would fetch sessions from the database
    // For now, we'll return mock data
    
    // Get query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const startupId = url.searchParams.get('startupId')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    
    // Mock sessions data
    const mockSessions: MentorSession[] = [
      {
        id: "1",
        startupId: "1",
        startupName: "هيلث تك",
        date: "2025-03-25",
        time: "15:00",
        duration: 60,
        topic: "مراجعة النموذج الأولي",
        status: "SCHEDULED",
        type: "INDIVIDUAL",
        location: "عبر الإنترنت"
      },
      {
        id: "2",
        startupId: "2",
        startupName: "ميديكال إيه آي",
        date: "2025-03-26",
        time: "11:00",
        duration: 60,
        topic: "مناقشة تحديات تطوير الخوارزميات",
        status: "SCHEDULED",
        type: "INDIVIDUAL",
        location: "عبر الإنترنت"
      },
      {
        id: "3",
        startupId: "3",
        startupName: "جلسة جماعية",
        date: "2025-03-28",
        time: "14:00",
        duration: 120,
        topic: "مناقشة تحديات التسويق في مجال التقنيات الصحية",
        status: "SCHEDULED",
        type: "GROUP",
        location: "مقر البرنامج"
      },
      {
        id: "4",
        startupId: "1",
        startupName: "هيلث تك",
        date: "2025-02-25",
        time: "15:00",
        duration: 60,
        topic: "مناقشة خطة تطوير المنتج",
        status: "COMPLETED",
        type: "INDIVIDUAL",
        notes: "تم مناقشة خطة تطوير المنتج وتحديد الخطوات القادمة"
      },
      {
        id: "5",
        startupId: "2",
        startupName: "ميديكال إيه آي",
        date: "2025-02-20",
        time: "11:00",
        duration: 60,
        topic: "مراجعة خطة العمل",
        status: "COMPLETED",
        type: "INDIVIDUAL",
        notes: "تم مراجعة خطة العمل وتقديم ملاحظات"
      }
    ]
    
    // Filter sessions based on query parameters
    let filteredSessions = [...mockSessions]
    
    if (status) {
      filteredSessions = filteredSessions.filter(session => session.status === status)
    }
    
    if (startupId) {
      filteredSessions = filteredSessions.filter(session => session.startupId === startupId)
    }
    
    if (from) {
      filteredSessions = filteredSessions.filter(session => session.date >= from)
    }
    
    if (to) {
      filteredSessions = filteredSessions.filter(session => session.date <= to)
    }
    
    // Group sessions by status
    const upcomingSessions = filteredSessions.filter(session => session.status === "SCHEDULED")
    const completedSessions = filteredSessions.filter(session => session.status === "COMPLETED")
    
    return NextResponse.json({
      sessions: filteredSessions,
      upcomingSessions,
      completedSessions,
      stats: {
        total: filteredSessions.length,
        upcoming: upcomingSessions.length,
        completed: completedSessions.length,
        totalHours: filteredSessions.reduce((acc, session) => acc + session.duration / 60, 0)
      }
    })
  } catch (error) {
    console.error("Error fetching mentor sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/mentor/sessions - Create a new session
export async function POST(req: NextRequest) {
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
    
    const data = await req.json()
    
    // Validate required fields
    if (!data.startupId || !data.date || !data.time || !data.duration || !data.topic || !data.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // In a real implementation, we would create a session in the database
    // For now, we'll return mock data
    
    const newSession: MentorSession = {
      id: Math.random().toString(36).substring(7),
      startupId: data.startupId,
      startupName: data.startupName || "شركة ناشئة",
      date: data.date,
      time: data.time,
      duration: data.duration,
      topic: data.topic,
      status: "SCHEDULED",
      type: data.type,
      location: data.location,
      notes: data.notes
    }
    
    return NextResponse.json(newSession)
  } catch (error) {
    console.error("Error creating mentor session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
