import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: companyId } = params;

    // Check if the user is an entrepreneur and has access to this company
    // (Assume the creator of the company or a member can view)
    const company = await prisma.startup.findUnique({
      where: { id: companyId },
      include: { members: true },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Only allow access if the user is the creator or a member
    const isCreator = company.creatorId === user.userId;
    const isMember = await prisma.companyMember.findFirst({
      where: {
        startupId: companyId,
        userId: user.userId,
        status: 'ACTIVE',
      },
    });

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this company\'s members' },
        { status: 403 }
      );
    }

    // Get all active company members
    const members = await prisma.companyMember.findMany({
      where: {
        startupId: companyId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    // Get all pending invitations for this company
    const invitations = await prisma.invitation.findMany({
      where: {
        startupId: companyId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user?.name,
        email: m.user?.email,
        role: m.role,
        joinedAt: m.joinedAt,
        profile: m.user?.profile,
      })),
      invitations: invitations.map((inv) => ({
        id: inv.id,
        inviteeEmail: inv.inviteeEmail,
        status: inv.status,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get company members error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching company members' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: companyId } = params;

    const company = await prisma.startup.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (company.creatorId !== user.userId) {
      return NextResponse.json({ error: 'Only the company creator can invite members' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, role } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check for existing pending invitation
    const existing = await prisma.invitation.findFirst({
      where: { startupId: companyId, inviteeEmail: email, status: 'PENDING' },
    });
    if (existing) {
      return NextResponse.json({ error: 'دعوة معلقة موجودة بالفعل لهذا البريد الإلكتروني' }, { status: 409 });
    }

    const invitation = await prisma.invitation.create({
      data: {
        type: 'COMPANY',
        inviterId: user.userId,
        inviteeEmail: email,
        startupId: companyId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, invitation }, { status: 201 });
  } catch (error) {
    console.error('Invite member error:', error);
    return NextResponse.json({ error: 'An error occurred while sending the invitation' }, { status: 500 });
  }
}
