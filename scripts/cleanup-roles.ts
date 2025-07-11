import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupRoles() {
  const rolesToDelete = ['محكم', 'مشارك'];
  console.log(`Starting cleanup of roles: ${rolesToDelete.join(', ')}`);

  try {
    for (const roleName of rolesToDelete) {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (role) {
        console.log(`Found role "${roleName}". Deleting it and its associated permissions...`);
        
        // First, delete associated role permissions
        await prisma.rolePermission.deleteMany({
          where: { roleId: role.id },
        });

        // Then, delete the role itself
        await prisma.role.delete({
          where: { id: role.id },
        });

        console.log(`Successfully deleted role "${roleName}".`);
      } else {
        console.log(`Role "${roleName}" not found. No action needed.`);
      }
    }
  } catch (error) {
    console.error('An error occurred during role cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupRoles();
