import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
// Mock data (in a real implementation, this would be retrieved from a database)
const mockIntegrations = [
  { 
    id: "1", 
    name: "Stripe", 
    category: "المدفوعات", 
    description: "معالجة المدفوعات وإدارة الاشتراكات",
    status: "متصل", 
    lastSync: "2025-03-12T10:15:22Z",
    icon: "credit-card",
    apiKey: "sk_test_*****************************",
    webhookUrl: "https://api.example.com/webhooks/stripe",
    syncFrequency: "كل ساعة",
    dataAccess: ["المدفوعات", "الاشتراكات", "العملاء"],
    connectedBy: "أحمد محمد",
    connectedDate: "2025-01-15T00:00:00Z"
  },
  { 
    id: "2", 
    name: "Google Calendar", 
    category: "الجدولة", 
    description: "مزامنة الفعاليات والمواعيد مع تقويم Google",
    status: "متصل", 
    lastSync: "2025-03-12T09:30:15Z",
    icon: "calendar",
    apiKey: "AIza*****************************",
    webhookUrl: "https://api.example.com/webhooks/google-calendar",
    syncFrequency: "كل 15 دقيقة",
    dataAccess: ["الفعاليات", "المواعيد", "الجلسات"],
    connectedBy: "محمد القحطاني",
    connectedDate: "2025-01-20T00:00:00Z"
  }
];

// GET handler to fetch a single integration by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'integrations',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // In a real implementation, this would query the database
    // For demo, find the integration in our mock data
    const integration = mockIntegrations.find(i => i.id === id);

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      integration 
    });
  } catch (error) {
    console.error(`Error fetching integration ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch integration' },
      { status: 500 }
    );
  }
}

// PATCH handler to update an integration
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'integrations',
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    
    // Parse request body
    const updateData = await request.json();
    
    // In a real implementation, this would update a database record
    // For demo, simulate a successful update
    
    // Add audit log entry
    const logEntry = {
      action: 'تحديث تكامل',
      user: user.userId,
      timestamp: new Date().toISOString(),
      details: `تم تحديث التكامل: ${id}`
    };
    
    console.log('Integration update audit log:', logEntry);

    return NextResponse.json({ 
      success: true, 
      message: 'Integration updated successfully',
      integration: {
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.userId
      }
    });
  } catch (error) {
    console.error(`Error updating integration ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove an integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'integrations',
      action: 'delete'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    
    // In a real implementation, this would delete from the database
    // For demo, simulate a successful deletion

    // Add audit log entry
    const logEntry = {
      action: 'حذف تكامل',
      user: user.userId,
      timestamp: new Date().toISOString(),
      details: `تم حذف التكامل: ${id}`
    };
    
    console.log('Integration deletion audit log:', logEntry);

    return NextResponse.json({ 
      success: true, 
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting integration ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    );
  }
}
