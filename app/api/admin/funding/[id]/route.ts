import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET handler to fetch a specific funding opportunity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Funding ID is required' }, { status: 400 });
    }

    // In a real implementation, this would fetch the funding opportunity from the database
    // For demonstration, we'll return mock data
    const funding = {
      id,
      title: `فرصة تمويل ${id} - منحة تطوير المنتجات التقنية`,
      description: `منحة لدعم الشركات الناشئة في تطوير منتجات تقنية مبتكرة تساهم في حلول مشاكل السوق المحلي. تهدف المنحة إلى تسريع نمو الشركات الناشئة وتعزيز قدراتها التنافسية في السوق.`,
      fundingAmount: { min: 500000, max: 2000000 },
      currency: 'SAR',
      status: 'open',
      type: 'grant',
      provider: 'مؤسسة الملك عبدالله للأعمال الخيرية',
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      eligibilityCriteria: [
        "شركات ناشئة في مرحلة مبكرة", 
        "مقرها في المملكة العربية السعودية", 
        "عمر الشركة أقل من 3 سنوات",
        "تعمل في مجال التقنية",
        "لديها نموذج أولي على الأقل"
      ],
      applicationProcess: [
        "تقديم طلب عبر المنصة",
        "فحص أولي للأهلية",
        "تقديم خطة العمل التفصيلية",
        "المقابلة مع لجنة التقييم",
        "القرار النهائي"
      ],
      startupStages: ['mvp', 'early'],
      sectors: ["التقنية", "الصحة", "التعليم"],
      applicationLink: `https://example.com/funding/${id}/apply`,
      contactEmail: `funding@king-abdullah-foundation.example.sa`,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days ago
      createdBy: 'user_123',
      updatedBy: 'user_456',
      applications: 47,
      awards: 0,
      additionalDetails: {
        fundingDuration: '12 شهر',
        reportingRequirements: 'تقرير مرحلي كل 3 أشهر وتقرير نهائي',
        disbursementSchedule: 'دفعتين: 60% عند التوقيع و40% بعد 6 أشهر بناءً على التقدم',
        useOfFunds: [
          'تطوير المنتج',
          'توظيف المواهب التقنية',
          'تسويق وتوسيع نطاق العملاء',
          'تكاليف التشغيل الأساسية'
        ],
        exclusions: [
          'مكافآت المؤسسين',
          'تكاليف السفر الدولي',
          'شراء الأصول الثابتة بقيمة تتجاوز 20% من إجمالي المنحة',
          'تسديد الديون الحالية'
        ],
        selectionCriteria: {
          innovation: 'مستوى الابتكار والتميز التقني',
          marketPotential: 'حجم السوق المستهدف والقدرة على النمو',
          teamCapability: 'خبرة وقدرات الفريق',
          impact: 'الأثر الاجتماعي أو الاقتصادي المحتمل',
          sustainability: 'استدامة نموذج العمل'
        }
      },
      faqs: [
        {
          question: 'هل يمكن للشركات غير السعودية التقديم؟',
          answer: 'لا، يجب أن تكون الشركة مسجلة في المملكة العربية السعودية وفقًا للأنظمة المحلية.'
        },
        {
          question: 'هل يشترط وجود إيرادات حالية للتقديم؟',
          answer: 'لا يشترط وجود إيرادات حالية، لكن يجب وجود نموذج أولي قابل للعرض على الأقل.'
        },
        {
          question: 'كم عدد الشركات التي سيتم اختيارها للمنحة؟',
          answer: 'سيتم اختيار ما بين 10-15 شركة ناشئة للحصول على المنحة في هذه الدورة.'
        },
        {
          question: 'هل هناك التزامات على الشركة بعد الحصول على المنحة؟',
          answer: 'نعم، تشمل الالتزامات تقديم تقارير دورية عن التقدم، والمشاركة في فعاليات المؤسسة، والالتزام بخطة الإنفاق المتفق عليها.'
        }
      ],
      statistics: {
        previousRounds: 2,
        totalFundedStartups: 23,
        averageGrantSize: 750000,
        successRate: 18 // 18% of applicants received funding
      },
      timeline: [
        {
          stage: 'فتح باب التقديم',
          date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() // 28 days ago
        },
        {
          stage: 'إغلاق باب التقديم',
          date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
        },
        {
          stage: 'الفرز المبدئي',
          date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString() // 75 days from now
        },
        {
          stage: 'المقابلات',
          date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
        },
        {
          stage: 'الإعلان عن النتائج',
          date: new Date(Date.now() + 105 * 24 * 60 * 60 * 1000).toISOString() // 105 days from now
        },
        {
          stage: 'بدء التمويل',
          date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString() // 120 days from now
        }
      ]
    };

    return NextResponse.json({ 
      success: true,
      data: funding
    });
  } catch (error) {
    console.error('Error fetching funding details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding details' },
      { status: 500 }
    );
  }
}

// PUT handler to update a funding opportunity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Funding ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    
    // In a real implementation, this would update the funding opportunity in the database
    // For demonstration, we'll just return a mock updated opportunity
    const updatedFunding = {
      id,
      ...body,
      updatedBy: user.userId,
      updatedAt: new Date().toISOString()
    };

    // If status was changed to 'published', set publishedAt
    if (body.status === 'published' && !updatedFunding.publishedAt) {
      updatedFunding.publishedAt = new Date().toISOString();
    }

    console.log('Funding opportunity updated:', updatedFunding);

    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث فرصة التمويل بنجاح',
      funding: updatedFunding
    });
  } catch (error) {
    console.error('Error updating funding opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update funding opportunity' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a funding opportunity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - requires admin level permission
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'funding',
      action: 'delete'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Funding ID is required' }, { status: 400 });
    }

    // In a real implementation, this would delete or mark the funding opportunity as deleted in the database
    // For demonstration, we'll just log the deletion
    console.log(`Funding opportunity ${id} deleted by user ${user.userId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف فرصة التمويل بنجاح'
    });
  } catch (error) {
    console.error('Error deleting funding opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete funding opportunity' },
      { status: 500 }
    );
  }
}
