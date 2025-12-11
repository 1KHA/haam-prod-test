import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  try {
    // Seed roles and permissions
    console.log('Seeding roles and permissions...');
    await import('./seed-roles');
    
    // Create admin user if not exists
    console.log('Ensuring admin user exists...');
    await execPromise('node prisma/create-test-user.js');
    
    // Seed reports
    console.log('Seeding sample reports...');
    await execPromise('node prisma/seed-reports.js');
    
    console.log('All seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
