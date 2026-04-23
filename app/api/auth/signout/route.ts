import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ success: true });

    // Clear the token cookie
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signout' },
      { status: 500 }
    );
  }
}
