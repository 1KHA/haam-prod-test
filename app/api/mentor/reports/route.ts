import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

// Define interfaces for report data
interface MentorReport {
  id: string
  title: string
  type: "SESSION_SUMMARY" | "STARTUP_PROGRESS" | "FEEDBACK_SUMMARY" | "ACTIVITY_SUMMARY"
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "CUSTOM"
  startDate: string
  endDate: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  createdAt: string
}

interface SessionSummary {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  totalHours: number
  sessionsByStartup: {
    startupId: string
    startupName: string
    sessions: number
    hours: number
  }[]
  sessionsByType: {
    type: string
    count: number
  }[]
  sessionTrend: {
    date: string
    count: number
  }[]
}

interface StartupProgressSummary {
  startups: {
    id: string
    name: string
    initialProgress: number
    currentProgress: number
    change: number
    milestones: {
      completed: number
      inProgress: number
      notStarted: number
    }
    keyAreas: {
      name: string
      initialRating: number
      currentRating: number
      change: number
    }[]
  }[]
}

interface FeedbackSummary {
  totalFeedback: number
  averageRating: number
  ratingDistribution: {
    rating: number
    count: number
  }[]
  topAreas: {
    area: string
    averageRating: number
    count: number
  }[]
  feedbackByStartup: {
    startupId: string
    startupName: string
    count: number
    averageRating: number
  }[]
}

interface ActivitySummary {
  totalActivities: number
  activityBreakdown: {
    type: string
    count: number
    percentage: number
  }[]
  activityTrend: {
    date: string
    sessions: number
    feedback: number
    resources: number
  }[]
  impactMetrics: {
    startupGrowth: number
    milestonesAchieved: number
    resourcesShared: number
  }
}

