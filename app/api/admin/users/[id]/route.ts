import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole } from '@/lib/auth';

// GET /api/admin/users/[id] - Get a single user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        mentorProfile: true,
        investorProfile: true,
        entrepreneurProfile: true,
        participantProfile: true,
        adminProfile: true,
        programManagerProfile: true,
        startupProfile: true,
        startups: {
          select: {
            id: true,
            name: true,
            industry: true,
            stage: true,
            status: true
          }
        },
        teamMembers: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Determine if the user has completed their profile
    const hasProfile = user.mentorProfile || 
                       user.investorProfile || user.entrepreneurProfile ||
                       user.participantProfile || user.adminProfile ||
                       user.programManagerProfile || user.startupProfile;
    
    // Add virtual status field
    const userWithStatus = {
      ...user,
      status: hasProfile ? 'ACTIVE' : 'PENDING'
    };
    
    return NextResponse.json(userWithStatus);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { name, email, role, specialization, password } = body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role as UserRole;
    if (specialization !== undefined) updateData.specialization = specialization;
    
    // If password is provided, hash it
    if (password) {
      updateData.password = await hash(password, 10);
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
