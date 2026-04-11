import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { notifyAccountApproved, notifyAccountSuspended } from '@/lib/services/notification-events';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const permissionCheck = await checkPermission(req, { category: 'users', action: 'edit' });
  if (!permissionCheck.authorized) {
    return NextResponse.json({ error: permissionCheck.error }, { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action || 'approve';
  const approvalStatus = action === 'approve' ? 'ACTIVE' : 'SUSPENDED';

  try {
    // Get user details before update
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, approvalStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { approvalStatus } as any,
    });

    // Send notification to user about status change
    try {
      if (action === 'approve') {
        await notifyAccountApproved({
          userId: user.id,
          name: user.name,
          approvedBy: permissionCheck.userId,
        });
      } else {
        await notifyAccountSuspended({
          userId: user.id,
          name: user.name,
          reason: body.reason || 'Account suspended by administrator',
          suspendedBy: permissionCheck.userId,
        });
      }
    } catch (notifyError) {
      console.error('[Approve API] Failed to send notification:', notifyError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ success: true, approvalStatus });
  } catch {
    return NextResponse.json({ error: 'Failed to update approval status' }, { status: 500 });
  }
}
