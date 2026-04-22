import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET handler to fetch security logs
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
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const severity = searchParams.get('severity'); // high, medium, low
    const status = searchParams.get('status'); // success, failure
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const type = searchParams.get('type'); // login, system, user, etc.
    
    // In a real implementation, this would query the database
    // For demo purposes, we'll return mock data
    const mockLogs = [
      { 
        id: "1", 
        action: "تسجيل دخول", 
        user: "أحمد محمد", 
        userRole: "مدير نظام", 
        status: "نجاح", 
        timestamp: "2025-03-12T10:15:22Z",
        ipAddress: "192.168.1.105",
        userAgent: "Chrome 120.0.0.0 / Windows",
        details: "تسجيل دخول ناجح من الرياض، المملكة العربية السعودية",
        severity: "منخفض"
      },
      { 
        id: "2", 
        action: "تغيير كلمة المرور", 
        user: "سارة العتيبي", 
        userRole: "مدير برنامج", 
        status: "نجاح", 
        timestamp: "2025-03-12T09:45:10Z",
        ipAddress: "192.168.1.110",
        userAgent: "Firefox 115.0 / macOS",
        details: "تم تغيير كلمة المرور بنجاح",
        severity: "منخفض"
      },
      { 
        id: "3", 
        action: "محاولة تسجيل دخول", 
        user: "خالد العمري", 
        userRole: "مستثمر", 
        status: "فشل", 
        timestamp: "2025-03-12T08:30:45Z",
        ipAddress: "192.168.1.120",
        userAgent: "Safari 17.0 / iOS",
        details: "فشل تسجيل الدخول: كلمة مرور غير صحيحة (المحاولة الثالثة)",
        severity: "متوسط"
      },
      { 
        id: "4", 
        action: "تعديل صلاحيات المستخدم", 
        user: "محمد القحطاني", 
        userRole: "مدير نظام", 
        status: "نجاح", 
        timestamp: "2025-03-11T16:20:33Z",
        ipAddress: "192.168.1.105",
        userAgent: "Chrome 120.0.0.0 / Windows",
        details: "تم تعديل صلاحيات المستخدم 'فاطمة الزهراء' من 'موجه' إلى 'مدير برنامج'",
        severity: "متوسط"
      },
      { 
        id: "5", 
        action: "محاولة وصول غير مصرح", 
        user: "مجهول", 
        userRole: "غير معروف", 
        status: "فشل", 
        timestamp: "2025-03-11T14:55:18Z",
        ipAddress: "203.0.113.42",
        userAgent: "Mozilla/5.0 (compatible; Bot/1.0)",
        details: "محاولة وصول غير مصرح بها إلى واجهة برمجة التطبيقات للإدارة",
        severity: "عالي"
      },
      { 
        id: "6", 
        action: "تصدير بيانات", 
        user: "نورة السعيد", 
        userRole: "مدير برنامج", 
        status: "نجاح", 
        timestamp: "2025-03-11T11:10:05Z",
        ipAddress: "192.168.1.115",
        userAgent: "Edge 120.0.0.0 / Windows",
        details: "تم تصدير بيانات الشركات الناشئة (120 سجل)",
        severity: "منخفض"
      },
      { 
        id: "7", 
        action: "تغيير إعدادات النظام", 
        user: "أحمد محمد", 
        userRole: "مدير نظام", 
        status: "نجاح", 
        timestamp: "2025-03-11T10:05:30Z",
        ipAddress: "192.168.1.105",
        userAgent: "Chrome 120.0.0.0 / Windows",
        details: "تم تغيير إعدادات البريد الإلكتروني للنظام",
        severity: "متوسط"
      },
      { 
        id: "8", 
        action: "محاولة اختراق", 
        user: "مجهول", 
        userRole: "غير معروف", 
        status: "فشل", 
        timestamp: "2025-03-10T23:45:12Z",
        ipAddress: "198.51.100.77",
        userAgent: "Mozilla/5.0 (compatible; Bot/2.0)",
        details: "محاولة هجوم حقن SQL على نموذج تسجيل الدخول",
        severity: "عالي"
      },
      { 
        id: "9", 
        action: "إنشاء مستخدم جديد", 
        user: "محمد القحطاني", 
        userRole: "مدير نظام", 
        status: "نجاح", 
        timestamp: "2025-03-10T15:30:22Z",
        ipAddress: "192.168.1.105",
        userAgent: "Chrome 120.0.0.0 / Windows",
        details: "تم إنشاء حساب مستخدم جديد: 'عبدالله الغامدي' بدور 'موجه'",
        severity: "منخفض"
      },
      { 
        id: "10", 
        action: "نسخ احتياطي للنظام", 
        user: "النظام", 
        userRole: "نظام", 
        status: "نجاح", 
        timestamp: "2025-03-10T03:00:00Z",
        ipAddress: "127.0.0.1",
        userAgent: "System Task",
        details: "تم إنشاء نسخة احتياطية مجدولة لقاعدة البيانات",
        severity: "منخفض"
      }
    ];

    // Apply filters based on query parameters
    let filteredLogs = [...mockLogs];
    
    if (severity) {
      const severityMapping: { [key: string]: string } = {
        'high': 'عالي',
        'medium': 'متوسط',
        'low': 'منخفض'
      };
      const mappedSeverity = severityMapping[severity];
      if (mappedSeverity) {
        filteredLogs = filteredLogs.filter(log => log.severity === mappedSeverity);
      }
    }
    
    if (status) {
      const statusMapping: { [key: string]: string } = {
        'success': 'نجاح',
        'failure': 'فشل'
      };
      const mappedStatus = statusMapping[status];
      if (mappedStatus) {
        filteredLogs = filteredLogs.filter(log => log.status === mappedStatus);
      }
    }
    
    if (fromDate) {
      const fromDateObj = new Date(fromDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDateObj);
    }
    
    if (toDate) {
      const toDateObj = new Date(toDate);
      // Add one day to include the end date fully
      toDateObj.setHours(23, 59, 59, 999);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDateObj);
    }
    
    if (type) {
      // This is a simplified mapping, expand as needed
      const typeActionMap: { [key: string]: string[] } = {
        'login': ['تسجيل دخول', 'محاولة تسجيل دخول'],
        'system': ['تغيير إعدادات النظام', 'نسخ احتياطي للنظام'],
        'user': ['إنشاء مستخدم جديد', 'تعديل صلاحيات المستخدم', 'تغيير كلمة المرور'],
        'data': ['تصدير بيانات'],
        'security': ['محاولة وصول غير مصرح', 'محاولة اختراق']
      };
      
      if (typeActionMap[type]) {
        filteredLogs = filteredLogs.filter(log => typeActionMap[type].includes(log.action));
      }
    }

    // Paginate results
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Calculate stats
    const stats = {
      total: filteredLogs.length,
      success: filteredLogs.filter(log => log.status === 'نجاح').length,
      failure: filteredLogs.filter(log => log.status === 'فشل').length,
      highSeverity: filteredLogs.filter(log => log.severity === 'عالي').length,
      mediumSeverity: filteredLogs.filter(log => log.severity === 'متوسط').length,
      lowSeverity: filteredLogs.filter(log => log.severity === 'منخفض').length,
      systemActions: filteredLogs.filter(log => log.userRole === 'نظام').length
    };

    return NextResponse.json({ 
      success: true,
      logs: paginatedLogs,
      stats,
      pagination: {
        total: filteredLogs.length,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security logs' },
      { status: 500 }
    );
  }
}

