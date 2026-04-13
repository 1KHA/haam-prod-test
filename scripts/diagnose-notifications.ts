#!/usr/bin/env tsx
/**
 * Notification System Diagnostic Script
 * 
 * This script tests each notification function and identifies failures.
 * Run with: npx tsx scripts/diagnose-notifications.ts
 */

import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/services/notification-service';
import {
  notifyMilestoneResponseSubmitted,
  notifyMilestoneResponseReviewed,
  notifyMilestoneCreated,
  notifyApplicationStatusChanged,
  notifyApplicationSubmitted,
  notifyUserCreated,
  notifyNewUserRegistered,
  notifyUserRoleChanged,
  notifyAccountApproved,
  notifyAccountSuspended,
  notifyStartupCreated,
  notifyEventCreated,
  notifyEventCancelled,
  notifyEventRegistration,
  notifyProgramCreated,
  notifyMilestoneDueSoon,
  notifyEventReminder,
} from '@/lib/services/notification-events';

// Test results
const results: { name: string; status: 'PASS' | 'FAIL' | 'SKIP'; error?: string; details?: any }[] = [];

// Helper to record results
function record(name: string, status: 'PASS' | 'FAIL' | 'SKIP', error?: string, details?: any) {
  results.push({ name, status, error, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${name}${error ? `: ${error}` : ''}`);
}

// Helper to get test users
async function getTestUsers() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true, name: true, email: true } });
  const pm = await prisma.user.findFirst({ where: { role: 'PROGRAM_MANAGER' }, select: { id: true, name: true, email: true } });
  const entrepreneur = await prisma.user.findFirst({ where: { role: 'ENTREPRENEUR' }, select: { id: true, name: true, email: true } });
  return { admin, pm, entrepreneur };
}

async function diagnose() {
  console.log('\n🔍 NOTIFICATION SYSTEM DIAGNOSTIC\n');
  console.log('=' .repeat(60));
  
  // 1. Database Connection Test
  console.log('\n📊 PHASE 1: Database Connection\n');
  try {
    const notificationCount = await (prisma as any).notification.count();
    const recipientCount = await (prisma as any).notificationRecipient.count();
    record('Database Connection', 'PASS', undefined, { notificationCount, recipientCount });
  } catch (error: any) {
    record('Database Connection', 'FAIL', error.message);
    console.error('\n❌ Cannot proceed without database connection');
    return;
  }

  // 2. Check Prisma Models
  console.log('\n📊 PHASE 2: Prisma Model Verification\n');
  try {
    // Try to query with proper Prisma syntax
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    record('Raw Query Execution', 'PASS');
  } catch (error: any) {
    record('Raw Query Execution', 'FAIL', error.message);
  }

  // 3. Test Notification Service Directly
  console.log('\n📊 PHASE 3: Notification Service Tests\n');
  
  const { admin, pm, entrepreneur } = await getTestUsers();
  
  if (!admin) {
    record('Find Admin User', 'FAIL', 'No admin user found in database');
  } else {
    record('Find Admin User', 'PASS', undefined, { id: admin.id, email: admin.email });
  }
  
  if (!pm) {
    record('Find PM User', 'FAIL', 'No program manager found - some tests will be skipped');
  } else {
    record('Find PM User', 'PASS', undefined, { id: pm.id, email: pm.email });
  }
  
  if (!entrepreneur) {
    record('Find Entrepreneur User', 'FAIL', 'No entrepreneur found - some tests will be skipped');
  } else {
    record('Find Entrepreneur User', 'PASS', undefined, { id: entrepreneur.id, email: entrepreneur.email });
  }

  // 4. Test Direct Notification Creation
  console.log('\n📊 PHASE 4: Direct Notification Creation\n');
  
  if (admin) {
    try {
      const notification = await NotificationService.createNotification({
        title: 'Test Notification',
        message: 'This is a test notification from diagnostic script',
        type: 'system',
        priority: 'low',
        recipientIds: [admin.id],
        metadata: { test: true, timestamp: Date.now() },
      });
      record('Direct Notification Creation', 'PASS', undefined, { notificationId: notification.id });
      
      // Cleanup test notification
      await (prisma as any).notification.delete({ where: { id: notification.id } }).catch(() => {});
    } catch (error: any) {
      record('Direct Notification Creation', 'FAIL', error.message);
    }
  } else {
    record('Direct Notification Creation', 'SKIP', 'No admin user available');
  }

  // 5. Test Each Notification Function
  console.log('\n📊 PHASE 5: Notification Event Functions\n');

  // Test notifyUserCreated
  if (admin) {
    try {
      await notifyUserCreated({
        userId: admin.id,
        email: 'test@example.com',
        name: 'Test User',
        role: 'ENTREPRENEUR',
        createdBy: admin.id,
      });
      record('notifyUserCreated', 'PASS');
    } catch (error: any) {
      record('notifyUserCreated', 'FAIL', error.message);
    }
  } else {
    record('notifyUserCreated', 'SKIP', 'No admin user');
  }

  // Test notifyNewUserRegistered
  if (admin && pm) {
    try {
      await notifyNewUserRegistered({
        userId: entrepreneur?.id || admin.id,
        userName: 'Test Entrepreneur',
        userEmail: 'test-ent@example.com',
        userRole: 'ENTREPRENEUR',
        adminIds: [admin.id],
      });
      record('notifyNewUserRegistered', 'PASS');
    } catch (error: any) {
      record('notifyNewUserRegistered', 'FAIL', error.message);
    }
  } else {
    record('notifyNewUserRegistered', 'SKIP', 'Missing required users');
  }

  // Test notifyAccountApproved
  if (entrepreneur) {
    try {
      await notifyAccountApproved({
        userId: entrepreneur.id,
        name: entrepreneur.name,
        approvedBy: admin?.id,
      });
      record('notifyAccountApproved', 'PASS');
    } catch (error: any) {
      record('notifyAccountApproved', 'FAIL', error.message);
    }
  } else {
    record('notifyAccountApproved', 'SKIP', 'No entrepreneur user');
  }

  // Test notifyAccountSuspended
  if (entrepreneur) {
    try {
      await notifyAccountSuspended({
        userId: entrepreneur.id,
        name: entrepreneur.name,
        reason: 'Test suspension',
        suspendedBy: admin?.id,
      });
      record('notifyAccountSuspended', 'PASS');
    } catch (error: any) {
      record('notifyAccountSuspended', 'FAIL', error.message);
    }
  } else {
    record('notifyAccountSuspended', 'SKIP', 'No entrepreneur user');
  }

  // Test notifyStartupCreated
  if (pm && entrepreneur) {
    try {
      await notifyStartupCreated({
        startupId: 'test-startup-id',
        startupName: 'Test Startup',
        startupDescription: 'Test description',
        founderId: entrepreneur.id,
        founderName: entrepreneur.name,
        programManagerIds: [pm.id],
      });
      record('notifyStartupCreated', 'PASS');
    } catch (error: any) {
      record('notifyStartupCreated', 'FAIL', error.message);
    }
  } else {
    record('notifyStartupCreated', 'SKIP', 'Missing required users');
  }

  // Test notifyProgramCreated
  if (pm) {
    try {
      await notifyProgramCreated({
        programId: 'test-program-id',
        programName: 'Test Program',
        programType: 'INCUBATOR',
        recipientIds: [pm.id],
        createdBy: admin?.id,
      });
      record('notifyProgramCreated', 'PASS');
    } catch (error: any) {
      record('notifyProgramCreated', 'FAIL', error.message);
    }
  } else {
    record('notifyProgramCreated', 'SKIP', 'No PM user');
  }

  // Test notifyEventCreated
  if (admin && pm) {
    try {
      await notifyEventCreated({
        eventId: 'test-event-id',
        eventName: 'Test Event',
        eventDate: new Date(Date.now() + 86400000),
        organizerName: admin.name,
        recipientIds: [admin.id, pm.id],
      });
      record('notifyEventCreated', 'PASS');
    } catch (error: any) {
      record('notifyEventCreated', 'FAIL', error.message);
    }
  } else {
    record('notifyEventCreated', 'SKIP', 'Missing required users');
  }

  // Test notifyEventRegistration
  if (admin && entrepreneur) {
    try {
      await notifyEventRegistration({
        registrationId: 'test-reg-id',
        eventId: 'test-event-id',
        eventName: 'Test Event',
        userId: entrepreneur.id,
        userName: entrepreneur.name,
        userEmail: entrepreneur.email,
        organizerIds: [admin.id],
      });
      record('notifyEventRegistration', 'PASS');
    } catch (error: any) {
      record('notifyEventRegistration', 'FAIL', error.message);
    }
  } else {
    record('notifyEventRegistration', 'SKIP', 'Missing required users');
  }

  // Test notifyApplicationSubmitted
  if (pm && entrepreneur) {
    try {
      await notifyApplicationSubmitted({
        applicationId: 'test-app-id',
        startupId: 'test-startup-id',
        startupName: 'Test Startup',
        cohortId: 'test-cohort-id',
        cohortName: 'Test Cohort',
        applicantId: entrepreneur.id,
        applicantName: entrepreneur.name,
        programManagerIds: [pm.id],
      });
      record('notifyApplicationSubmitted', 'PASS');
    } catch (error: any) {
      record('notifyApplicationSubmitted', 'FAIL', error.message);
    }
  } else {
    record('notifyApplicationSubmitted', 'SKIP', 'Missing required users');
  }

  // Test notifyApplicationStatusChanged
  if (entrepreneur) {
    try {
      await notifyApplicationStatusChanged({
        applicationId: 'test-app-id',
        startupId: 'test-startup-id',
        startupName: 'Test Startup',
        cohortId: 'test-cohort-id',
        cohortName: 'Test Cohort',
        oldStatus: 'PENDING',
        newStatus: 'ACCEPTED',
        feedback: 'Congratulations!',
        entrepreneurIds: [entrepreneur.id],
      });
      record('notifyApplicationStatusChanged', 'PASS');
    } catch (error: any) {
      record('notifyApplicationStatusChanged', 'FAIL', error.message);
    }
  } else {
    record('notifyApplicationStatusChanged', 'SKIP', 'No entrepreneur user');
  }

  // Test notifyMilestoneCreated
  if (entrepreneur) {
    try {
      await notifyMilestoneCreated({
        milestoneId: 'test-milestone-id',
        title: 'Test Milestone',
        description: 'Test description',
        dueDate: new Date(Date.now() + 7 * 86400000),
        priority: 'high',
        startupId: 'test-startup-id',
        startupName: 'Test Startup',
        recipientIds: [entrepreneur.id],
      });
      record('notifyMilestoneCreated', 'PASS');
    } catch (error: any) {
      record('notifyMilestoneCreated', 'FAIL', error.message);
    }
  } else {
    record('notifyMilestoneCreated', 'SKIP', 'No entrepreneur user');
  }

  // Test notifyMilestoneResponseSubmitted
  if (pm && entrepreneur) {
    try {
      await notifyMilestoneResponseSubmitted({
        milestoneId: 'test-milestone-id',
        milestoneTitle: 'Test Milestone',
        startupId: 'test-startup-id',
        startupName: 'Test Startup',
        submittedBy: entrepreneur.id,
        submittedByName: entrepreneur.name,
        programManagerId: pm.id,
      });
      record('notifyMilestoneResponseSubmitted', 'PASS');
    } catch (error: any) {
      record('notifyMilestoneResponseSubmitted', 'FAIL', error.message);
    }
  } else {
    record('notifyMilestoneResponseSubmitted', 'SKIP', 'Missing required users');
  }

  // Test notifyMilestoneResponseReviewed
  if (entrepreneur) {
    try {
      await notifyMilestoneResponseReviewed({
        milestoneId: 'test-milestone-id',
        milestoneTitle: 'Test Milestone',
        startupId: 'test-startup-id',
        startupName: 'Test Startup',
        status: 'approved',
        feedback: 'Great work!',
        reviewedByName: 'Test PM',
        entrepreneurIds: [entrepreneur.id],
      });
      record('notifyMilestoneResponseReviewed', 'PASS');
    } catch (error: any) {
      record('notifyMilestoneResponseReviewed', 'FAIL', error.message);
    }
  } else {
    record('notifyMilestoneResponseReviewed', 'SKIP', 'No entrepreneur user');
  }

  // Test notifyMilestoneDueSoon
  if (entrepreneur) {
    try {
      await notifyMilestoneDueSoon({
        milestoneId: 'test-milestone-id',
        title: 'Test Milestone',
        startupId: 'test-startup-id',
        daysUntil: 2,
        recipientIds: [entrepreneur.id],
      });
      record('notifyMilestoneDueSoon', 'PASS');
    } catch (error: any) {
      record('notifyMilestoneDueSoon', 'FAIL', error.message);
    }
  } else {
    record('notifyMilestoneDueSoon', 'SKIP', 'No entrepreneur user');
  }

  // Test notifyEventReminder
  if (admin && entrepreneur) {
    try {
      await notifyEventReminder({
        eventId: 'test-event-id',
        eventName: 'Test Event',
        eventDate: new Date(Date.now() + 24 * 3600000),
        hoursBefore: 24,
        recipientIds: [admin.id, entrepreneur.id],
      });
      record('notifyEventReminder', 'PASS');
    } catch (error: any) {
      record('notifyEventReminder', 'FAIL', error.message);
    }
  } else {
    record('notifyEventReminder', 'SKIP', 'Missing required users');
  }

  // Test notifyEventCancelled
  if (admin && entrepreneur) {
    try {
      await notifyEventCancelled({
        eventId: 'test-event-id',
        eventName: 'Test Event',
        recipientIds: [admin.id, entrepreneur.id],
        reason: 'Test cancellation',
        cancelledBy: admin.id,
      });
      record('notifyEventCancelled', 'PASS');
    } catch (error: any) {
      record('notifyEventCancelled', 'FAIL', error.message);
    }
  } else {
    record('notifyEventCancelled', 'SKIP', 'Missing required users');
  }

  // Test notifyUserRoleChanged
  if (admin && entrepreneur) {
    try {
      await notifyUserRoleChanged({
        userId: entrepreneur.id,
        name: entrepreneur.name,
        oldRole: 'ENTREPRENEUR',
        newRole: 'MENTOR',
        changedBy: admin.id,
      });
      record('notifyUserRoleChanged', 'PASS');
    } catch (error: any) {
      record('notifyUserRoleChanged', 'FAIL', error.message);
    }
  } else {
    record('notifyUserRoleChanged', 'SKIP', 'Missing required users');
  }

  // 6. Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
  }
  
  if (skipped > 0) {
    console.log('\n⏭️ SKIPPED TESTS (missing test data):\n');
    results.filter(r => r.status === 'SKIP').forEach(r => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
  }

  // Cleanup test notifications
  console.log('\n🧹 Cleaning up test notifications...');
  try {
    const deleteResult = await (prisma as any).notification.deleteMany({
      where: {
        metadata: {
          contains: '"test":true',
        },
      },
    });
    console.log(`   Deleted ${deleteResult.count} test notifications`);
  } catch (error) {
    console.log('   Could not cleanup (metadata filter may not work on SQLite)');
  }

  console.log('\n✅ Diagnostic complete!\n');
  
  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run diagnosis
diagnose().catch((error) => {
  console.error('\n💥 Diagnostic script failed:', error);
  process.exit(1);
});
