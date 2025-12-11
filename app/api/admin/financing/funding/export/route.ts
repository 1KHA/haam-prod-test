import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

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
    
    // Fetch funding data from database
    const fundingData = await prisma.funding.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Format dates for export
    const formattedFundingData = fundingData.map((item: any) => ({
      ...item,
      date: item.date.toISOString().split('T')[0],
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))
    
    // Process data based on requested format
    if (format === "json") {
      // Return JSON data
      return NextResponse.json({ data: formattedFundingData })
    } else if (format === "csv") {
      // Convert to CSV
      const headers = [
        "رقم المعرف",
        "العنوان",
        "المبلغ",
        "الشركة الناشئة",
        "نوع التمويل",
        "الجهة الممولة",
        "التاريخ",
        "الحالة",
        "التفاصيل",
        "تاريخ الإنشاء",
        "تاريخ التحديث"
      ]
      
      const rows = formattedFundingData.map((funding: any) => [
        funding.id,
        funding.title,
        funding.amount,
        funding.startupName,
        funding.fundingType,
        funding.investorName,
        funding.date,
        funding.status,
        funding.description,
        funding.createdAt,
        funding.updatedAt
      ])
      
      const csvContent = [
        headers.join(","),
        ...rows.map((row: any) => row.join(","))
      ].join("\n")
      
      // Return CSV data
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=funding-export.csv"
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
    console.error("Error exporting funding data:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    )
  }
}
