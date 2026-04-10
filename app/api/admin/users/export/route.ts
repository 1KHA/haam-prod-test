import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { createExcelResponse } from '@/lib/csv-utils';

// GET /api/admin/users/export - Export users data
export async function GET(req: NextRequest) {
  try {
    // Enhanced debugging for admin users
    console.log('[USER EXPORT] Starting export request...');
    const authHeader = req.headers.get('authorization');
    console.log('[USER EXPORT] Auth header present:', !!authHeader);
    console.log('[USER EXPORT] Auth header format:', authHeader ? authHeader.substring(0, 20) + '...' : 'missing');
    
    // Check permission with enhanced logging
    const permissionCheck = await checkPermission(req, { category: 'users', action: 'view' });
    
    console.log('[USER EXPORT] Permission check result:', {
      authorized: permissionCheck.authorized,
      error: permissionCheck.error,
      userId: permissionCheck.userId
    });
    
    if (!permissionCheck.authorized) {
      // Enhanced error response with debugging info
      let errorMessage = permissionCheck.error || 'Unauthorized access';
      let errorDetails = '';
      
      if (permissionCheck.error === 'Unauthorized') {
        errorMessage = 'Authentication required';
        errorDetails = 'Please ensure you are logged in and have a valid authentication token.';
        console.log('[USER EXPORT] Authentication failed - no valid token');
      } else if (permissionCheck.error === 'Forbidden - Insufficient permissions') {
        errorMessage = 'Insufficient permissions';
        errorDetails = 'Your account does not have permission to export user data. Required permission: users:view';
        console.log('[USER EXPORT] Permission denied for user:', permissionCheck.userId);
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          requiredPermission: 'users:view',
          debug: {
            hasAuthHeader: !!authHeader,
            userId: permissionCheck.userId
          }
        },
        { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    console.log('[USER EXPORT] Permission check passed for user:', permissionCheck.userId);

    // Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Build filter conditions
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
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
        user.entrepreneurProfile;

      // Determine status
      const status = (user as any).approvalStatus || (roleProfile ? 'ACTIVE' : 'PENDING');
      const statusLabel = status === 'ACTIVE' ? 'نشط' : status === 'PENDING_APPROVAL' ? 'قيد المراجعة' : 'معلق';

      // Map role names for clarity
      const roleMap: Record<string, string> = {
        'ADMIN': 'مدير',
        'PROGRAM_MANAGER': 'مدير برنامج',
        'STARTUP': 'شركة ناشئة',
        'MENTOR': 'موجه',
        'INVESTOR': 'مستثمر',
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
        status: statusLabel,
        specialization: user.specialization || '-',
        createdAt: formatDate(user.createdAt),
        updatedAt: formatDate(user.updatedAt)
      };
    });

    return createExcelResponse({
      filename: 'users-export.xlsx',
      headers: [
        'معرف المستخدم',
        'الاسم',
        'البريد الإلكتروني',
        'الدور',
        'الحالة',
        'التخصص',
        'تاريخ الإنشاء',
        'تاريخ التحديث'
      ],
      data: formattedUsers
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
