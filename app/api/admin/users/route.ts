import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole } from '@prisma/client';

// GET /api/admin/users - Get all users with pagination and filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || undefined;
    
    const skip = (page - 1) * limit;
    
    // Build the where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        specialization: true,
        startupProfile: {
          select: {
            companyName: true,
            industry: true,
            stage: true
          }
        },
        mentorProfile: {
          select: {
            expertise: true,
            experience: true
          }
        },
        investorProfile: {
          select: {
            companyName: true,
            investmentFocus: true
          }
        },
        acceleratorProfile: {
          select: {
            organizationName: true,
            industry: true,
            focusAreas: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count for pagination
    const total = await prisma.user.count({ where });
    
    // Transform the users to include a virtual status field
    const transformedUsers = users.map(user => {
      // Determine if the user has completed their profile
      const hasProfile = user.startupProfile || user.mentorProfile || 
                         user.investorProfile || user.acceleratorProfile;
      
      return {
        ...user,
        // Virtual status field
        status: hasProfile ? 'ACTIVE' : 'PENDING',
        // Add a program field based on profile data
        program: user.startupProfile?.companyName || 
                 user.acceleratorProfile?.organizationName || 
                 user.mentorProfile?.expertise || 
                 user.investorProfile?.companyName || '-'
      };
    });
    
    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, specialization } = body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        specialization
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
        createdAt: true
      }
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Bulk update users
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userIds, action, data } = body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'No users specified' },
        { status: 400 }
      );
    }
    
    if (!action) {
      return NextResponse.json(
        { error: 'No action specified' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'updateRole':
        if (!data.role) {
          return NextResponse.json(
            { error: 'No role specified' },
            { status: 400 }
          );
        }
        
        result = await prisma.$transaction(
          userIds.map(id => 
            prisma.user.update({
              where: { id },
              data: { role: data.role as UserRole },
              select: { id: true }
            })
          )
        );
        break;
        
      case 'updateSpecialization':
        if (!data.specialization) {
          return NextResponse.json(
            { error: 'No specialization specified' },
            { status: 400 }
          );
        }
        
        result = await prisma.$transaction(
          userIds.map(id => 
            prisma.user.update({
              where: { id },
              data: { specialization: data.specialization },
              select: { id: true }
            })
          )
        );
        break;
        
      case 'delete':
        result = await prisma.$transaction(
          userIds.map(id => 
            prisma.user.delete({
              where: { id },
              select: { id: true }
            })
          )
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      count: result.length,
      action
    });
  } catch (error) {
    console.error('Error updating users:', error);
    return NextResponse.json(
      { error: 'Failed to update users' },
      { status: 500 }
    );
  }
}
