import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// GET /api/admin/users/export - Export users data
export async function GET(req: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(req, { category: 'users', action: 'view' });
    
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Build filter conditions
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role.toLowerCase() !== 'all') {
      whereClause.role = role.toUpperCase();
    }

    // Fetch users with their profiles
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        mentorProfile: true,
        investorProfile: true,
        startupProfile: true,
        adminProfile: true,
        programManagerProfile: true,
        entrepreneurProfile: true,
        participantProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the data for export
    const formattedUsers = users.map((user: any) => {
      // Determine profile data
      const roleProfile = 
        user.mentorProfile || 
        user.investorProfile || 
        user.startupProfile || 
        user.adminProfile || 
        user.programManagerProfile || 
        user.entrepreneurProfile || 
        user.participantProfile;

      // Determine status
      const status = roleProfile ? 'ACTIVE' : 'PENDING';

      // Map role names for clarity
      const roleMap: Record<string, string> = {
        'ADMIN': 'مدير',
        'PROGRAM_MANAGER': 'مدير برنامج',
        'STARTUP': 'شركة ناشئة',
        'MENTOR': 'موجه',
        'INVESTOR': 'مستثمر',
        'PARTICIPANT': 'مشارك',
        'ENTREPRENEUR': 'رائد أعمال',
        'ACCELERATOR': 'مسرع أعمال'
      };

      // Format date
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleMap[user.role] || user.role,
        status: status === 'ACTIVE' ? 'نشط' : 'معلق',
        specialization: user.specialization || '-',
        createdAt: formatDate(user.createdAt),
        updatedAt: formatDate(user.updatedAt)
      };
    });

    // Convert to CSV
    const headers = [
      'معرف المستخدم',
      'الاسم',
      'البريد الإلكتروني',
      'الدور',
      'الحالة',
      'التخصص',
      'تاريخ الإنشاء',
      'تاريخ التحديث'
    ];

    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    formattedUsers.forEach((user: any) => {
      const row = [
        user.id,
        `"${user.name.replace(/"/g, '""')}"`, // Escape quotes in names
        `"${user.email}"`,
        `"${user.role}"`,
        `"${user.status}"`,
        `"${user.specialization}"`,
        user.createdAt,
        user.updatedAt
      ];
      csv += row.join(',') + '\n';
    });

    // Set headers for file download
    const headers_response = new Headers();
    headers_response.set('Content-Type', 'text/csv; charset=utf-8');
    headers_response.set('Content-Disposition', 'attachment; filename="users-export.csv"');

    return new NextResponse(csv, {
      status: 200,
      headers: headers_response,
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
