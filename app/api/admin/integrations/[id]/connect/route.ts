import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// POST handler to connect an integration
export async function POST(
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
    
    // Parse request body for connection credentials
    const connectionData = await request.json();
    
    // Validate required fields for connection
    if (!connectionData.apiKey) {
      return NextResponse.json(
        { error: 'API key is required for connection' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would:
    // 1. Validate the API key with the integration provider
    // 2. Store the validated connection in the database
    // 3. Set up webhooks or other integration-specific configuration
    
    // For demo, simulate a successful connection
    const connectedIntegration = {
      id,
      status: "متصل",
      apiKey: connectionData.apiKey.substring(0, 5) + '************************',
      connectedBy: user.email, // TokenPayload has email but not name
      connectedDate: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      webhookUrl: connectionData.webhookUrl || "https://api.example.com/webhooks/integration-" + id
    };
    
    console.log(`Integration ${id} connected:`, connectedIntegration);

    // Add audit log entry
    const logEntry = {
      action: 'اتصال تكامل',
      user: user.userId,
      timestamp: new Date().toISOString(),
      details: `تم الاتصال بالتكامل: ${id}`
    };
    
    console.log('Integration connection audit log:', logEntry);

    // Simulate a slight delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ 
      success: true, 
      message: 'Integration connected successfully',
      integration: connectedIntegration
    });
  } catch (error) {
    console.error(`Error connecting integration ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to connect integration' },
      { status: 500 }
    );
  }
}

// DELETE handler to disconnect an integration
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
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    
    // In a real implementation, this would:
    // 1. Remove the API key and other credentials from the database
    // 2. Clean up webhooks or other integration-specific configuration
    // 3. Update the status in the database
    
    // For demo, simulate a successful disconnection
    const disconnectedIntegration = {
      id,
      status: "غير متصل",
      apiKey: "",
      connectedBy: "",
      connectedDate: "",
      lastSync: "",
      webhookUrl: ""
    };
    
    console.log(`Integration ${id} disconnected:`, disconnectedIntegration);

    // Add audit log entry
    const logEntry = {
      action: 'قطع الاتصال بالتكامل',
      user: user.userId,
      timestamp: new Date().toISOString(),
      details: `تم قطع الاتصال بالتكامل: ${id}`
    };
    
    console.log('Integration disconnection audit log:', logEntry);

    // Simulate a slight delay for realism
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({ 
      success: true, 
      message: 'Integration disconnected successfully',
      integration: disconnectedIntegration
    });
  } catch (error) {
    console.error(`Error disconnecting integration ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
