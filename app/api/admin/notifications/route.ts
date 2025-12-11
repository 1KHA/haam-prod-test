import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET handler to fetch notifications
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - any user can view their own notifications
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'notifications',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const unreadOnly = searchParams.get('unread') === 'true';
    
    // In a real implementation, this would query the database
    // For demo purposes, we'll return mock data
    const mockNotifications = [
      {
        id: '1',
        title: 'تحديث النظام',
        message: 'تم تحديث النظام إلى الإصدار 2.5.0',
        type: 'system',
        isRead: false,
        createdAt: '2025-03-10T14:30:00Z',
        priority: 'high'
      },
      {
        id: '2',
        title: 'طلب جديد',
        message: 'تم استلام طلب انضمام جديد من شركة ناشئة',
        type: 'application',
        isRead: true,
        createdAt: '2025-03-09T10:15:00Z',
        priority: 'medium'
      },
      {
        id: '3',
        title: 'تذكير: جلسة إرشادية',
        message: 'لديك جلسة إرشادية مجدولة غدًا الساعة 2 مساءً',
        type: 'reminder',
        isRead: false,
        createdAt: '2025-03-08T09:45:00Z',
        priority: 'medium'
      },
      {
        id: '4',
        title: 'تنبيه أمان',
        message: 'تم تسجيل الدخول إلى حسابك من جهاز جديد',
        type: 'security',
        isRead: true,
        createdAt: '2025-03-07T18:20:00Z',
        priority: 'high'
      },
      {
        id: '5',
        title: 'اكتمال النسخ الاحتياطي',
        message: 'تم إنشاء نسخة احتياطية للنظام بنجاح',
        type: 'system',
        isRead: false,
        createdAt: '2025-03-06T02:00:00Z',
        priority: 'low'
      }
    ];

    // Filter and paginate
    let filteredNotifications = [...mockNotifications];
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.isRead);
    }

    const paginatedNotifications = filteredNotifications
      .slice(offset, offset + limit);

    return NextResponse.json({ 
      success: true,
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      unreadCount: filteredNotifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
