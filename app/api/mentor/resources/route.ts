import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/auth"

// Define the Resource model
interface Resource {
  id: string
  mentorId: string
  title: string
  description: string
  type: "DOCUMENT" | "LINK" | "VIDEO"
  url: string
  category: string
  tags: string[]
  createdAt: string
  sharedWith: {
    id: string
    name: string
    type: "STARTUP" | "COHORT"
  }[]
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
    
    // Format the startups data for sharing
    const startups = cohortMembers.map(member => ({
      id: member.startup.id,
      name: member.startup.name
    }))
    
    // Format the cohorts data for sharing
    const cohorts = mentorCohorts.map(mc => ({
      id: mc.cohort.id,
      name: mc.cohort.name
    }))
    
    // In a real implementation, we would have a resources table in the database
    // For now, we'll create mock data
    
    // Create mock resources data
    const resources: Resource[] = [
      {
        id: "1",
        mentorId: user.id,
        title: "دليل نموذج العمل التجاري",
        description: "دليل شامل لإنشاء نموذج عمل تجاري فعال للشركات الناشئة",
        type: "DOCUMENT",
        url: "https://example.com/business-model-guide.pdf",
        category: "نموذج العمل",
        tags: ["نموذج العمل", "استراتيجية", "تخطيط"],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        sharedWith: [
          {
            id: startups[0]?.id || "startup-1",
            name: startups[0]?.name || "شركة ناشئة 1",
            type: "STARTUP"
          },
          {
            id: cohorts[0]?.id || "cohort-1",
            name: cohorts[0]?.name || "برنامج 1",
            type: "COHORT"
          }
        ]
      },
      {
        id: "2",
        mentorId: user.id,
        title: "استراتيجيات التسويق الرقمي",
        description: "أفضل الممارسات والاستراتيجيات للتسويق الرقمي للشركات الناشئة",
        type: "LINK",
        url: "https://example.com/digital-marketing",
        category: "تسويق",
        tags: ["تسويق", "رقمي", "استراتيجية"],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        sharedWith: [
          {
            id: startups[1]?.id || "startup-2",
            name: startups[1]?.name || "شركة ناشئة 2",
            type: "STARTUP"
          }
        ]
      },
      {
        id: "3",
        mentorId: user.id,
        title: "كيفية إعداد عرض تقديمي للمستثمرين",
        description: "دليل فيديو لإعداد عرض تقديمي مقنع للمستثمرين",
        type: "VIDEO",
        url: "https://example.com/investor-pitch-video",
        category: "تمويل",
        tags: ["استثمار", "عرض تقديمي", "تمويل"],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        sharedWith: [
          {
            id: cohorts[0]?.id || "cohort-1",
            name: cohorts[0]?.name || "برنامج 1",
            type: "COHORT"
          }
        ]
      },
      {
        id: "4",
        mentorId: user.id,
        title: "أساسيات المحاسبة للشركات الناشئة",
        description: "مقدمة في المحاسبة والإدارة المالية للشركات الناشئة",
        type: "DOCUMENT",
        url: "https://example.com/startup-accounting.pdf",
        category: "مالية",
        tags: ["محاسبة", "مالية", "إدارة"],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        sharedWith: []
      },
      {
        id: "5",
        mentorId: user.id,
        title: "استراتيجيات بناء الفريق",
        description: "نصائح وأدوات لبناء فريق فعال في الشركات الناشئة",
        type: "LINK",
        url: "https://example.com/team-building",
        category: "إدارة الفريق",
        tags: ["فريق", "توظيف", "إدارة"],
        createdAt: new Date().toISOString(),
        sharedWith: [
          {
            id: startups[0]?.id || "startup-1",
            name: startups[0]?.name || "شركة ناشئة 1",
            type: "STARTUP"
          },
          {
            id: startups[1]?.id || "startup-2",
            name: startups[1]?.name || "شركة ناشئة 2",
            type: "STARTUP"
          }
        ]
      }
    ]
    
    return NextResponse.json({ resources, startups, cohorts })
  } catch (error) {
    console.error("Error fetching mentor resources:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
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
    if (!data.title || !data.type || !data.url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // In a real implementation, we would create a new resource in the database
    // For now, we'll just return a success message with the mock data
    
    // Get shared with entities
    const sharedWith: { id: string; name: string; type: "STARTUP" | "COHORT" }[] = []
    
    if (data.sharedWith && data.sharedWith.length > 0) {
      // Get startups
      const startups = await prisma.startup.findMany({
        where: {
          id: {
            in: data.sharedWith
          }
        },
        select: {
          id: true,
          name: true
        }
      })
      
      startups.forEach(startup => {
        sharedWith.push({
          id: startup.id,
          name: startup.name,
          type: "STARTUP"
        })
      })
      
      // Get cohorts
      const cohorts = await prisma.cohort.findMany({
        where: {
          id: {
            in: data.sharedWith
          }
        },
        select: {
          id: true,
          name: true
        }
      })
      
      cohorts.forEach(cohort => {
        sharedWith.push({
          id: cohort.id,
          name: cohort.name,
          type: "COHORT"
        })
      })
    }
    
    // Create a new resource object
    const newResource: Resource = {
      id: `new-${Date.now()}`,
      mentorId: user.id,
      title: data.title,
      description: data.description || "",
      type: data.type,
      url: data.url,
      category: data.category || "عام",
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      sharedWith
    }
    
    return NextResponse.json({
      success: true,
      message: "Resource added successfully",
      resource: newResource
    })
  } catch (error) {
    console.error("Error adding resource:", error)
    return NextResponse.json(
      { error: "Failed to add resource" },
      { status: 500 }
    )
  }
}
