import { NextRequest, NextResponse } from 'next/server';
import { getClientFromRequest, destroySession, clearSessionCookie } from '@/lib/client-auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getClientFromRequest(req);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      client: session.client,
    });
  } catch (error) {
    console.error('[CLIENT_AUTH] session GET error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('of_client_session')?.value;

    if (sessionToken) {
      await destroySession(sessionToken);
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CLIENT_AUTH] session DELETE error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
