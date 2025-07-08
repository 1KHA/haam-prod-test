import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles and permissions...');

  // Define permission categories and actions
  const permissionCategories = [
    'dashboard',
    'users',
    'programs',
    'startups',
    'funding',
    'payments',
    'reports',
    'settings',
    'events',
    'mentorship',
    'applications',
    'cohorts',
    'resources',
    'analytics',
    'hackathons',
    'integrations',
    'notifications',
    'discussions',
    'portfolio',
    'evaluation'
  ];

  const permissionActions = [
    'view',
    'edit',
    'add',
    'delete'
  ];

  // Create permissions
  for (const category of permissionCategories) {
    for (const action of permissionActions) {
      // Skip some combinations that don't make sense
      if (
        (category === 'dashboard' && action === 'add') ||
        (category === 'dashboard' && action === 'delete')
      ) {
        continue;
      }

      await prisma.permission.upsert({
        where: {
          category_action: {
            category,
            action,
          },
        },
        update: {},
        create: {
          category,
          action,
        },
      });
    }
  }

  // Create admin role
  const adminRole = await prisma.role.upsert({
    where: { name: 'مدير النظام' },
    update: {
      description: 'وصول كامل إلى جميع ميزات النظام وإعداداته',
    },
    create: {
      name: 'مدير النظام',
      description: 'وصول كامل إلى جميع ميزات النظام وإعداداته',
    },
  });

  // Create program manager role
  const programManagerRole = await prisma.role.upsert({
    where: { name: 'مدير برنامج' },
    update: {
      description: 'إدارة برامج المسرعات والحاضنات والشركات الناشئة المشاركة',
    },
    create: {
      name: 'مدير برنامج',
      description: 'إدارة برامج المسرعات والحاضنات والشركات الناشئة المشاركة',
    },
  });

  // Create mentor role
  const mentorRole = await prisma.role.upsert({
    where: { name: 'موجه' },
    update: {
      description: 'تقديم الإرشاد والتوجيه للشركات الناشئة',
    },
    create: {
      name: 'موجه',
      description: 'تقديم الإرشاد والتوجيه للشركات الناشئة',
    },
  });

  // Create investor role
  const investorRole = await prisma.role.upsert({
    where: { name: 'مستثمر' },
    update: {
      description: 'عرض الشركات الناشئة وتقديم التمويل',
    },
    create: {
      name: 'مستثمر',
      description: 'عرض الشركات الناشئة وتقديم التمويل',
    },
  });

  // Create judge role
  const judgeRole = await prisma.role.upsert({
    where: { name: 'محكم' },
    update: {
      description: 'تقييم الشركات الناشئة في الهاكاثونات والمسابقات',
    },
    create: {
      name: 'محكم',
      description: 'تقييم الشركات الناشئة في الهاكاثونات والمسابقات',
    },
  });

  // Create participant role
  const participantRole = await prisma.role.upsert({
    where: { name: 'مشارك' },
    update: {
      description: 'مشارك في البرامج والفعاليات',
    },
    create: {
      name: 'مشارك',
      description: 'مشارك في البرامج والفعاليات',
    },
  });

  // Clean up old 'ENTREPRENEUR' role if it exists
  try {
    const oldRole = await prisma.role.findUnique({ where: { name: 'ENTREPRENEUR' } });
    if (oldRole) {
      // Reassign users before deleting
      const newRole = await prisma.role.findUnique({ where: { name: 'رائد أعمال' } });
      if (newRole) {
        await prisma.user.updateMany({
          where: { role: 'ENTREPRENEUR' },
          data: { role: 'ENTREPRENEUR' },
        });
      }
      // Delete associated role permissions first
      await prisma.rolePermission.deleteMany({ where: { roleId: oldRole.id } });
      await prisma.role.delete({ where: { name: 'ENTREPRENEUR' } });
      console.log('Cleaned up old ENTREPRENEUR role.');
    }
  } catch (error) {
    // Ignore if it doesn't exist or fails for other reasons
    console.log('No old ENTREPRENEUR role to clean up or error during cleanup.');
  }

  // Create entrepreneur role
  const entrepreneurRole = await prisma.role.upsert({
    where: { name: 'رائد أعمال' },
    update: {
      description: 'إدارة الشركة والوصول إلى الموارد والتمويل',
    },
    create: {
      name: 'رائد أعمال',
      description: 'إدارة الشركة والوصول إلى الموارد والتمويل',
    },
  });

  // Add permissions to admin role (all permissions)
  for (const category of permissionCategories) {
    for (const action of permissionActions) {
      // Skip some combinations that don't make sense
      if (
        (category === 'dashboard' && action === 'add') ||
        (category === 'dashboard' && action === 'delete')
      ) {
        continue;
      }

      const permission = await prisma.permission.findUnique({
        where: {
          category_action: {
            category,
            action,
          },
        },
      });

      if (permission) {
        // Check if the role permission already exists
        const existingRolePermission = await prisma.rolePermission.findFirst({
          where: {
            roleId: adminRole.id,
            permissionId: permission.id,
            userId: null,
          },
        });

        if (!existingRolePermission) {
          // Create the role permission if it doesn't exist
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
  }

  // Add permissions to program manager role
  const programManagerPermissions = [
    { category: 'dashboard', action: 'view' },
    { category: 'dashboard', action: 'edit' },
    { category: 'users', action: 'view' },
    { category: 'programs', action: 'view' },
    { category: 'programs', action: 'edit' },
    { category: 'startups', action: 'view' },
    { category: 'startups', action: 'edit' },
    { category: 'startups', action: 'add' },
    { category: 'funding', action: 'view' },
    { category: 'funding', action: 'edit' },
    { category: 'reports', action: 'view' },
    { category: 'applications', action: 'view' },
    { category: 'applications', action: 'edit' },
    { category: 'cohorts', action: 'view' },
    { category: 'cohorts', action: 'edit' },
    { category: 'cohorts', action: 'add' },
    { category: 'mentorship', action: 'view' },
    { category: 'mentorship', action: 'edit' },
    { category: 'events', action: 'view' },
    { category: 'events', action: 'edit' },
    { category: 'events', action: 'add' },
    { category: 'resources', action: 'view' },
    { category: 'resources', action: 'edit' },
    { category: 'resources', action: 'add' },
    { category: 'discussions', action: 'view' },
    { category: 'discussions', action: 'edit' },
  ];

  for (const { category, action } of programManagerPermissions) {
    const permission = await prisma.permission.findUnique({
      where: {
        category_action: {
          category,
          action,
        },
      },
    });

    if (permission) {
      // Check if the role permission already exists
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: programManagerRole.id,
          permissionId: permission.id,
          userId: null,
        },
      });

      if (!existingRolePermission) {
        // Create the role permission if it doesn't exist
        await prisma.rolePermission.create({
          data: {
            roleId: programManagerRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // Add permissions to mentor role
  const mentorPermissions = [
    { category: 'dashboard', action: 'view' },
    { category: 'programs', action: 'view' },
    { category: 'startups', action: 'view' },
    { category: 'reports', action: 'view' },
    { category: 'users', action: 'view' },
    { category: 'users', action: 'edit' },
    { category: 'mentorship', action: 'view' },
    { category: 'mentorship', action: 'edit' },
    { category: 'mentorship', action: 'add' },
    { category: 'resources', action: 'view' },
    { category: 'resources', action: 'add' },
    { category: 'discussions', action: 'view' },
    { category: 'discussions', action: 'edit' },
    { category: 'discussions', action: 'add' },
  ];

  for (const { category, action } of mentorPermissions) {
    const permission = await prisma.permission.findUnique({
      where: {
        category_action: {
          category,
          action,
        },
      },
    });

    if (permission) {
      // Check if the role permission already exists
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: mentorRole.id,
          permissionId: permission.id,
          userId: null,
        },
      });

      if (!existingRolePermission) {
        // Create the role permission if it doesn't exist
        await prisma.rolePermission.create({
          data: {
            roleId: mentorRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // Add permissions to investor role
  const investorPermissions = [
    { category: 'dashboard', action: 'view' },
    { category: 'programs', action: 'view' },
    { category: 'startups', action: 'view' },
    { category: 'funding', action: 'view' },
    { category: 'funding', action: 'edit' },
    { category: 'funding', action: 'add' },
    { category: 'payments', action: 'view' },
    { category: 'reports', action: 'view' },
    { category: 'portfolio', action: 'view' },
    { category: 'events', action: 'view' },
    { category: 'analytics', action: 'view' },
    { category: 'discussions', action: 'view' },
    { category: 'discussions', action: 'edit' },
    { category: 'users', action: 'view' },
    { category: 'users', action: 'edit' },
  ];

  for (const { category, action } of investorPermissions) {
    const permission = await prisma.permission.findUnique({
      where: {
        category_action: {
          category,
          action,
        },
      },
    });

    if (permission) {
      // Check if the role permission already exists
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: investorRole.id,
          permissionId: permission.id,
          userId: null,
        },
      });

      if (!existingRolePermission) {
        // Create the role permission if it doesn't exist
        await prisma.rolePermission.create({
          data: {
            roleId: investorRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // Add permissions to judge role
  const judgePermissions = [
    { category: 'dashboard', action: 'view' },
    { category: 'startups', action: 'view' },
    { category: 'reports', action: 'view' },
    { category: 'evaluation', action: 'view' },
    { category: 'evaluation', action: 'edit' },
    { category: 'evaluation', action: 'add' },
  ];

  for (const { category, action } of judgePermissions) {
    const permission = await prisma.permission.findUnique({
      where: {
        category_action: {
          category,
          action,
        },
      },
    });

    if (permission) {
      // Check if the role permission already exists
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: judgeRole.id,
          permissionId: permission.id,
          userId: null,
        },
      });

      if (!existingRolePermission) {
        // Create the role permission if it doesn't exist
        await prisma.rolePermission.create({
          data: {
            roleId: judgeRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // Add permissions to participant role
  const participantPermissions = [
    { category: 'dashboard', action: 'view' },
  ];

  for (const { category, action } of participantPermissions) {
    const permission = await prisma.permission.findUnique({
      where: {
        category_action: {
          category,
          action,
        },
      },
    });

    if (permission) {
      // Check if the role permission already exists
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: participantRole.id,
          permissionId: permission.id,
          userId: null,
        },
      });

      if (!existingRolePermission) {
        // Create the role permission if it doesn't exist
        await prisma.rolePermission.create({
          data: {
            roleId: participantRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // Add permissions to entrepreneur role
  const entrepreneurPermissions = [
    { category: 'dashboard', action: 'view' },
    { category: 'programs', action: 'view' },
    { category: 'applications', action: 'add' },
    { category: 'funding', action: 'view' },
    { category: 'funding', action: 'add' },
    { category: 'payments', action: 'view' },
    { category: 'reports', action: 'view' },
    { category: 'users', action: 'view' },
    { category: 'users', action: 'add' },
    { category: 'users', action: 'edit' },
    { category: 'users', action: 'delete' },
    { category: 'startups', action: 'view' },
    { category: 'startups', action: 'edit' },
    { category: 'mentorship', action: 'view' },
    { category: 'events', action: 'view' },
    { category: 'resources', action: 'view' },
    { category: 'discussions', action: 'view' },
    { category: 'discussions', action: 'edit' },
  ];

  for (const { category, action } of entrepreneurPermissions) {
    const permission = await prisma.permission.findUnique({
      where: {
        category_action: {
          category,
          action,
        },
      },
    });

    if (permission) {
      // Check if the role permission already exists
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: entrepreneurRole.id,
          permissionId: permission.id,
          userId: null,
        },
      });

      if (!existingRolePermission) {
        // Create the role permission if it doesn't exist
        await prisma.rolePermission.create({
          data: {
            roleId: entrepreneurRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
