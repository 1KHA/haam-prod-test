import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions';
import { getDelimiterFromRequest } from '@/lib/csv-utils';

// GET /api/admin/notifications/export - Export notifications data
export async function GET(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'notifications', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Sample notifications data with proper Arabic text handling
    const notificationsData = [
      {
        id: "1",
        title: "تحديث النظام المجدول",
        message: "سيتم إجراء تحديث مجدول للنظام يوم الأحد الساعة 2:00 صباحاً. قد يستغرق التحديث حوالي 30 دقيقة.",
        type: "نظام",
        priority: "متوسط",
        status: "مرسل",
        scheduledFor: "2025-03-15T02:00:00Z",
        sentAt: "2025-03-12T10:00:00Z",
        recipients: 150,
        readCount: 95,
        createdBy: "أحمد محمد",
        createdAt: "2025-03-12T09:45:00Z"
      },
      {
        id: "2", 
        title: "موعد نهائي للتقديم على البرنامج الجديد",
        message: "آخر موعد للتقديم على برنامج مسرعة الأعمال الجديد هو 20 مارس 2025. لا تفوت الفرصة!",
        type: "برامج",
        priority: "عالي",
        status: "مرسل",
        scheduledFor: "2025-03-13T09:00:00Z",
        sentAt: "2025-03-13T09:00:00Z",
        recipients: 75,
        readCount: 68,
        createdBy: "سارة العتيبي",
        createdAt: "2025-03-13T08:30:00Z"
      },
      {
        id: "3",
        title: "ورشة عمل حول ريادة الأعمال",
        message: "ندعوكم لحضور ورشة عمل متخصصة حول ريادة الأعمال وبناء الشركات الناشئة يوم الخميس المقبل.",
        type: "فعاليات",
        priority: "منخفض",
        status: "مجدول",
        scheduledFor: "2025-03-14T10:00:00Z",
        sentAt: "",
        recipients: 120,
        readCount: 0,
        createdBy: "محمد القحطاني",
        createdAt: "2025-03-12T14:20:00Z"
      },
      {
        id: "4",
        title: "تحديث بيانات الملف الشخصي",
        message: "يرجى تحديث بيانات ملفك الشخصي لضمان وصول الإشعارات المهمة إليك.",
        type: "مستخدم",
        priority: "منخفض",
        status: "مرسل",
        scheduledFor: "2025-03-11T12:00:00Z",
        sentAt: "2025-03-11T12:00:00Z",
        recipients: 45,
        readCount: 32,
        createdBy: "نورة السعيد", 
        createdAt: "2025-03-11T11:45:00Z"
      },
      {
        id: "5",
        title: "إعلان نتائج مسابقة الأفكار الإبداعية",
        message: "تم الإعلان عن نتائج مسابقة الأفكار الإبداعية لهذا العام. تهانينا للفائزين!",
        type: "مسابقات",
        priority: "عالي",
        status: "مرسل",
        scheduledFor: "2025-03-10T15:00:00Z",
        sentAt: "2025-03-10T15:00:00Z",
        recipients: 200,
        readCount: 187,
        createdBy: "فهد العنزي",
        createdAt: "2025-03-10T14:30:00Z"
      },
      {
        id: "6",
        title: "دعوة لجلسة استشارية مجانية",
        message: "احصل على استشارة مجانية مع خبراء ريادة الأعمال لدينا. احجز موعدك الآن!",
        type: "خدمات",
        priority: "متوسط",
        status: "فشل",
        scheduledFor: "2025-03-09T11:00:00Z",
        sentAt: "",
        recipients: 0,
        readCount: 0,
        createdBy: "عبدالله الغامدي",
        createdAt: "2025-03-09T10:45:00Z"
      }
    ];

    // Get the appropriate delimiter for the user's environment
    const delimiter = getDelimiterFromRequest(searchParams);

    // Apply filters
    let filteredData = [...notificationsData];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.message.toLowerCase().includes(searchLower) ||
        item.createdBy.toLowerCase().includes(searchLower)
      );
    }

    if (type) {
      filteredData = filteredData.filter(item => item.type === type);
    }

    if (priority) {
      filteredData = filteredData.filter(item => item.priority === priority);
    }

    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }

    // Apply date filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredData = filteredData.filter(item => new Date(item.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredData = filteredData.filter(item => new Date(item.createdAt) <= toDate);
    }

    // Format the data for export
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedData = filteredData.map((item: any) => {
      // Format dates with proper Arabic locale
      const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      // Calculate engagement rate
      const engagementRate = item.recipients > 0 ? 
        ((item.readCount / item.recipients) * 100).toFixed(1) + '%' : '0%';

      return {
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        priority: item.priority,
        status: item.status,
        scheduledFor: formatDate(item.scheduledFor),
        sentAt: formatDate(item.sentAt),
        recipients: item.recipients.toString(),
        readCount: item.readCount.toString(),
        engagementRate: engagementRate,
        createdBy: item.createdBy,
        createdAt: formatDate(item.createdAt)
      };
    });

    // CSV headers in Arabic with proper encoding
    const headers = [
      'معرف الإشعار',
      'العنوان',
      'الرسالة',
      'النوع',
      'الأولوية',
      'الحالة',
      'موعد الإرسال',
      'تم الإرسال في',
      'عدد المستلمين',
      'عدد القراءة',
      'معدل التفاعل',
      'منشئ الإشعار',
      'تاريخ الإنشاء'
    ];

    // Create CSV content with enhanced Arabic text handling
    const csvRows: string[] = [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formattedData.forEach((item: any) => {
      const row = [
        `"${item.id}"`,
        `"${item.title.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${item.message.replace(/"/g, '""').replace(/\r?\n/g, ' ').substring(0, 200)}${item.message.length > 200 ? '...' : ''}"`, // Limit message length
        `"${item.type}"`,
        `"${item.priority}"`,
        `"${item.status}"`,
        `"${item.scheduledFor}"`,
        `"${item.sentAt}"`,
        `"${item.recipients}"`,
        `"${item.readCount}"`,
        `"${item.engagementRate}"`,
        `"${item.createdBy.replace(/"/g, '""')}"`,
        `"${item.createdAt}"`
      ];
      csvRows.push(row.join(delimiter));
    });

    // Combine header and rows
    const csv = [headers.join(delimiter), ...csvRows].join('\n');

    // Generate filename with current date in Arabic format
    const filename = `notifications-export-${new Date().toISOString().split('T')[0]}.csv`;

    // Set appropriate response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv; charset=utf-8');
    responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);

    // Enhanced UTF-8 BOM for proper Arabic text encoding
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Error exporting notifications data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
