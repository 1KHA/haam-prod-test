import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/auth"

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
      },
      include: {
        mentorProfile: true,
        profile: true
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
        cohort: {
          include: {
            program: true
          }
        }
      }
    })
    
    // Format the cohorts data
    const cohorts = mentorCohorts.map(mc => ({
      id: mc.cohort.id,
      name: mc.cohort.name,
      program: mc.cohort.program.name,
      startDate: mc.cohort.startDate.toISOString(),
      endDate: mc.cohort.endDate.toISOString(),
      role: mc.role || "Mentor"
    }))
    
    // Get the count of startups the mentor is assigned to
    const cohortIds = mentorCohorts.map(mc => mc.cohortId)
    const startupCount = await prisma.cohortMember.count({
      where: {
        cohortId: {
          in: cohortIds
        }
      }
    })
    
    // Format the profile data
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      expertise: user.mentorProfile?.expertise || "",
      experience: user.mentorProfile?.experience || "",
      availability: user.mentorProfile?.availability || "",
      bio: user.profile?.bio || "",
      avatar: user.profile?.avatar || "",
      phone: user.profile?.phone || "",
      address: user.profile?.address || "",
      city: user.profile?.city || "",
      country: user.profile?.country || "",
      position: user.profile?.position || "",
      cohorts,
      stats: {
        totalCohorts: cohorts.length,
        totalStartups: startupCount,
        totalSessions: 24, // Mock data
        totalFeedback: 18, // Mock data
        totalHours: 36 // Mock data
      }
    }
    
    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching mentor profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
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
      },
      include: {
        mentorProfile: true,
        profile: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Parse the request body
    const data = await req.json()
    
    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        name: data.name || user.name,
        specialization: data.specialization || user.specialization,
        mentorProfile: {
          update: {
            expertise: data.expertise || user.mentorProfile?.expertise,
            experience: data.experience || user.mentorProfile?.experience,
            availability: data.availability || user.mentorProfile?.availability
          }
        },
        profile: {
          upsert: {
            create: {
              bio: data.bio || "",
              avatar: data.avatar || "",
              phone: data.phone || "",
              address: data.address || "",
              city: data.city || "",
              country: data.country || "",
              position: data.position || ""
            },
            update: {
              bio: data.bio || user.profile?.bio,
              avatar: data.avatar || user.profile?.avatar,
              phone: data.phone || user.profile?.phone,
              address: data.address || user.profile?.address,
              city: data.city || user.profile?.city,
              country: data.country || user.profile?.country,
              position: data.position || user.profile?.position
            }
          }
        }
      },
      include: {
        mentorProfile: true,
        profile: true
      }
    })
    
    // Format the updated profile data
    const updatedProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      specialization: updatedUser.specialization,
      expertise: updatedUser.mentorProfile?.expertise || "",
      experience: updatedUser.mentorProfile?.experience || "",
      availability: updatedUser.mentorProfile?.availability || "",
      bio: updatedUser.profile?.bio || "",
      avatar: updatedUser.profile?.avatar || "",
      phone: updatedUser.profile?.phone || "",
      address: updatedUser.profile?.address || "",
      city: updatedUser.profile?.city || "",
      country: updatedUser.profile?.country || "",
      position: updatedUser.profile?.position || ""
    }
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile
    })
  } catch (error) {
    console.error("Error updating mentor profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
