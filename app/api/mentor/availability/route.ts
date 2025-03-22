import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

// Define interfaces for availability data
interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  isRecurring: boolean
  recurrencePattern?: string
  status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE"
  sessionId?: string
}

interface AvailabilitySettings {
  defaultSessionDuration: number
  bufferBetweenSessions: number
  maxSessionsPerDay: number
  preferredMeetingMethod: "ONLINE" | "IN_PERSON" | "BOTH"
  availableLocations?: string[]
  notificationPreferences: {
    email: boolean
    sms: boolean
    reminderTime: number
  }
}

// GET /api/mentor/availability - Get mentor availability
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
      include: {
        mentorProfile: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    if (user.role !== UserRole.MENTOR) {
      return NextResponse.json({ error: "User is not a mentor" }, { status: 403 })
    }
    
    // In a real implementation, we would fetch availability from the database
    // For now, we'll return mock data
    
    // Get query parameters
    const url = new URL(req.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const status = url.searchParams.get('status')
    
    // Mock time slots data
    const mockTimeSlots: TimeSlot[] = [
      {
        id: "1",
        day: "2025-03-25",
        startTime: "09:00",
        endTime: "10:00",
        isRecurring: false,
        status: "AVAILABLE"
      },
      {
        id: "2",
        day: "2025-03-25",
        startTime: "10:30",
        endTime: "11:30",
        isRecurring: false,
        status: "AVAILABLE"
      },
      {
        id: "3",
        day: "2025-03-25",
        startTime: "13:00",
        endTime: "14:00",
        isRecurring: false,
        status: "AVAILABLE"
      },
      {
        id: "4",
        day: "2025-03-25",
        startTime: "15:00",
        endTime: "16:00",
        isRecurring: false,
        status: "BOOKED",
        sessionId: "1"
      },
      {
        id: "5",
        day: "2025-03-26",
        startTime: "09:00",
        endTime: "10:00",
        isRecurring: false,
        status: "AVAILABLE"
      },
      {
        id: "6",
        day: "2025-03-26",
        startTime: "11:00",
        endTime: "12:00",
        isRecurring: false,
        status: "BOOKED",
        sessionId: "2"
      },
      {
        id: "7",
        day: "2025-03-28",
        startTime: "14:00",
        endTime: "16:00",
        isRecurring: false,
        status: "BOOKED",
        sessionId: "3"
      }
    ]
    
    // Mock availability settings
    const mockSettings: AvailabilitySettings = {
      defaultSessionDuration: 60,
      bufferBetweenSessions: 15,
      maxSessionsPerDay: 4,
      preferredMeetingMethod: "BOTH",
      availableLocations: ["عبر الإنترنت", "مقر البرنامج"],
      notificationPreferences: {
        email: true,
        sms: true,
        reminderTime: 60
      }
    }
    
    // Filter time slots based on query parameters
    let filteredTimeSlots = [...mockTimeSlots]
    
    if (from) {
      filteredTimeSlots = filteredTimeSlots.filter(slot => slot.day >= from)
    }
    
    if (to) {
      filteredTimeSlots = filteredTimeSlots.filter(slot => slot.day <= to)
    }
    
    if (status) {
      filteredTimeSlots = filteredTimeSlots.filter(slot => slot.status === status)
    }
    
    // Group time slots by day
    const timeSlotsByDay = filteredTimeSlots.reduce((acc, slot) => {
      if (!acc[slot.day]) {
        acc[slot.day] = []
      }
      acc[slot.day].push(slot)
      return acc
    }, {} as Record<string, TimeSlot[]>)
    
    return NextResponse.json({
      timeSlots: filteredTimeSlots,
      timeSlotsByDay,
      settings: mockSettings,
      stats: {
        totalSlots: filteredTimeSlots.length,
        availableSlots: filteredTimeSlots.filter(slot => slot.status === "AVAILABLE").length,
        bookedSlots: filteredTimeSlots.filter(slot => slot.status === "BOOKED").length
      }
    })
  } catch (error) {
    console.error("Error fetching mentor availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/mentor/availability - Create or update availability
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
    
    // Check if we're updating settings or adding time slots
    if (data.settings) {
      // Validate settings
      if (!data.settings.defaultSessionDuration || !data.settings.preferredMeetingMethod) {
        return NextResponse.json({ error: "Missing required settings fields" }, { status: 400 })
      }
      
      // In a real implementation, we would update settings in the database
      // For now, we'll return mock data
      
      return NextResponse.json({
        settings: {
          defaultSessionDuration: data.settings.defaultSessionDuration,
          bufferBetweenSessions: data.settings.bufferBetweenSessions || 15,
          maxSessionsPerDay: data.settings.maxSessionsPerDay || 4,
          preferredMeetingMethod: data.settings.preferredMeetingMethod,
          availableLocations: data.settings.availableLocations || [],
          notificationPreferences: data.settings.notificationPreferences || {
            email: true,
            sms: false,
            reminderTime: 60
          }
        }
      })
    } else if (data.timeSlots) {
      // Validate time slots
      if (!Array.isArray(data.timeSlots) || data.timeSlots.length === 0) {
        return NextResponse.json({ error: "Invalid time slots data" }, { status: 400 })
      }
      
      for (const slot of data.timeSlots) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          return NextResponse.json({ error: "Missing required time slot fields" }, { status: 400 })
        }
      }
      
      // In a real implementation, we would create/update time slots in the database
      // For now, we'll return mock data
      
      const newTimeSlots = data.timeSlots.map((slot: any) => ({
        id: slot.id || Math.random().toString(36).substring(7),
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring || false,
        recurrencePattern: slot.recurrencePattern,
        status: slot.status || "AVAILABLE",
        sessionId: slot.sessionId
      }))
      
      return NextResponse.json({
        timeSlots: newTimeSlots
      })
    } else {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating mentor availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
