import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

export const dynamic = 'force-dynamic';
// Define interfaces for discussion data
interface Discussion {
  id: string
  title: string
  description: string
  type: "GENERAL" | "STARTUP_SPECIFIC" | "MENTOR_ONLY" | "ANNOUNCEMENT"
  status: "ACTIVE" | "CLOSED" | "ARCHIVED"
  startupId?: string
  startupName?: string
  createdBy: {
    id: string
    name: string
    role: string
  }
  createdAt: string
  updatedAt: string
  lastActivity: string
  participants: number
  messages: number
  tags: string[]
  latestMessage?: Message
}

interface Message {
  id: string
  discussionId: string
  content: string
  attachments?: {
    id: string
    name: string
    type: string
    url: string
    size?: number
  }[]
  author: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  isEdited: boolean
  reactions?: {
    type: string
    count: number
    users: string[]
  }[]
  mentions?: {
    userId: string
    name: string
  }[]
}

// GET /api/mentor/discussions - Get discussions
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
    
    // In a real implementation, we would fetch discussions from the database
    // For now, we'll return mock data
    
    // Get query parameters
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const startupId = url.searchParams.get('startupId')
    const search = url.searchParams.get('search')
    const tag = url.searchParams.get('tag')
    
    // Mock discussions data
    const mockDiscussions: Discussion[] = [
      {
        id: "1",
        title: "مناقشة استراتيجيات التسويق للشركات الناشئة في مجال التقنيات الصحية",
        description: "منتدى لمناقشة أفضل الممارسات والاستراتيجيات للتسويق في مجال التقنيات الصحية",
        type: "GENERAL",
        status: "ACTIVE",
        createdBy: {
          id: "mentor1",
          name: "د. خالد العمري",
          role: "MENTOR"
        },
        createdAt: "2025-03-01T10:00:00Z",
        updatedAt: "2025-03-20T15:30:00Z",
        lastActivity: "2025-03-20T15:30:00Z",
        participants: 8,
        messages: 24,
        tags: ["تسويق", "تقنيات صحية", "استراتيجية"],
        latestMessage: {
          id: "msg24",
          discussionId: "1",
          content: "أعتقد أن التركيز على المستشفيات والعيادات كشركاء استراتيجيين يمكن أن يكون مفيداً جداً للشركات الناشئة في هذا المجال.",
          author: {
            id: "startup2",
            name: "ميديكال إيه آي",
          role: "ENTREPRENEUR"
          },
          createdAt: "2025-03-20T15:30:00Z",
          updatedAt: "2025-03-20T15:30:00Z",
          isEdited: false
        }
      },
      {
        id: "2",
        title: "تحديات تطوير النموذج الأولي - هيلث تك",
        description: "مناقشة التحديات والحلول لتطوير النموذج الأولي لشركة هيلث تك",
        type: "STARTUP_SPECIFIC",
        status: "ACTIVE",
        startupId: "1",
        startupName: "هيلث تك",
        createdBy: {
          id: "startup1",
          name: "هيلث تك",
          role: "ENTREPRENEUR"
        },
        createdAt: "2025-03-10T09:15:00Z",
        updatedAt: "2025-03-21T11:45:00Z",
        lastActivity: "2025-03-21T11:45:00Z",
        participants: 4,
        messages: 18,
        tags: ["نموذج أولي", "تطوير المنتج", "تقنيات صحية"],
        latestMessage: {
          id: "msg18",
          discussionId: "2",
          content: "سنقوم بتجربة الحل المقترح ونعود إليكم بالنتائج خلال الأسبوع القادم.",
          author: {
            id: "startup1",
            name: "هيلث تك",
            role: "ENTREPRENEUR"
          },
          createdAt: "2025-03-21T11:45:00Z",
          updatedAt: "2025-03-21T11:45:00Z",
          isEdited: false
        }
      },
      {
        id: "3",
        title: "مشاركة الخبرات في مجال الذكاء الاصطناعي في الرعاية الصحية",
        description: "منتدى للموجهين لمشاركة الخبرات والتحديات في مجال الذكاء الاصطناعي في الرعاية الصحية",
        type: "MENTOR_ONLY",
        status: "ACTIVE",
        createdBy: {
          id: "mentor2",
          name: "د. سارة الأحمد",
          role: "MENTOR"
        },
        createdAt: "2025-02-15T14:30:00Z",
        updatedAt: "2025-03-18T10:20:00Z",
        lastActivity: "2025-03-18T10:20:00Z",
        participants: 5,
        messages: 32,
        tags: ["ذكاء اصطناعي", "تقنيات صحية", "خبرات"],
        latestMessage: {
          id: "msg32",
          discussionId: "3",
          content: "أتفق مع الرأي السابق، ويمكنني مشاركة بعض الموارد المفيدة حول هذا الموضوع في الاجتماع القادم.",
          author: {
            id: "mentor1",
            name: "د. خالد العمري",
            role: "MENTOR"
          },
          createdAt: "2025-03-18T10:20:00Z",
          updatedAt: "2025-03-18T10:20:00Z",
          isEdited: false
        }
      },
      {
        id: "4",
        title: "إعلان: ورشة عمل قادمة حول استراتيجيات جذب المستثمرين",
        description: "إعلان عن ورشة عمل قادمة حول استراتيجيات جذب المستثمرين للشركات الناشئة في مجال التقنيات الصحية",
        type: "ANNOUNCEMENT",
        status: "ACTIVE",
        createdBy: {
          id: "admin1",
          name: "إدارة البرنامج",
          role: "ADMIN"
        },
        createdAt: "2025-03-15T09:00:00Z",
        updatedAt: "2025-03-19T14:10:00Z",
        lastActivity: "2025-03-19T14:10:00Z",
        participants: 12,
        messages: 8,
        tags: ["ورشة عمل", "استثمار", "تمويل"],
        latestMessage: {
          id: "msg8",
          discussionId: "4",
          content: "هل سيتم توفير مواد الورشة للمشاركين بعد انتهائها؟",
          author: {
            id: "startup2",
            name: "ميديكال إيه آي",
            role: "STARTUP"
          },
          createdAt: "2025-03-19T14:10:00Z",
          updatedAt: "2025-03-19T14:10:00Z",
          isEdited: false
        }
      },
      {
        id: "5",
        title: "تحديات تطوير الخوارزميات - ميديكال إيه آي",
        description: "مناقشة التحديات والحلول لتطوير الخوارزميات لشركة ميديكال إيه آي",
        type: "STARTUP_SPECIFIC",
        status: "ACTIVE",
        startupId: "2",
        startupName: "ميديكال إيه آي",
        createdBy: {
          id: "mentor1",
          name: "د. خالد العمري",
          role: "MENTOR"
        },
        createdAt: "2025-03-05T11:30:00Z",
        updatedAt: "2025-03-22T09:45:00Z",
        lastActivity: "2025-03-22T09:45:00Z",
        participants: 5,
        messages: 22,
        tags: ["ذكاء اصطناعي", "خوارزميات", "تطوير"],
        latestMessage: {
          id: "msg22",
          discussionId: "5",
          content: "لقد وجدنا حلاً للمشكلة التي ناقشناها في الاجتماع الأخير، وسنقوم بمشاركة النتائج معكم قريباً.",
          author: {
            id: "startup2",
            name: "ميديكال إيه آي",
            role: "STARTUP"
          },
          createdAt: "2025-03-22T09:45:00Z",
          updatedAt: "2025-03-22T09:45:00Z",
          isEdited: false
        }
      }
    ]
    
    // Filter discussions based on query parameters
    let filteredDiscussions = [...mockDiscussions]
    
    if (type) {
      filteredDiscussions = filteredDiscussions.filter(discussion => discussion.type === type)
    }
    
    if (status) {
      filteredDiscussions = filteredDiscussions.filter(discussion => discussion.status === status)
    }
    
    if (startupId) {
      filteredDiscussions = filteredDiscussions.filter(discussion => 
        discussion.startupId === startupId || discussion.type === "GENERAL" || discussion.type === "ANNOUNCEMENT"
      )
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredDiscussions = filteredDiscussions.filter(discussion => 
        discussion.title.toLowerCase().includes(searchLower) || 
        discussion.description.toLowerCase().includes(searchLower)
      )
    }
    
    if (tag) {
      filteredDiscussions = filteredDiscussions.filter(discussion => 
        discussion.tags.includes(tag)
      )
    }
    
    // Group discussions by type
    const discussionsByType = filteredDiscussions.reduce((acc, discussion) => {
      if (!acc[discussion.type]) {
        acc[discussion.type] = []
      }
      acc[discussion.type].push(discussion)
      return acc
    }, {} as Record<string, Discussion[]>)
    
    // Get all unique tags
    const allTags = Array.from(new Set(
      mockDiscussions.flatMap(discussion => discussion.tags)
    ))
    
    return NextResponse.json({
      discussions: filteredDiscussions,
      discussionsByType,
      tags: allTags,
      stats: {
        total: filteredDiscussions.length,
        byType: Object.entries(discussionsByType).reduce((acc, [type, discussions]) => {
          acc[type] = discussions.length
          return acc
        }, {} as Record<string, number>),
        active: filteredDiscussions.filter(d => d.status === "ACTIVE").length,
        closed: filteredDiscussions.filter(d => d.status === "CLOSED").length,
        archived: filteredDiscussions.filter(d => d.status === "ARCHIVED").length
      }
    })
  } catch (error) {
    console.error("Error fetching mentor discussions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/mentor/discussions - Create a new discussion
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
    if (!data.title || !data.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Validate startup-specific discussions
    if (data.type === "STARTUP_SPECIFIC" && !data.startupId) {
      return NextResponse.json({ error: "Startup ID is required for startup-specific discussions" }, { status: 400 })
    }
    
    // In a real implementation, we would create a discussion in the database
    // For now, we'll return mock data
    
    const now = new Date().toISOString()
    
    const newDiscussion: Discussion = {
      id: Math.random().toString(36).substring(7),
      title: data.title,
      description: data.description || "",
      type: data.type,
      status: "ACTIVE",
      startupId: data.startupId,
      startupName: data.startupName,
      createdBy: {
        id: userData.userId,
        name: user.name,
        role: user.role
      },
      createdAt: now,
      updatedAt: now,
      lastActivity: now,
      participants: 1,
      messages: 0,
      tags: data.tags || []
    }
    
    return NextResponse.json(newDiscussion)
  } catch (error) {
    console.error("Error creating mentor discussion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
