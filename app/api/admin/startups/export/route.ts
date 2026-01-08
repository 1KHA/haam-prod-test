import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// Define Startup interface based on our schema
interface Startup {
  id: string;
  name: string;
  industry: string;
  stage: string;
  description: string;
  problem: string;
  solution: string;
  targetMarket: string | null;
  businessModel: string | null;
  competitiveAdvantage: string | null;
  teamSize: number;
  fundingNeeds: string | null;
  pitchDeckUrl: string | null;
  status: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define types for the startup with included relations
type StartupWithRelations = Startup & {
  creator: {
    id: string;
    name: string;
    email: string;
    entrepreneurProfile: {
      organizationName: string;
    } | null;
  };
};

// GET /api/admin/startups/export - Export startups data
export async function GET(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'startups', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const industry = searchParams.get('industry') || '';
    const delimiter = searchParams.get('delimiter') || ','; // Allow delimiter customization for Arabic environments

    // Build filter conditions
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status.toUpperCase() !== 'ALL') {
      whereClause.status = status.toUpperCase();
    }

    if (industry) {
      whereClause.industry = { contains: industry, mode: 'insensitive' };
    }

    // Fetch startups with their creator
    const startups = await prisma.startup.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            entrepreneurProfile: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the data for export
    const formattedStartups = startups.map((startup: StartupWithRelations) => {
      // Status mapping
      const statusMap: Record<string, string> = {
        'PENDING': 'معلق',
        'APPROVED': 'نشط',
        'REJECTED': 'مرفوض'
      };

      // Format date
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      // Format funding
      const formatFunding = (funding: string | null) => {
        return funding || 'غير محدد';
      };

      // Get accelerator name if available
      const acceleratorName = startup.creator.entrepreneurProfile?.organizationName || 'غير محدد';

      return {
        id: startup.id,
        name: startup.name,
        industry: startup.industry,
        stage: startup.stage,
        teamSize: startup.teamSize.toString(),
        status: statusMap[startup.status] || startup.status,
        description: startup.description,
        problem: startup.problem,
        solution: startup.solution,
        targetMarket: startup.targetMarket || '-',
        businessModel: startup.businessModel || '-',
        competitiveAdvantage: startup.competitiveAdvantage || '-',
        fundingNeeds: formatFunding(startup.fundingNeeds),
        creatorName: startup.creator.name,
        creatorEmail: startup.creator.email,
        accelerator: acceleratorName,
        createdAt: formatDate(startup.createdAt.toString()),
        updatedAt: formatDate(startup.updatedAt.toString())
      };
    });

    // Convert to CSV
    const headers = [
      'معرف الشركة',
      'اسم الشركة',
      'القطاع',
      'المرحلة',
      'حجم الفريق',
      'الحالة',
      'الوصف',
      'المشكلة',
      'الحل',
      'السوق المستهدف',
      'نموذج العمل',
      'الميزة التنافسية',
      'احتياجات التمويل',
      'اسم المنشئ',
      'بريد المنشئ',
      'المسرع/البرنامج',
      'تاريخ الإنشاء',
      'تاريخ التحديث'
    ];

    // Create CSV content with enhanced Arabic text handling
    const csvRows: string[] = [];
    
    formattedStartups.forEach((startup: any) => {
      const row = [
        `"${startup.id}"`,
        `"${startup.name.replace(/"/g, '""')}"`,
        `"${startup.industry.replace(/"/g, '""')}"`,
        `"${startup.stage.replace(/"/g, '""')}"`,
        `"${startup.teamSize}"`,
        `"${startup.status}"`,
        `"${startup.description.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${startup.problem.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${startup.solution.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
        `"${startup.targetMarket?.replace(/"/g, '""').replace(/\r?\n/g, ' ') || ''}"`,
        `"${startup.businessModel?.replace(/"/g, '""').replace(/\r?\n/g, ' ') || ''}"`,
        `"${startup.competitiveAdvantage?.replace(/"/g, '""').replace(/\r?\n/g, ' ') || ''}"`,
        `"${startup.fundingNeeds?.replace(/"/g, '""') || ''}"`,
        `"${startup.creatorName.replace(/"/g, '""')}"`,
        `"${startup.creatorEmail}"`,
        `"${startup.accelerator.replace(/"/g, '""')}"`,
        `"${startup.createdAt}"`,
        `"${startup.updatedAt}"`
      ];
      csvRows.push(row.join(delimiter));
    });

    // Combine header and rows
    const csv = [headers.join(delimiter), ...csvRows].join('\n');

    // Set headers for file download
    const headers_response = new Headers();
    headers_response.set('Content-Type', 'text/csv; charset=utf-8');
    headers_response.set('Content-Disposition', 'attachment; filename="startups-export.csv"');

    // Add UTF-8 BOM to ensure proper encoding
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;
    
    return new NextResponse(csvWithBom, {
      status: 200,
      headers: headers_response,
    });
  } catch (error) {
    console.error('Error exporting startups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
