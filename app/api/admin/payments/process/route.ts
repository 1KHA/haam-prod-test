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

    // In a real implementation, this would process the payment in the database
    // For demonstration, we'll simulate processing a payment
    let newStatus;
    let actionDescription;
    
    switch (action) {
      case 'approve':
        newStatus = 'completed';
        actionDescription = 'تمت الموافقة على الدفعة';
        break;
      case 'reject':
        newStatus = 'rejected';
        actionDescription = 'تم رفض الدفعة';
        break;
      case 'refund':
        newStatus = 'refunded';
        actionDescription = 'تم رد الدفعة';
        break;
      case 'mark_as_paid':
        newStatus = 'completed';
        actionDescription = 'تم تحديث الدفعة كمدفوعة';
        break;
      case 'cancel':
        newStatus = 'cancelled';
        actionDescription = 'تم إلغاء الدفعة';
        break;
      default:
        newStatus = 'pending';
        actionDescription = 'تم تحديث حالة الدفعة';
    }

    // Mock process result
    const processResult = {
      id: paymentId,
      previousStatus: 'pending',
      currentStatus: newStatus,
      processedAt: new Date().toISOString(),
      processedBy: user.userId,
      notes: notes || '',
      action,
      actionDescription,
      success: true
    };

    // In a real implementation, we would:
    // 1. Update the payment status in the database
    // 2. Record the action in an audit log
    // 3. Trigger any necessary side effects (notifications, emails, etc.)
    
    console.log('Payment processed:', processResult);

    // For payments that require integration with a payment gateway
    // we would add additional logic here
    
    // Mock receipt data that would be generated
    const receiptData = {
      id: `REC-${Date.now().toString().slice(-8)}`,
      paymentId,
      amount: 5000, // This would be fetched from the actual payment
      currency: 'SAR',
      status: newStatus,
      processedAt: new Date().toISOString(),
      receiptUrl: `https://example.com/receipts/REC-${Date.now().toString().slice(-8)}.pdf`
    };

    return NextResponse.json({ 
      success: true, 
      message: `تم ${actionDescription} بنجاح`,
      result: processResult,
      receipt: action === 'approve' || action === 'mark_as_paid' ? receiptData : null
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

    // In a real implementation, this would check the payment processing status
    // For demonstration, we'll return mock data
    const processingStatus = {
      paymentId,
      status: 'completed',
      lastProcessedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      lastProcessedBy: 'user_789',
      processingHistory: [
        {
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
          action: 'created',
          status: 'pending',
          user: 'أحمد العمري',
          notes: 'تم إنشاء طلب الدفع'
        },
        {
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
          action: 'mark_as_paid',
          status: 'processing',
          user: 'سارة الخالدي',
          notes: 'تم استلام إثبات الدفع وجاري التحقق'
        },
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          action: 'approve',
          status: 'completed',
          user: 'محمد القحطاني',
          notes: 'تم التحقق من الدفع وتأكيد استلامه'
        }
      ]
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
