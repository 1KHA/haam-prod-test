import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

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

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
