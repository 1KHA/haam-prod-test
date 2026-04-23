import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only entrepreneurs can view their team members
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can view team members' },
        { status: 403 }
      );
    }

    // Get team member by ID
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        id: params.id,
        creatorId: user.userId, // Ensure the team member belongs to the user
      },
    });
    
    // Check if team member exists
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
    
    // Return team member details
    return NextResponse.json({
      teamMember: {
        id: teamMember.id,
        name: teamMember.name,
        position: teamMember.position,
        email: teamMember.email,
        phone: teamMember.phone,
        avatar: teamMember.avatar,
        department: teamMember.department,
        createdAt: teamMember.createdAt,
      },
    });
    
  } catch (error) {
    console.error('Get team member details error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching team member details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only entrepreneurs can update their team members
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can update team members' },
        { status: 403 }
      );
    }

    // Check if team member exists and belongs to the user
    const existingTeamMember = await prisma.teamMember.findUnique({
      where: {
        id: params.id,
        creatorId: user.userId,
      },
    });

    if (!existingTeamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, position, email, phone, department, avatar } = body;
    
    // Validate required fields
    if (!name || !position || !email || !phone || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Update team member in database
    const updatedTeamMember = await prisma.teamMember.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        position,
        email,
        phone,
        department,
        avatar: avatar || existingTeamMember.avatar,
      },
    });
    
    // Return success response
    return NextResponse.json({
      message: 'Team member updated successfully',
      teamMember: {
        id: updatedTeamMember.id,
        name: updatedTeamMember.name,
        position: updatedTeamMember.position,
        email: updatedTeamMember.email,
        phone: updatedTeamMember.phone,
        avatar: updatedTeamMember.avatar,
        department: updatedTeamMember.department,
      },
    });
    
  } catch (error) {
    console.error('Update team member error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the team member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only entrepreneurs can delete their team members
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can delete team members' },
        { status: 403 }
      );
    }

    // Check if team member exists and belongs to the user
    const existingTeamMember = await prisma.teamMember.findUnique({
      where: {
        id: params.id,
        creatorId: user.userId,
      },
    });

    if (!existingTeamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Delete team member from database
    await prisma.teamMember.delete({
      where: {
        id: params.id,
      },
    });
    
    // Return success response
    return NextResponse.json({
      message: 'Team member deleted successfully',
    });
    
  } catch (error) {
    console.error('Delete team member error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the team member' },
      { status: 500 }
    );
  }
}
