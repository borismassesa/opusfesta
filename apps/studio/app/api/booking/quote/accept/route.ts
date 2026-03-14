import { NextRequest, NextResponse } from 'next/server';
import { validateClientToken } from '@/lib/booking-tokens';
import { acceptQuote } from '@/lib/booking-service';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const validated = validateClientToken(token);
    if (!validated.valid) {
      return NextResponse.json(
        { error: validated.expired ? 'Token has expired' : 'Invalid token' },
        { status: 401 }
      );
    }

    if (validated.action !== 'accept_quote') {
      return NextResponse.json({ error: 'Invalid token action' }, { status: 400 });
    }

    // Get the latest pending quote for this booking
    const db = getStudioSupabaseAdmin();
    const { data: quote } = await db
      .from('studio_quotes')
      .select('id')
      .eq('booking_id', validated.bookingId)
      .is('accepted_at', null)
      .is('rejected_at', null)
      .is('expired_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!quote) {
      return NextResponse.json({ error: 'No pending quote found' }, { status: 404 });
    }

    const booking = await acceptQuote(validated.bookingId, quote.id);
    return NextResponse.json({
      bookingId: booking.id,
      lifecycleStatus: booking.lifecycle_status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept quote' },
      { status: 500 }
    );
  }
}
