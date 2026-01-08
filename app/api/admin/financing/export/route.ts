import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { createCSVResponse, getDelimiterFromRequest } from '@/lib/csv-utils'

// Define types for our data
interface FundingItem {
  id: string;
  title: string;
  amount: string;
  startupName: string;
  startupId: string;
  fundingType: string;
  investorName: string;
  status: string;
  date: string;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  type: "funding";
}

interface PaymentItem {
  id: string;
  invoiceNumber: string;
  amount: string;
  startupName: string;
  startupId: string;
  category: string;
  status: string;
  date: string;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string | null;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  type: "payment";
}

type FinancingItem = FundingItem | PaymentItem;

// Sample financing data for demonstration
const sampleFundingData: FundingItem[] = [
  {
    id: "1", 
    title: "استثمار مباشر - تك سمارت",
    amount: "5000000",
    startupName: "تك سمارت", 
    startupId: "123",
    fundingType: "استثمار مباشر",
    investorName: "صندوق الاستثمارات العامة",
    status: "مكتمل", 
    date: "2025-01-15",
    category: "استثمار",
    description: "تمويل استثماري مباشر لدعم نمو شركة تك سمارت",
    createdAt: "2025-01-10T12:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
    type: "funding"
  },
  {
    id: "3", 
    title: "منحة تطويرية - هيلث تك",
    amount: "3000000",
    startupName: "هيلث تك", 
    startupId: "456",
    fundingType: "منحة",
    investorName: "وزارة الاتصالات وتقنية المعلومات",
    status: "قيد المراجعة", 
    date: "2025-01-10",
    category: "منحة",
    description: "منحة لدعم تطوير تقنيات الرعاية الصحية",
    createdAt: "2025-01-05T09:20:00Z",
    updatedAt: "2025-01-10T11:45:00Z",
    type: "funding"
  },
  {
    id: "5", 
    title: "استثمار - إيكو سمارت",
    amount: "10000000",
    startupName: "إيكو سمارت", 
    startupId: "789",
    fundingType: "استثمار",
    investorName: "شركة وادي الرياض",
    status: "قيد المراجعة", 
    date: "2025-01-05",
    category: "استثمار",
    description: "استثمار في مجال التقنيات الخضراء والاستدامة",
    createdAt: "2024-12-30T10:30:00Z",
    updatedAt: "2025-01-05T16:20:00Z",
    type: "funding"
  }
]

// Sample payments data for demonstration
const samplePaymentsData: PaymentItem[] = [
  {
    id: "2",
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
    updatedAt: "2025-01-08T14:30:00Z",
    type: "payment"
  },
  {
    id: "4",
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
    updatedAt: "2025-01-15T09:45:00Z",
    type: "payment"
  },
  {
    id: "6",
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
    updatedAt: "2025-01-16T13:10:00Z",
    type: "payment"
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
    const type = searchParams.get("type") || "all" // Can be 'all', 'funding', or 'payments'
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")
    const startupId = searchParams.get("startupId")
    const category = searchParams.get("category")
    
    // In a real implementation, we would fetch both funding and payments data from the database
    // For now, we'll use sample data

    // In a real implementation, this would be:
    // let fundingData = await prisma.funding.findMany({
    //   where: {
    //     // Apply filters based on query parameters
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });
    //
    // let paymentsData = await prisma.payment.findMany({
    //   where: {
    //     // Apply filters based on query parameters
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });
    
    // For demonstration, use sample data
    let fundingData = [...sampleFundingData]
    let paymentsData = [...samplePaymentsData]
    
    // Apply filters
    if (startDate) {
      const start = new Date(startDate).getTime()
      fundingData = fundingData.filter(item => {
        const itemDate = new Date(item.date).getTime()
        return itemDate >= start
      })
      
      paymentsData = paymentsData.filter(item => {
        const itemDate = new Date(item.date).getTime()
        return itemDate >= start
      })
    }
    
    if (endDate) {
      const end = new Date(endDate).getTime()
      fundingData = fundingData.filter(item => {
        const itemDate = new Date(item.date).getTime()
        return itemDate <= end
      })
      
      paymentsData = paymentsData.filter(item => {
        const itemDate = new Date(item.date).getTime()
        return itemDate <= end
      })
    }
    
    if (status) {
      fundingData = fundingData.filter(item => item.status === status)
      paymentsData = paymentsData.filter(item => item.status === status)
    }
    
    if (startupId) {
      fundingData = fundingData.filter(item => item.startupId === startupId)
      paymentsData = paymentsData.filter(item => item.startupId === startupId)
    }
    
    if (category) {
      fundingData = fundingData.filter(item => item.category === category)
      paymentsData = paymentsData.filter(item => item.category === category)
    }
    
    // Combine data based on the requested type
    let combinedData: FinancingItem[] = []
    if (type === 'all') {
      combinedData = [...fundingData, ...paymentsData]
    } else if (type === 'funding') {
      combinedData = fundingData
    } else if (type === 'payments') {
      combinedData = paymentsData
    }
    
    // Sort by date, most recent first
    combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Process data based on requested format
    if (format === "json") {
      // Return JSON data
      return NextResponse.json({ data: combinedData })
    } else if (format === "csv") {
      // Define headers for comprehensive financing export
      const headers = [
        "رقم المعرف",
        "النوع",
        "المبلغ",
        "الشركة الناشئة",
        "رقم الشركة",
        "الفئة",
        "الحالة",
        "التاريخ",
        "العنوان/رقم الفاتورة",
        "نوع التمويل/طريقة الدفع",
        "الجهة الممولة/تاريخ الاستحقاق",
        "معلومات إضافية",
        "الوصف",
        "تاريخ الإنشاء",
        "تاريخ التحديث"
      ]
      
      // Map financing data to CSV rows
      const csvRows = combinedData.map((item: FinancingItem) => {
        const baseData = {
          'رقم المعرف': item.id,
          'النوع': item.type === "funding" ? "تمويل" : "مدفوعات",
          'المبلغ': item.amount,
          'الشركة الناشئة': item.startupName,
          'رقم الشركة': item.startupId,
          'الفئة': item.category,
          'الحالة': item.status,
          'التاريخ': item.date,
          'الوصف': item.description,
          'تاريخ الإنشاء': item.createdAt,
          'تاريخ التحديث': item.updatedAt
        };

        if (item.type === "funding") {
          return {
            ...baseData,
            'العنوان/رقم الفاتورة': item.title,
            'نوع التمويل/طريقة الدفع': item.fundingType,
            'الجهة الممولة/تاريخ الاستحقاق': item.investorName,
            'معلومات إضافية': '-'
          };
        } else {
          const paymentItem = item as PaymentItem;
          return {
            ...baseData,
            'العنوان/رقم الفاتورة': paymentItem.invoiceNumber,
            'نوع التمويل/طريقة الدفع': paymentItem.paymentMethod || '-',
            'الجهة الممولة/تاريخ الاستحقاق': paymentItem.dueDate,
            'معلومات إضافية': paymentItem.paidDate ? `مدفوع في: ${paymentItem.paidDate}` : '-'
          };
        }
      });
      
      // Use CSV utility function with proper delimiter support
      return createCSVResponse({
        headers,
        data: csvRows,
        delimiter: getDelimiterFromRequest(searchParams),
        filename: 'financing-export.csv',
        includeUTF8BOM: true
      });
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
    console.error("Error exporting financing data:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    )
  }
}
