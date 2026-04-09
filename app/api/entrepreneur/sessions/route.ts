import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// Get entrepreneur's sessions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== UserRole.ENTREPRENEUR && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get entrepreneur's startups
    const startups = await prisma.startup.findMany({
      where: { creatorId: user.userId },
      select: { id: true },
    });
    const startupIds = startups.map(s => s.id);

    const sessions = await prisma.mentorSession.findMany({
      where: { startupId: { in: startupIds } },
      include: {
        startup: { select: { id: true, name: true } },
        mentor: { 
          select: { 
            id: true, 
            name: true, 
            profile: { select: { avatar: true } },
            mentorProfile: { select: { expertise: true } }
          } 
        },
        cohort: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const mapped = sessions.map((s) => ({
      id: s.id,
      startupId: s.startupId,
      startupName: s.startup.name,
      mentorId: s.mentorId,
      mentorName: s.mentor.name,
      mentorAvatar: s.mentor.profile?.avatar,
      mentorExpertise: s.mentor.mentorProfile?.expertise,
      cohortName: s.cohort?.name || null,
      topic: s.topic,
      type: s.sessionType,
      status: s.status.toUpperCase(),
      date: s.date.toISOString().split('T')[0],
      time: s.date.toISOString().split('T')[1]?.substring(0, 5) || '00:00',
      duration: s.duration,
      location: s.location || '',
      notes: s.notes || '',
    }));

    const upcomingSessions = mapped.filter((s) => s.status === 'SCHEDULED');
    const completedSessions = mapped.filter((s) => s.status === 'COMPLETED');

    return NextResponse.json({
      sessions: mapped,
      upcomingSessions,
      completedSessions,
    });
  } catch (error) {
    console.error('Get entrepreneur sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// Book a new session with a mentor
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== UserRole.ENTREPRENEUR && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { mentorId, startupId, topic, date, time, duration, location, notes, type } = body;

    if (!mentorId || !startupId || !topic || !date) {
      return NextResponse.json(
        { error: 'mentorId, startupId, topic, and date are required' },
        { status: 400 }
      );
    }

    // Verify the startup belongs to the entrepreneur
    const startup = await prisma.startup.findFirst({
      where: { id: startupId, creatorId: user.userId },
    });
    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found or does not belong to you' },
        { status: 403 }
      );
    }

    // Verify the mentor exists
    const mentor = await prisma.user.findFirst({
      where: { id: mentorId, role: UserRole.MENTOR },
    });
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const dateTime = new Date(`${date}T${time || '10:00'}:00`);

    const session = await prisma.mentorSession.create({
      data: {
        startupId,
        mentorId,
        topic,
        sessionType: type || 'INDIVIDUAL',
        status: 'scheduled',
        date: dateTime,
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

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error('Create entrepreneur session error:', error);
    return NextResponse.json({ error: 'Failed to book session' }, { status: 500 });
  }
}

// Cancel a session
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== UserRole.ENTREPRENEUR && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId || !action) {
      return NextResponse.json({ error: 'sessionId and action are required' }, { status: 400 });
    }

    // Get entrepreneur's startups
    const startups = await prisma.startup.findMany({
      where: { creatorId: user.userId },
      select: { id: true },
    });
    const startupIds = startups.map(s => s.id);

    // Verify the session belongs to one of the entrepreneur's startups
    const existingSession = await prisma.mentorSession.findFirst({
      where: { id: sessionId, startupId: { in: startupIds } },
    });
    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (action === 'cancel') {
      const session = await prisma.mentorSession.update({
        where: { id: sessionId },
        data: { status: 'cancelled' },
      });
      return NextResponse.json({ success: true, session });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

// Delete a session
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== UserRole.ENTREPRENEUR && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get entrepreneur's startups
    const startups = await prisma.startup.findMany({
      where: { creatorId: user.userId },
      select: { id: true },
    });
    const startupIds = startups.map(s => s.id);

    // Verify the session belongs to one of the entrepreneur's startups
    const existingSession = await prisma.mentorSession.findFirst({
      where: { id: sessionId, startupId: { in: startupIds } },
    });
    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.mentorSession.delete({ where: { id: sessionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
