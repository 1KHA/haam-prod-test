import { prisma } from '../lib/prisma';
import { NotificationService } from '../lib/services/notification-service';

async function test() {
  console.log('\n🔍 TESTING ENTREPRENEUR NOTIFICATIONS\n');
  
  const entrepreneurs = await prisma.user.findMany({
    where: { role: 'ENTREPRENEUR' },
    select: { id: true, email: true, name: true },
  });
  
  console.log(`Found ${entrepreneurs.length} entrepreneurs:`);
  entrepreneurs.forEach(e => console.log(`  - ${e.email}`));
  
  // Test creating a notification directly
  console.log('\n📊 Creating test notification...');
  try {
    const notif = await NotificationService.createNotification({
      title: 'Test Notification for Entrepreneurs',
      message: 'This is a test notification',
      type: 'system',
      priority: 'low',
      recipientIds: entrepreneurs.map(e => e.id),
    });
    console.log('✅ Notification created:', notif.id);
  } catch (e: any) {
    console.log('❌ Error:', e.message);
  }
  
  // Check notification counts
  console.log('\n📊 Current notification counts:');
  for (const ent of entrepreneurs) {
    const count = await (prisma as any).notificationRecipient.count({
      where: { userId: ent.id }
    });
    console.log(`  ${ent.email}: ${count} notifications`);
  }
  
  await prisma.$disconnect();
}

test();
