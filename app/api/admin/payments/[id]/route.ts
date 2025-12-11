import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET handler to fetch a specific payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // In a real implementation, this would fetch the payment from the database
    // For demonstration, we'll return mock data
    const payment = {
      id,
      referenceNumber: `PAY-${Date.now().toString().slice(-8)}-${id.padStart(4, '0')}`,
      paymentDate: new Date().toISOString(),
      amount: 5000,
      currency: 'SAR',
      status: 'completed',
      type: 'program_fee',
      description: 'رسوم برنامج مسرعة الأعمال - الدورة الخامسة',
      payerName: 'شركة تقنية المستقبل',
      payerEmail: 'finance@future-tech.example.com',
      paymentMethod: 'bank_transfer',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      createdBy: 'user_123',
      updatedBy: 'user_456',
      metadata: {
        programId: '5',
        startupId: '42',
        invoiceId: 'INV-123456',
        notes: 'تم التحقق من التحويل البنكي',
        bankReference: 'REF87654321',
        paymentProof: 'https://example.com/proof/12345.pdf'
      },
      history: [
        {
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          action: 'created',
          user: 'أحمد العمري',
          details: 'تم إنشاء سجل الدفع'
        },
        {
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          action: 'updated',
          user: 'سارة الخالدي',
          details: 'تم تحديث حالة الدفع إلى "قيد المعالجة"'
        },
        {
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          action: 'completed',
          user: 'محمد القحطاني',
          details: 'تم تأكيد استلام الدفعة وتحديث الحالة إلى "مكتمل"'
        }
      ],
      relatedDocuments: [
        {
          id: 'doc_1',
          type: 'invoice',
          name: 'فاتورة رسوم البرنامج',
          url: 'https://example.com/invoices/INV-123456.pdf',
          createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'doc_2',
          type: 'receipt',
          name: 'إيصال استلام الدفعة',
          url: 'https://example.com/receipts/REC-123456.pdf',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'doc_3',
          type: 'proof',
          name: 'إثبات التحويل البنكي',
          url: 'https://example.com/proofs/PRF-123456.pdf',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    return NextResponse.json({ 
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}

// PUT handler to update a payment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    
    // In a real implementation, this would update the payment in the database
    // For demonstration, we'll just return a mock updated payment
    const updatedPayment = {
      id,
      referenceNumber: `PAY-${Date.now().toString().slice(-8)}-${id.padStart(4, '0')}`,
      ...body,
      updatedBy: user.userId,
      updatedAt: new Date().toISOString()
    };

    console.log('Payment updated:', updatedPayment);

    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث الدفعة بنجاح',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - requires admin level permission
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'payments',
      action: 'delete'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // In a real implementation, this would delete or mark the payment as deleted in the database
    // For demonstration, we'll just log the deletion
    console.log(`Payment ${id} deleted by user ${user.userId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف الدفعة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
