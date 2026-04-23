import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
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

    // Fetch the payment from the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payment = await (prisma as any).payment.findUnique({
      where: { id },
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
      // If payment not found in database, check if we should generate mock data for development
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // Generate mock payment data for development/testing
        const mockPayment = generateMockPayment(id);
        return NextResponse.json({ 
          success: true,
          data: mockPayment,
          isMock: true // Flag to indicate this is mock data
        });
      } else {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
    }

    // Process the payment data for the response
    const formattedPayment = {
      id: payment.id,
      referenceNumber: payment.referenceNumber,
      paymentDate: payment.paymentDate.toISOString(),
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      type: payment.type,
      description: payment.description,
      payerName: payment.payerName,
      payerEmail: payment.payerEmail,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      creatorId: payment.creatorId,
      creator: payment.creator,
      metadata: payment.metadata || {},
      history: payment.history || [],
      relatedDocuments: payment.relatedDocuments || []
    };

    return NextResponse.json({ 
      success: true,
      data: formattedPayment
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
    
    // Check if the payment exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingPayment = await (prisma as any).payment.findUnique({
      where: { id },
      include: { 
        history: true 
      }
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    // Process data for update
    // Filter out fields that should not be directly updated
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      referenceNumber,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      creatorId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      creator,
      ...updateData
    } = body;
    
    // Handle status change history
    let history = existingPayment.history || [];
    
    // Check if status is being updated
    if (updateData.status && updateData.status !== existingPayment.status) {
      // Add a new history entry for the status change
      const statusChange = {
        status: updateData.status,
        timestamp: new Date().toISOString(),
        userId: user.userId,
        note: body.statusChangeNote || `Status changed from ${existingPayment.status} to ${updateData.status}`
      };
      
      history = [...history, statusChange];
    }
    
    // Convert payment type from frontend format to PaymentType enum if needed
    if (updateData.type && typeof updateData.type === 'string' && updateData.type.includes('_')) {
      const typeMap: Record<string, string> = {
        'program_fee': 'PROGRAM_FEE',
        'mentorship_fee': 'MENTORSHIP_FEE',
        'event_registration': 'EVENT_REGISTRATION',
        'service_fee': 'SERVICE_FEE'
      };
      
      updateData.type = typeMap[updateData.type.toLowerCase()] || updateData.type.toUpperCase();
    }

    // Update the payment in the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedPayment = await (prisma as any).payment.update({
      where: { id },
      data: {
        ...updateData,
        history: history,
        updatedAt: new Date()
      },
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

    console.log('Payment updated:', updatedPayment.id);

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

    // Check if the payment exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingPayment = await (prisma as any).payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Delete the payment from the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).payment.delete({
      where: { id }
    });

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

// Helper function to generate mock payment data
function generateMockPayment(id: string) {
  return {
    id,
    referenceNumber: `PAY-${Date.now().toString().slice(-8)}-${id.padStart(4, '0')}`,
    paymentDate: new Date().toISOString(),
    amount: 5000,
    currency: 'SAR',
    status: 'COMPLETED',
    type: 'PROGRAM_FEE',
    description: 'رسوم برنامج مسرعة الأعمال - الدورة الخامسة',
    payerName: 'شركة تقنية المستقبل',
    payerEmail: 'finance@future-tech.example.com',
    paymentMethod: 'bank_transfer',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    creatorId: '1',
    creator: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com'
    },
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
        status: 'PENDING',
        userId: '1',
        note: 'تم إنشاء سجل الدفع'
      },
      {
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PROCESSING',
        userId: '2',
        note: 'تم تحديث حالة الدفع إلى "قيد المعالجة"'
      },
      {
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'COMPLETED',
        userId: '3',
        note: 'تم تأكيد استلام الدفعة وتحديث الحالة إلى "مكتمل"'
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
}
