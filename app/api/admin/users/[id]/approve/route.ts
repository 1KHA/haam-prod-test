import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const permissionCheck = await checkPermission(req, { category: 'users', action: 'edit' });
  if (!permissionCheck.authorized) {
    return NextResponse.json({ error: permissionCheck.error }, { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action || 'approve';
  const approvalStatus = action === 'approve' ? 'ACTIVE' : 'SUSPENDED';

  try {
    await prisma.user.update({
      where: { id: params.id },
      data: { approvalStatus } as any,
    });
    return NextResponse.json({ success: true, approvalStatus });
  } catch {
    return NextResponse.json({ error: 'Failed to update approval status' }, { status: 500 });
  }
}
