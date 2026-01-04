import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { UserRole } from '@prisma/client';

// PUT /api/admin/users/[id]/role - Update a user's role
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
    const { role } = body;
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
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
    
    // Validate role value against UserRole enum from auth.ts
    const validRoles = ['ADMIN', 'PROGRAM_MANAGER', 'MENTOR', 'INVESTOR', 'PARTICIPANT', 'ENTREPRENEUR'];
    
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { 
          error: 'Invalid role value. Valid roles are: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, PARTICIPANT, ENTREPRENEUR' 
        },
        { status: 400 }
      );
    }
    
    try {
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
    } catch (error: any) {
      console.error('Error updating user role:', error);
      
      // Check if it's an enum validation error
      if (error.code === 'P2006' || error.message.includes('enum')) {
        return NextResponse.json(
          { 
            error: 'Invalid role value. Valid roles are: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, PARTICIPANT, ENTREPRENEUR' 
          },
          { status: 400 }
        );
      }
      
      throw error; // rethrow for the general error handler
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
