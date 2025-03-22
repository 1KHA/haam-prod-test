import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

// Define interfaces for resource data
interface Resource {
  id: string
  title: string
  description: string
  type: "DOCUMENT" | "VIDEO" | "LINK" | "TEMPLATE" | "PRESENTATION" | "OTHER"
  url: string
  fileSize?: number
  fileType?: string
  tags: string[]
  isPublic: boolean
  sharedWith: {
    startupId: string
    startupName: string
  }[]
  createdAt: string
  updatedAt: string
}

// GET /api/mentor/resources - Get mentor resources
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
    
    // In a real implementation, we would fetch resources from the database
    // For now, we'll return mock data
    
    // Get query parameters
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const startupId = url.searchParams.get('startupId')
    const tag = url.searchParams.get('tag')
    const search = url.searchParams.get('search')
    
    // Mock resources data
    const mockResources: Resource[] = [
      {
        id: "1",
        title: "دليل تطوير نموذج العمل",
        description: "دليل شامل لتطوير نموذج عمل قوي للشركات الناشئة في مجال التقنيات الصحية",
        type: "DOCUMENT",
        url: "/uploads/resources/business-model-guide.pdf",
        fileSize: 2500000,
        fileType: "application/pdf",
        tags: ["نموذج العمل", "استراتيجية", "تقنيات صحية"],
        isPublic: true,
        sharedWith: [
          { startupId: "1", startupName: "هيلث تك" },
          { startupId: "2", startupName: "ميديكال إيه آي" }
        ],
        createdAt: "2025-02-15T10:30:00Z",
        updatedAt: "2025-02-15T10:30:00Z"
      },
      {
        id: "2",
        title: "قالب خطة التسويق",
        description: "قالب لإعداد خطة تسويق شاملة للشركات الناشئة",
        type: "TEMPLATE",
        url: "/uploads/resources/marketing-plan-template.docx",
        fileSize: 1500000,
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        tags: ["تسويق", "استراتيجية", "خطة عمل"],
        isPublic: true,
        sharedWith: [
          { startupId: "1", startupName: "هيلث تك" }
        ],
        createdAt: "2025-02-20T14:15:00Z",
        updatedAt: "2025-02-20T14:15:00Z"
      },
      {
        id: "3",
        title: "استراتيجيات جذب المستثمرين",
        description: "عرض تقديمي حول أفضل الممارسات لجذب المستثمرين للشركات الناشئة في مجال التقنيات الصحية",
        type: "PRESENTATION",
        url: "/uploads/resources/investor-pitch-strategies.pptx",
        fileSize: 3500000,
        fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        tags: ["استثمار", "تمويل", "عرض تقديمي"],
        isPublic: false,
        sharedWith: [
          { startupId: "2", startupName: "ميديكال إيه آي" }
        ],
        createdAt: "2025-03-05T09:45:00Z",
        updatedAt: "2025-03-05T09:45:00Z"
      },
      {
        id: "4",
        title: "مصادر مفيدة لتطوير الخوارزميات الطبية",
        description: "قائمة بالمصادر والأدوات المفيدة لتطوير الخوارزميات في مجال الرعاية الصحية",
        type: "LINK",
        url: "https://example.com/medical-ai-resources",
        tags: ["ذكاء اصطناعي", "تقنيات صحية", "تطوير"],
        isPublic: false,
        sharedWith: [
          { startupId: "2", startupName: "ميديكال إيه آي" }
        ],
        createdAt: "2025-03-10T11:20:00Z",
        updatedAt: "2025-03-10T11:20:00Z"
      },
      {
        id: "5",
        title: "فيديو: كيفية إجراء اختبارات المستخدمين",
        description: "فيديو تعليمي حول كيفية إجراء اختبارات المستخدمين للمنتجات الصحية",
        type: "VIDEO",
        url: "https://example.com/videos/user-testing-guide",
        tags: ["اختبار المستخدمين", "تجربة المستخدم", "تطوير المنتج"],
        isPublic: true,
        sharedWith: [
          { startupId: "1", startupName: "هيلث تك" },
          { startupId: "2", startupName: "ميديكال إيه آي" }
        ],
        createdAt: "2025-03-15T13:10:00Z",
        updatedAt: "2025-03-15T13:10:00Z"
      }
    ]
    
    // Filter resources based on query parameters
    let filteredResources = [...mockResources]
    
    if (type) {
      filteredResources = filteredResources.filter(resource => resource.type === type)
    }
    
    if (startupId) {
      filteredResources = filteredResources.filter(resource => 
        resource.sharedWith.some(s => s.startupId === startupId)
      )
    }
    
    if (tag) {
      filteredResources = filteredResources.filter(resource => 
        resource.tags.includes(tag)
      )
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredResources = filteredResources.filter(resource => 
        resource.title.toLowerCase().includes(searchLower) || 
        resource.description.toLowerCase().includes(searchLower)
      )
    }
    
    // Group resources by type
    const resourcesByType = filteredResources.reduce((acc, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = []
      }
      acc[resource.type].push(resource)
      return acc
    }, {} as Record<string, Resource[]>)
    
    // Get all unique tags
    const allTags = Array.from(new Set(
      mockResources.flatMap(resource => resource.tags)
    ))
    
    return NextResponse.json({
      resources: filteredResources,
      resourcesByType,
      tags: allTags,
      stats: {
        total: filteredResources.length,
        byType: Object.entries(resourcesByType).reduce((acc, [type, resources]) => {
          acc[type] = resources.length
          return acc
        }, {} as Record<string, number>)
      }
    })
  } catch (error) {
    console.error("Error fetching mentor resources:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/mentor/resources - Create a new resource
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
    if (!data.title || !data.type || !data.url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // In a real implementation, we would create a resource in the database
    // For now, we'll return mock data
    
    const newResource: Resource = {
      id: Math.random().toString(36).substring(7),
      title: data.title,
      description: data.description || "",
      type: data.type,
      url: data.url,
      fileSize: data.fileSize,
      fileType: data.fileType,
      tags: data.tags || [],
      isPublic: data.isPublic || false,
      sharedWith: data.sharedWith || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json(newResource)
  } catch (error) {
    console.error("Error creating mentor resource:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
