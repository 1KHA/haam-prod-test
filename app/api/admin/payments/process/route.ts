import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// POST handler to process a payment
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
      action: 'process'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['paymentId', 'action'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const { paymentId, action, notes } = body;
    
    // Validate action type
    const validActions = ['approve', 'reject', 'refund', 'mark_as_paid', 'cancel'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Get the payment record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payment = await (prisma as any).payment.findUnique({
      where: { id: paymentId }
    });
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Map actions to statuses
    let newStatus;
    let actionDescription;
    
    switch (action) {
      case 'approve':
        newStatus = 'COMPLETED';
        actionDescription = 'تمت الموافقة على الدفعة';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        actionDescription = 'تم رفض الدفعة';
        break;
      case 'refund':
        newStatus = 'REFUNDED';
        actionDescription = 'تم رد الدفعة';
        break;
      case 'mark_as_paid':
        newStatus = 'COMPLETED';
        actionDescription = 'تم تحديث الدفعة كمدفوعة';
        break;
      case 'cancel':
        newStatus = 'CANCELLED';
        actionDescription = 'تم إلغاء الدفعة';
        break;
      default:
        newStatus = 'PENDING';
        actionDescription = 'تم تحديث حالة الدفعة';
    }

    // Create a history entry for this action
    const historyEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      userId: user.userId,
      note: notes || actionDescription
    };

    // Add new history entry to existing history
    const updatedHistory = [...(payment.history || []), historyEntry];

    // Update the payment in the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedPayment = await (prisma as any).payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        history: updatedHistory,
        updatedAt: new Date()
      }
    });

    // Process result to return
    const processResult = {
      id: paymentId,
      previousStatus: payment.status,
      currentStatus: newStatus,
      processedAt: new Date().toISOString(),
      processedBy: user.userId,
      notes: notes || '',
      action,
      actionDescription,
      success: true
    };

    // Generate receipt data for completed payments
    let receiptData = null;
    if (action === 'approve' || action === 'mark_as_paid') {
      const receiptId = `REC-${Date.now().toString().slice(-8)}`;
      
      // Create a virtual receipt (in a real app, you might create an actual PDF)
      receiptData = {
        id: receiptId,
        paymentId: updatedPayment.id,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        status: updatedPayment.status,
        processedAt: new Date().toISOString(),
        receiptUrl: `https://example.com/receipts/${receiptId}.pdf`
      };
      
      // In a production app, you'd update the payment with a reference to the receipt
    }

    console.log('Payment processed:', processResult);

    return NextResponse.json({ 
      success: true, 
      message: `${actionDescription} بنجاح`,
      result: processResult,
      receipt: receiptData
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'فشل في معالجة الدفعة' },
      { status: 500 }
    );
  }
}

// GET handler to fetch payment processing status
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
    const paymentId = searchParams.get('paymentId');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get the payment from the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payment = await (prisma as any).payment.findUnique({
      where: { id: paymentId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!payment) {
      // For development, return mock data if no payment is found
      if (process.env.NODE_ENV === 'development') {
        const mockStatus = generateMockProcessingStatus(paymentId);
        return NextResponse.json({ 
          success: true,
          data: mockStatus,
          isMock: true
        });
      }
      
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Format the history entries for the response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processingHistory = payment.history ? payment.history.map((entry: any) => {
      // Map status to action
      let action = 'updated';
      if (entry.status === 'PENDING') action = 'created';
      else if (entry.status === 'COMPLETED') action = 'approve';
      else if (entry.status === 'REJECTED') action = 'reject';
      else if (entry.status === 'REFUNDED') action = 'refund';
      else if (entry.status === 'CANCELLED') action = 'cancel';
      
      return {
        timestamp: entry.timestamp,
        action,
        status: entry.status,
        user: entry.userId || 'System',
        notes: entry.note || ''
      };
    }) : [];

    // Get the name of the last processor from user records
    // (In a real app, you would fetch user details for each history entry)
    let lastProcessedBy = 'System';
    let lastProcessedAt = payment.updatedAt ? payment.updatedAt.toISOString() : payment.createdAt.toISOString();
    
    // Get the last history entry if available
    if (processingHistory.length > 0) {
      const lastEntry = processingHistory[processingHistory.length - 1];
      lastProcessedBy = lastEntry.user;
      lastProcessedAt = lastEntry.timestamp;
    }

    // Format the processing status response
    const processingStatus = {
      paymentId,
      status: payment.status,
      lastProcessedAt,
      lastProcessedBy,
      processingHistory
    };

    return NextResponse.json({ 
      success: true,
      data: processingStatus
    });
  } catch (error) {
    console.error('Error fetching payment processing status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment processing status' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock processing status data for development
function generateMockProcessingStatus(paymentId: string) {
  return {
    paymentId,
    status: 'COMPLETED',
    lastProcessedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    lastProcessedBy: 'مستخدم النظام',
    processingHistory: [
      {
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
        action: 'created',
        status: 'PENDING',
        user: 'أحمد العمري',
        notes: 'تم إنشاء طلب الدفع'
      },
      {
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        action: 'mark_as_paid',
        status: 'PROCESSING',
        user: 'سارة الخالدي',
        notes: 'تم استلام إثبات الدفع وجاري التحقق'
      },
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        action: 'approve',
        status: 'COMPLETED',
        user: 'محمد القحطاني',
        notes: 'تم التحقق من الدفع وتأكيد استلامه'
      }
    ]
  };
}
