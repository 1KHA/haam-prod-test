const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting to seed events data...");

    // Create sample events
    const events = [
      {
        title: "هاكاثون الذكاء الاصطناعي",
        eventType: "هاكاثون",
        description: "انضم إلينا في هذا الهاكاثون المثير لتطوير حلول مبتكرة باستخدام تقنيات الذكاء الاصطناعي.",
        startDate: new Date("2025-04-15T09:00:00.000Z"),
        endDate: new Date("2025-04-15T18:00:00.000Z"),
        location: "مركز الابتكار، الرياض",
        organizer: "إدارة المنصة",
        registrationDeadline: new Date("2025-04-10T23:59:59.000Z"),
        capacity: 100,
        status: "published",
      },
      {
        title: "ورشة عمل: تطوير نموذج العمل",
        eventType: "ورشة عمل",
        description: "ورشة عمل متخصصة لمساعدة الشركات الناشئة في تطوير وتحسين نماذج أعمالها.",
        startDate: new Date("2025-04-25T10:00:00.000Z"),
        endDate: new Date("2025-04-25T14:00:00.000Z"),
        location: "مقر المسرع، الرياض",
        organizer: "مسرع التقنية المالية",
        registrationDeadline: new Date("2025-04-20T23:59:59.000Z"),
        capacity: 50,
        status: "published",
      },
      {
        title: "مؤتمر التكنولوجيا المالية السنوي",
        eventType: "مؤتمر",
        description: "اجتمع مع الخبراء والمستثمرين في مجال التكنولوجيا المالية وتبادل الخبرات والفرص.",
        startDate: new Date("2025-05-10T08:30:00.000Z"),
        endDate: new Date("2025-05-11T17:00:00.000Z"),
        location: "فندق الفورسيزونز، الرياض",
        organizer: "هيئة السوق المالية",
        registrationDeadline: new Date("2025-05-01T23:59:59.000Z"),
        capacity: 300,
        status: "published",
      }
    ];

    // Create events and store their IDs
    console.log("Creating events...");
    const createdEvents = [];
    for (const event of events) {
      const createdEvent = await prisma.event.create({
        data: event
      });
      createdEvents.push(createdEvent);
      console.log(`Created event: ${createdEvent.title}`);
    }

    // Create test users for event registrations if not already existing
    console.log("Creating test users if needed...");
    let testUser1 = await prisma.user.findUnique({
      where: { email: "testuser1@example.com" }
    });

    if (!testUser1) {
      testUser1 = await prisma.user.create({
        data: {
          email: "testuser1@example.com",
          password: "$2a$10$CrI4UUdGJJKBtHVpKVfaueC9NWQwvSz1/8YOOgLx8akYzCHQxG3pC", // hashed version of "password"
          name: "Test User 1",
          role: "ENTREPRENEUR"
        }
      });
      console.log("Created test user 1");
    }

    let testUser2 = await prisma.user.findUnique({
      where: { email: "testuser2@example.com" }
    });

    if (!testUser2) {
      testUser2 = await prisma.user.create({
        data: {
          email: "testuser2@example.com",
          password: "$2a$10$CrI4UUdGJJKBtHVpKVfaueC9NWQwvSz1/8YOOgLx8akYzCHQxG3pC", // hashed version of "password"
          name: "Test User 2",
          role: "ENTREPRENEUR"
        }
      });
      console.log("Created test user 2");
    }

    // Create event registrations
    console.log("Creating event registrations...");
    if (createdEvents.length > 0 && testUser1 && testUser2) {
      const registrations = [
        {
          userId: testUser1.id,
          eventId: createdEvents[0].id,
          status: "confirmed"
        },
        {
          userId: testUser2.id,
          eventId: createdEvents[1].id,
          status: "waitlist"
        }
      ];

      for (const registration of registrations) {
        try {
          // Check if registration already exists
          const existingRegistration = await prisma.eventRegistration.findUnique({
            where: {
              eventId_userId: {
                eventId: registration.eventId,
                userId: registration.userId
              }
            }
          });

          if (!existingRegistration) {
            await prisma.eventRegistration.create({
              data: registration
            });
            console.log(`Created registration for event ID: ${registration.eventId}`);
          } else {
            console.log(`Registration already exists for event ID: ${registration.eventId} and user ID: ${registration.userId}`);
          }
        } catch (error) {
          console.error(`Error creating registration: ${error}`);
        }
      }
    }

    console.log("Seed data creation completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
