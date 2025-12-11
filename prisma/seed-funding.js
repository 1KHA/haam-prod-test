const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create some test funding entries
    const fundingEntries = [
      {
        title: "استثمار مباشر - تك سمارت",
        amount: "5000000",
        startupId: "test-startup-123",
        startupName: "تك سمارت",
        status: "مكتمل",
        date: new Date("2025-01-15"),
        fundingType: "استثمار مباشر",
        investorName: "صندوق الاستثمارات العامة",
        description: "تمويل استثماري مباشر لدعم نمو شركة تك سمارت في مجال التقنيات المالية.",
      },
      {
        title: "منحة تقنية - هيلث تك",
        amount: "2500000",
        startupId: "test-startup-456",
        startupName: "هيلث تك",
        status: "مكتمل",
        date: new Date("2025-02-01"),
        fundingType: "منحة تقنية",
        investorName: "وزارة الاتصالات وتقنية المعلومات",
        description: "منحة تقنية لدعم الابتكار في مجال التقنيات الصحية.",
      },
      {
        title: "استثمار جولة أ - إيكو سمارت",
        amount: "10000000",
        startupId: "test-startup-789",
        startupName: "إيكو سمارت",
        status: "قيد المراجعة",
        date: new Date("2025-01-25"),
        fundingType: "استثمار جولة أ",
        investorName: "سدرة فينشرز",
        description: "استثمار في جولة أ لشركة إيكو سمارت العاملة في مجال التقنيات البيئية.",
      }
    ];

    // Create funding opportunities
    const fundingOpportunities = [
      {
        title: "منحة تطوير المنتجات التقنية",
        description: "منحة لدعم تطوير المنتجات التقنية المبتكرة في مجال الذكاء الاصطناعي",
        fundingType: "GRANT",
        minAmount: 50000,
        maxAmount: 500000,
        currency: "SAR",
        deadline: new Date("2025-06-30"),
        requirements: "يجب أن تكون الشركة سعودية وعمرها أقل من 5 سنوات",
        sectors: "الذكاء الاصطناعي,التقنية المالية,الصحة الرقمية",
      },
      {
        title: "استثمار مباشر للشركات الناشئة",
        description: "استثمار مباشر للشركات الناشئة في مرحلة النمو",
        fundingType: "INVESTMENT",
        minAmount: 1000000,
        maxAmount: 5000000,
        currency: "SAR",
        deadline: new Date("2025-08-15"),
        requirements: "يجب أن يكون لدى الشركة منتج قائم وإيرادات",
        sectors: "التجارة الإلكترونية,الخدمات اللوجستية,التقنية المالية",
      },
      {
        title: "قرض تمويلي ميسر",
        description: "قرض تمويلي بفائدة منخفضة للشركات في مراحلها الأولى",
        fundingType: "LOAN",
        amount: 250000,
        currency: "SAR",
        deadline: new Date("2025-05-01"),
        requirements: "يجب تقديم خطة عمل مفصلة وضمانات مالية",
        sectors: "الصناعة,الزراعة,الطاقة المتجددة",
      }
    ];

    console.log("Creating funding entries...");
    for (const funding of fundingEntries) {
      await prisma.funding.create({
        data: funding
      });
    }
    console.log(`✅ Created ${fundingEntries.length} funding entries`);
    
    console.log("Creating funding opportunities...");
    for (const opportunity of fundingOpportunities) {
      await prisma.fundingOpportunity.create({
        data: opportunity
      });
    }
    console.log(`✅ Created ${fundingOpportunities.length} funding opportunities`);
    
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
