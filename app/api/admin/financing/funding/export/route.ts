import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { createCSVResponse, getDelimiterFromRequest } from '@/lib/csv-utils'

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
    const search = searchParams.get("search")
    
    // Build where clause for filtering
    let whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { startupName: { contains: search, mode: 'insensitive' } },
        { investorName: { contains: search, mode: 'insensitive' } },
        { fundingType: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Fetch funding data from database
    const fundingData = await prisma.funding.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })
    
    // Format dates for export
    const formattedFundingData = fundingData.map((item: any) => ({
      ...item,
      date: item.date?.toISOString()?.split('T')[0] || '',
      createdAt: item.createdAt?.toISOString() || '',
      updatedAt: item.updatedAt?.toISOString() || ''
    }))
    
    // Process data based on requested format
    if (format === "json") {
      // Return JSON data
      return NextResponse.json({ data: formattedFundingData })
    } else if (format === "csv") {
      // Define headers in Arabic
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
      
      // Map funding data to CSV rows
      const csvRows = formattedFundingData.map((funding: any) => ({
        'رقم المعرف': funding.id || '',
        'العنوان': funding.title || '',
        'المبلغ': funding.amount || '',
        'الشركة الناشئة': funding.startupName || '',
        'نوع التمويل': funding.fundingType || '',
        'الجهة الممولة': funding.investorName || '',
        'التاريخ': funding.date || '',
        'الحالة': funding.status || '',
        'التفاصيل': funding.description || '',
        'تاريخ الإنشاء': funding.createdAt || '',
        'تاريخ التحديث': funding.updatedAt || ''
      }))
      
      // Use CSV utility function with proper delimiter support
      return createCSVResponse({
        headers,
        data: csvRows,
        delimiter: getDelimiterFromRequest(searchParams),
        filename: 'funding-export.csv',
        includeUTF8BOM: true
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
