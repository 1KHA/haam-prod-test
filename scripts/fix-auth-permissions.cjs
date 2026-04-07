const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAuthPermissions() {
  console.log('🔧 Starting authentication and permission fixes...');

  try {
    // Step 1: Ensure basic roles exist
    console.log('\n📋 Step 1: Ensuring roles exist...');
    
    const rolesData = [
      { name: 'مدير النظام', englishName: 'ADMIN' },
      { name: 'مدير برنامج', englishName: 'PROGRAM_MANAGER' },
      { name: 'رائد أعمال', englishName: 'ENTREPRENEUR' },
      { name: 'مستثمر', englishName: 'INVESTOR' },
      { name: 'موجه', englishName: 'MENTOR' }
    ];

    for (const roleData of rolesData) {
      const existingRole = await prisma.role.findFirst({
        where: {
          OR: [
            { name: roleData.name },
            { name: roleData.englishName }
          ]
        }
      });

      if (!existingRole) {
        await prisma.role.create({
          data: {
            name: roleData.name,
            description: `${roleData.englishName} role`
          }
        });
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`✅ Role exists: ${roleData.name}`);
      }
    }

    // Step 2: Ensure basic permissions exist
    console.log('\n📋 Step 2: Ensuring permissions exist...');
    
    const permissionsData = [
      { category: 'events', action: 'view' },
      { category: 'events', action: 'create' },
      { category: 'events', action: 'edit' },
      { category: 'events', action: 'delete' },
      { category: 'notifications', action: 'view' },
      { category: 'notifications', action: 'create' },
      { category: 'notifications', action: 'edit' },
      { category: 'startups', action: 'view' },
      { category: 'startups', action: 'create' },
      { category: 'startups', action: 'edit' },
      { category: 'users', action: 'view' },
      { category: 'users', action: 'edit' }
    ];

    for (const permData of permissionsData) {
      const existingPerm = await prisma.permission.findFirst({
        where: {
          category: permData.category,
          action: permData.action
        }
      });

      if (!existingPerm) {
        await prisma.permission.create({
          data: permData
        });
        console.log(`✅ Created permission: ${permData.category}:${permData.action}`);
      } else {
        console.log(`✅ Permission exists: ${permData.category}:${permData.action}`);
      }
    }

    // Step 3: Assign permissions to roles
    console.log('\n📋 Step 3: Assigning permissions to roles...');

    // Get role records
    const adminRole = await prisma.role.findFirst({
      where: {
        OR: [{ name: 'مدير النظام' }, { name: 'ADMIN' }]
      }
    });

    const programManagerRole = await prisma.role.findFirst({
      where: {
        OR: [{ name: 'مدير برنامج' }, { name: 'PROGRAM_MANAGER' }]
      }
    });

    // Admin gets all permissions
    if (adminRole) {
      const allPermissions = await prisma.permission.findMany();
      
      for (const permission of allPermissions) {
        const existingMapping = await prisma.rolePermission.findFirst({
          where: {
            roleId: adminRole.id,
            permissionId: permission.id,
            userId: null // Role-based permission, not user-specific
          }
        });

        if (!existingMapping) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permission.id,
              userId: null
            }
          });
          console.log(`✅ Granted ${permission.category}:${permission.action} to ADMIN`);
        }
      }
    }

    // Program Manager gets specific permissions
    if (programManagerRole) {
      const pmPermissions = [
        { category: 'events', action: 'view' },
        { category: 'events', action: 'create' },
        { category: 'events', action: 'edit' },
        { category: 'events', action: 'delete' },
        { category: 'startups', action: 'view' },
        { category: 'startups', action: 'create' },
        { category: 'startups', action: 'edit' },
        { category: 'notifications', action: 'view' }
      ];

      for (const permData of pmPermissions) {
        const permission = await prisma.permission.findFirst({
          where: {
            category: permData.category,
            action: permData.action
          }
        });

        if (permission) {
          const existingMapping = await prisma.rolePermission.findFirst({
            where: {
              roleId: programManagerRole.id,
              permissionId: permission.id,
              userId: null
            }
          });

          if (!existingMapping) {
            await prisma.rolePermission.create({
              data: {
                roleId: programManagerRole.id,
                permissionId: permission.id,
                userId: null
              }
            });
            console.log(`✅ Granted ${permission.category}:${permission.action} to PROGRAM_MANAGER`);
          }
        }
      }
    }

    // Step 4: Create/update test users with proper roles
    console.log('\n📋 Step 4: Creating/updating test users...');

    // Create admin test user
    const adminEmail = 'admin@example.com';
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: '$2a$10$CrI4UUdGJJKBtHVpKVfaueC9NWQwvSz1/8YOOgLx8akYzCHQxG3pC', // password: "password"
          name: 'Admin Test User',
          role: 'ADMIN',
          profile: {
            create: {
              bio: 'Test admin user for authentication testing',
              position: 'System Administrator'
            }
          }
        }
      });
      console.log(`✅ Created admin test user: ${adminEmail}`);
    } else {
      // Update role if needed
      if (adminUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: 'ADMIN' }
        });
        console.log(`✅ Updated admin test user role: ${adminEmail}`);
      } else {
        console.log(`✅ Admin test user exists: ${adminEmail}`);
      }
    }

    // Create program manager test user
    const pmEmail = 'pm@example.com';
    let pmUser = await prisma.user.findUnique({
      where: { email: pmEmail }
    });

    if (!pmUser) {
      pmUser = await prisma.user.create({
        data: {
          email: pmEmail,
          password: '$2a$10$CrI4UUdGJJKBtHVpKVfaueC9NWQwvSz1/8YOOgLx8akYzCHQxG3pC', // password: "password"
          name: 'Program Manager Test User',
          role: 'PROGRAM_MANAGER',
          profile: {
            create: {
              bio: 'Test program manager user for authentication testing',
              position: 'Program Manager'
            }
          }
        }
      });
      console.log(`✅ Created program manager test user: ${pmEmail}`);
    } else {
      // Update role if needed
      if (pmUser.role !== 'PROGRAM_MANAGER') {
        await prisma.user.update({
          where: { id: pmUser.id },
          data: { role: 'PROGRAM_MANAGER' }
        });
        console.log(`✅ Updated program manager test user role: ${pmEmail}`);
      } else {
        console.log(`✅ Program manager test user exists: ${pmEmail}`);
      }
    }

    // Step 5: Verify permission system works
    console.log('\n📋 Step 5: Verifying permission system...');

    // Test admin permissions
    const adminPermissions = await prisma.rolePermission.count({
      where: {
        role: {
          OR: [{ name: 'مدير النظام' }, { name: 'ADMIN' }]
        },
        userId: null
      }
    });
    console.log(`✅ Admin role has ${adminPermissions} permissions`);

    // Test program manager permissions
    const pmPermissions = await prisma.rolePermission.count({
      where: {
        role: {
          OR: [{ name: 'مدير برنامج' }, { name: 'PROGRAM_MANAGER' }]
        },
        userId: null
      }
    });
    console.log(`✅ Program Manager role has ${pmPermissions} permissions`);

    // Step 6: Create sample events for testing
    console.log('\n📋 Step 6: Creating sample events for testing...');

    const sampleEvent = await prisma.event.findFirst({
      where: {
        title: 'Test Event for Program Manager'
      }
    });

    if (!sampleEvent && pmUser) {
      await prisma.event.create({
        data: {
          title: 'Test Event for Program Manager',
          description: 'A sample event to test program manager functionality',
          eventType: 'conference',
          startDate: new Date('2025-12-01T10:00:00Z'),
          endDate: new Date('2025-12-01T18:00:00Z'),
          location: 'Test Conference Center',
          organizer: 'Program Manager Test',
          capacity: 100,
          status: 'published',
          creatorId: pmUser.id
        }
      });
      console.log(`✅ Created sample test event`);
    } else {
      console.log(`✅ Sample test event already exists`);
    }

    console.log('\n🎉 Authentication and permission fixes completed successfully!');
    console.log('\n📋 Test Users Created:');
    console.log('👤 Admin: admin@example.com / password');
    console.log('👤 Program Manager: pm@example.com / password');
    
    return true;

  } catch (error) {
    console.error('❌ Error fixing authentication and permissions:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix if this script is called directly
if (require.main === module) {
  fixAuthPermissions()
    .then((success) => {
      if (success) {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
      } else {
        console.log('\n❌ Script failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Script execution failed:', error);
      process.exit(1);
    });
}

module.exports = { fixAuthPermissions };
