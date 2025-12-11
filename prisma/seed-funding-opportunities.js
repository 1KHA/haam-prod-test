const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting to seed funding opportunities data...");

    // Create sample funding opportunities
    const fundingOpportunities = [
      {
        title: "برنامج تمويل الشركات الناشئة التقنية",
        description: "برنامج مقدم من صندوق الاستثمارات العامة لدعم الشركات الناشئة في مجال التقنية بتمويل يتراوح بين 500 ألف إلى 3 مليون ريال.",
        fundingType: "GRANT",
        minAmount: 500000,
        maxAmount: 3000000,
        currency: "SAR",
        deadline: new Date("2025-12-30"),
        requirements: "- شركة ناشئة في مجال التقنية\n- عمر الشركة أقل من 5 سنوات\n- وجود نموذج أعمال قابل للتطوير\n- فريق عمل متكامل",
        applicationLink: "https://example.com/funding/apply",
        contactEmail: "funding@example.com",
        sectors: "التقنية,الذكاء الاصطناعي,التجارة الإلكترونية",
      },
      {
        title: "تمويل المشاريع الصغيرة والمتوسطة",
        description: "برنامج تمويلي ميسر للمشاريع الصغيرة والمتوسطة بقيمة تصل إلى مليون ريال وبفترة سداد تصل إلى 5 سنوات.",
        fundingType: "LOAN",
        minAmount: 100000,
        maxAmount: 1000000,
        currency: "SAR",
        deadline: new Date("2026-03-15"),
        requirements: "- ترخيص تجاري ساري المفعول\n- خطة عمل واضحة\n- سجل مالي للسنة الماضية",
        applicationLink: "https://example.com/sme/funding",
        contactEmail: "sme.fund@example.com",
        sectors: "التجارة,الصناعة,الخدمات",
      },
      {
        title: "استثمار المرحلة الأولى للشركات الناشئة",
        description: "استثمار في شركات ناشئة واعدة بقيمة تصل إلى 5 مليون ريال مقابل حصة من الشركة تتراوح بين 10% و20%.",
        fundingType: "INVESTMENT",
        minAmount: 1000000,
        maxAmount: 5000000,
        currency: "SAR",
        deadline: null, // No deadline
        requirements: "- نموذج أعمال مثبت\n- فريق إداري قوي\n- إمكانية نمو سريع\n- سوق مستهدف كبير",
        applicationLink: "https://example.com/venture/investment",
        contactEmail: "investments@example.com",
        sectors: "التكنولوجيا,الصحة,التعليم,الخدمات اللوجستية",
      }
    ];

    // Create funding opportunities
    console.log("Creating funding opportunities...");
    for (const opportunity of fundingOpportunities) {
      const createdOpportunity = await prisma.fundingOpportunity.create({
        data: opportunity
      });
      console.log(`Created funding opportunity: ${createdOpportunity.title}`);
    }

    // Create sample fundings (for startups that received funding)
    const fundings = [
      {
        title: "تمويل المرحلة الأولى لشركة تقنية المستقبل",
        amount: "1,000,000",
        startupName: "تقنية المستقبل",
        status: "مكتمل",
        date: new Date("2025-06-15"),
        fundingType: "استثمار",
        investorName: "شركة الاستثمارات الرقمية",
        description: "تمويل المرحلة الأولى لتطوير منصة الذكاء الاصطناعي وتوسيع فريق العمل.",
        startupId: "startup-1", // This will be a placeholder
      },
      {
        title: "منحة تطوير تطبيقات التعليم الإلكتروني",
        amount: "500,000",
        startupName: "تعلّم الذكي",
        status: "قيد المراجعة",
        date: new Date("2025-07-10"),
        fundingType: "منحة",
        investorName: "صندوق دعم التعليم",
        description: "منحة لتطوير تطبيقات تعليمية تفاعلية باستخدام تقنيات الواقع المعزز.",
        startupId: "startup-2", // This will be a placeholder
      },
      {
        title: "تمويل توسع شركة التوصيل السريع",
        amount: "2,000,000",
        startupName: "توصيل سريع",
        status: "مكتمل",
        date: new Date("2025-05-20"),
        fundingType: "استثمار",
        investorName: "مجموعة استثمارات النقل",
        description: "تمويل لتوسيع نطاق خدمات التوصيل لتشمل 5 مدن جديدة وتطوير نظام إدارة الطلبات.",
        startupId: "startup-3", // This will be a placeholder
      }
    ];

    // Create test user for funding if not exists
    let testUser = await prisma.user.findUnique({
      where: { email: "funding-admin@example.com" }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: "funding-admin@example.com",
          password: "$2a$10$CrI4UUdGJJKBtHVpKVfaueC9NWQwvSz1/8YOOgLx8akYzCHQxG3pC", // hashed version of "password"
          name: "Funding Admin",
          role: "ADMIN"
        }
      });
      console.log("Created funding admin user");
    }

    // Create startup records if they don't exist
    const startupRecords = await Promise.all(fundings.map(async (funding, index) => {
      const startupName = funding.startupName;
      
      // Check if we have a startup with this name
      let startup = await prisma.startup.findFirst({
        where: { name: startupName }
      });
      
      // If not, create a new startup
      if (!startup) {
        startup = await prisma.startup.create({
          data: {
            name: startupName,
            industry: "Technology",
            stage: "Seed",
            description: `Startup description for ${startupName}`,
            problem: "Problem statement",
            solution: "Solution description",
            status: "APPROVED",
            creatorId: testUser.id
          }
        });
        console.log(`Created placeholder startup: ${startupName}`);
      }
      
      return { ...funding, startupId: startup.id };
    }));

    // Create funding records
    console.log("Creating funding records...");
    for (const funding of startupRecords) {
      // Create funding record
      const createdFunding = await prisma.funding.create({
        data: {
          title: funding.title,
          amount: funding.amount,
          startupId: funding.startupId,
          startupName: funding.startupName,
          status: funding.status,
          date: funding.date,
          fundingType: funding.fundingType,
          investorName: funding.investorName,
          description: funding.description,
          createdBy: testUser.id
        }
      });
      
      console.log(`Created funding record: ${createdFunding.title}`);
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
