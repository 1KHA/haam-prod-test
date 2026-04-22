import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== UserRole.PROGRAM_MANAGER && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sessions = await prisma.mentorSession.findMany({
      include: {
        startup: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true, mentorProfile: { select: { expertise: true } } } },
        cohort: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== UserRole.PROGRAM_MANAGER && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { startupId, mentorId, cohortId, topic, sessionType, date, duration, location, notes } = body;

    if (!startupId || !mentorId || !topic || !date) {
      return NextResponse.json({ error: 'startupId, mentorId, topic, and date are required' }, { status: 400 });
    }

    const session = await prisma.mentorSession.create({
      data: {
        startupId,
        mentorId,
        cohortId: cohortId || undefined,
        topic,
        sessionType: sessionType || 'INDIVIDUAL',
        status: 'scheduled',
        date: new Date(date),
        duration: duration || 60,
        location: location || '',
        notes: notes || '',
        createdById: user.userId,
      },
      include: {
        startup: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true } },
      },
    });

    // Notify startup team and mentor about the scheduled meeting
    try {
      const startupWithMembers = await prisma.startup.findUnique({
        where: { id: startupId },
        include: {
          creator: { select: { id: true } },
          members: { select: { userId: true } },
        },
      });
      const recipientIds = [
        mentorId,
        ...(startupWithMembers?.creator ? [startupWithMembers.creator.id] : []),
        ...(startupWithMembers?.members.map(m => m.userId) || []),
      ];
      const uniqueRecipients = Array.from(new Set(recipientIds));
      if (uniqueRecipients.length > 0) {
        await EmailService.fireScenario('meeting_scheduled', uniqueRecipients, {
          session: { topic, date, duration: duration || 60, location: location || '' },
          startup: { name: session.startup.name },
          mentor: { name: session.mentor.name },
        });
      }
    } catch (emailError) {
      console.error('[PM Sessions] meeting_scheduled email scenario failed:', emailError);
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
