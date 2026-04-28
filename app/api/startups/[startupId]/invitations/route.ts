import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { InvitationType, InvitationStatus } from '@prisma/client';
import { EmailService } from '@/lib/services/email-service';
import { notifyTeamInvitationSent } from '@/lib/services/notification-events';
import { generateInvitationEmailHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';
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

    if (inviteeEmail === user.email) {
      return NextResponse.json({ error: 'Cannot invite yourself to the company' }, { status: 400 });
    }

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

    // Check if invitee is an existing registered user
    const inviteeUser = await prisma.user.findUnique({
      where: { email: inviteeEmail },
      select: { id: true },
    });

    const invitation = await prisma.invitation.create({
      data: {
        type: InvitationType.COMPANY,
        inviterId: user.userId,
        inviteeEmail: inviteeEmail,
        startupId: startupId,
        status: InvitationStatus.PENDING,
      },
    });

    const acceptLink = `${request.nextUrl.origin}/entrepreneur-dashboard/startups/invitations/${invitation.id}?status=accepted`;
    const rejectLink = `${request.nextUrl.origin}/entrepreneur-dashboard/startups/invitations/${invitation.id}?status=rejected`;

    // Send invitation email via real SMTP (works for registered and non-registered invitees)
    try {
      await EmailService.sendEmail({
        to: inviteeEmail,
        subject: `دعوة للانضمام إلى ${startup.name} من ${inviterUser.name}`,
        subjectEn: `Invitation to join ${startup.name} from ${inviterUser.name}`,
        htmlBody: generateInvitationEmailHtml(
          inviterUser.name,
          inviteeEmail,
          'company',
          acceptLink,
          rejectLink,
          startup.name
        ),
        scenarioType: 'team_invitation_sent',
      });
    } catch (emailError) {
      console.error('[Invitation POST] Email send failed:', emailError);
    }

    // Fire scenario-based email for registered invitees (uses admin-configured template if set up)
    if (inviteeUser) {
      try {
        await EmailService.fireScenario('team_invitation_sent', [inviteeUser.id], {
          inviter: { name: inviterUser.name, email: inviterUser.email },
          startup: { name: startup.name, id: startupId },
          invitation: { acceptLink, rejectLink, role },
        });
      } catch (scenarioError) {
        console.error('[Invitation POST] fireScenario failed:', scenarioError);
      }
    }

    // In-app notification (only fires if invitee is a registered user)
    try {
      await notifyTeamInvitationSent({
        invitationId: invitation.id,
        startupName: startup.name,
        invitedByName: inviterUser.name,
        inviteeEmail,
        inviteeId: inviteeUser?.id,
        role,
      });
    } catch (notifyError) {
      console.error('[Invitation POST] notifyTeamInvitationSent failed:', notifyError);
    }

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
