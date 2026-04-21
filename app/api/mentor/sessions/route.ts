import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"
import { EmailService } from "@/lib/services/email-service"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const user = await isAuthenticated(authHeader || undefined)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (user.role !== UserRole.MENTOR && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const sessions = await prisma.mentorSession.findMany({
      where: { mentorId: user.userId },
      include: {
        startup: { select: { id: true, name: true } },
        cohort: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    })

    const mapped = sessions.map((s) => ({
      id: s.id,
      startupId: s.startupId,
      startupName: s.startup.name,
      cohortName: s.cohort?.name || null,
      topic: s.topic,
      type: s.sessionType,
      status: s.status.toUpperCase(),
      date: s.date.toISOString().split("T")[0],
      time: s.date.toISOString().split("T")[1]?.substring(0, 5) || "00:00",
      duration: s.duration,
      location: s.location || "",
      notes: s.notes || "",
    }))

    const upcomingSessions = mapped.filter((s) => s.status === "SCHEDULED")
    const completedSessions = mapped.filter((s) => s.status === "COMPLETED")

    return NextResponse.json({
      sessions: mapped,
      upcomingSessions,
      completedSessions,
      stats: {
        totalSessions: mapped.length,
        upcomingSessions: upcomingSessions.length,
        completedSessions: completedSessions.length,
      },
    })
  } catch (error) {
    console.error("Error fetching mentor sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const user = await isAuthenticated(authHeader || undefined)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (user.role !== UserRole.MENTOR && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { startupId, topic, date, time, duration, location, notes, type } = body

    if (!startupId || !topic || !date) {
      return NextResponse.json({ error: "startupId, topic, and date are required" }, { status: 400 })
    }

    const dateTime = new Date(`${date}T${time || "10:00"}:00`)

    const session = await prisma.mentorSession.create({
      data: {
        startupId,
        mentorId: user.userId,
        topic,
        sessionType: type || "INDIVIDUAL",
        status: "scheduled",
        date: dateTime,
        duration: duration || 60,
        location: location || "",
        notes: notes || "",
        createdById: user.userId,
      },
      include: {
        startup: { select: { id: true, name: true } },
      },
    })

    // Notify startup team about the scheduled meeting
    try {
      const startupWithMembers = await prisma.startup.findUnique({
        where: { id: startupId },
        include: {
          creator: { select: { id: true } },
          members: { select: { userId: true } },
        },
      });
      const recipientIds = [
        ...(startupWithMembers?.creator ? [startupWithMembers.creator.id] : []),
        ...(startupWithMembers?.members.map(m => m.userId) || []),
      ].filter(id => id !== user.userId);
      if (recipientIds.length > 0) {
        await EmailService.fireScenario('meeting_scheduled', recipientIds, {
          session: { topic, date, duration: duration || 60, location: location || '' },
          startup: { name: session.startup.name },
        });
      }
    } catch (emailError) {
      console.error('[Mentor Sessions] meeting_scheduled email scenario failed:', emailError);
    }

    return NextResponse.json({ success: true, session }, { status: 201 })
  } catch (error) {
    console.error("Error creating mentor session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
