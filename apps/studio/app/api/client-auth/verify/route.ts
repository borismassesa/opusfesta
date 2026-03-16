import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, verifyMagicLinkToken, setSessionCookie } from '@/lib/client-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, token } = body;

    let result;

    if (token) {
      // Magic link token verification
      result = await verifyMagicLinkToken(token);
    } else if (email && code) {
      // OTP verification
      result = await verifyCode(email, code);
    } else {
      return NextResponse.json(
        { error: 'Provide email+code or token' },
        { status: 400 }
      );
    }

    if (!result.success || !result.sessionToken) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 401 }
      );
    }

    // Set session cookie
    await setSessionCookie(result.sessionToken);

    return NextResponse.json({
      success: true,
      client: {
        id: result.client!.id,
        email: result.client!.email,
        name: result.client!.name,
      },
    });
  } catch (error) {
    console.error('[CLIENT_AUTH] verify error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
