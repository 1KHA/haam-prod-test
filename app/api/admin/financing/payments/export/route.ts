import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// Sample payments data for demonstration
const samplePaymentsData = [
  {
    id: "1",
    invoiceNumber: "INV-001-2025",
    amount: "250000",
    startupName: "شركة الحلول التقنية",
    startupId: "123",
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
    startupName: "مؤسسة التعليم الذكي",
    startupId: "456",
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
    startupName: "شركة التقنيات المتقدمة",
    startupId: "789",
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
    startupName: "منصة الذكاء التقني",
    startupId: "101",
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
]

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const status = searchParams.get("status")
    const startupId = searchParams.get("startupId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")
    
    // Apply filters if needed (for a real implementation)
    let filteredPayments = [...samplePaymentsData]
    
    if (status) {
      filteredPayments = filteredPayments.filter(payment => payment.status === status)
    }
    
    if (startupId) {
      filteredPayments = filteredPayments.filter(payment => payment.startupId === startupId)
    }
    
    if (startDate) {
      const start = new Date(startDate).getTime()
      filteredPayments = filteredPayments.filter(payment => {
        const paymentDate = new Date(payment.date).getTime()
        return paymentDate >= start
      })
    }
    
    if (endDate) {
      const end = new Date(endDate).getTime()
      filteredPayments = filteredPayments.filter(payment => {
        const paymentDate = new Date(payment.date).getTime()
        return paymentDate <= end
      })
    }
    
    if (category) {
      filteredPayments = filteredPayments.filter(payment => payment.category === category)
    }
    
    // Fetch payments data from database
    // For demonstration, we'll use sample data
    // In a real implementation, this would fetch from the database:
    // const paymentsData = await prisma.payment.findMany({
    //   where: {
    //     // Filter conditions based on query parameters
    //   },
    //   include: {
    //     startup: true,
    //   },
    // })
    const paymentsData = filteredPayments
    
    // Process data based on requested format
    if (format === "json") {
      // Return JSON data
      return NextResponse.json({ data: paymentsData })
    } else if (format === "csv") {
      // Convert to CSV
      const headers = [
        "رقم المعرف",
        "رقم الفاتورة",
        "المبلغ",
        "اسم الشركة",
        "رقم الشركة",
        "الفئة",
        "الحالة",
        "تاريخ الإصدار",
        "تاريخ الاستحقاق",
        "تاريخ السداد",
        "طريقة الدفع",
        "الوصف",
        "تم الإنشاء بواسطة",
        "تاريخ الإنشاء",
        "تاريخ التحديث"
      ]
      
      const rows = paymentsData.map(payment => [
        payment.id,
        payment.invoiceNumber,
        payment.amount,
        payment.startupName,
        payment.startupId,
        payment.category,
        payment.status,
        payment.date,
        payment.dueDate,
        payment.paidDate || "",
        payment.paymentMethod || "",
        `"${payment.description.replace(/"/g, '""')}"`,
        payment.createdBy,
        payment.createdAt,
        payment.updatedAt
      ])
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n")
      
      // Return CSV data
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=payments-export.csv"
        }
      })
    } else if (format === "excel") {
      // For demonstration, we'll return a placeholder message
      // In a real implementation, you would use a library like exceljs to create Excel files
      return new NextResponse("Excel export functionality would be implemented here", {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        }
      })
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Unsupported format" }),
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error exporting payments data:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    )
  }
}
