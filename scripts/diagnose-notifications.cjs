#!/usr/bin/env node
/**
 * Notification System Diagnostic Script
 * 
 * This script tests the notification system via direct database queries
 * and API endpoint inspection.
 * Run with: node scripts/diagnose-notifications.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n🔍 NOTIFICATION SYSTEM DIAGNOSTIC\n');
console.log('=' .repeat(60));

const results = [];

function record(name, status, error, details) {
  results.push({ name, status, error, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${name}${error ? `: ${error}` : details ? `: ${JSON.stringify(details)}` : ''}`);
}

// Check if SQLite database exists
console.log('\n📊 PHASE 1: Database File Check\n');
try {
  const fs = require('fs');
  const dbPath = path.join(__dirname, '../prisma/dev.db');
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    record('Database File Exists', 'PASS', undefined, { 
      path: dbPath, 
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB` 
    });
  } else {
    record('Database File Exists', 'FAIL', `Database not found at ${dbPath}`);
  }
} catch (error) {
  record('Database File Exists', 'FAIL', error.message);
}

// Check notification tables
console.log('\n📊 PHASE 2: Database Tables\n');
try {
  const output = execSync('sqlite3 prisma/dev.db ".tables" 2>/dev/null', { 
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8'
  });
  
  const hasNotification = output.includes('Notification');
  const hasRecipient = output.includes('NotificationRecipient');
  
  if (hasNotification) {
    record('Notification Table', 'PASS');
  } else {
    record('Notification Table', 'FAIL', 'Table not found');
  }
  
  if (hasRecipient) {
    record('NotificationRecipient Table', 'PASS');
  } else {
    record('NotificationRecipient Table', 'FAIL', 'Table not found');
  }
} catch (error) {
  record('Database Tables', 'FAIL', error.message);
}

// Check notification counts
console.log('\n📊 PHASE 3: Notification Statistics\n');
try {
  const countOutput = execSync('sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Notification;" 2>/dev/null', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8'
  }).trim();
  
  const notificationCount = parseInt(countOutput);
  record('Total Notifications', 'PASS', undefined, { count: notificationCount });
  
  const recipientOutput = execSync('sqlite3 prisma/dev.db "SELECT COUNT(*) FROM NotificationRecipient;" 2>/dev/null', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8'
  }).trim();
  
  const recipientCount = parseInt(recipientOutput);
  record('Total Recipients', 'PASS', undefined, { count: recipientCount });
  
  // Get notification types
  const typesOutput = execSync('sqlite3 prisma/dev.db "SELECT type, COUNT(*) FROM Notification GROUP BY type;" 2>/dev/null', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8'
  }).trim();
  
  console.log('\n   Notification Types:');
  typesOutput.split('\n').forEach(line => {
    const [type, count] = line.split('|');
    console.log(`   - ${type || 'null'}: ${count}`);
  });
  
} catch (error) {
  record('Notification Statistics', 'FAIL', error.message);
}

// Check recent notifications
console.log('\n📊 PHASE 4: Recent Notifications\n');
try {
  const recentOutput = execSync('sqlite3 prisma/dev.db "SELECT title, type, createdAt FROM Notification ORDER BY createdAt DESC LIMIT 10;" 2>/dev/null', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8'
  }).trim();
  
  console.log('   Recent Notifications:');
  recentOutput.split('\n').forEach((line, i) => {
    const [title, type, date] = line.split('|');
    const dateStr = date ? new Date(parseInt(date)).toLocaleString() : 'unknown';
    console.log(`   ${i + 1}. [${type}] ${title?.substring(0, 40)}... (${dateStr})`);
  });
  
} catch (error) {
  record('Recent Notifications', 'FAIL', error.message);
}

// Check for unread notifications
console.log('\n📊 PHASE 5: Unread Notifications\n');
try {
  const unreadOutput = execSync('sqlite3 prisma/dev.db "SELECT userId, COUNT(*) FROM NotificationRecipient WHERE isRead = 0 GROUP BY userId;" 2>/dev/null', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8'
  }).trim();
  
  if (unreadOutput) {
    console.log('   Unread Notifications by User:');
    unreadOutput.split('\n').forEach(line => {
      const [userId, count] = line.split('|');
      console.log(`   - User ${userId?.substring(0, 8)}...: ${count} unread`);
    });
  } else {
    console.log('   No unread notifications found');
  }
  
} catch (error) {
  record('Unread Notifications', 'FAIL', error.message);
}

// Check API routes that trigger notifications
console.log('\n📊 PHASE 6: API Route Analysis\n');

const notificationRoutes = [
  { path: 'app/api/auth/signup/route.ts', name: 'Signup', notifications: ['notifyUserCreated', 'notifyNewUserRegistered'] },
  { path: 'app/api/admin/users/route.ts', name: 'Admin Users', notifications: ['notifyUserCreated', 'notifyUserRoleChanged'] },
  { path: 'app/api/admin/users/[id]/approve/route.ts', name: 'User Approval', notifications: ['notifyAccountApproved', 'notifyAccountSuspended'] },
  { path: 'app/api/admin/programs/route.ts', name: 'Program Creation', notifications: ['notifyProgramCreated'] },
  { path: 'app/api/admin/events/route.ts', name: 'Event Creation', notifications: ['notifyEventCreated', 'notifyEventCancelled'] },
  { path: 'app/api/startups/create/route.ts', name: 'Startup Creation', notifications: ['notifyStartupCreated'] },
  { path: 'app/api/cohorts/apply/route.ts', name: 'Cohort Application', notifications: ['notifyApplicationSubmitted'] },
  { path: 'app/api/events/[id]/register/route.ts', name: 'Event Registration', notifications: ['notifyEventRegistration'] },
  { path: 'app/api/milestones/[id]/submissions/route.ts', name: 'Milestone Submission', notifications: ['notifyMilestoneResponseSubmitted'] },
  { path: 'app/api/program-manager/milestones/route.ts', name: 'Milestone Creation', notifications: ['notifyMilestoneCreated'] },
  { path: 'app/api/program-manager/milestones/[id]/review/route.ts', name: 'Milestone Review', notifications: ['notifyMilestoneResponseReviewed'] },
  { path: 'app/api/program-manager/cohorts/[id]/applications/route.ts', name: 'Application Status', notifications: ['notifyApplicationStatusChanged'] },
];

const fs = require('fs');
notificationRoutes.forEach(route => {
  const fullPath = path.join(__dirname, '..', route.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const hasImport = content.includes('notification-events') || content.includes('NotificationService');
    const hasTryCatch = content.includes('try {') && content.includes('catch');
    
    let foundNotifications = [];
    route.notifications.forEach(notif => {
      if (content.includes(notif)) {
        foundNotifications.push(notif);
      }
    });
    
    if (foundNotifications.length === route.notifications.length) {
      record(`${route.name} API`, 'PASS', undefined, { notifications: foundNotifications });
    } else if (foundNotifications.length > 0) {
      record(`${route.name} API`, 'FAIL', `Missing: ${route.notifications.filter(n => !foundNotifications.includes(n)).join(', ')}`);
    } else if (hasImport) {
      record(`${route.name} API`, 'FAIL', 'Imports notification-events but does not call notification functions');
    } else {
      record(`${route.name} API`, 'FAIL', 'No notification imports found');
    }
  } else {
    record(`${route.name} API`, 'FAIL', `File not found: ${route.path}`);
  }
});

// Summary
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
  console.log('\n❌ FAILED CHECKS:\n');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  • ${r.name}: ${r.error}`);
  });
}

console.log('\n🔍 ANALYSIS:\n');

// Check what notification types are missing
const hasMilestoneNotif = results.some(r => r.name === 'Milestone Submission API' && r.status === 'PASS');
const hasApplicationNotif = results.some(r => r.name === 'Cohort Application API' && r.status === 'PASS');
const hasStartupNotif = results.some(r => r.name === 'Startup Creation API' && r.status === 'PASS');

if (hasMilestoneNotif && hasApplicationNotif && hasStartupNotif) {
  console.log('✅ All API routes have notification imports');
  console.log('⚠️  If notifications are not being created, the issue is likely:');
  console.log('   1. Silent failures in try/catch blocks');
  console.log('   2. Empty recipient arrays (no PMs/admins found)');
  console.log('   3. Database transaction failures');
} else {
  console.log('❌ Some API routes are missing notification imports');
}

console.log('\n✅ Diagnostic complete!\n');

process.exit(failed > 0 ? 1 : 0);
