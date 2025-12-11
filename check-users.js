const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Role: ${user.role}, Password hash: ${user.password.substring(0, 20)}...`);
    });
    console.log(`Total users: ${users.length}`);
  } catch (error) {
    console.error('Error querying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
