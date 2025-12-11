import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// GET /api/admin/roles - Get all roles with their permissions
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    // Get all roles with their permissions
    const roles = await prisma.role.findMany({
      where: {
        name: {
          contains: search
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Count users for each role
    const rolesWithUserCount = await Promise.all(
      roles.map(async (role: any) => {
        const userCount = await prisma.user.count({
          where: {
            rolePermissions: {
              some: {
                roleId: role.id,
              },
            },
          },
        });

        // Transform permissions into a more usable format
        const permissionsMap: Record<string, Record<string, boolean>> = {};
        
        role.permissions.forEach((rp: any) => {
          const { category, action } = rp.permission;
          
          if (!permissionsMap[category]) {
            permissionsMap[category] = {};
          }
          
          permissionsMap[category][action] = true;
        });

        return {
          id: role.id,
          name: role.name,
          description: role.description,
          usersCount: userCount,
          permissions: permissionsMap,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        };
      })
    );

    return NextResponse.json(rolesWithUserCount);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { name, description, permissions } = body;

    // Validate request body
    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: {
        name,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role already exists' },
        { status: 400 }
      );
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    });

    // Add permissions to role if provided
    const permissionsMap: Record<string, Record<string, boolean>> = {};
    
    if (permissions && Object.keys(permissions).length > 0) {
      for (const category of Object.keys(permissions)) {
        permissionsMap[category] = {};
        
        for (const action of Object.keys(permissions[category])) {
          if (permissions[category][action]) {
            // Find or create permission
            let permission = await prisma.permission.findUnique({
              where: {
                category_action: {
                  category,
                  action,
                },
              },
            });

            if (!permission) {
              permission = await prisma.permission.create({
                data: {
                  category,
                  action,
                },
              });
            }

            // Add permission to role
            await prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permission.id,
              },
            });
            
            // Add to permissions map
            if (!permissionsMap[category]) {
              permissionsMap[category] = {};
            }
            permissionsMap[category][action] = true;
          }
        }
      }
    }
    
    // Count users (will be 0 for new role)
    const userCount = 0;

    // Return complete role object with permissions
    return NextResponse.json({
      id: role.id,
      name: role.name,
      description: role.description,
      usersCount: userCount,
      permissions: permissionsMap,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/roles - Update roles (batch operations)
export async function PUT(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { roleIds, action, data } = body;

    // Validate request body
    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return NextResponse.json(
        { error: 'Role IDs are required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let count = 0;

    // Perform action based on the action type
    switch (action) {
      case 'delete':
        // Delete roles
        const deleteResult = await prisma.role.deleteMany({
          where: {
            id: {
              in: roleIds,
            },
          },
        });
        count = deleteResult.count;
        break;

      case 'updatePermissions':
        // Update permissions for roles
        if (!data || !data.permissions) {
          return NextResponse.json(
            { error: 'Permissions data is required' },
            { status: 400 }
          );
        }

        // Process each role
        for (const roleId of roleIds) {
          // Remove existing permissions
          await prisma.rolePermission.deleteMany({
            where: {
              roleId,
            },
          });

          // Add new permissions
          for (const category of Object.keys(data.permissions)) {
            for (const action of Object.keys(data.permissions[category])) {
              if (data.permissions[category][action]) {
                // Find or create permission
                let permission = await prisma.permission.findUnique({
                  where: {
                    category_action: {
                      category,
                      action,
                    },
                  },
                });

                if (!permission) {
                  permission = await prisma.permission.create({
                    data: {
                      category,
                      action,
                    },
                  });
                }

                // Add permission to role
                await prisma.rolePermission.create({
                  data: {
                    roleId,
                    permissionId: permission.id,
                  },
                });
              }
            }
          }
        }
        count = roleIds.length;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error updating roles:', error);
    return NextResponse.json(
      { error: 'Failed to update roles' },
      { status: 500 }
    );
  }
}
