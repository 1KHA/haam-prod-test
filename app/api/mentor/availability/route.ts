import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/auth"

export const dynamic = 'force-dynamic';
// Define the TimeSlot model
interface TimeSlot {
  id: string
  mentorId: string
  day: string
  startTime: string
  endTime: string
  isRecurring: boolean
  notes?: string
}

export async function GET(req: NextRequest) {
  try {
    // Get the token from the request headers
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    
    // Get the user from the database based on the token
    // This is a simplified example - in a real app, you would decode the JWT
    const user = await prisma.user.findFirst({
      where: {
        role: UserRole.MENTOR
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // In a real implementation, we would have a timeSlots table in the database
    // For now, we'll create mock data
    
    // Create mock time slots data
    const timeSlots: TimeSlot[] = [
      {
        id: "1",
        mentorId: user.id,
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        isRecurring: true,
        notes: "Online sessions only"
      },
      {
        id: "2",
        mentorId: user.id,
        day: "Monday",
        startTime: "14:00",
        endTime: "15:30",
        isRecurring: true
      },
      {
        id: "3",
        mentorId: user.id,
        day: "Wednesday",
        startTime: "10:00",
        endTime: "11:00",
        isRecurring: true,
        notes: "Available for in-person meetings"
      },
      {
        id: "4",
        mentorId: user.id,
        day: "Thursday",
        startTime: "13:00",
        endTime: "14:00",
        isRecurring: true
      },
      {
        id: "5",
        mentorId: user.id,
        day: "Friday",
        startTime: "11:00",
        endTime: "12:00",
        isRecurring: false,
        notes: "One-time availability"
      }
    ]
    
    return NextResponse.json({ timeSlots })
  } catch (error) {
    console.error("Error fetching mentor availability:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability" },
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
    if (!data.day || !data.startTime || !data.endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // In a real implementation, we would create a new time slot in the database
    // For now, we'll just return a success message with the mock data
    
    // Create a new time slot object
    const newTimeSlot: TimeSlot = {
      id: `new-${Date.now()}`,
      mentorId: user.id,
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      isRecurring: data.isRecurring || false,
      notes: data.notes
    }
    
    return NextResponse.json({
      success: true,
      message: "Time slot added successfully",
      timeSlot: newTimeSlot
    })
  } catch (error) {
    console.error("Error adding time slot:", error)
    return NextResponse.json(
      { error: "Failed to add time slot" },
      { status: 500 }
    )
  }
}
