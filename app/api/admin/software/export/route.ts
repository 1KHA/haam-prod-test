import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions';

// GET /api/admin/software/export - Export software/integrations data
export async function GET(req: NextRequest) {
  try {
    // Check permission - using integrations category since software likely refers to integrations
    const permissionCheck = await checkPermission(req, { category: 'integrations', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const delimiter = searchParams.get('delimiter') || ','; // Allow delimiter customization

    // Sample software/integrations data (in real implementation, this would come from database)
    const softwareData = [
      {
        id: "1",
        name: "Stripe",
        category: "المدفوعات",
        version: "v2.1.5",
        description: "معالجة المدفوعات وإدارة الاشتراكات",
        status: "متصل",
        lastSync: "2025-03-12T10:15:22Z",
        installDate: "2025-01-15T00:00:00Z",
        license: "تجاري",
        vendor: "Stripe Inc.",
        supportLevel: "كامل",
        connectedBy: "أحمد محمد",
        apiVersion: "2023-10-16",
        webhookUrl: "https://api.example.com/webhooks/stripe",
        syncFrequency: "كل ساعة",
        dataAccess: "المدفوعات، الاشتراكات، العملاء"
      },
      {
        id: "2",
        name: "Google Calendar",
        category: "الجدولة",
        version: "v3.0.2",
        description: "مزامنة الفعاليات والمواعيد مع تقويم Google",
        status: "متصل",
        lastSync: "2025-03-12T09:30:15Z",
        installDate: "2025-01-20T00:00:00Z",
        license: "مجاني",
        vendor: "Google LLC",
        supportLevel: "محدود",
        connectedBy: "محمد القحطاني",
        apiVersion: "v3",
        webhookUrl: "https://api.example.com/webhooks/google-calendar",
        syncFrequency: "كل 15 دقيقة",
        dataAccess: "الفعاليات، المواعيد، الجلسات"
      },
      {
        id: "3",
        name: "Slack",
        category: "التواصل",
        version: "v1.8.3",
        description: "إرسال إشعارات وتنبيهات إلى قنوات Slack",
        status: "متصل",
        lastSync: "2025-03-12T08:45:30Z",
        installDate: "2025-02-05T00:00:00Z",
        license: "مجاني",
        vendor: "Slack Technologies",
        supportLevel: "كامل",
        connectedBy: "سارة العتيبي",
        apiVersion: "1.7.0",
        webhookUrl: "https://api.example.com/webhooks/slack",
        syncFrequency: "فوري",
        dataAccess: "الإشعارات، التنبيهات"
      },
      {
        id: "4",
        name: "HubSpot",
        category: "إدارة العلاقات",
        version: "v2.3.1",
        description: "إدارة العلاقات مع العملاء وتتبع المبيعات",
        status: "غير متصل",
        lastSync: "",
        installDate: "",
        license: "تجاري",
        vendor: "HubSpot Inc.",
        supportLevel: "كامل",
        connectedBy: "",
        apiVersion: "v3",
        webhookUrl: "",
        syncFrequency: "",
        dataAccess: ""
      },
      {
        id: "5",
        name: "GitHub",
        category: "تطوير",
        version: "v4.2.0",
        description: "إدارة الكود المصدري والمشاريع",
        status: "متصل",
        lastSync: "2025-03-10T16:40:55Z",
        installDate: "2025-03-01T00:00:00Z",
        license: "مجاني",
        vendor: "GitHub Inc.",
        supportLevel: "محدود",
        connectedBy: "فهد العنزي",
        apiVersion: "v4",
        webhookUrl: "https://api.example.com/webhooks/github",
        syncFrequency: "كل 30 دقيقة",
        dataAccess: "المستودعات، المشكلات، طلبات السحب"
      },
      {
        id: "6",
        name: "Microsoft Power BI",
        category: "تحليلات",
        version: "v3.1.2",
        description: "تحليلات البيانات وإنشاء لوحات المعلومات",
        status: "غير متصل",
        lastSync: "",
        installDate: "",
        license: "تجاري",
        vendor: "Microsoft Corporation",
        supportLevel: "كامل",
        connectedBy: "",
        apiVersion: "v1.0",
        webhookUrl: "",
        syncFrequency: "",
        dataAccess: ""
      }
    ];

    // Apply filters
    let filteredData = [...softwareData];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.vendor.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filteredData = filteredData.filter(item => item.category === category);
    }

    if (status) {
      const statusMap: Record<string, string> = {
        'connected': 'متصل',
        'disconnected': 'غير متصل'
      };
      filteredData = filteredData.filter(item => item.status === (statusMap[status] || status));
    }

    // Format the data for export
    const formattedData = filteredData.map((item: any) => {
      // Format dates
      const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        version: item.version,
        description: item.description,
        status: item.status,
        license: item.license,
        vendor: item.vendor,
        supportLevel: item.supportLevel,
        installDate: formatDate(item.installDate),
        lastSync: formatDate(item.lastSync),
        connectedBy: item.connectedBy || '-',
        apiVersion: item.apiVersion || '-',
        webhookUrl: item.webhookUrl || '-',
        syncFrequency: item.syncFrequency || '-',
        dataAccess: item.dataAccess || '-'
      };
    });

    // CSV headers in Arabic
    const headers = [
      'معرف البرنامج',
      'اسم البرنامج',
      'الفئة',
      'الإصدار',
      'الوصف',
      'الحالة',
      'نوع الترخيص',
      'المورد',
      'مستوى الدعم',
      'تاريخ التثبيت',
      'آخر مزامنة',
      'تم الربط بواسطة',
      'إصدار API',
      'رابط Webhook',
      'تكرار المزامنة',
      'البيانات المتاحة'
    ];

    // Create CSV content with proper Arabic text handling
    const csvRows: string[] = [];
    
    formattedData.forEach((item: any) => {
      const row = [
        `"${item.id}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category.replace(/"/g, '""')}"`,
        `"${item.version}"`,
        `"${item.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${item.status}"`,
        `"${item.license}"`,
        `"${item.vendor.replace(/"/g, '""')}"`,
        `"${item.supportLevel}"`,
        `"${item.installDate}"`,
        `"${item.lastSync}"`,
        `"${item.connectedBy.replace(/"/g, '""')}"`,
        `"${item.apiVersion}"`,
        `"${item.webhookUrl}"`,
        `"${item.syncFrequency.replace(/"/g, '""')}"`,
        `"${item.dataAccess.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(delimiter));
    });

    // Combine header and rows
    const csv = [headers.join(delimiter), ...csvRows].join('\n');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `software-export-${currentDate}.csv`;

    // Set appropriate response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv; charset=utf-8');
    responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);

    // Add UTF-8 BOM for proper Arabic text encoding
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Error exporting software data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
