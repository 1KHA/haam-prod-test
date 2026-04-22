import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET handler to fetch security settings
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
      category: 'security',
      action: 'view'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // In a real implementation, this would query the database for system settings
    // For demo purposes, we're returning mock security settings
    const mockSecuritySettings = {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiryDays: 90,
        preventReuseCount: 5
      },
      loginSecurity: {
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 30,
        requireMFA: false, // MFA is disabled by default to allow initial login
        mfaMethodsAvailable: ["email", "sms", "app"],
        defaultMFAMethod: "email",
        rememberDeviceDays: 30
      },
      sessionManagement: {
        sessionTimeoutMinutes: 60,
        maxConcurrentSessions: 3,
        enforceOneSessionPerUser: false,
        automaticLogoutInactivity: true
      },
      ipSecurity: {
        allowedIpRanges: [],
        blockListedIpRanges: ["198.51.100.0/24", "203.0.113.0/24"],
        geoRestrictions: {
          enabled: false,
          allowedCountries: ["SA"],
          blockedCountries: []
        }
      },
      auditSettings: {
        retentionPeriodDays: 90,
        logLoginAttempts: true,
        logDataAccess: true,
        logSystemChanges: true,
        alertOnSensitiveActions: true,
        alertOnSuspiciousActivity: true
      },
      dataProtection: {
        encryptionEnabled: true,
        encryptionAlgorithm: "AES-256",
        dataBackupEnabled: true,
        backupFrequency: "daily",
        backupRetentionDays: 30
      }
    };

    return NextResponse.json({ 
      success: true, 
      settings: mockSecuritySettings 
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    );
  }
}

// PUT handler to update security settings
export async function PUT(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - requires higher level permission
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'security',
      action: 'edit'
    });

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const updatedSettings = await request.json();
    
    // Validate the updated settings
    // This is a simplified validation, in a real application you'd want more thorough validation
    if (!updatedSettings || typeof updatedSettings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings format' },
        { status: 400 }
      );
    }

    // Basic validation for critical security settings
    if (updatedSettings.passwordPolicy) {
      const { minLength } = updatedSettings.passwordPolicy;
      if (minLength !== undefined && (typeof minLength !== 'number' || minLength < 6)) {
        return NextResponse.json(
          { error: 'Password minimum length must be at least 6 characters' },
          { status: 400 }
        );
      }
    }

    // In a real implementation, this would update settings in the database
    // For demo purposes, we'll simulate a successful update
    console.log('Security settings updated by user:', user.userId);
    console.log('Updated settings:', updatedSettings);

    // Add an audit log entry
    const logEntry = {
      action: 'تعديل إعدادات الأمان',
      user: user.userId,
      timestamp: new Date().toISOString(),
      details: 'تم تحديث إعدادات الأمان للنظام'
    };
    
    console.log('Security audit log:', logEntry);

    return NextResponse.json({ 
      success: true, 
      message: 'Security settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    );
  }
}
