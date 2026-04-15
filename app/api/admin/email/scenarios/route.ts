import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// Default scenario definitions
const DEFAULT_SCENARIOS = [
  'user_created',
  'account_approved',
  'account_suspended',
  'password_reset',
  'login_failed',
  'application_submitted',
  'application_status_changed',
  'startup_created',
  'program_created',
  'milestone_created',
  'milestone_due',
  'milestone_completed',
  'event_created',
  'event_reminder',
  'event_cancelled',
  'meeting_scheduled',
  'document_uploaded',
  'document_approved',
  'announcement',
  'weekly_digest',
];

/**
 * GET /api/admin/email/scenarios
 * Get all email scenario settings
 */
export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    // Get existing settings
    const settings = await (prisma as any).emailScenarioSettings.findMany({
      include: {
        template: {
          select: { id: true, name: true, subject: true },
        },
      },
    });

    // Create a map of existing settings
    const settingsMap = new Map(settings.map((s: any) => [s.scenarioType, s]));

    // Ensure all default scenarios exist
    const allScenarios = DEFAULT_SCENARIOS.map((scenarioType) => {
      if (settingsMap.has(scenarioType)) {
        return settingsMap.get(scenarioType);
      }
      // Return default setting
      return {
        scenarioType,
        isEnabled: false,
        templateId: null,
        template: null,
        sendToRoles: ['all'],
        delayMinutes: 0,
        digestMode: 'immediate',
        requireApproval: false,
      };
    });

    return NextResponse.json({ success: true, scenarios: allScenarios });
  } catch (error) {
    console.error('Error fetching scenario settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenario settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/email/scenarios
 * Update a scenario setting
 */
export async function PUT(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      scenarioType,
      isEnabled,
      templateId,
      sendToRoles,
      delayMinutes,
      digestMode,
      requireApproval,
    } = body;

    if (!scenarioType) {
      return NextResponse.json(
        { success: false, error: 'Scenario type is required' },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existing = await (prisma as any).emailScenarioSettings.findUnique({
      where: { scenarioType },
    });

    let setting;
    if (existing) {
      setting = await (prisma as any).emailScenarioSettings.update({
        where: { scenarioType },
        data: {
          isEnabled: isEnabled ?? existing.isEnabled,
          templateId: templateId !== undefined ? templateId : existing.templateId,
          sendToRoles: sendToRoles ?? existing.sendToRoles,
          delayMinutes: delayMinutes ?? existing.delayMinutes,
          digestMode: digestMode ?? existing.digestMode,
          requireApproval: requireApproval ?? existing.requireApproval,
        },
      });
    } else {
      setting = await (prisma as any).emailScenarioSettings.create({
        data: {
          scenarioType,
          isEnabled: isEnabled ?? false,
          templateId: templateId || null,
          sendToRoles: sendToRoles || ['all'],
          delayMinutes: delayMinutes || 0,
          digestMode: digestMode || 'immediate',
          requireApproval: requireApproval ?? false,
        },
      });
    }

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('Error updating scenario setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update scenario setting' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email/scenarios/reset
 * Reset scenario to default
 */
export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { scenarioType } = body;

    if (!scenarioType) {
      return NextResponse.json(
        { success: false, error: 'Scenario type is required' },
        { status: 400 }
      );
    }

    // Delete the custom setting to revert to default
    await (prisma as any).emailScenarioSettings.delete({
      where: { scenarioType },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting scenario:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset scenario' },
      { status: 500 }
    );
  }
}
