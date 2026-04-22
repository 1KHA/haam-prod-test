import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { InvitationType, InvitationStatus } from '@prisma/client';
import { sendEmail, generateInvitationEmailHtml } from '@/lib/email'; // Import email functions

export async function POST(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
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

    const { startupId } = params;
    const body = await request.json();
    const { inviteeEmail, role } = body;

    if (!inviteeEmail || !role) {
      return NextResponse.json({ error: 'Missing invitee email or role' }, { status: 400 });
    }

    // Verify the startup exists and the current user is its creator
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    if (startup.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to invite members to this startup' },
        { status: 403 }
      );
    }

    // Prevent inviting self to company
    if (inviteeEmail === user.email) {
      return NextResponse.json({ error: 'Cannot invite yourself to the company' }, { status: 400 });
    }

    // Check if an invitation already exists for this email to this startup
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        startupId: startupId,
        inviteeEmail: inviteeEmail,
        type: InvitationType.COMPANY,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation to this user for this company is already pending' },
        { status: 409 }
      );
    }

    // Create the invitation
    const invitation = await prisma.invitation.create({
      data: {
        type: InvitationType.COMPANY,
        inviterId: user.userId,
        inviteeEmail: inviteeEmail,
        startupId: startupId,
        status: InvitationStatus.PENDING,
      },
    });

    // TODO: Send invitation email to inviteeEmail

    // Construct accept/reject links (these would typically point to frontend routes that call the PATCH API)
    const acceptLink = `${request.nextUrl.origin}/entrepreneur-dashboard/startups/invitations/${invitation.id}?status=accepted`;
    const rejectLink = `${request.nextUrl.origin}/entrepreneur-dashboard/startups/invitations/${invitation.id}?status=rejected`;

    // Send invitation email
    await sendEmail({
      to: inviteeEmail,
      subject: `Invitation to join ${startup.name} from ${inviterUser.name}`,
      html: generateInvitationEmailHtml(inviterUser.name, inviteeEmail, InvitationType.COMPANY.toLowerCase() as 'company', acceptLink, rejectLink, startup.name),
    });

    return NextResponse.json(
      { message: 'Company invitation sent successfully', invitation },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create company invitation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending the company invitation' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startupId } = params;

    // Verify the startup exists and the current user is its creator or a member
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        members: {
          where: { userId: user.userId, status: 'ACTIVE' },
        },
      },
    });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const isCreator = startup.creatorId === user.userId;
    const isMember = startup.members.length > 0;

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { error: 'You are not authorized to view invitations for this startup' },
        { status: 403 }
      );
    }

    // Get invitations for this startup
    const invitations = await prisma.invitation.findMany({
      where: {
        startupId: startupId,
        type: InvitationType.COMPANY,
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Get company invitations error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching company invitations' },
      { status: 500 }
    );
  }
}
