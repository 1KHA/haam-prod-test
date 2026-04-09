import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { createCSVResponse, getDelimiterFromRequest } from '@/lib/csv-utils';

/**
 * GET /api/admin/security/logs/export
 * Export security logs as CSV based on filter criteria or selected IDs
 */
export async function GET(req: NextRequest) {
  try {
    const user = await isAuthenticated(req.headers.get('Authorization') || undefined);
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'security',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - Insufficient permissions' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const severity = url.searchParams.get('severity');
    const type = url.searchParams.get('type');
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const search = url.searchParams.get('search');
    const ids = url.searchParams.get('ids');
    
    // For demonstration purposes, we'll use mock data similar to the front end
    // In a real application, you would fetch from the database
    const mockLogs = [
      { 
        id: "1", 
        action: "تسجيل دخول", 
        userName: "أحمد محمد", 
        userRole: "مدير نظام", 
        status: "نجاح", 
        timestamp: new Date('2025-03-12T10:15:22').toISOString(),
        ipAddress: "192.168.1.105",
        userAgent: "Chrome 120.0.0.0 / Windows",
        details: "تسجيل دخول ناجح من الرياض، المملكة العربية السعودية",
        severity: "منخفض",
        type: "user"
      },
      { 
        id: "2", 
        action: "تغيير كلمة المرور", 
        userName: "سارة العتيبي", 
        userRole: "مدير برنامج", 
        status: "نجاح", 
        timestamp: new Date('2025-03-12T09:45:10').toISOString(),
        ipAddress: "192.168.1.110",
        userAgent: "Firefox 115.0 / macOS",
        details: "تم تغيير كلمة المرور بنجاح",
        severity: "منخفض",
        type: "user"
      },
      { 
        id: "3", 
        action: "محاولة تسجيل دخول", 
        userName: "خالد العمري", 
        userRole: "مستثمر", 
        status: "فشل", 
        timestamp: new Date('2025-03-12T08:30:45').toISOString(),
        ipAddress: "192.168.1.120",
        userAgent: "Safari 17.0 / iOS",
        details: "فشل تسجيل الدخول: كلمة مرور غير صحيحة (المحاولة الثالثة)",
        severity: "متوسط",
        type: "user"
      },
      { 
        id: "4", 
        action: "تعديل صلاحيات المستخدم", 
        userName: "محمد القحطاني", 
        userRole: "مدير نظام", 
        status: "نجاح", 
        timestamp: new Date('2025-03-11T16:20:33').toISOString(),
        ipAddress: "192.168.1.105",
        userAgent: "Chrome 120.0.0.0 / Windows",
        details: "تم تعديل صلاحيات المستخدم 'فاطمة الزهراء' من 'موجه' إلى 'مدير برنامج'",
        severity: "متوسط",
        type: "user"
      },
      { 
        id: "5", 
        action: "محاولة وصول غير مصرح", 
        userName: "مجهول", 
        userRole: "غير معروف", 
        status: "فشل", 
        timestamp: new Date('2025-03-11T14:55:18').toISOString(),
        ipAddress: "203.0.113.42",
        userAgent: "Mozilla/5.0 (compatible; Bot/1.0)",
        details: "محاولة وصول غير مصرح بها إلى واجهة برمجة التطبيقات للإدارة",
        severity: "عالي",
        type: "security"
      },
      { 
        id: "6", 
        action: "تصدير بيانات", 
        userName: "نورة السعيد", 
        userRole: "مدير برنامج", 
        status: "نجاح", 
        timestamp: new Date('2025-03-11T11:10:05').toISOString(),
        ipAddress: "192.168.1.115",
        userAgent: "Edge 120.0.0.0 / Windows",
        details: "تم تصدير بيانات الشركات الناشئة (120 سجل)",
        severity: "منخفض",
        type: "data"
      },
      { 
        id: "7", 
        action: "تغيير إعدادات النظام", 
        userName: "أحمد محمد", 
        userRole: "مدير نظام", 
        status: "نجاح", 
        timestamp: new Date('2025-03-11T10:05:30').toISOString(),
        ipAddress: "192.168.1.105",
        userAgent: "Chrome 120.0.0.0 / Windows",
        details: "تم تغيير إعدادات البريد الإلكتروني للنظام",
        severity: "متوسط",
        type: "system"
      },
      { 
        id: "8", 
        action: "محاولة اختراق", 
        userName: "مجهول", 
        userRole: "غير معروف", 
        status: "فشل", 
        timestamp: new Date('2025-03-10T23:45:12').toISOString(),
        ipAddress: "198.51.100.77",
        userAgent: "Mozilla/5.0 (compatible; Bot/2.0)",
        details: "محاولة هجوم حقن SQL على نموذج تسجيل الدخول",
        severity: "عالي",
        type: "security"
      },
      { 
        id: "9", 
        action: "إنشاء مستخدم جديد", 
        userName: "محمد القحطاني", 
        userRole: "مدير نظام", 
        status: "نجاح", 
        timestamp: new Date('2025-03-10T15:30:22').toISOString(),
        ipAddress: "192.168.1.105",
        userAgent: "Chrome 120.0.0.0 / Windows",
        details: "تم إنشاء حساب مستخدم جديد: 'عبدالله الغامدي' بدور 'موجه'",
        severity: "منخفض",
        type: "user"
      },
      { 
        id: "10", 
        action: "نسخ احتياطي للنظام", 
        userName: "النظام", 
        userRole: "نظام", 
        status: "نجاح", 
        timestamp: new Date('2025-03-10T03:00:00').toISOString(),
        ipAddress: "127.0.0.1",
        userAgent: "System Task",
        details: "تم إنشاء نسخة احتياطية مجدولة لقاعدة البيانات",
        severity: "منخفض",
        type: "system"
      }
    ];
    
    // Check if we're exporting specific logs by ID
    if (ids) {
      const logIds = ids.split(',');
      console.log(`Exporting ${logIds.length} specific logs by ID`);
      
      // In a real implementation, we would query the database for these specific logs
      // For now, we'll filter our mock data
      
      // Get the logs by ID
      try {
        // In a real implementation, this would be:
        // const logs = await prisma.securityLog.findMany({
        //   where: {
        //     id: { in: logIds }
        //   }
        // });
        
        // For demonstration, filter mock logs
        const selectedLogs = mockLogs.filter(log => logIds.includes(log.id));
        
        if (selectedLogs.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'No logs found with the specified IDs' }),
            { 
              status: 404,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        // Get delimiter from request parameters
        const delimiter = getDelimiterFromRequest(url.searchParams);
        
        // Convert to CSV and return
        return generateCsvResponse(selectedLogs, delimiter);
      } catch (error) {
        console.error('Error fetching logs by ID:', error);
        throw error;
      }
    }
    
    // Otherwise, build where clause for filtered logs
    let where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (severity) {
      where.severity = severity;
    }
    
    if (type) {
      where.type = type;
    }
    
    // Date filtering
    if (fromDate || toDate) {
      where.timestamp = {}; // Using timestamp instead of createdAt to match our mock data
      
      if (fromDate) {
        where.timestamp.gte = new Date(fromDate);
      }
      
      if (toDate) {
        // Add one day to include the end date
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        where.timestamp.lte = endDate;
      }
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { userName: { contains: search } },
        { details: { contains: search } },
        { ipAddress: { contains: search } },
      ];
    }
    
    console.log('Exporting logs with filter criteria:', where);

    // In a real implementation, this would query the database
    // For demonstration, we'll filter our mock data based on criteria
    let filteredLogs = [...mockLogs];
    
    if (status) {
      const statusMap: Record<string, string> = {
        'success': 'نجاح',
        'failure': 'فشل'
      };
      filteredLogs = filteredLogs.filter(log => log.status === statusMap[status]);
    }
    
    if (severity) {
      const severityMap: Record<string, string> = {
        'high': 'عالي',
        'medium': 'متوسط',
        'low': 'منخفض'
      };
      filteredLogs = filteredLogs.filter(log => log.severity === severityMap[severity]);
    }
    
    if (type) {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }
    
    if (fromDate) {
      const fromDateTime = new Date(fromDate).getTime();
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= fromDateTime);
    }
    
    if (toDate) {
      // Add one day to include the end date
      const endDate = new Date(toDate);
      endDate.setDate(endDate.getDate() + 1);
      const toDateTime = endDate.getTime();
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= toDateTime);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower) ||
        log.ipAddress.toLowerCase().includes(searchLower)
      );
    }
    
    // Get delimiter from request parameters
    const delimiter = getDelimiterFromRequest(url.searchParams);
    
    return generateCsvResponse(filteredLogs, delimiter);
    
    
  } catch (error) {
    console.error('Error exporting security logs:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Helper function to generate a CSV response from logs using the CSV utilities
 */
function generateCsvResponse(logs: any[], delimiter: string) {
  // Define CSV headers
  const headers = [
    "الرقم التعريفي",
    "الإجراء",
    "المستخدم",
    "الدور",
    "الحالة",
    "التوقيت",
    "عنوان IP",
    "متصفح المستخدم",
    "التفاصيل",
    "مستوى الخطورة",
    "النوع"
  ];
  
  // Map logs to CSV data format
  const csvData = logs.map(log => ({
    "الرقم التعريفي": log.id,
    "الإجراء": log.action,
    "المستخدم": log.userName,
    "الدور": log.userRole,
    "الحالة": log.status,
    "التوقيت": new Date(log.timestamp).toLocaleString('ar-SA'),
    "عنوان IP": log.ipAddress,
    "متصفح المستخدم": log.userAgent,
    "التفاصيل": log.details,
    "مستوى الخطورة": log.severity,
    "النوع": log.type
  }));
  
  // Use the CSV utility to create proper response
  return createCSVResponse({
    headers,
    data: csvData,
    delimiter,
    filename: 'security-logs-export.csv'
  });
}
