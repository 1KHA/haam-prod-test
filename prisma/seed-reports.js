const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding reports...');
  
  // Create reports upload directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const reportsDir = path.join(uploadsDir, 'reports');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
    console.log('Created reports directory');
  }
  
  // Find admin user to set as creator
  const adminUser = await prisma.user.findFirst({
    where: {
      role: 'ADMIN'
    }
  });
  
  if (!adminUser) {
    console.error('No admin user found. Please run seed-roles.js first.');
    return;
  }
  
  // Sample report data
  const reports = [
    {
      title: 'تقرير أداء المسرعات - الربع الأول 2025',
      description: 'تقرير شامل عن أداء برامج المسرعات خلال الربع الأول من عام 2025، يتضمن مؤشرات الأداء الرئيسية والإنجازات والتحديات.',
      category: 'أداء البرامج',
      format: 'PDF',
      status: 'published',
      publishDate: new Date('2025-03-12'),
      fileName: 'program-performance-q1-2025.pdf',
      fileSize: 2457600, // ~2.4 MB
      downloadCount: 85
    },
    {
      title: 'تقرير التمويل الاستثماري - فبراير 2025',
      description: 'تحليل مفصل لصفقات التمويل الاستثماري خلال شهر فبراير 2025، يشمل توزيع الاستثمارات حسب القطاع والمرحلة وحجم الصفقات.',
      category: 'التمويل',
      format: 'XLSX',
      status: 'published',
      publishDate: new Date('2025-03-05'),
      fileName: 'investment-funding-feb-2025.xlsx',
      fileSize: 1887436, // ~1.8 MB
      downloadCount: 120
    },
    {
      title: 'تقرير نمو الشركات الناشئة - الربع الرابع 2024',
      description: 'تقرير تحليلي عن نمو الشركات الناشئة خلال الربع الرابع من عام 2024، يتضمن مؤشرات النمو والتوظيف والإيرادات والتحديات.',
      category: 'الشركات الناشئة',
      format: 'PDF',
      status: 'published',
      publishDate: new Date('2025-02-28'),
      fileName: 'startup-growth-q4-2024.pdf',
      fileSize: 3355443, // ~3.2 MB
      downloadCount: 95
    },
    {
      title: 'تقرير المستخدمين النشطين - يناير 2025',
      description: 'تحليل لنشاط المستخدمين على المنصة خلال شهر يناير 2025، يشمل معدلات الاستخدام والتفاعل والمشاركة حسب نوع المستخدم.',
      category: 'المستخدمين',
      format: 'PDF',
      status: 'published',
      publishDate: new Date('2025-02-15'),
      fileName: 'active-users-jan-2025.pdf',
      fileSize: 1572864, // ~1.5 MB
      downloadCount: 65
    },
    {
      title: 'تقرير الفعاليات والورش - الربع الأول 2025',
      description: 'تقرير عن الفعاليات وورش العمل المنفذة خلال الربع الأول من عام 2025، يتضمن إحصائيات المشاركة والتقييمات والتوصيات.',
      category: 'الفعاليات',
      format: 'PPTX',
      status: 'draft',
      publishDate: null,
      fileName: 'events-workshops-q1-2025.pptx',
      fileSize: 4928307, // ~4.7 MB
      downloadCount: 0
    },
    {
      title: 'تقرير أداء المنصة - فبراير 2025',
      description: 'تقرير فني عن أداء المنصة خلال شهر فبراير 2025، يشمل معدلات الاستجابة وأوقات التحميل والأعطال والتحسينات المقترحة.',
      category: 'تقني',
      format: 'PDF',
      status: 'draft',
      publishDate: null,
      fileName: 'platform-performance-feb-2025.pdf',
      fileSize: 2202009, // ~2.1 MB
      downloadCount: 0
    },
    {
      title: 'تقرير التوجيه والإرشاد - الربع الأول 2025',
      description: 'تقرير عن برامج التوجيه والإرشاد خلال الربع الأول من عام 2025، يتضمن إحصائيات الجلسات والتقييمات والنتائج.',
      category: 'التوجيه',
      format: 'PDF',
      status: 'scheduled',
      publishDate: new Date('2025-03-31T08:00:00'),
      scheduledTime: '08:00:00',
      fileName: 'mentorship-guidance-q1-2025.pdf',
      fileSize: 0, // Not yet generated
      downloadCount: 0
    },
    {
      title: 'تقرير الأداء المالي - الربع الأول 2025',
      description: 'تقرير مالي شامل عن الربع الأول من عام 2025، يتضمن الإيرادات والمصروفات والميزانية والتوقعات المالية.',
      category: 'مالي',
      format: 'XLSX',
      status: 'scheduled',
      publishDate: new Date('2025-04-05T09:00:00'),
      scheduledTime: '09:00:00',
      fileName: 'financial-performance-q1-2025.xlsx',
      fileSize: 0, // Not yet generated
      downloadCount: 0
    }
  ];
  
  // Create sample placeholder files and database entries
  for (const reportData of reports) {
    const uniqueFileName = `${randomUUID()}-${reportData.fileName}`;
    const filePath = path.join(reportsDir, uniqueFileName);
    const publicFilePath = `/uploads/reports/${uniqueFileName}`;
    
    // Create placeholder file if not a scheduled report
    if (reportData.status !== 'scheduled') {
      // Create a simple placeholder file with the report title and description
      const placeholderContent = `
        ${reportData.title}
        
        ${reportData.description}
        
        This is a placeholder file for demonstration purposes.
        In a real system, this would be an actual ${reportData.format} file with real content.
      `;
      
      fs.writeFileSync(filePath, placeholderContent);
    }
    
    // Create report record in database
    await prisma.report.create({
      data: {
        title: reportData.title,
        description: reportData.description,
        category: reportData.category,
        format: reportData.format,
        status: reportData.status,
        publishDate: reportData.publishDate,
        scheduledTime: reportData.scheduledTime,
        fileUrl: publicFilePath,
        filePath: publicFilePath,
        fileSize: reportData.fileSize,
        downloadCount: reportData.downloadCount,
        printCount: Math.floor(reportData.downloadCount * 0.3), // Some percentage of downloads
        viewCount: Math.floor(reportData.downloadCount * 1.8), // More views than downloads
        shareCount: Math.floor(reportData.downloadCount * 0.15), // Some percentage of downloads
        createdById: adminUser.id
      }
    });
    
    console.log(`Created sample report: ${reportData.title}`);
  }
  
  console.log('Reports seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
