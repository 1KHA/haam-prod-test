import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupJudgeUsers() {
  console.log('Starting cleanup of users with JUDGE role...');

  try {
    console.log("Attempting raw SQL delete for users with 'JUDGE' role.");
    
    // Use a raw SQL query to delete users with the old 'JUDGE' role.
    // This bypasses Prisma's enum validation.
    // Note: This is specific to SQLite. Syntax may vary for other DBs.
    const result = await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE "role" = 'JUDGE';`);
    
    console.log(`Raw SQL delete operation completed. Rows affected: ${result}`);
    
    if (result > 0) {
      console.log(`Successfully deleted ${result} user(s) with the JUDGE role.`);
    } else {
      console.log('No users with JUDGE role found to delete.');
    }

  } catch (error) {
    console.error('An error occurred during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupJudgeUsers();
