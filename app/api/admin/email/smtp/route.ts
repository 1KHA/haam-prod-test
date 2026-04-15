import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import crypto from 'crypto';

// Encryption helpers for SMTP passwords
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-key-32-chars-long!!!!!'; // Must be 32 chars for AES-256
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * GET /api/admin/email/smtp
 * Get all SMTP configurations
 */
export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const configs = await (prisma as any).smtpConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Don't return passwords
    const sanitizedConfigs = configs.map((config: any) => ({
      ...config,
      password: undefined,
    }));

    return NextResponse.json({ success: true, configs: sanitizedConfigs });
  } catch (error) {
    console.error('Error fetching SMTP configs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SMTP configurations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email/smtp
 * Create or update SMTP configuration
 */
export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      host,
      port,
      secure,
      username,
      password,
      fromEmail,
      fromName,
      isActive,
      testMode,
    } = body;

    // Validate required fields
    if (!host || !port || !username || !fromEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Encrypt password if provided
    const encryptedPassword = password ? encrypt(password) : undefined;

    let config;
    if (id) {
      // Update existing
      const updateData: any = {
        host,
        port: parseInt(port),
        secure: secure ?? false,
        username,
        fromEmail,
        fromName: fromName || 'HAAM Platform',
        isActive: isActive ?? true,
        testMode: testMode ?? true,
      };
      
      if (encryptedPassword) {
        updateData.password = encryptedPassword;
      }

      config = await (prisma as any).smtpConfig.update({
        where: { id },
        data: updateData,
      });
    } else {
      // Create new
      config = await (prisma as any).smtpConfig.create({
        data: {
          host,
          port: parseInt(port),
          secure: secure ?? false,
          username,
          password: encryptedPassword || '',
          fromEmail,
          fromName: fromName || 'HAAM Platform',
          isActive: isActive ?? true,
          testMode: testMode ?? true,
        },
      });
    }

    // Don't return password
    const { password: _, ...sanitizedConfig } = config;

    return NextResponse.json({ success: true, config: sanitizedConfig });
  } catch (error) {
    console.error('Error saving SMTP config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save SMTP configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/email/smtp
 * Delete SMTP configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'delete' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Config ID is required' },
        { status: 400 }
      );
    }

    await (prisma as any).smtpConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting SMTP config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SMTP configuration' },
      { status: 500 }
    );
  }
}
