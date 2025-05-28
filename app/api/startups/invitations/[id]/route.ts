import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { InvitationStatus, InvitationType, MemberStatus } from '@prisma/client';
import { sendEmail } from '@/lib/email'; // Import email functions

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
      include: {
        startup: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Ensure it's a company invitation
    if (invitation.type !== InvitationType.COMPANY) {
      return NextResponse.json(
        { error: 'This is not a company invitation' },
        { status: 400 }
      );
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

    const updatedInvitation = await prisma.$transaction(async (tx) => {
      const updated = await tx.invitation.update({
        where: { id },
        data: {
          status: status,
          respondedAt: new Date(),
        },
      });

      if (status === InvitationStatus.ACCEPTED) {
        // Check if the user is already a member of this startup
        const existingMembership = await tx.companyMember.findFirst({
          where: {
            startupId: invitation.startupId!,
            userId: user.userId,
          },
        });

        if (existingMembership) {
          // If already a member, update status if needed, or just return
          await tx.companyMember.update({
            where: { id: existingMembership.id },
            data: { status: MemberStatus.ACTIVE },
          });
        } else {
          // Create a new CompanyMember record
          await tx.companyMember.create({
            data: {
              startupId: invitation.startupId!,
              userId: user.userId,
              role: 'Member', // Default role, can be customized
              status: MemberStatus.ACTIVE,
              invitationId: invitation.id,
              joinedAt: new Date(),
            },
          });
        }
      } else if (status === InvitationStatus.REJECTED) {
        // Optionally, update any existing pending CompanyMember record to REJECTED
        await tx.companyMember.updateMany({
          where: {
            invitationId: invitation.id,
            userId: user.userId,
            status: MemberStatus.INVITED,
          },
          data: {
            status: MemberStatus.REJECTED,
          },
        });
      }
      return updated;
    });

    // Send notification email to inviter
    const inviter = await prisma.user.findUnique({
      where: { id: invitation.inviterId },
      select: { email: true, name: true },
    });

    if (inviter) {
      await sendEmail({
        to: inviter.email,
        subject: `Company Invitation ${status.toLowerCase()}: ${invitation.startup?.name || 'Your Startup'}`,
        html: `
          <p>Hello ${inviter.name},</p>
          <p>Your invitation to ${invitation.inviteeEmail} to join ${invitation.startup?.name || 'your startup'} has been ${status.toLowerCase()}.</p>
          <p>Thank you,</p>
          <p>The Accelerator Dashboard Team</p>
        `,
      });
    }

    return NextResponse.json(
      { message: `Company invitation ${status.toLowerCase()} successfully`, invitation: updatedInvitation },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update company invitation status error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the company invitation status' },
      { status: 500 }
    );
  }
}
