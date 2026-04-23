import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
// GET handler to fetch security audit information
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
      category: 'security',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const auditType = searchParams.get('type') || 'system'; // 'system', 'user', 'data', etc.
    
    // Mock audit data based on type
    let auditData;
    
    switch (auditType) {
      case 'system':
        auditData = {
          lastAuditDate: '2025-03-10T14:30:00Z',
          status: 'completed',
          summary: {
            totalChecks: 42,
            passedChecks: 38,
            warningChecks: 3,
            failedChecks: 1,
            criticalVulnerabilities: 0
          },
          securityScore: 94,
          findings: [
            {
              id: '1',
              category: 'النسخ الاحتياطي',
              check: 'تشفير النسخ الاحتياطية',
              status: 'passed',
              details: 'النسخ الاحتياطية مشفرة باستخدام AES-256'
            },
            {
              id: '2',
              category: 'التشفير',
              check: 'استخدام TLS 1.2+',
              status: 'passed',
              details: 'يستخدم النظام TLS 1.3 لجميع الاتصالات'
            },
            {
              id: '3',
              category: 'سياسة كلمات المرور',
              check: 'تعقيد كلمة المرور',
              status: 'passed',
              details: 'سياسة كلمة المرور تتوافق مع معايير NIST'
            },
            {
              id: '4',
              category: 'الوصول إلى النظام',
              check: 'قفل الحسابات',
              status: 'passed',
              details: 'يتم قفل الحسابات بعد 5 محاولات فاشلة'
            },
            {
              id: '5',
              category: 'المصادقة',
              check: 'المصادقة متعددة العوامل',
              status: 'warning',
              details: 'المصادقة متعددة العوامل متاحة ولكن غير مطلوبة لجميع المستخدمين'
            },
            {
              id: '6',
              category: 'تسجيل الأحداث',
              check: 'مدة الاحتفاظ بالسجلات',
              status: 'warning',
              details: 'يتم الاحتفاظ بالسجلات لمدة 90 يومًا فقط، يوصى بزيادة المدة إلى 365 يومًا'
            },
            {
              id: '7',
              category: 'تحديثات النظام',
              check: 'تحديثات الأمان',
              status: 'failed',
              details: 'بعض مكونات النظام لم يتم تحديثها خلال الـ 90 يومًا الماضية'
            },
            {
              id: '8',
              category: 'التكوين',
              check: 'ضوابط CORS',
              status: 'warning',
              details: 'سياسة CORS واسعة جدًا، يجب تقييدها لمجالات محددة فقط'
            }
          ],
          recommendations: [
            'تفعيل المصادقة متعددة العوامل لجميع المستخدمين',
            'زيادة مدة الاحتفاظ بالسجلات إلى 365 يومًا',
            'تحديث جميع مكونات النظام المعلقة في أقرب وقت ممكن',
            'تضييق سياسة CORS للمجالات المصرح بها فقط'
          ]
        };
        break;
        
      case 'user':
        auditData = {
          lastAuditDate: '2025-03-08T09:15:00Z',
          status: 'completed',
          summary: {
            totalUsers: 324,
            activeUsers: 287,
            inactiveUsers: 37,
            adminUsers: 8,
            usersWithWeakPasswords: 12,
            usersWithoutMFA: 128
          },
          securityScore: 86,
          findings: [
            {
              id: '1',
              category: 'حسابات المستخدمين',
              check: 'حسابات مهجورة',
              status: 'warning',
              details: 'تم العثور على 18 حسابًا غير نشط لأكثر من 180 يومًا'
            },
            {
              id: '2',
              category: 'صلاحيات المستخدمين',
              check: 'مبدأ الصلاحيات الأقل',
              status: 'warning',
              details: '3 مستخدمين لديهم صلاحيات أكثر من اللازم لدورهم'
            },
            {
              id: '3',
              category: 'أمان الحساب',
              check: 'المصادقة متعددة العوامل',
              status: 'failed',
              details: '128 مستخدمًا لم يفعلوا المصادقة متعددة العوامل'
            },
            {
              id: '4',
              category: 'كلمات المرور',
              check: 'قوة كلمة المرور',
              status: 'warning',
              details: '12 مستخدمًا لديهم كلمات مرور ضعيفة أو مخترقة معروفة'
            }
          ],
          recommendations: [
            'تطبيق المصادقة متعددة العوامل إلزاميًا لجميع المستخدمين',
            'مراجعة وتحديث صلاحيات المستخدمين وفقًا لمبدأ الصلاحيات الأقل',
            'إجبار تغيير كلمات المرور للحسابات التي تستخدم كلمات مرور ضعيفة',
            'تعطيل الحسابات غير النشطة لأكثر من 180 يومًا'
          ]
        };
        break;
        
      case 'data':
        auditData = {
          lastAuditDate: '2025-03-05T11:45:00Z',
          status: 'completed',
          summary: {
            dataStoresAudited: 8,
            encryptedDataStores: 7,
            sensitiveDataExposures: 2,
            dataAccessViolations: 3,
            unauthorizedDataSharing: 0
          },
          securityScore: 88,
          findings: [
            {
              id: '1',
              category: 'تشفير البيانات',
              check: 'تشفير البيانات في وضع السكون',
              status: 'warning',
              details: 'قاعدة بيانات التقارير المؤقتة غير مشفرة'
            },
            {
              id: '2',
              category: 'تشفير البيانات',
              check: 'تشفير البيانات أثناء النقل',
              status: 'passed',
              details: 'جميع البيانات مشفرة أثناء النقل باستخدام TLS 1.3'
            },
            {
              id: '3',
              category: 'البيانات الحساسة',
              check: 'تخزين البيانات الحساسة',
              status: 'warning',
              details: 'تم العثور على أرقام بطاقات ائتمان غير مقنعة بالكامل في سجلات المعاملات'
            },
            {
              id: '4',
              category: 'وصول البيانات',
              check: 'ضوابط الوصول إلى البيانات',
              status: 'warning',
              details: '3 حالات من الوصول غير المصرح به إلى بيانات العملاء من قبل موظفي الدعم'
            }
          ],
          recommendations: [
            'تشفير قاعدة بيانات التقارير المؤقتة',
            'تطبيق تقنية التقنيع الكامل لأرقام بطاقات الائتمان في جميع البيانات',
            'تنفيذ ضوابط وصول أكثر صرامة لموظفي الدعم مع سجلات تدقيق تفصيلية',
            'إجراء مراجعة منتظمة لأذونات الوصول إلى البيانات'
          ]
        };
        break;
        
      default:
        auditData = {
          lastAuditDate: '2025-03-10T14:30:00Z',
          status: 'completed',
          summary: {
            totalChecks: 42,
            passedChecks: 38,
            warningChecks: 3,
            failedChecks: 1,
            criticalVulnerabilities: 0
          },
          securityScore: 94
        };
    }

    return NextResponse.json({ 
      success: true,
      auditType,
      data: auditData
    });
  } catch (error) {
    console.error('Error fetching security audit data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security audit data' },
      { status: 500 }
    );
  }
}

// POST handler to start a new security audit
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - requires admin level permission
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'security',
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { auditType, scope } = body;
    
    if (!auditType) {
      return NextResponse.json(
        { error: 'Missing required field: auditType' },
        { status: 400 }
      );
    }

    // In a real implementation, this would trigger an actual security audit process
    // For demo purposes, we'll simulate starting an audit
    const auditJob = {
      id: Date.now().toString(),
      auditType,
      scope: scope || 'full',
      status: 'pending',
      startedBy: user.userId,
      startedAt: new Date().toISOString(),
      estimatedCompletionTime: new Date(Date.now() + 1800000).toISOString() // 30 minutes from now
    };

    console.log('Security audit job started:', auditJob);

    return NextResponse.json({ 
      success: true, 
      message: 'Security audit started successfully',
      audit: auditJob
    });
  } catch (error) {
    console.error('Error starting security audit:', error);
    return NextResponse.json(
      { error: 'Failed to start security audit' },
      { status: 500 }
    );
  }
}
