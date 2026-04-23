import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
// Sample integrations data structure (mock data)
const mockIntegrations = [
  { 
    id: "1", 
    name: "Stripe", 
    category: "المدفوعات", 
    description: "معالجة المدفوعات وإدارة الاشتراكات",
    status: "متصل", 
    lastSync: "2025-03-12T10:15:22Z",
    icon: "credit-card",
    apiKey: "sk_test_*****************************",
    webhookUrl: "https://api.example.com/webhooks/stripe",
    syncFrequency: "كل ساعة",
    dataAccess: ["المدفوعات", "الاشتراكات", "العملاء"],
    connectedBy: "أحمد محمد",
    connectedDate: "2025-01-15T00:00:00Z"
  },
  { 
    id: "2", 
    name: "Google Calendar", 
    category: "الجدولة", 
    description: "مزامنة الفعاليات والمواعيد مع تقويم Google",
    status: "متصل", 
    lastSync: "2025-03-12T09:30:15Z",
    icon: "calendar",
    apiKey: "AIza*****************************",
    webhookUrl: "https://api.example.com/webhooks/google-calendar",
    syncFrequency: "كل 15 دقيقة",
    dataAccess: ["الفعاليات", "المواعيد", "الجلسات"],
    connectedBy: "محمد القحطاني",
    connectedDate: "2025-01-20T00:00:00Z"
  },
  { 
    id: "3", 
    name: "Slack", 
    category: "التواصل", 
    description: "إرسال إشعارات وتنبيهات إلى قنوات Slack",
    status: "متصل", 
    lastSync: "2025-03-12T08:45:30Z",
    icon: "message-square",
    apiKey: "xoxb-*****************************",
    webhookUrl: "https://api.example.com/webhooks/slack",
    syncFrequency: "فوري",
    dataAccess: ["الإشعارات", "التنبيهات"],
    connectedBy: "سارة العتيبي",
    connectedDate: "2025-02-05T00:00:00Z"
  },
  { 
    id: "4", 
    name: "Mailchimp", 
    category: "التسويق", 
    description: "إدارة القوائم البريدية وحملات البريد الإلكتروني",
    status: "متصل", 
    lastSync: "2025-03-11T14:20:10Z",
    icon: "mail",
    apiKey: "mc-*****************************",
    webhookUrl: "https://api.example.com/webhooks/mailchimp",
    syncFrequency: "يومي",
    dataAccess: ["المستخدمين", "القوائم البريدية", "الحملات"],
    connectedBy: "نورة السعيد",
    connectedDate: "2025-02-10T00:00:00Z"
  },
  { 
    id: "5", 
    name: "HubSpot", 
    category: "إدارة العلاقات", 
    description: "إدارة العلاقات مع العملاء وتتبع المبيعات",
    status: "غير متصل", 
    lastSync: "",
    icon: "users",
    apiKey: "",
    webhookUrl: "",
    syncFrequency: "",
    dataAccess: [],
    connectedBy: "",
    connectedDate: ""
  },
  { 
    id: "6", 
    name: "Zapier", 
    category: "أتمتة", 
    description: "ربط التطبيقات وأتمتة سير العمل",
    status: "غير متصل", 
    lastSync: "",
    icon: "link",
    apiKey: "",
    webhookUrl: "",
    syncFrequency: "",
    dataAccess: [],
    connectedBy: "",
    connectedDate: ""
  },
  { 
    id: "7", 
    name: "Microsoft Power BI", 
    category: "تحليلات", 
    description: "تحليلات البيانات وإنشاء لوحات المعلومات",
    status: "غير متصل", 
    lastSync: "",
    icon: "bar-chart",
    apiKey: "",
    webhookUrl: "",
    syncFrequency: "",
    dataAccess: [],
    connectedBy: "",
    connectedDate: ""
  },
  { 
    id: "8", 
    name: "GitHub", 
    category: "تطوير", 
    description: "إدارة الكود المصدري والمشاريع",
    status: "متصل", 
    lastSync: "2025-03-10T16:40:55Z",
    icon: "code",
    apiKey: "ghp_*****************************",
    webhookUrl: "https://api.example.com/webhooks/github",
    syncFrequency: "كل 30 دقيقة",
    dataAccess: ["المستودعات", "المشكلات", "طلبات السحب"],
    connectedBy: "فهد العنزي",
    connectedDate: "2025-03-01T00:00:00Z"
  }
];

// GET handler to fetch integrations
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
      category: 'integrations',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Filter integrations based on query parameters
    let filteredIntegrations = [...mockIntegrations];
    
    if (category) {
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (status) {
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (search) {
      filteredIntegrations = filteredIntegrations.filter(integration => 
        integration.name.toLowerCase().includes(search.toLowerCase()) ||
        integration.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // In a real implementation, this would query the database
    return NextResponse.json({ 
      success: true, 
      integrations: filteredIntegrations,
      total: filteredIntegrations.length,
      connectedCount: filteredIntegrations.filter(i => i.status === "متصل").length
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST handler to create or update an integration
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
      category: 'integrations',
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const integrationData = await request.json();
    
    // Validate required fields
    if (!integrationData.name || !integrationData.category) {
      return NextResponse.json(
        { error: 'Name and category are required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, this would create a new record in the database
    // For demo, we'll simulate a successful creation with a new mock ID
    const newIntegration = {
      id: (mockIntegrations.length + 1).toString(),
      ...integrationData,
      status: "غير متصل", // Default status for new integrations
      lastSync: "",
      connectedBy: "",
      connectedDate: "",
      createdAt: new Date().toISOString(),
      createdBy: user.userId
    };
    
    console.log('New integration created:', newIntegration);

    // Add audit log entry
    const logEntry = {
      action: 'إضافة تكامل جديد',
      user: user.userId,
      timestamp: new Date().toISOString(),
      details: `تم إضافة تكامل جديد: ${integrationData.name}`
    };
    
    console.log('Integration audit log:', logEntry);

    return NextResponse.json({ 
      success: true, 
      integration: newIntegration,
      message: 'Integration created successfully'
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}
