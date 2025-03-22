import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/auth"

// Define the Feedback model
interface Feedback {
  id: string
  startupId: string
  startupName: string
  mentorId: string
  sessionId?: string
  sessionTopic?: string
  date: string
  rating: number
  content: string
  category: string
  status: string
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
    
    // In a real implementation, we would have a feedback table in the database
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
    
    // Create mock feedback data
    const today = new Date()
    const feedback: Feedback[] = []
    
    const categories = [
      "Business Model",
      "Product Development",
      "Marketing Strategy",
      "Team Building",
      "Fundraising",
      "Customer Acquisition",
      "Financial Planning"
    ]
    
    const statuses = ["DRAFT", "PUBLISHED", "UNDER_REVIEW"]
    
    cohortMembers.forEach((member, index) => {
      // Create a few feedback entries for each startup
      for (let i = 0; i < 3; i++) {
        const feedbackDate = new Date(today)
        feedbackDate.setDate(today.getDate() - (i * 7 + index))
        
        const feedbackEntry: Feedback = {
          id: `feedback-${index}-${i}`,
          startupId: member.startup.id,
          startupName: member.startup.name,
          mentorId: user.id,
          date: feedbackDate.toISOString().split('T')[0],
          rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
          content: getRandomFeedbackContent(i),
          category: categories[Math.floor(Math.random() * categories.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        }
        
        // Add session details to some feedback entries
        if (i % 2 === 0) {
          feedbackEntry.sessionId = `session-${index}-${i}`
          feedbackEntry.sessionTopic = getRandomSessionTopic(i)
        }
        
        feedback.push(feedbackEntry)
      }
    })
    
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error fetching mentor feedback:", error)
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
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
    if (!data.startupId || !data.rating || !data.content || !data.category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // In a real implementation, we would create a new feedback entry in the database
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
    
    // Create a new feedback object
    const newFeedback: Feedback = {
      id: `new-${Date.now()}`,
      startupId: data.startupId,
      startupName: startup.name,
      mentorId: user.id,
      sessionId: data.sessionId,
      sessionTopic: data.sessionTopic,
      date: new Date().toISOString().split('T')[0],
      rating: data.rating,
      content: data.content,
      category: data.category,
      status: data.status || "DRAFT"
    }
    
    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: newFeedback
    })
  } catch (error) {
    console.error("Error creating mentor feedback:", error)
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    )
  }
}

// Helper functions for generating mock data
function getRandomFeedbackContent(index: number): string {
  const feedbackOptions = [
    "The team has made significant progress on their MVP. The product is starting to take shape, but there are still some key features missing. I recommend focusing on the core functionality before adding more features.",
    "The business model needs refinement. The current pricing strategy may not be sustainable in the long run. I suggest conducting more market research to validate the pricing assumptions.",
    "The marketing strategy is well thought out, but the execution is lacking. The team needs to be more consistent with their social media presence and content marketing efforts.",
    "The team dynamics are excellent. Everyone seems to be aligned with the company's vision and working well together. However, there might be a need for additional technical expertise as the product grows.",
    "The pitch deck is compelling, but the financial projections seem overly optimistic. I recommend revising the revenue forecasts to be more conservative and providing more detailed assumptions.",
    "Customer acquisition strategy needs work. The current CAC is too high compared to the LTV. The team should explore more cost-effective channels for acquiring customers.",
    "The product has a strong value proposition, but the UX needs improvement. Users might find it difficult to navigate through the application. I suggest conducting usability testing with potential customers."
  ]
  
  return feedbackOptions[index % feedbackOptions.length]
}

function getRandomSessionTopic(index: number): string {
  const topicOptions = [
    "Weekly Progress Review",
    "Pitch Deck Review",
    "Business Model Canvas",
    "Marketing Strategy",
    "Team Building Workshop",
    "Financial Planning",
    "Product Development Roadmap"
  ]
  
  return topicOptions[index % topicOptions.length]
}