// POST handler to add a security log (for auditing purposes)
export async function POST(request: NextRequest) {
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
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { action, details, severity } = body;
    
    if (!action || !details || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields: action, details, severity' },
        { status: 400 }
      );
    }

    // In a real implementation, this would save to the database
    // For demo purposes, we'll simulate a successful log creation
    const logEntry = {
      id: Date.now().toString(),
      action,
      user: `${user.userId}`, // Use userId since we don't know if firstName/lastName are available
      userRole: user.role || 'مستخدم',
      status: 'نجاح',
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      details,
      severity
    };

    // In a real implementation, we would save this to the database
    console.log('New security log entry:', logEntry);

    return NextResponse.json({ 
      success: true, 
      message: 'Security log added successfully',
      log: logEntry
    });
  } catch (error) {
    console.error('Error adding security log:', error);
    return NextResponse.json(
      { error: 'Failed to add security log' },
      { status: 500 }
    );
  }
}

// DELETE handler to clear security logs (with proper permissions)
export async function DELETE(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This requires a higher level of permission (admin only)
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'security',
      action: 'delete'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before'); // Delete logs before this date
    const severity = searchParams.get('severity'); // Delete logs of specific severity
    
    // In a real implementation, this would delete from the database
    // For demo purposes, we'll simulate a successful deletion
    const deletionCriteria = {
      before: before ? new Date(before).toISOString() : undefined,
      severity
    };

    console.log('Security logs deletion criteria:', deletionCriteria);

    return NextResponse.json({ 
      success: true, 
      message: 'Security logs deleted successfully',
      deletionCriteria
    });
  } catch (error) {
    console.error('Error deleting security logs:', error);
    return NextResponse.json(
      { error: 'Failed to delete security logs' },
      { status: 500 }
    );
  }
}
