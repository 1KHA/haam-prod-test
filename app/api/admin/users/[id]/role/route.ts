import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { UserRole } from '@prisma/client';
import { emitPermissionsRefresh } from '@/lib/sse-helpers';

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
    
    // Validate role - first check standard enum roles, then check custom roles in the database
    const validEnumRoles = ['ADMIN', 'PROGRAM_MANAGER', 'MENTOR', 'INVESTOR', 'PARTICIPANT', 'ENTREPRENEUR'];
    
    let isValidRole = validEnumRoles.includes(role);
    
    // If not a standard enum role, check if it's a custom role in the database
    if (!isValidRole) {
      console.log(`Role ${role} not found in enum, checking database for custom roles...`);
      
      // Check if this is a role ID
      const customRoleById = await prisma.role.findUnique({
        where: { id: role }
      });
      
      if (customRoleById) {
        isValidRole = true;
        console.log(`Found custom role by ID: ${customRoleById.name}`);
      } else {
        // Check if this is a role name
        const customRoleByName = await prisma.role.findFirst({
          where: { name: role }
        });
        
        if (customRoleByName) {
          isValidRole = true;
          console.log(`Found custom role by name: ${customRoleByName.name}`);
        }
      }
    }
    
    if (!isValidRole) {
      return NextResponse.json(
        { 
          error: 'Invalid role value. The role does not exist in the system.' 
        },
        { status: 400 }
      );
    }
    
    try {
      // First determine if this is a standard enum role or a custom role
      let userRoleUpdate: any = {};
      
      if (validEnumRoles.includes(role)) {
        // It's a standard enum role
        userRoleUpdate = { role: role as UserRole };
      } else {
        // For custom roles, we need to find the role record first
        const customRole = await prisma.role.findFirst({
          where: { 
            OR: [
              { id: role },
              { name: role }
            ] 
          }
        });
        
        if (customRole) {
          // For custom roles, we set a standard enum value that will be overridden by permissions
          // This ensures compatibility with the UserRole enum while supporting custom roles
          userRoleUpdate = { 
            role: UserRole.ADMIN, // Use ADMIN as a base role for permissions
            // Store custom role ID in a separate field if needed
            // customRoleId: customRole.id 
          };
          
          // Assign the custom role permissions to the user
          await prisma.rolePermission.deleteMany({
            where: {
              userId: userId
            }
          });
          
          // Get role permissions
          const rolePermissions = await prisma.rolePermission.findMany({
            where: {
              roleId: customRole.id,
              userId: null
            },
            include: {
              permission: true
            }
          });
          
          // Assign all permissions from the role to the user
          for (const rolePerm of rolePermissions) {
            await prisma.rolePermission.create({
              data: {
                userId: userId,
                permissionId: rolePerm.permissionId,
                roleId: customRole.id
              }
            });
          }
          
          console.log(`Assigned custom role "${customRole.name}" to user ${userId} with ${rolePermissions.length} permissions`);
        } else {
          throw new Error(`Role not found: ${role}`);
        }
      }
      
      // Update the user's role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: userRoleUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      // Emit permissions refresh event to update all connected clients
      await emitPermissionsRefresh(userId, { includeConnectedUsers: true });
      
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