// GET /api/mentor/reports - Get mentor reports
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
    
    // In a real implementation, we would fetch reports from the database
    // For now, we'll return mock data
    
    // Get query parameters
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const period = url.searchParams.get('period')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    
    // Mock session summary data
    const mockSessionSummary: SessionSummary = {
      totalSessions: 18,
      completedSessions: 15,
      upcomingSessions: 3,
      totalHours: 32,
      sessionsByStartup: [
        {
          startupId: "1",
          startupName: "هيلث تك",
          sessions: 8,
          hours: 14
        },
        {
          startupId: "2",
          startupName: "ميديكال إيه آي",
          sessions: 7,
          hours: 12
        },
        {
          startupId: "3",
          startupName: "دوكتور أونلاين",
          sessions: 3,
          hours: 6
        }
      ],
      sessionsByType: [
        { type: "فردي", count: 15 },
        { type: "جماعي", count: 3 }
      ],
      sessionTrend: [
        { date: "2025-01", count: 4 },
        { date: "2025-02", count: 6 },
        { date: "2025-03", count: 8 }
      ]
    }
    
    // Mock startup progress summary data
    const mockStartupProgressSummary: StartupProgressSummary = {
      startups: [
        {
          id: "1",
          name: "هيلث تك",
          initialProgress: 60,
          currentProgress: 85,
          change: 25,
          milestones: {
            completed: 5,
            inProgress: 2,
            notStarted: 1
          },
          keyAreas: [
            { name: "تطوير المنتج", initialRating: 3, currentRating: 4, change: 1 },
            { name: "نموذج العمل", initialRating: 2, currentRating: 3, change: 1 },
            { name: "فهم السوق", initialRating: 3, currentRating: 4, change: 1 }
          ]
        },
        {
          id: "2",
          name: "ميديكال إيه آي",
          initialProgress: 40,
          currentProgress: 65,
          change: 25,
          milestones: {
            completed: 4,
            inProgress: 3,
            notStarted: 2
          },
          keyAreas: [
            { name: "تطوير التكنولوجيا", initialRating: 3, currentRating: 5, change: 2 },
            { name: "نموذج العمل", initialRating: 2, currentRating: 4, change: 2 },
            { name: "فهم السوق", initialRating: 3, currentRating: 5, change: 2 }
          ]
        }
      ]
    }
    
    // Mock feedback summary data
    const mockFeedbackSummary: FeedbackSummary = {
      totalFeedback: 12,
      averageRating: 4.5,
      ratingDistribution: [
        { rating: 5, count: 6 },
        { rating: 4, count: 4 },
        { rating: 3, count: 2 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 }
      ],
      topAreas: [
        { area: "تطوير المنتج", averageRating: 4.2, count: 10 },
        { area: "نموذج العمل", averageRating: 3.8, count: 8 },
        { area: "فهم السوق", averageRating: 4.5, count: 6 }
      ],
      feedbackByStartup: [
        { startupId: "1", startupName: "هيلث تك", count: 6, averageRating: 4.3 },
        { startupId: "2", startupName: "ميديكال إيه آي", count: 4, averageRating: 4.8 },
        { startupId: "3", startupName: "دوكتور أونلاين", count: 2, averageRating: 4.0 }
      ]
    }
    
    // Mock activity summary data
    const mockActivitySummary: ActivitySummary = {
      totalActivities: 35,
      activityBreakdown: [
        { type: "جلسات", count: 18, percentage: 51.4 },
        { type: "ملاحظات", count: 12, percentage: 34.3 },
        { type: "موارد", count: 5, percentage: 14.3 }
      ],
      activityTrend: [
        { date: "2025-01", sessions: 4, feedback: 3, resources: 1 },
        { date: "2025-02", sessions: 6, feedback: 4, resources: 2 },
        { date: "2025-03", sessions: 8, feedback: 5, resources: 2 }
      ],
      impactMetrics: {
        startupGrowth: 25,
        milestonesAchieved: 9,
        resourcesShared: 5
      }
    }
    
    // Mock reports data
    const mockReports: MentorReport[] = [
      {
        id: "1",
        title: "ملخص الجلسات - الربع الأول 2025",
        type: "SESSION_SUMMARY",
        period: "QUARTERLY",
        startDate: "2025-01-01",
        endDate: "2025-03-31",
        data: mockSessionSummary,
        createdAt: "2025-04-01T10:00:00Z"
      },
      {
        id: "2",
        title: "تقدم الشركات الناشئة - الربع الأول 2025",
        type: "STARTUP_PROGRESS",
        period: "QUARTERLY",
        startDate: "2025-01-01",
        endDate: "2025-03-31",
        data: mockStartupProgressSummary,
        createdAt: "2025-04-01T10:30:00Z"
      },
      {
        id: "3",
        title: "ملخص الملاحظات - الربع الأول 2025",
        type: "FEEDBACK_SUMMARY",
        period: "QUARTERLY",
        startDate: "2025-01-01",
        endDate: "2025-03-31",
        data: mockFeedbackSummary,
        createdAt: "2025-04-01T11:00:00Z"
      },
      {
        id: "4",
        title: "ملخص النشاط - الربع الأول 2025",
        type: "ACTIVITY_SUMMARY",
        period: "QUARTERLY",
        startDate: "2025-01-01",
        endDate: "2025-03-31",
        data: mockActivitySummary,
        createdAt: "2025-04-01T11:30:00Z"
      },
      {
        id: "5",
        title: "ملخص الجلسات - شهر مارس 2025",
        type: "SESSION_SUMMARY",
        period: "MONTHLY",
        startDate: "2025-03-01",
        endDate: "2025-03-31",
        data: {
          ...mockSessionSummary,
          totalSessions: 8,
          completedSessions: 5,
          upcomingSessions: 3,
          totalHours: 14
        },
        createdAt: "2025-04-01T12:00:00Z"
      }
    ]
    
    // Filter reports based on query parameters
    let filteredReports = [...mockReports]
    
    if (type) {
      filteredReports = filteredReports.filter(report => report.type === type)
    }
    
    if (period) {
      filteredReports = filteredReports.filter(report => report.period === period)
    }
    
    if (from) {
      filteredReports = filteredReports.filter(report => report.startDate >= from)
    }
    
    if (to) {
      filteredReports = filteredReports.filter(report => report.endDate <= to)
    }
    
    // Group reports by type
    const reportsByType = filteredReports.reduce((acc, report) => {
      if (!acc[report.type]) {
        acc[report.type] = []
      }
      acc[report.type].push(report)
      return acc
    }, {} as Record<string, MentorReport[]>)
    
    return NextResponse.json({
      reports: filteredReports,
      reportsByType,
      stats: {
        total: filteredReports.length,
        byType: Object.entries(reportsByType).reduce((acc, [type, reports]) => {
          acc[type] = reports.length
          return acc
        }, {} as Record<string, number>)
      },
      // Include the latest summary data for quick access
      summaries: {
        session: mockSessionSummary,
        startupProgress: mockStartupProgressSummary,
        feedback: mockFeedbackSummary,
        activity: mockActivitySummary
      }
    })
  } catch (error) {
    console.error("Error fetching mentor reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
