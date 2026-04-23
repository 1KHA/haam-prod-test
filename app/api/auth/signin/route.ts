import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken, UserRole } from '@/lib/auth';
import { notifyLoginFailed } from '@/lib/services/notification-events';
import { EmailService } from '@/lib/services/email-service';

export const dynamic = 'force-dynamic';
// In-memory store for failed login attempts (use Redis in production)
const failedAttempts = new Map<string, { count: number; lastAttempt: Date; notified: boolean }>();
const MAX_ATTEMPTS = 3;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Clean up old entries periodically
setInterval(() => {
  const now = new Date();
  Array.from(failedAttempts.entries()).forEach(([email, data]) => {
    if (now.getTime() - data.lastAttempt.getTime() > ATTEMPT_WINDOW_MS) {
      failedAttempts.delete(email);
    }
  });
}, 60 * 1000); // Clean every minute

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Track failed attempt (TASK-02)
      const now = new Date();
      const currentAttempt = failedAttempts.get(email) || { count: 0, lastAttempt: now, notified: false };
      currentAttempt.count++;
      currentAttempt.lastAttempt = now;
      failedAttempts.set(email, currentAttempt);
      
      // Notify after 3 failed attempts
      if (currentAttempt.count >= MAX_ATTEMPTS && !currentAttempt.notified) {
        console.log(`[Signin] ${MAX_ATTEMPTS} failed attempts for ${email}, sending notification...`);
        try {
          await notifyLoginFailed({
            userId: user.id,
            email: user.email,
            attemptCount: currentAttempt.count,
            ipAddress: request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown',
            timestamp: now,
          });
          currentAttempt.notified = true;
          failedAttempts.set(email, currentAttempt);
          await EmailService.fireScenario('login_failed', [user.id], {
            user: { name: user.name, email: user.email },
            attemptCount: currentAttempt.count,
          });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (notifyError: any) {
          console.error('[Signin] Failed to send login failed notification:', notifyError.message);
        }
      }
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Clear failed attempts on successful login
    if (failedAttempts.has(email)) {
      failedAttempts.delete(email);
    }

    // Block non-active accounts
    if (user.approvalStatus === 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'حسابك قيد المراجعة من قبل المسؤول. سيتم إعلامك عند الموافقة على طلبك.' },
        { status: 403 }
      );
    }
    if (user.approvalStatus === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'تم تعليق حسابك. يرجى التواصل مع المسؤول.' },
        { status: 403 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set HTTP-only cookie with token
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signin' },
      { status: 500 }
    );
  }
}
