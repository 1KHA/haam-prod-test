import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET /api/admin/payments/export - Export payments data
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
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const programId = searchParams.get('programId');
    const startupId = searchParams.get('startupId');
    const ids = searchParams.get('ids');
    
    // Array of payment IDs if provided
    const paymentIds = ids ? ids.split(',') : undefined;

    // Build filter conditions for the query
    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (startDate) {
      whereClause.paymentDate = {
        ...(whereClause.paymentDate || {}),
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereClause.paymentDate = {
        ...(whereClause.paymentDate || {}),
        lte: new Date(endDate)
      };
    }

    if (search) {
      whereClause.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { payerName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (programId) {
      whereClause.metadata = {
        path: ['programId'],
        equals: programId
      };
    }

    if (startupId) {
      whereClause.metadata = {
        path: ['startupId'],
        equals: startupId
      };
    }

    // For demonstration, we'll use mock data
    // In a real implementation, this would query the database using Prisma
    
    // If specific payment IDs were requested, use those
    let paymentsCount = paymentIds ? paymentIds.length : (50 + Math.floor(Math.random() * 100));
    
    // Generate mock payment data
    const payments = Array.from({ length: paymentsCount }, (_, i) => {
      // If specific IDs were requested, use those IDs, otherwise generate sequential ones
      const id = paymentIds ? paymentIds[i] : (i + 1).toString();
      // ID already set above
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const statuses = ['completed', 'pending', 'failed', 'refunded'];
      const randomStatus = status || statuses[Math.floor(Math.random() * statuses.length)];
      
      const types = ['program_fee', 'mentorship_fee', 'event_registration', 'service_fee'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const amounts = [500, 1000, 1500, 2500, 5000, 7500, 10000];
      const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];

      // Create a mock payment that would match filters
      const mockPayment = {
        id,
        referenceNumber: `PAY-${Date.now().toString().slice(-8)}-${id.padStart(4, '0')}`,
        paymentDate: date.toISOString(),
        amount: randomAmount,
        currency: 'SAR',
        status: randomStatus,
        type: randomType,
        description: `دفعة ${randomType === 'program_fee' ? 'رسوم برنامج' : 
                      randomType === 'mentorship_fee' ? 'رسوم إرشاد' : 
                      randomType === 'event_registration' ? 'تسجيل فعالية' : 
                      'رسوم خدمات'}`,
        payerName: `شركة ${Math.floor(Math.random() * 1000)} للتقنية`,
        payerEmail: `startup${Math.floor(Math.random() * 1000)}@example.com`,
        paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'bank_transfer',
        metadata: {
          // If programId filter is set, use it, otherwise generate random
          programId: programId || (Math.random() > 0.5 ? Math.floor(Math.random() * 10).toString() : null),
          // If startupId filter is set, use it, otherwise generate random
          startupId: startupId || Math.floor(Math.random() * 50).toString(),
          invoiceId: `INV-${Date.now().toString().slice(-6)}`
        }
      };
      
      return mockPayment;
    });

    // Format the data for export
    const formattedPayments = payments.map((payment) => {
      // Map status for clarity in Arabic
      const statusMap: Record<string, string> = {
        'completed': 'مكتمل',
        'pending': 'معلق',
        'failed': 'فشل',
        'rejected': 'مرفوض',
        'refunded': 'مسترجع'
      };

      // Map type for clarity in Arabic
      const typeMap: Record<string, string> = {
        'program_fee': 'رسوم برنامج',
        'mentorship_fee': 'رسوم إرشاد',
        'event_registration': 'رسوم فعالية',
        'service_fee': 'رسوم خدمات'
      };

      // Format date
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      // Format currency
      const formatAmount = (amount: number) => {
        return `${amount.toLocaleString('ar-SA')}`;
      };

      return {
        id: payment.id,
        referenceNumber: payment.referenceNumber,
        paymentDate: formatDate(payment.paymentDate),
        amount: formatAmount(payment.amount),
        currency: payment.currency === 'SAR' ? 'ريال سعودي' : payment.currency,
        status: statusMap[payment.status] || payment.status,
        type: typeMap[payment.type] || payment.type,
        description: payment.description,
        payerName: payment.payerName,
        payerEmail: payment.payerEmail || '-',
        paymentMethod: payment.paymentMethod === 'credit_card' ? 'بطاقة ائتمان' : 'تحويل بنكي',
        programId: payment.metadata.programId || '-',
        startupId: payment.metadata.startupId || '-',
        invoiceId: payment.metadata.invoiceId || '-'
      };
    });

    // Convert to CSV
    const headers = [
      'رقم المرجع',
      'التاريخ',
      'المبلغ',
      'العملة',
      'الحالة',
      'النوع',
      'الوصف',
      'اسم الدافع',
      'البريد الإلكتروني',
      'طريقة الدفع',
      'رقم البرنامج',
      'رقم الشركة الناشئة',
      'رقم الفاتورة'
    ];

    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    formattedPayments.forEach((payment) => {
      const row = [
        `"${payment.referenceNumber}"`,
        payment.paymentDate,
        payment.amount,
        `"${payment.currency}"`,
        `"${payment.status}"`,
        `"${payment.type}"`,
        `"${payment.description.replace(/"/g, '""')}"`,
        `"${payment.payerName.replace(/"/g, '""')}"`,
        `"${payment.payerEmail}"`,
        `"${payment.paymentMethod}"`,
        `"${payment.programId}"`,
        `"${payment.startupId}"`,
        `"${payment.invoiceId}"`
      ];
      csv += row.join(',') + '\n';
    });

    // Set headers for file download
    const headers_response = new Headers();
    headers_response.set('Content-Type', 'text/csv; charset=utf-8');
    headers_response.set('Content-Disposition', 'attachment; filename="payments-export.csv"');

    return new NextResponse(csv, {
      status: 200,
      headers: headers_response,
    });
  } catch (error) {
    console.error('Error exporting payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
