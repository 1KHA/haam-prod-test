import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET handler to fetch payments
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
      category: 'payments',
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const programId = searchParams.get('programId');
    const startupId = searchParams.get('startupId');

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // For demonstration, we'll use mock data
    // In a real implementation, this would query the database
    
    // Adjust the total payments based on whether we're filtering
    let totalPayments = 120;
    
    // If filtering by program ID, reduce the number of results to make it realistic
    if (programId) {
      totalPayments = 15 + Math.floor(Math.random() * 20);
    }
    
    // If filtering by startup ID, reduce the number of results
    if (startupId) {
      totalPayments = 8 + Math.floor(Math.random() * 12);
    }
    
    // If both filters, even fewer results
    if (programId && startupId) {
      totalPayments = 3 + Math.floor(Math.random() * 7);
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(totalPayments / pageSize);
    const actualPageSize = Math.min(pageSize, totalPayments - skip);
    
    // Generate mock payment data
    const payments = Array.from({ length: actualPageSize > 0 ? actualPageSize : 0 }, (_, i) => {
      const id = (skip + i + 1).toString();
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const statuses = ['completed', 'pending', 'failed', 'refunded'];
      const randomStatus = status || statuses[Math.floor(Math.random() * statuses.length)];
      
      const types = ['program_fee', 'mentorship_fee', 'event_registration', 'service_fee'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const amounts = [500, 1000, 1500, 2500, 5000, 7500, 10000];
      const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
      
      // Create a more specific description based on the payment type
      const descriptions = {
        program_fee: [
          'رسوم اشتراك في برنامج مسرع الأعمال',
          'دفعة رسوم برنامج حاضنة الأعمال',
          'رسوم تسجيل في برنامج تدريبي'
        ],
        mentorship_fee: [
          'رسوم جلسة إرشادية',
          'دفعة استشارة مع موجه أعمال',
          'رسوم برنامج توجيه'
        ],
        event_registration: [
          'رسوم تسجيل في ورشة عمل',
          'دفعة مشاركة في فعالية',
          'رسوم حضور مؤتمر'
        ],
        service_fee: [
          'رسوم خدمات استشارية',
          'دفعة خدمات تسويقية',
          'رسوم خدمات قانونية'
        ]
      };
      
      const descriptionOptions = descriptions[randomType as keyof typeof descriptions] || ['دفعة'];
      const randomDescription = descriptionOptions[Math.floor(Math.random() * descriptionOptions.length)];
      
      // Make sure we always return a payment with the requested programId if it's specified
      const mockProgramId = programId || (Math.random() > 0.5 ? (Math.floor(Math.random() * 10) + 1).toString() : null);
      const mockStartupId = startupId || (Math.floor(Math.random() * 50) + 1).toString();
      
      return {
        id,
        referenceNumber: `PAY-${Date.now().toString().slice(-8)}-${id.padStart(4, '0')}`,
        paymentDate: date.toISOString(),
        amount: randomAmount,
        currency: 'SAR',
        status: randomStatus,
        type: randomType,
        description: randomDescription,
        payerName: `شركة ${Math.floor(Math.random() * 1000) + 1} للتقنية`,
        payerEmail: `startup${Math.floor(Math.random() * 1000) + 1}@example.com`,
        paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'bank_transfer',
        metadata: {
          programId: mockProgramId,
          startupId: mockStartupId,
          invoiceId: `INV-${Date.now().toString().slice(-6)}`
        }
      };
    });

    return NextResponse.json({ 
      success: true,
      data: {
        payments,
        pagination: {
          page,
          pageSize,
          totalItems: totalPayments,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST handler to create a new payment record
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
      category: 'payments',
      action: 'create'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['amount', 'currency', 'payerName', 'paymentMethod', 'type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // In a real implementation, this would create a payment record in the database
    // For demonstration, we'll just return a mock created payment
    const newPayment = {
      id: Date.now().toString(),
      referenceNumber: `PAY-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      paymentDate: new Date().toISOString(),
      amount: body.amount,
      currency: body.currency,
      status: 'pending',
      type: body.type,
      description: body.description || `دفعة جديدة`,
      payerName: body.payerName,
      payerEmail: body.payerEmail,
      paymentMethod: body.paymentMethod,
      createdBy: user.userId,
      createdAt: new Date().toISOString(),
      metadata: body.metadata || {}
    };

    // Log the creation for audit purposes
    console.log('New payment created:', newPayment);

    return NextResponse.json({ 
      success: true, 
      message: 'تم إنشاء سجل الدفع بنجاح',
      payment: newPayment
    });
  } catch (error) {
    console.error('Error creating payment record:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء سجل الدفع' },
      { status: 500 }
    );
  }
}
