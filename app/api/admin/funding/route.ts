import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET handler to fetch funding opportunities
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'funding',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // For demonstration, we'll use mock data
    // In a real implementation, this would query the database
    const totalFunding = 85;
    const totalPages = Math.ceil(totalFunding / pageSize);
    
    // Generate mock funding data
    const fundingOpportunities = Array.from({ length: pageSize }, (_, i) => {
      const id = (skip + i + 1).toString();
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 180)); // Within last 6 months
      
      const applicationDeadline = new Date();
      applicationDeadline.setDate(createdDate.getDate() + 30 + Math.floor(Math.random() * 60)); // 1-3 months after creation
      
      const statuses = ['open', 'closed', 'upcoming', 'processing', 'awarded'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const types = ['equity', 'grant', 'loan', 'prize', 'seed', 'venture'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const amounts = [
        { min: 100000, max: 500000 },
        { min: 500000, max: 1000000 },
        { min: 1000000, max: 5000000 },
        { min: 5000000, max: 10000000 },
        { min: null, max: 2000000 },
        { min: 2000000, max: null }
      ];
      const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
      
      const eligibilityCriteria = [
        [
          "شركات ناشئة في مرحلة مبكرة", 
          "مقرها في المملكة العربية السعودية", 
          "عمر الشركة أقل من 3 سنوات"
        ],
        [
          "مشاريع في قطاع التقنية", 
          "لديها نموذج أولي قابل للتطبيق", 
          "فريق عمل متكامل"
        ],
        [
          "شركات في مرحلة النمو", 
          "إيرادات سنوية تتجاوز 1 مليون ريال", 
          "خطة توسع إقليمية"
        ],
        [
          "مشاريع ابتكارية في قطاع الصحة", 
          "حلول تقنية مبتكرة", 
          "إمكانية التوسع العالمي"
        ]
      ];
      const randomEligibility = eligibilityCriteria[Math.floor(Math.random() * eligibilityCriteria.length)];
      
      const startupStages = ['idea', 'mvp', 'early', 'growth', 'scaling'];
      const randomStages = Array.from(
        { length: 1 + Math.floor(Math.random() * 3) }, 
        () => startupStages[Math.floor(Math.random() * startupStages.length)]
      ).filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
      
      return {
        id,
        title: `فرصة تمويل ${id} - ${
          randomType === 'equity' ? 'استثمار' : 
          randomType === 'grant' ? 'منحة' :
          randomType === 'loan' ? 'قرض' :
          randomType === 'prize' ? 'جائزة' :
          randomType === 'seed' ? 'تمويل أولي' :
          'رأس مال مغامر'
        }`,
        description: `فرصة تمويل للشركات الناشئة في مجال ${
          Math.random() > 0.5 ? 'التقنية' : 
          Math.random() > 0.5 ? 'الصحة' : 
          Math.random() > 0.5 ? 'التعليم' : 
          'الاستدامة'
        }`,
        fundingAmount: randomAmount,
        currency: 'SAR',
        status: status || randomStatus,
        type: type || randomType,
        provider: `${
          Math.random() > 0.7 ? 'صندوق الاستثمارات العامة' :
          Math.random() > 0.6 ? 'سانابل للاستثمار' :
          Math.random() > 0.5 ? 'مؤسسة الملك عبدالله للأعمال الخيرية' :
          Math.random() > 0.4 ? 'شركة وادي الرياض' :
          Math.random() > 0.3 ? 'منشآت' :
          'مسرعة أعمال الهيئة الملكية'
        }`,
        applicationDeadline: applicationDeadline.toISOString(),
        eligibilityCriteria: randomEligibility,
        applicationProcess: [
          "تقديم طلب عبر المنصة",
          "فحص أولي للأهلية",
          "تقديم خطة العمل التفصيلية",
          "المقابلة مع لجنة التقييم",
          "القرار النهائي"
        ],
        startupStages: randomStages,
        sectors: [
          Math.random() > 0.5 ? "التقنية" : null,
          Math.random() > 0.5 ? "الصحة" : null,
          Math.random() > 0.5 ? "التعليم" : null,
          Math.random() > 0.5 ? "الطاقة" : null,
          Math.random() > 0.5 ? "الزراعة" : null,
          Math.random() > 0.5 ? "الخدمات المالية" : null,
        ].filter(Boolean), // Remove nulls
        applicationLink: `https://example.com/funding/${id}/apply`,
        contactEmail: `funding${id}@example.com`,
        createdAt: createdDate.toISOString(),
        updatedAt: new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date after creation
        publishedAt: Math.random() > 0.2 ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null, // 80% chance to be published
        applications: Math.floor(Math.random() * 100),
        awards: Math.floor(Math.random() * 10)
      };
    });

    return NextResponse.json({ 
      success: true,
      data: {
        fundingOpportunities,
        pagination: {
          page,
          pageSize,
          totalItems: totalFunding,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching funding opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding opportunities' },
      { status: 500 }
    );
  }
}

// POST handler to create a new funding opportunity
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - requires admin permission to create funding opportunities
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'funding',
      action: 'create'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'type', 'applicationDeadline', 'eligibilityCriteria'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // In a real implementation, this would create a funding opportunity in the database
    // For demonstration, we'll just return a mock created opportunity
    const newFunding = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      fundingAmount: body.fundingAmount || { min: null, max: null },
      currency: body.currency || 'SAR',
      status: body.status || 'draft',
      type: body.type,
      provider: body.provider,
      applicationDeadline: body.applicationDeadline,
      eligibilityCriteria: body.eligibilityCriteria,
      applicationProcess: body.applicationProcess || [],
      startupStages: body.startupStages || [],
      sectors: body.sectors || [],
      applicationLink: body.applicationLink,
      contactEmail: body.contactEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: body.status === 'published' ? new Date().toISOString() : null,
      createdBy: user.userId,
      applications: 0,
      awards: 0
    };

    // Log the creation for audit purposes
    console.log('New funding opportunity created:', newFunding);

    return NextResponse.json({ 
      success: true, 
      message: 'تم إنشاء فرصة التمويل بنجاح',
      funding: newFunding
    });
  } catch (error) {
    console.error('Error creating funding opportunity:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء فرصة التمويل' },
      { status: 500 }
    );
  }
}
