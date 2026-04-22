import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// POST handler to run a cleanup operation
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'system',
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse the request body to get cleanup options
    const data = await request.json();
    const { 
      cleanLogs = false, 
      cleanTempFiles = false, 
      cleanDeletedItems = false,
      olderThan = 30 // Default to 30 days
    } = data;

    // Validate at least one option is selected
    if (!cleanLogs && !cleanTempFiles && !cleanDeletedItems) {
      return NextResponse.json(
        { error: 'At least one cleanup option must be selected' },
        { status: 400 }
      );
    }

    // In a real implementation, this would actually delete data
    // Here we'll just track what would be cleaned up and simulate success/failure
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random results with a small chance of failure for realistic simulation
    const cleanupResults = {
      logs: cleanLogs ? { 
        status: Math.random() < 0.9 ? 'success' : 'failed', 
        cleanedCount: Math.floor(Math.random() * 100) + 50,
        message: Math.random() < 0.9 ? 
          `تم تنظيف سجلات النظام الأقدم من ${olderThan} يومًا بنجاح (${Math.floor(Math.random() * 100) + 50} سجل)` : 
          `فشل في تنظيف بعض سجلات النظام بسبب عمليات قفل قاعدة البيانات`
      } : null,
      tempFiles: cleanTempFiles ? {
        status: Math.random() < 0.95 ? 'success' : 'failed',
        cleanedCount: Math.floor(Math.random() * 30) + 10,
        message: Math.random() < 0.95 ? 
          `تم تنظيف الملفات المؤقتة الأقدم من ${olderThan} يومًا بنجاح (${Math.floor(Math.random() * 30) + 10} ملف)` : 
          `فشل في تنظيف بعض الملفات المؤقتة بسبب قفل الملفات`
      } : null,
      deletedItems: cleanDeletedItems ? {
        status: Math.random() < 0.98 ? 'success' : 'failed',
        cleanedCount: Math.floor(Math.random() * 20) + 5,
        message: Math.random() < 0.98 ? 
          `تم إزالة العناصر المحذوفة الأقدم من ${olderThan} يومًا بشكل دائم (${Math.floor(Math.random() * 20) + 5} عنصر)` : 
          `فشل في إزالة بعض العناصر المحذوفة بسبب تعارضات المراجع`
      } : null
    };
    
    // Log the action for auditing
    console.log(`Cleanup operation initiated by user ${user.userId} at ${new Date().toISOString()}`);
    console.log(`Cleanup options: ${JSON.stringify({ cleanLogs, cleanTempFiles, cleanDeletedItems, olderThan })}`);

    // Check if any operation failed
    const hasFailure = Object.values(cleanupResults)
      .filter(result => result !== null)
      .some(result => result.status === 'failed');

    return NextResponse.json({ 
      success: !hasFailure, 
      message: hasFailure ? 
        'تم إكمال عملية التنظيف مع بعض الأخطاء' : 
        'تم إكمال عملية التنظيف بنجاح',
      results: cleanupResults
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'فشل في تنفيذ عملية التنظيف', success: false },
      { status: 500 }
    );
  }
}

// GET handler to check cleanup status and get cleanup options
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
      category: 'system',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // In a real implementation, you would query the database or file system
    // to get the current sizes and last cleanup dates
    // For demo purposes, we'll return mock data
    
    const mockCleanupOptions = [
      { 
        id: 'logs',
        name: 'System Logs',
        description: 'Application logs, audit trails, and system events',
        currentSize: '256 MB',
        estimatedSavings: '120 MB',
        lastCleanup: '2025-03-01T10:15:00Z'
      },
      {
        id: 'tempFiles',
        name: 'Temporary Files',
        description: 'Cached files, user uploads awaiting processing, and session data',
        currentSize: '512 MB',
        estimatedSavings: '350 MB',
        lastCleanup: '2025-03-10T14:30:00Z'
      },
      {
        id: 'deletedItems',
        name: 'Deleted Items',
        description: 'Soft-deleted records that can be permanently removed',
        currentSize: '128 MB',
        estimatedSavings: '128 MB',
        lastCleanup: '2025-02-15T09:45:00Z'
      }
    ];

    const mockCleanupSchedule = {
      enabled: true,
      frequency: 'weekly',
      day: 'Sunday',
      time: '02:00',
      options: {
        cleanLogs: true,
        cleanTempFiles: true,
        cleanDeletedItems: false,
        olderThan: 90
      },
      nextScheduledRun: '2025-03-20T02:00:00Z',
      lastRun: '2025-03-13T02:00:00Z'
    };

    return NextResponse.json({ 
      success: true,
      options: mockCleanupOptions,
      schedule: mockCleanupSchedule
    });
  } catch (error) {
    console.error('Error fetching cleanup options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cleanup options' },
      { status: 500 }
    );
  }
}
