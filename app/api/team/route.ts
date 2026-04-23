import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
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

    // Get team members created by the user
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        creatorId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Return team members
    return NextResponse.json({
      teamMembers: teamMembers.map(member => ({
        id: member.id,
        name: member.name,
        position: member.position,
        email: member.email,
        phone: member.phone,
        avatar: member.avatar,
        department: member.department,
        createdAt: member.createdAt,
      })),
    });
    
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Only entrepreneurs can create team members
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can create team members' },
        { status: 403 }
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
    
    // Create team member in database
    const teamMember = await prisma.teamMember.create({
      data: {
        name,
        position,
        email,
        phone,
        department,
        avatar: avatar || '/placeholder-avatar.jpg',
        creatorId: user.userId,
      },
    });
    
    // Return success response
    return NextResponse.json({
      message: 'Team member created successfully',
      teamMember: {
        id: teamMember.id,
        name: teamMember.name,
        position: teamMember.position,
        email: teamMember.email,
        phone: teamMember.phone,
        avatar: teamMember.avatar,
        department: teamMember.department,
      },
    });
    
  } catch (error) {
    console.error('Create team member error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the team member' },
      { status: 500 }
    );
  }
}
