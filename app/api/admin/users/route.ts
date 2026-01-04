import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { UserRole } from '@prisma/client';

// GET /api/admin/users - Get all users with pagination, search, and filtering
export async function GET(req: NextRequest) {
  try {
    console.log('[Users API] Processing GET request');
    
    // Extract auth header for logging
    const authHeader = req.headers.get('Authorization');
    console.log('[Users API] Auth header present:', !!authHeader);
    
    // Check permission with enhanced logging
    const permissionCheck = await checkPermission(req, { category: 'users', action: 'view' });
    console.log('[Users API] Permission check result:', permissionCheck);
    
    if (!permissionCheck.authorized) {
      console.error(`[Users API] Permission denied: ${permissionCheck.error}`);
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    
    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Apply role filter - normalize it to uppercase if provided
    if (role && role.toUpperCase() !== 'ALL') {
      where.role = role.toUpperCase();
      console.log('[Users API] Applying role filter:', role.toUpperCase());
    }

    // Fetch users with their profiles
    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        mentorProfile: true,
        investorProfile: true,
        startupProfile: true,
        adminProfile: true,
        programManagerProfile: true,
        entrepreneurProfile: true,
        participantProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get total count with filters for pagination
    const total = await prisma.user.count({ where });

    // Format the response
    const formattedUsers = users.map((user: any) => {
      // Determine profile data
      const roleProfile = 
        user.mentorProfile || 
        user.investorProfile || 
        user.startupProfile || 
        user.adminProfile || 
        user.programManagerProfile || 
        user.entrepreneurProfile || 
        user.participantProfile;

      // Determine status
      const status = roleProfile ? 'ACTIVE' : 'PENDING';

      // Get program information if available
      let program = '-';
      if (user.programManagerProfile?.programs) {
        program = user.programManagerProfile.programs;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialization: user.specialization,
        createdAt: user.createdAt,
        status: status,
        program: program,
        profile: user.profile,
        roleProfile: roleProfile
      };
    });

    // Calculate pagination metadata
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
      hasMore: page < Math.ceil(total / limit)
    };

    return NextResponse.json({ 
      users: formattedUsers,
      pagination
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'users', action: 'add' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const body = await req.json();
    const { email, password, name, role, specialization } = body;

    // Validate role - only accept valid enum values from the standardized list
    const validRoles = ['ADMIN', 'PROGRAM_MANAGER', 'MENTOR', 'INVESTOR', 'PARTICIPANT', 'ENTREPRENEUR'];
    
    if (!validRoles.includes(role)) {
      console.error(`[Users API] Invalid role specified: '${role}'`);
      return NextResponse.json(
        { error: 'Invalid role value. Valid roles are: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, PARTICIPANT, ENTREPRENEUR' },
        { status: 400 }
      );
    }
    
    // Role is valid, use it directly
    const userRole = role as UserRole;
    console.log(`[Users API] Using validated role: '${userRole}'`);

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword(password);

    // Create the base user data
    const baseUserData = {
      email,
      password: hashedPassword,
      name,
      role: userRole,
      specialization,
      profile: {
        create: {},
      }
    };
    
    // Prepare the role-specific profile data
    let userData: any = { ...baseUserData };
    
    // Add role-specific profile based on the selected role
    switch(userRole) {
      case 'ADMIN':
        userData.adminProfile = {
          create: {
            department: 'General',
            permissions: 'Default'
          }
        };
        break;
      case 'PROGRAM_MANAGER':
        userData.programManagerProfile = {
          create: {
            programs: '',
            responsibilities: ''
          }
        };
        break;
      case 'MENTOR':
        userData.mentorProfile = {
          create: {
            expertise: specialization || '',
            experience: '',
            availability: ''
          }
        };
        break;
      case 'INVESTOR':
        userData.investorProfile = {
          create: {
            companyName: '',
            investmentFocus: specialization || '',
            investmentStage: '',
            investmentSize: ''
          }
        };
        break;
      case 'PARTICIPANT':
        userData.participantProfile = {
          create: {
            skills: specialization || '',
            interests: '',
            education: '',
            experience: ''
          }
        };
        break;
      case 'ENTREPRENEUR':
        userData.entrepreneurProfile = {
          create: {
            organizationName: name + "'s Organization",
            industry: specialization || '',
            focusAreas: '',
            programLength: '',
            website: '',
            description: ''
          }
        };
        break;
    }
    
    // Create user with the appropriate profiles
    const user = await prisma.user.create({
      data: userData,
      include: {
        profile: true,
        adminProfile: userRole === 'ADMIN',
        programManagerProfile: userRole === 'PROGRAM_MANAGER',
        mentorProfile: userRole === 'MENTOR',
        investorProfile: userRole === 'INVESTOR',
        participantProfile: userRole === 'PARTICIPANT',
        entrepreneurProfile: userRole === 'ENTREPRENEUR',
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update a user
export async function PUT(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'users', action: 'edit' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const body = await req.json();
    const { id, email, name, role, specialization } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Handle role update if provided
    let userRole: UserRole | undefined = undefined;
    
    if (role) {
      // Validate role - only accept valid enum values from the standardized list
      const validRoles = ['ADMIN', 'PROGRAM_MANAGER', 'MENTOR', 'INVESTOR', 'PARTICIPANT', 'ENTREPRENEUR'];
      
      if (!validRoles.includes(role)) {
        console.error(`[Users API] Invalid role specified: '${role}'`);
        return NextResponse.json(
          { error: 'Invalid role value. Valid roles are: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, PARTICIPANT, ENTREPRENEUR' },
          { status: 400 }
        );
      }
      
      // Role is valid, use it directly
      userRole = role as UserRole;
      console.log(`[Users API] Using validated role: '${userRole}'`);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        role: userRole,
        specialization,
      },
      include: {
        profile: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete a user
export async function DELETE(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'users', action: 'delete' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
