const { PrismaClient } = require('@prisma/client');

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

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'مدير النظام' },
    update: { description: 'وصول كامل إلى جميع ميزات النظام وإعداداته', roleEnum: 'ADMIN' },
    create: { name: 'مدير النظام', description: 'وصول كامل إلى جميع ميزات النظام وإعداداته', roleEnum: 'ADMIN' },
  });

  const programManagerRole = await prisma.role.upsert({
    where: { name: 'مدير برنامج' },
    update: { description: 'إدارة برامج المسرعات والحاضنات والشركات الناشئة المشاركة', roleEnum: 'PROGRAM_MANAGER' },
    create: { name: 'مدير برنامج', description: 'إدارة برامج المسرعات والحاضنات والشركات الناشئة المشاركة', roleEnum: 'PROGRAM_MANAGER' },
  });

  const mentorRole = await prisma.role.upsert({
    where: { name: 'موجه' },
    update: { description: 'تقديم الإرشاد والتوجيه للشركات الناشئة', roleEnum: 'MENTOR' },
    create: { name: 'موجه', description: 'تقديم الإرشاد والتوجيه للشركات الناشئة', roleEnum: 'MENTOR' },
  });

  const investorRole = await prisma.role.upsert({
    where: { name: 'مستثمر' },
    update: { description: 'عرض الشركات الناشئة وتقديم التمويل', roleEnum: 'INVESTOR' },
    create: { name: 'مستثمر', description: 'عرض الشركات الناشئة وتقديم التمويل', roleEnum: 'INVESTOR' },
  });

  const judgeRole = await prisma.role.upsert({
    where: { name: 'محكم' },
    update: { description: 'تقييم الشركات الناشئة في الهاكاثونات والمسابقات', roleEnum: 'MENTOR' },
    create: { name: 'محكم', description: 'تقييم الشركات الناشئة في الهاكاثونات والمسابقات', roleEnum: 'MENTOR' },
  });

  const entrepreneurRole = await prisma.role.upsert({
    where: { name: 'ENTREPRENEUR' },
    update: { description: 'Manage company, access resources and funding', roleEnum: 'ENTREPRENEUR' },
    create: { name: 'ENTREPRENEUR', description: 'Manage company, access resources and funding', roleEnum: 'ENTREPRENEUR' },
  });

  // Helper to assign permissions to a role
  async function assignPermissions(roleId, permissions) {
    for (const { category, action } of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { category_action: { category, action } },
      });
      if (permission) {
        const existing = await prisma.rolePermission.findFirst({
          where: { roleId, permissionId: permission.id, userId: null },
        });
        if (!existing) {
          await prisma.rolePermission.create({ data: { roleId, permissionId: permission.id } });
        }
      }
    }
  }

  // Program Manager permissions
  await assignPermissions(programManagerRole.id, [
    { category: 'dashboard', action: 'view' },
    { category: 'programs', action: 'view' },
    { category: 'programs', action: 'add' },
    { category: 'programs', action: 'edit' },
    { category: 'cohorts', action: 'view' },
    { category: 'cohorts', action: 'add' },
    { category: 'cohorts', action: 'edit' },
    { category: 'cohorts', action: 'delete' },
    { category: 'applications', action: 'view' },
    { category: 'applications', action: 'edit' },
    { category: 'events', action: 'view' },
    { category: 'events', action: 'add' },
    { category: 'events', action: 'edit' },
    { category: 'events', action: 'delete' },
    { category: 'startups', action: 'view' },
    { category: 'startups', action: 'edit' },
    { category: 'users', action: 'view' },
    { category: 'mentorship', action: 'view' },
    { category: 'mentorship', action: 'add' },
    { category: 'mentorship', action: 'edit' },
    { category: 'reports', action: 'view' },
    { category: 'analytics', action: 'view' },
    { category: 'resources', action: 'view' },
    { category: 'resources', action: 'add' },
    { category: 'resources', action: 'edit' },
    { category: 'discussions', action: 'view' },
    { category: 'discussions', action: 'add' },
    { category: 'discussions', action: 'edit' },
    { category: 'notifications', action: 'view' },
  ]);

  // Mentor permissions
  await assignPermissions(mentorRole.id, [
    { category: 'dashboard', action: 'view' },
    { category: 'mentorship', action: 'view' },
    { category: 'mentorship', action: 'add' },
    { category: 'mentorship', action: 'edit' },
    { category: 'startups', action: 'view' },
    { category: 'programs', action: 'view' },
    { category: 'events', action: 'view' },
    { category: 'resources', action: 'view' },
    { category: 'discussions', action: 'view' },
    { category: 'discussions', action: 'add' },
    { category: 'reports', action: 'view' },
    { category: 'notifications', action: 'view' },
  ]);

  // Investor permissions
  await assignPermissions(investorRole.id, [
    { category: 'dashboard', action: 'view' },
    { category: 'startups', action: 'view' },
    { category: 'programs', action: 'view' },
    { category: 'funding', action: 'view' },
    { category: 'funding', action: 'add' },
    { category: 'events', action: 'view' },
    { category: 'reports', action: 'view' },
    { category: 'analytics', action: 'view' },
    { category: 'portfolio', action: 'view' },
    { category: 'portfolio', action: 'add' },
    { category: 'portfolio', action: 'edit' },
    { category: 'discussions', action: 'view' },
    { category: 'notifications', action: 'view' },
  ]);

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

  await assignPermissions(entrepreneurRole.id, entrepreneurPermissions);

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
