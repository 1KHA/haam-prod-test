// Seed script for integrations

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedIntegrations() {
  console.log('Seeding integrations...');

  // Define integrations to seed
  const integrations = [
    {
      name: "Stripe",
      description: "معالجة المدفوعات وإدارة الاشتراكات",
      category: "المدفوعات",
      provider: "stripe",
      icon: "credit-card",
      status: "متصل",
      apiKey: "sk_test_*****************************",
      webhookUrl: "https://api.example.com/webhooks/stripe",
      webhookSecret: "whsec_*****************************",
      syncFrequency: "كل ساعة",
      lastSync: new Date(),
      dataAccess: JSON.stringify(["المدفوعات", "الاشتراكات", "العملاء"]),
      settings: JSON.stringify({
        paymentMethods: ["card", "bank_transfer"],
        automaticReceipts: true,
        currency: "SAR"
      })
    },
    {
      name: "Google Calendar",
      description: "مزامنة الفعاليات والمواعيد مع تقويم Google",
      category: "الجدولة",
      provider: "google",
      icon: "calendar",
      status: "متصل",
      oauthClientId: "************.apps.googleusercontent.com",
      oauthClientSecret: "************",
      oauthAccessToken: "ya29.*****************************",
      oauthRefreshToken: "*****************************",
      oauthTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      webhookUrl: "https://api.example.com/webhooks/google-calendar",
      syncFrequency: "كل 15 دقيقة",
      lastSync: new Date(Date.now() - 900000), // 15 minutes ago
      dataAccess: JSON.stringify(["الفعاليات", "المواعيد", "الجلسات"]),
      settings: JSON.stringify({
        calendarId: "primary",
        notifyBefore: 15,
        defaultReminders: true
      })
    },
    {
      name: "Slack",
      description: "إرسال إشعارات وتنبيهات إلى قنوات Slack",
      category: "التواصل",
      provider: "slack",
      icon: "message-square",
      status: "متصل",
      apiKey: "xoxb-*****************************",
      webhookUrl: "https://api.example.com/webhooks/slack",
      syncFrequency: "فوري",
      lastSync: new Date(Date.now() - 1800000), // 30 minutes ago
      dataAccess: JSON.stringify(["الإشعارات", "التنبيهات"]),
      settings: JSON.stringify({
        defaultChannel: "#general",
        notificationChannels: {
          payments: "#payments",
          events: "#events",
          system: "#system-alerts"
        }
      })
    },
    {
      name: "Mailchimp",
      description: "إدارة القوائم البريدية وحملات البريد الإلكتروني",
      category: "التسويق",
      provider: "mailchimp",
      icon: "mail",
      status: "متصل",
      apiKey: "mc-*****************************",
      webhookUrl: "https://api.example.com/webhooks/mailchimp",
      syncFrequency: "يومي",
      lastSync: new Date(Date.now() - 86400000), // 1 day ago
      dataAccess: JSON.stringify(["المستخدمين", "القوائم البريدية", "الحملات"]),
      settings: JSON.stringify({
        defaultListId: "a1b2c3d4e5",
        defaultFromName: "فريق حاضنة الأعمال",
        defaultFromEmail: "no-reply@example.com"
      })
    },
    {
      name: "HubSpot",
      description: "إدارة العلاقات مع العملاء وتتبع المبيعات",
      category: "إدارة العلاقات",
      provider: "hubspot",
      icon: "users",
      status: "غير متصل"
    },
    {
      name: "Zapier",
      description: "ربط التطبيقات وأتمتة سير العمل",
      category: "أتمتة",
      provider: "zapier",
      icon: "link",
      status: "غير متصل"
    },
    {
      name: "Microsoft Power BI",
      description: "تحليلات البيانات وإنشاء لوحات المعلومات",
      category: "تحليلات",
      provider: "powerbi",
      icon: "bar-chart",
      status: "غير متصل"
    },
    {
      name: "GitHub",
      description: "إدارة الكود المصدري والمشاريع",
      category: "تطوير",
      provider: "github",
      icon: "code",
      status: "متصل",
      apiKey: "ghp_*****************************",
      webhookUrl: "https://api.example.com/webhooks/github",
      syncFrequency: "كل 30 دقيقة",
      lastSync: new Date(Date.now() - 1200000), // 20 minutes ago
      dataAccess: JSON.stringify(["المستودعات", "المشكلات", "طلبات السحب"]),
      settings: JSON.stringify({
        repositories: ["username/repo1", "username/repo2"],
        defaultBranch: "main",
        webhookEvents: ["push", "pull_request", "issues"]
      })
    }
  ];

  // Create integrations
  for (const integration of integrations) {
    const existingIntegration = await prisma.integration.findFirst({
      where: { 
        name: integration.name,
        provider: integration.provider
      },
    });

    if (!existingIntegration) {
      const newIntegration = await prisma.integration.create({
        data: integration,
      });
      console.log(`Created integration: ${newIntegration.name}`);
    } else {
      console.log(`Integration already exists: ${existingIntegration.name}`);
    }
  }

  // Create some sample sync records
  const connectedIntegrations = await prisma.integration.findMany({
    where: {
      status: "متصل"
    },
  });

  for (const integration of connectedIntegrations) {
    // Create sync history for the past 7 days
    const syncCount = Math.floor(Math.random() * 10) + 5; // 5-15 syncs
    
    for (let i = 0; i < syncCount; i++) {
      const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
      const hoursAgo = Math.floor(Math.random() * 24); // 0-23 hours ago
      
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - daysAgo);
      startTime.setHours(startTime.getHours() - hoursAgo);
      
      const syncDuration = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
      const endTime = new Date(startTime.getTime() + syncDuration * 1000);
      
      const itemCount = Math.floor(Math.random() * 100) + 10; // 10-110 items
      const success = Math.random() > 0.15; // 85% success rate
      
      await prisma.integrationSync.create({
        data: {
          integrationId: integration.id,
          status: success ? "completed" : "failed",
          startTime: startTime,
          endTime: success ? endTime : undefined,
          itemsProcessed: success ? itemCount : Math.floor(itemCount * 0.3),
          itemsCreated: success ? Math.floor(itemCount * 0.3) : 0,
          itemsUpdated: success ? Math.floor(itemCount * 0.6) : 0,
          itemsDeleted: success ? Math.floor(itemCount * 0.1) : 0,
          itemsFailed: success ? 0 : Math.floor(itemCount * 0.3),
          error: success ? null : "Connection timed out after 30 seconds",
        },
      });
      
      console.log(`Created sync record for: ${integration.name}`);
    }

    // Create some sample webhook logs
    const webhookCount = Math.floor(Math.random() * 15) + 5; // 5-20 webhooks
    
    for (let i = 0; i < webhookCount; i++) {
      const hoursAgo = Math.floor(Math.random() * 72); // 0-72 hours ago
      const receivedAt = new Date();
      receivedAt.setHours(receivedAt.getHours() - hoursAgo);
      
      const processedAt = new Date(receivedAt.getTime() + Math.floor(Math.random() * 10) * 1000); // 0-10 seconds later
      const success = Math.random() > 0.1; // 90% success rate

      let eventType, payload;
      
      switch (integration.provider) {
        case 'stripe':
          eventType = ['payment_intent.succeeded', 'charge.succeeded', 'invoice.paid', 'charge.failed'][Math.floor(Math.random() * 4)];
          payload = JSON.stringify({
            id: `evt_${Math.random().toString(36).substring(2, 10)}`,
            type: eventType,
            data: { object: { id: `pi_${Math.random().toString(36).substring(2, 10)}` } }
          });
          break;
        case 'github':
          eventType = ['push', 'pull_request', 'issues', 'release'][Math.floor(Math.random() * 4)];
          payload = JSON.stringify({
            event: eventType,
            repository: { full_name: 'username/repo' },
            sender: { login: 'username' }
          });
          break;
        case 'slack':
          eventType = 'event_callback';
          payload = JSON.stringify({
            type: eventType,
            event: { 
              type: 'message', 
              channel: 'C123456',
              text: 'Test message from webhook'
            }
          });
          break;
        default:
          eventType = 'generic.event';
          payload = JSON.stringify({ type: eventType, data: { test: true } });
      }
      
      await prisma.integrationWebhook.create({
        data: {
          integrationId: integration.id,
          provider: integration.provider,
          eventType: eventType,
          status: success ? "success" : "error",
          payload: payload,
          processedAt: success ? processedAt : null,
          error: success ? null : "Invalid webhook signature",
          createdAt: receivedAt
        },
      });
      
      console.log(`Created webhook log for: ${integration.name} (${eventType})`);
    }
  }

  console.log('Integration seeding completed');
}

// Export for use in main seed file
module.exports = { seedIntegrations };

// Allow running this file directly
if (require.main === module) {
  seedIntegrations()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
