import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { UserRole } from '@/lib/auth';
import { checkPermission } from '@/lib/permissions';
import { notifyPasswordChanged, notifyUserUpdated, notifyUserDeleted } from '@/lib/services/notification-events';

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
      user.role === 'ADMIN' ? !!user.adminProfile :
      false
    }`);
    
    // Determine if the user has completed their profile
    const hasProfile = user.mentorProfile || 
                      user.investorProfile || 
                      user.entrepreneurProfile ||
                      user.adminProfile ||
                      user.programManagerProfile;
    
    // Add virtual status field
    const userWithStatus = {
      ...user,
      status: user.approvalStatus || (hasProfile ? 'ACTIVE' : 'PENDING_APPROVAL')
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
    
    // Check if user exists with their current role and profiles
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentorProfile: true,
        investorProfile: true,
        startupProfile: true,
        adminProfile: true,
        programManagerProfile: true,
        entrepreneurProfile: true,
      }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Validate role value if provided
    if (role) {
      const validRoles = ['ADMIN', 'PROGRAM_MANAGER', 'MENTOR', 'INVESTOR', 'ENTREPRENEUR'];
      
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { 
            error: 'Invalid role value. Valid roles are: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, ENTREPRENEUR' 
          },
          { status: 400 }
        );
      }
    }
    
    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role as UserRole;
    if (specialization !== undefined) updateData.specialization = specialization;
    
    // Track if password is being changed for notification
    let passwordChanged = false;
    
    // If password is provided, hash it
    if (password) {
      updateData.password = await hash(password, 10);
      passwordChanged = true;
    }
    
    // Check if role is being changed and handle role-specific profiles
    if (role && role !== existingUser.role) {
      console.log(`Changing user role from ${existingUser.role} to ${role}`);
      
      // Create new role-specific profile based on the new role
      switch (role) {
        case 'ADMIN':
          updateData.adminProfile = {
            create: {
              department: 'General',
              permissions: 'Default'
            }
          };
          break;
        case 'PROGRAM_MANAGER':
          updateData.programManagerProfile = {
            create: {
              programs: '',
              responsibilities: ''
            }
          };
          break;
        case 'MENTOR':
          updateData.mentorProfile = {
            create: {
              expertise: specialization || '',
              experience: '',
              availability: ''
            }
          };
          break;
        case 'INVESTOR':
          updateData.investorProfile = {
            create: {
              companyName: '',
              investmentFocus: specialization || '',
              investmentStage: '',
              investmentSize: ''
            }
          };
          break;
        case 'ENTREPRENEUR':
          updateData.entrepreneurProfile = {
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
    }
    
    // Get current user data for comparison before update
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: true, specialization: true }
    });
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        profile: true,
        mentorProfile: true,
        investorProfile: true,
        startupProfile: true,
        adminProfile: true,
        programManagerProfile: true,
        entrepreneurProfile: true,
      }
    });
    
    // Send notifications for changes (don't await - don't block response)
    console.log(`[Admin Users] Checking for notifications...`);
    
    // Get updater info for notifications
    const updaterInfo = await prisma.user.findUnique({
      where: { id: permissionCheck.userId },
      select: { name: true }
    });
    const updaterName = updaterInfo?.name || 'Admin';
    
    // 1. Password change notification (TASK-01)
    if (passwordChanged) {
      console.log(`[Admin Users] Sending password change notification...`);
      try {
        await notifyPasswordChanged({
          userId,
          changedAt: new Date(),
          changedByName: updaterName,
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
        });
        console.log(`[Admin Users] Password change notification sent`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (notifyError: any) {
        console.error('[Admin Users] Failed to send password change notification:', notifyError.message);
      }
    }
    
    // 2. Profile update notification (TASK-03)
    const changedFields: string[] = [];
    if (name && name !== currentUser?.name) changedFields.push('name');
    if (email && email !== currentUser?.email) changedFields.push('email');
    if (role && role !== currentUser?.role) changedFields.push('role');
    if (specialization !== undefined && specialization !== currentUser?.specialization) {
      changedFields.push('specialization');
    }
    
    if (changedFields.length > 0) {
      console.log(`[Admin Users] Sending profile update notification...`);
      try {
        await notifyUserUpdated({
          userId,
          changedFields,
          updatedByName: updaterName,
        });
        console.log(`[Admin Users] Profile update notification sent`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (notifyError: any) {
        console.error('[Admin Users] Failed to send profile update notification:', notifyError.message);
      }
    }
    
    // Determine if the user has completed their profile
    const hasProfile = updatedUser.mentorProfile || 
                      updatedUser.investorProfile || 
                      updatedUser.startupProfile ||
                      updatedUser.adminProfile ||
                      updatedUser.programManagerProfile ||
                      updatedUser.entrepreneurProfile;
    
    // Add virtual status field
    const userWithStatus = {
      ...updatedUser,
      status: updatedUser.approvalStatus || (hasProfile ? 'ACTIVE' : 'PENDING_APPROVAL')
    };
    
    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = userWithStatus;
    
    return NextResponse.json(userWithoutPassword);
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
    
    // Check if user exists with all related data
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mentorProfile: true,
        investorProfile: true,
        entrepreneurProfile: true,
        programManagerProfile: true,
        adminProfile: true,
        startups: true,
        teamMembers: true
      }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Save user info for notification before deletion (TASK-04)
    const userToDelete = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email
    };
    
    // Use transaction to safely delete user and all related records
    await prisma.$transaction(async (tx) => {
      // Delete related records that reference the user
      
      // Delete role permissions
      await tx.rolePermission.deleteMany({
        where: { userId: userId }
      });
      
      // Delete event registrations
      await tx.eventRegistration.deleteMany({
        where: { userId: userId }
      });
      
      // Delete cohort mentorships
      await tx.cohortMentor.deleteMany({
        where: { userId: userId }
      });
      
      // Delete company memberships
      await tx.companyMember.deleteMany({
        where: { userId: userId }
      });
      
      // Delete team member records
      await tx.teamMember.deleteMany({
        where: { creatorId: userId }
      });
      
      // Delete milestones created by user
      await tx.milestone.deleteMany({
        where: { createdBy: userId }
      });
      
      // Delete invitations sent by user
      await tx.invitation.deleteMany({
        where: { inviterId: userId }
      });
      
      // Delete funding records created by user
      await tx.funding.deleteMany({
        where: { createdBy: userId }
      });
      
      // Delete funding opportunities
      await tx.fundingOpportunity.deleteMany({
        where: { entrepreneurId: userId }
      });
      
      // Delete all profile records first to avoid foreign key constraints
      if (existingUser.mentorProfile) {
        await tx.mentorProfile.delete({
          where: { userId: userId }
        });
      }
      
      if (existingUser.investorProfile) {
        await tx.investorProfile.delete({
          where: { userId: userId }
        });
      }
      
      if (existingUser.entrepreneurProfile) {
        await tx.entrepreneurProfile.delete({
          where: { userId: userId }
        });
      }
      
      if (existingUser.programManagerProfile) {
        await tx.programManagerProfile.delete({
          where: { userId: userId }
        });
      }
      
      if (existingUser.adminProfile) {
        await tx.adminProfile.delete({
          where: { userId: userId }
        });
      }
      
      // Delete startups created by the user (with proper cascade)
      const userStartups = await tx.startup.findMany({
        where: { creatorId: userId }
      });
      
      // Delete all related startup records first
      for (const startup of userStartups) {
        // Delete milestone submissions owned by the startup. Cohort milestones
        // are shared and must remain available to the rest of the cohort.
        await tx.milestoneSubmission.deleteMany({
          where: { startupId: startup.id }
        });
        
        // Delete cohort memberships
        await tx.cohortMember.deleteMany({
          where: { startupId: startup.id }
        });
        
        // Delete company members
        await tx.companyMember.deleteMany({
          where: { startupId: startup.id }
        });
        
        // Delete invitations for the startup
        await tx.invitation.deleteMany({
          where: { startupId: startup.id }
        });
      }
      
      // Delete the startups themselves
      await tx.startup.deleteMany({
        where: { creatorId: userId }
      });
      
      // Only check for critical records that truly cannot be deleted (programs and cohorts)
      const criticalRecords = await tx.user.findUnique({
        where: { id: userId },
        include: {
          programs: true,
          managedCohorts: true
        }
      });
      
      if (criticalRecords) {
        const hasCriticalRecords = criticalRecords.programs.length > 0 ||
                                  criticalRecords.managedCohorts.length > 0;
        
        if (hasCriticalRecords) {
          throw new Error('Cannot delete user: user has created programs or manages cohorts that must be handled first');
        }
      }
      
      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });
    
    // Send notification about user deletion (TASK-04)
    console.log(`[Admin Users] Sending user deletion notification...`);
    try {
      // Get all admins to notify
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });
      
      // Get deleter info
      const deleterInfo = await prisma.user.findUnique({
        where: { id: permissionCheck.userId },
        select: { name: true }
      });
      
      await notifyUserDeleted({
        deletedUserId: userToDelete.id,
        deletedUserName: userToDelete.name,
        deletedUserEmail: userToDelete.email,
        deletedByName: deleterInfo?.name || 'Admin',
        adminIds: admins.map(a => a.id),
      });
      console.log(`[Admin Users] User deletion notification sent to ${admins.length} admins`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (notifyError: any) {
      console.error('[Admin Users] Failed to send user deletion notification:', notifyError.message);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    // Check for specific constraint violations
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete user: user has associated records that must be handled first' },
        { status: 409 }
      );
    }
    
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
    const validRoles = ['ADMIN', 'PROGRAM_MANAGER', 'MENTOR', 'INVESTOR', 'ENTREPRENEUR'];
    
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { 
          error: 'Invalid role value. Valid roles are: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, ENTREPRENEUR' 
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
