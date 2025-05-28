import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌱 Starting role and permission seeding...\n');

try {
  // Run the TypeScript seed file using tsx
  const seedFile = join(__dirname, '..', 'prisma', 'seed-roles.ts');
  
  console.log('📝 Seeding roles and permissions...');
  execSync(`npx tsx ${seedFile}`, { 
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  
  console.log('\n✅ Role and permission seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('- Created 8 roles (ADMIN, PROGRAM_MANAGER, STARTUP, MENTOR, INVESTOR, JUDGE, PARTICIPANT, ACCELERATOR)');
  console.log('- Created permissions for 20 categories with 4 actions each');
  console.log('- Assigned appropriate permissions to each role');
  console.log('\n🎉 Your RBAC system is ready to use!');
  
} catch (error) {
  console.error('\n❌ Error seeding roles and permissions:', error.message);
  process.exit(1);
}
