import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { InvitationType, InvitationStatus } from '@prisma/client';
import { sendEmail, generateInvitationEmailHtml } from '@/lib/email'; // Import email functions

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the full user object to get the name
    const inviterUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true, email: true },
    });

    if (!inviterUser) {
      return NextResponse.json({ error: 'Inviter user not found' }, { status: 404 });
    }

    // Only users with ENTREPRENEUR role can send entrepreneur invitations
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can send team invitations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { inviteeEmail } = body;

    if (!inviteeEmail) {
      return NextResponse.json({ error: 'Missing invitee email' }, { status: 400 });
    }

    // Prevent inviting self
    if (inviteeEmail === user.email) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 });
    }

    // Check if an invitation already exists for this email from this inviter
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        inviterId: user.userId,
        inviteeEmail: inviteeEmail,
        type: InvitationType.ENTREPRENEUR,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation to this email is already pending' },
        { status: 409 }
      );
    }

    // Create the invitation
    const invitation = await prisma.invitation.create({
      data: {
        type: InvitationType.ENTREPRENEUR,
        inviterId: user.userId,
        inviteeEmail: inviteeEmail,
        status: InvitationStatus.PENDING,
      },
    });

    // Construct accept/reject links (these would typically point to frontend routes that call the PATCH API)
    const acceptLink = `${request.nextUrl.origin}/entrepreneur-dashboard/team/invitations/${invitation.id}?status=accepted`;
    const rejectLink = `${request.nextUrl.origin}/entrepreneur-dashboard/team/invitations/${invitation.id}?status=rejected`;

    // Send invitation email
    await sendEmail({
      to: inviteeEmail,
      subject: `Invitation to connect from ${inviterUser.name}`,
      html: generateInvitationEmailHtml(inviterUser.name, inviteeEmail, InvitationType.ENTREPRENEUR.toLowerCase() as 'entrepreneur', acceptLink, rejectLink),
    });

    return NextResponse.json(
      { message: 'Invitation sent successfully', invitation },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create entrepreneur invitation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending the invitation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get invitations sent by the current user or received by the current user's email
    const invitations = await prisma.invitation.findMany({
      where: {
        OR: [
          { inviterId: user.userId },
          { inviteeEmail: user.email },
        ],
        type: InvitationType.ENTREPRENEUR,
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        startup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Get entrepreneur invitations error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching invitations' },
      { status: 500 }
    );
  }
}
