import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated, UserRole } from "@/lib/auth"

// GET /api/mentor/profile - Get mentor profile
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
        mentorProfile: true,
        profile: true,
      },
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    if (user?.role !== UserRole.MENTOR) {
      return NextResponse.json({ error: "User is not a mentor" }, { status: 403 })
    }
    
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      specialization: user.specialization,
      profile: user.profile,
      mentorProfile: user.mentorProfile,
    })
  } catch (error) {
    console.error("Error fetching mentor profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/mentor/profile - Update mentor profile
export async function PUT(req: NextRequest) {
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
        mentorProfile: true,
        profile: true,
      },
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    if (user?.role !== UserRole.MENTOR) {
      return NextResponse.json({ error: "User is not a mentor" }, { status: 403 })
    }
    
    const data = await req.json()
    
    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        specialization: data.specialization,
      },
    })
    
    // Update profile data
    let updatedProfile
    if (user.profile) {
      updatedProfile = await prisma.profile.update({
        where: { userId: user.id },
        data: {
          bio: data.bio,
          avatar: data.avatar,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          position: data.position,
        },
      })
    } else {
      updatedProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          bio: data.bio,
          avatar: data.avatar,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          position: data.position,
        },
      })
    }
    
    // Update mentor profile data
    let updatedMentorProfile
    if (user.mentorProfile) {
      updatedMentorProfile = await prisma.mentorProfile.update({
        where: { userId: user.id },
        data: {
          expertise: data.expertise,
          experience: data.experience,
          availability: data.availability,
        },
      })
    } else {
      updatedMentorProfile = await prisma.mentorProfile.create({
        data: {
          userId: user.id,
          expertise: data.expertise,
          experience: data.experience,
          availability: data.availability,
        },
      })
    }
    
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      specialization: updatedUser.specialization,
      profile: updatedProfile,
      mentorProfile: updatedMentorProfile,
    })
  } catch (error) {
    console.error("Error updating mentor profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
