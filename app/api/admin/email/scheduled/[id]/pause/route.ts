import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'settings', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const campaign = await (prisma as any).scheduledEmail.update({
      where: { id: params.id },
      data: { status: 'paused' },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error pausing scheduled email:', error);
    return NextResponse.json(
      { error: 'Failed to pause campaign' },
      { status: 500 }
    );
  }
}
