import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole } from '@prisma/client';
import { checkPermission } from '@/lib/permissions';

// GET /api/admin/users/[id] - Get a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Check permission
    const permissionCheck = await checkPermission(request, { 
      category: 'users', 
      action: 'view' 
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    // Get user with all possible profiles based on UserRole enum
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentorProfile: true,
        investorProfile: true,
        entrepreneurProfile: true,
        programManagerProfile: true,
        participantProfile: true,
        adminProfile: true,
        startups: true,
        teamMembers: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Log to help debug missing profile issues
    console.log(`User ${userId} role: ${user.role}, has profile: ${
      user.role === 'MENTOR' ? !!user.mentorProfile :
      user.role === 'INVESTOR' ? !!user.investorProfile :
      user.role === 'ENTREPRENEUR' ? !!user.entrepreneurProfile :
      user.role === 'PROGRAM_MANAGER' ? !!user.programManagerProfile :
      user.role === 'PARTICIPANT' ? !!user.participantProfile :
      user.role === 'ADMIN' ? !!user.adminProfile :
      false
    }`);
    
    // Determine if the user has completed their profile
    const hasProfile = user.mentorProfile || 
                      user.investorProfile || 
                      user.entrepreneurProfile ||
                      user.participantProfile || 
                      user.adminProfile ||
                      user.programManagerProfile;
    
    // Add virtual status field
    const userWithStatus = {
      ...user,
      status: hasProfile ? 'ACTIVE' : 'PENDING'
    };
    
    return NextResponse.json(userWithStatus);
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { 
      category: 'users', 
      action: 'edit' 
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }
    
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
    
    // Validate role value if provided
    if (role) {
      const validRoles = ['ADMIN', 'PROGRAM_MANAGER', 'MENTOR', 'INVESTOR', 'PARTICIPANT', 'ENTREPRENEUR'];
      
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { 
            error: 'Invalid role value. Valid roles are: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, PARTICIPANT, ENTREPRENEUR' 
          },
          { status: 400 }
        );
      }
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { 
      category: 'users', 
      action: 'delete' 
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }
    
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
    
    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Partial update of a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { 
      category: 'users', 
      action: 'edit' 
    });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = params.id;
    const body = await request.json();
    const { role } = body;
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }
    
    // Validate role value
    const validRoles = ['ADMIN', 'PROGRAM_MANAGER', 'MENTOR', 'INVESTOR', 'PARTICIPANT', 'ENTREPRENEUR'];
    
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { 
          error: 'Invalid role value. Valid roles are: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, PARTICIPANT, ENTREPRENEUR' 
        },
        { status: 400 }
      );
    }
    
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
    
    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as UserRole
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
