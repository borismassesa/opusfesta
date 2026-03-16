import { NextRequest, NextResponse } from 'next/server';
import { sendMagicLink } from '@/lib/client-auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const result = await sendMagicLink(email);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CLIENT_AUTH] send-code error:', error);
    return NextResponse.json(
      { error: 'Failed to send code' },
      { status: 500 }
    );
  }
}
