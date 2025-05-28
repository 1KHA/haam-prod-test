import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { InvitationStatus, InvitationType } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body; // 'ACCEPTED' or 'REJECTED'

    if (!status || (status !== InvitationStatus.ACCEPTED && status !== InvitationStatus.REJECTED)) {
      return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Only the invitee can accept or reject the invitation
    if (invitation.inviteeEmail !== user.email) {
      return NextResponse.json(
        { error: 'You are not authorized to respond to this invitation' },
        { status: 403 }
      );
    }

    // Prevent responding to already responded invitations
    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { error: `Invitation already ${invitation.status.toLowerCase()}` },
        { status: 409 }
      );
    }

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        status: status,
        respondedAt: new Date(),
      },
    });

    // TODO: Send notification email to inviter about the response

    return NextResponse.json(
      { message: `Invitation ${status.toLowerCase()} successfully`, invitation: updatedInvitation },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update entrepreneur invitation status error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the invitation status' },
      { status: 500 }
    );
  }
}
