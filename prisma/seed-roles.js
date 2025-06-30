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
    update: { description: 'وصول كامل إلى جميع ميزات النظام وإعداداته' },
    create: { name: 'مدير النظام', description: 'وصول كامل إلى جميع ميزات النظام وإعداداته' },
  });

  const programManagerRole = await prisma.role.upsert({
    where: { name: 'مدير برنامج' },
    update: { description: 'إدارة برامج المسرعات والحاضنات والشركات الناشئة المشاركة' },
    create: { name: 'مدير برنامج', description: 'إدارة برامج المسرعات والحاضنات والشركات الناشئة المشاركة' },
  });

  const mentorRole = await prisma.role.upsert({
    where: { name: 'موجه' },
    update: { description: 'تقديم الإرشاد والتوجيه للشركات الناشئة' },
    create: { name: 'موجه', description: 'تقديم الإرشاد والتوجيه للشركات الناشئة' },
  });

  const investorRole = await prisma.role.upsert({
    where: { name: 'مستثمر' },
    update: { description: 'عرض الشركات الناشئة وتقديم التمويل' },
    create: { name: 'مستثمر', description: 'عرض الشركات الناشئة وتقديم التمويل' },
  });

  const judgeRole = await prisma.role.upsert({
    where: { name: 'محكم' },
    update: { description: 'تقييم الشركات الناشئة في الهاكاثونات والمسابقات' },
    create: { name: 'محكم', description: 'تقييم الشركات الناشئة في الهاكاثونات والمسابقات' },
  });

  const participantRole = await prisma.role.upsert({
    where: { name: 'مشارك' },
    update: { description: 'مشارك في البرامج والفعاليات' },
    create: { name: 'مشارك', description: 'مشارك في البرامج والفعاليات' },
  });

  const entrepreneurRole = await prisma.role.upsert({
    where: { name: 'ENTREPRENEUR' },
    update: { description: 'Manage company, access resources and funding' },
    create: { name: 'ENTREPRENEUR', description: 'Manage company, access resources and funding' },
  });

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
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: entrepreneurRole.id,
          permissionId: permission.id,
          userId: null,
        },
      });

      if (!existingRolePermission) {
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
