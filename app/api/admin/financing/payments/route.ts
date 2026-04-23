import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export const dynamic = 'force-dynamic';
// Define the payment item interface
export interface PaymentItem {
  id: string
  invoiceNumber: string
  amount: string
  startupId: string
  startupName: string
  category: string
  status: string
  date: string
  dueDate: string
  paidDate: string | null
  paymentMethod: string | null
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// In-memory storage for payments data (in a real app, this would use Prisma/DB)
export const paymentsData: PaymentItem[] = [
  {
    id: "1",
    invoiceNumber: "INV-001-2025",
    amount: "250000",
    startupId: "123",
    startupName: "شركة الحلول التقنية",
    category: "رسوم برنامج",
    status: "مدفوع",
    date: "2025-01-12",
    dueDate: "2025-01-10",
    paidDate: "2025-01-08",
    paymentMethod: "تحويل بنكي",
    description: "رسوم الاشتراك في برنامج مسرعات الأعمال 2025",
    createdBy: "أحمد محمد",
    createdAt: "2025-01-05T12:00:00Z",
    updatedAt: "2025-01-08T14:30:00Z"
  },
  {
    id: "2",
    invoiceNumber: "INV-002-2025",
    amount: "175000",
    startupId: "456",
    startupName: "مؤسسة التعليم الذكي",
    category: "رسوم خدمات",
    status: "معلق",
    date: "2025-01-15",
    dueDate: "2025-01-30",
    paidDate: null,
    paymentMethod: null,
    description: "رسوم خدمات استشارية للربع الأول من عام 2025",
    createdBy: "سارة عبدالله",
    createdAt: "2025-01-15T09:45:00Z",
    updatedAt: "2025-01-15T09:45:00Z"
  },
  {
    id: "3",
    invoiceNumber: "INV-003-2025",
    amount: "75000",
    startupId: "789",
    startupName: "شركة التقنيات المتقدمة",
    category: "رسوم فعالية",
    status: "متأخر",
    date: "2025-01-01",
    dueDate: "2025-01-15",
    paidDate: null,
    paymentMethod: null,
    description: "رسوم المشاركة في معرض التقنيات الناشئة 2025",
    createdBy: "محمد علي",
    createdAt: "2024-12-20T11:20:00Z",
    updatedAt: "2025-01-16T13:10:00Z"
  },
  {
    id: "4",
    invoiceNumber: "INV-004-2025",
    amount: "350000",
    startupId: "101",
    startupName: "منصة الذكاء التقني",
    category: "رسوم عضوية",
    status: "مدفوع",
    date: "2025-01-10",
    dueDate: "2025-01-25",
    paidDate: "2025-01-20",
    paymentMethod: "شيك",
    description: "رسوم العضوية السنوية في منصة الابتكار التقني 2025",
    createdBy: "فاطمة أحمد",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-20T15:30:00Z"
  }
];

// GET /api/admin/financing/payments - Get all payments
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
      category: 'financing',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startupId = searchParams.get('startupId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    // Filter the payments data based on query parameters
    let filteredData = [...paymentsData];
    
    if (status && status !== 'all') {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (startupId) {
      filteredData = filteredData.filter(item => item.startupId === startupId);
    }
    
    if (startDate) {
      const startDateTimestamp = new Date(startDate).getTime();
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date).getTime();
        return itemDate >= startDateTimestamp;
      });
    }
    
    if (endDate) {
      const endDateTimestamp = new Date(endDate).getTime();
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date).getTime();
        return itemDate <= endDateTimestamp;
      });
    }
    
    if (category && category !== 'all') {
      filteredData = filteredData.filter(item => item.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.invoiceNumber.toLowerCase().includes(searchLower) ||
        item.startupName.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.createdBy.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate payments summary
    const totalAmount = filteredData.reduce((sum, item) => sum + parseInt(item.amount), 0);
    const paidPayments = filteredData.filter(item => item.status === 'مدفوع').length;
    const pendingPayments = filteredData.filter(item => item.status === 'معلق').length;
    const overduePayments = filteredData.filter(item => item.status === 'متأخر').length;
    
    const summary = {
      totalAmount,
      paidPayments,
      pendingPayments,
      overduePayments,
      totalPayments: filteredData.length,
      collectionRate: Math.round((paidPayments / filteredData.length) * 100) || 0
    };
    
    // Format the data for display
    const formattedData = filteredData.map(item => ({
      ...item,
      amount: `${parseInt(item.amount).toLocaleString()} ريال`
    }));

    return NextResponse.json({ 
      data: formattedData,
      summary
    });
  } catch (error) {
    console.error('Error fetching payments data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/financing/payments - Create a new payment
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
      category: 'financing',
      action: 'create'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'invoiceNumber', 
      'amount', 
      'startupId', 
      'startupName', 
      'category', 
      'status', 
      'date', 
      'dueDate', 
      'description', 
      'createdBy'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Generate new ID and timestamps
    const newId = (paymentsData.length + 1).toString();
    const now = new Date().toISOString();
    
    // Create new payment entry
    const newPayment: PaymentItem = {
      id: newId,
      ...body,
      paidDate: body.status === 'مدفوع' ? (body.paidDate || now) : null,
      paymentMethod: body.status === 'مدفوع' ? (body.paymentMethod || null) : null,
      createdAt: now,
      updatedAt: now
    };
    
    // Add to in-memory data (in a real app, this would save to the database)
    paymentsData.push(newPayment);
    
    return NextResponse.json({ 
      message: 'تم إنشاء الدفعة بنجاح',
      data: newPayment 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
