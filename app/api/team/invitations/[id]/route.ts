import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { InvitationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
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

    // If accepted, add the user as a CompanyMember for the associated startup
    if (status === InvitationStatus.ACCEPTED && invitation.startupId) {
      // Find or create the user by inviteeEmail
      const inviteeUser = await prisma.user.findUnique({
        where: { email: invitation.inviteeEmail },
      });

      // If user does not exist, return error (could implement auto-registration flow)
      if (!inviteeUser) {
        return NextResponse.json(
          { error: 'Invitee user not found. Please register first.' },
          { status: 404 }
        );
      }

      // Check if CompanyMember already exists
      const existingMember = await prisma.companyMember.findUnique({
        where: {
          startupId_userId: {
            startupId: invitation.startupId,
            userId: inviteeUser.id,
          },
        },
      });

      if (!existingMember) {
        // Create CompanyMember record
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const companyMember = await prisma.companyMember.create({
          data: {
            startupId: invitation.startupId,
            userId: inviteeUser.id,
            role: "Member",
            status: "ACTIVE",
            invitationId: invitation.id,
            joinedAt: new Date(),
          },
        });
        // Optionally, update invitation with companyMember (if needed)
      } else {
        // If already exists, update status to ACTIVE if needed
        if (existingMember.status !== "ACTIVE") {
          await prisma.companyMember.update({
            where: { id: existingMember.id },
            data: { status: "ACTIVE", joinedAt: new Date() },
          });
        }
      }
    }

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
