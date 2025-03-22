import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

// Define interfaces for feedback data
interface MentorFeedback {
  id: string
  startupId: string
  startupName: string
  sessionId?: string
  date: string
  rating: number
  comment: string
  areas?: {
    name: string
    rating: number
    comment?: string
  }[]
  actionItems?: string[]
  status: "DRAFT" | "SUBMITTED" | "REVIEWED"
}

// GET /api/mentor/feedback - Get mentor feedback
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
    
    // In a real implementation, we would fetch feedback from the database
    // For now, we'll return mock data
    
    // Get query parameters
    const url = new URL(req.url)
    const startupId = url.searchParams.get('startupId')
    const sessionId = url.searchParams.get('sessionId')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    
    // Mock feedback data
    const mockFeedback: MentorFeedback[] = [
      {
        id: "1",
        startupId: "1",
        startupName: "هيلث تك",
        sessionId: "4",
        date: "2025-02-25",
        rating: 4,
        comment: "فريق متميز مع تقدم جيد في تطوير المنتج. يحتاجون إلى التركيز أكثر على استراتيجية التسويق.",
        areas: [
          { name: "تطوير المنتج", rating: 4, comment: "تقدم جيد في تطوير النموذج الأولي" },
          { name: "نموذج العمل", rating: 3, comment: "يحتاج إلى مزيد من التفصيل" },
          { name: "فهم السوق", rating: 4, comment: "فهم جيد للسوق المستهدف" }
        ],
        actionItems: [
          "تطوير استراتيجية تسويق أكثر تفصيلاً",
          "إجراء مزيد من اختبارات المستخدمين للنموذج الأولي",
          "تحديث خطة العمل بناءً على التعليقات"
        ],
        status: "SUBMITTED"
      },
      {
        id: "2",
        startupId: "2",
        startupName: "ميديكال إيه آي",
        sessionId: "5",
        date: "2025-02-20",
        rating: 5,
        comment: "فريق استثنائي مع تقدم ممتاز في تطوير الخوارزميات. لديهم فهم عميق للسوق وخطة عمل قوية.",
        areas: [
          { name: "تطوير التكنولوجيا", rating: 5, comment: "تقدم ممتاز في تطوير الخوارزميات" },
          { name: "نموذج العمل", rating: 4, comment: "خطة عمل قوية وواضحة" },
          { name: "فهم السوق", rating: 5, comment: "فهم عميق للسوق المستهدف" }
        ],
        actionItems: [
          "البدء في التواصل مع المستشفيات للتجارب الأولية",
          "تطوير خطة للتوسع في أسواق جديدة",
          "البحث عن فرص تمويل إضافية"
        ],
        status: "SUBMITTED"
      }
    ]
    
    // Filter feedback based on query parameters
    let filteredFeedback = [...mockFeedback]
    
    if (startupId) {
      filteredFeedback = filteredFeedback.filter(feedback => feedback.startupId === startupId)
    }
    
    if (sessionId) {
      filteredFeedback = filteredFeedback.filter(feedback => feedback.sessionId === sessionId)
    }
    
    if (from) {
      filteredFeedback = filteredFeedback.filter(feedback => feedback.date >= from)
    }
    
    if (to) {
      filteredFeedback = filteredFeedback.filter(feedback => feedback.date <= to)
    }
    
    return NextResponse.json({
      feedback: filteredFeedback,
      stats: {
        total: filteredFeedback.length,
        averageRating: filteredFeedback.reduce((acc, feedback) => acc + feedback.rating, 0) / filteredFeedback.length || 0
      }
    })
  } catch (error) {
    console.error("Error fetching mentor feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/mentor/feedback - Create new feedback
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
    if (!data.startupId || !data.rating || !data.comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // In a real implementation, we would create feedback in the database
    // For now, we'll return mock data
    
    const newFeedback: MentorFeedback = {
      id: Math.random().toString(36).substring(7),
      startupId: data.startupId,
      startupName: data.startupName || "شركة ناشئة",
      sessionId: data.sessionId,
      date: new Date().toISOString().split('T')[0],
      rating: data.rating,
      comment: data.comment,
      areas: data.areas || [],
      actionItems: data.actionItems || [],
      status: data.status || "DRAFT"
    }
    
    return NextResponse.json(newFeedback)
  } catch (error) {
    console.error("Error creating mentor feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
