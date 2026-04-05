const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test admin user...');
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: '$2b$12$ElTkVQggICId8pNIuLw0vuzlYWIirz7RfQQYw13bcZaVrSfKbMeKC', // Password: admin123
        name: 'Admin User',
        role: 'ADMIN',
        profile: {
          create: {
            bio: 'System Administrator',
            position: 'Admin'
          }
        },
        adminProfile: {
          create: {
            department: 'IT',
            permissions: 'ALL'
          }
        }
      }
    });
    console.log('Test user created successfully:', user.email);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
