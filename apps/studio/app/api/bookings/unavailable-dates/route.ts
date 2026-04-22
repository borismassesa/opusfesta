import { NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { computeUnavailableDates } from '@/lib/booking-slots';

// Public — the booking widget calls this to grey-out dates in its calendar.
// Returns only hard-blocked dates (closed weekdays + blackouts). "Fully
// booked" days are NOT returned; they surface as empty slot lists in the
// slots endpoint so the UI can say "no times left" without leaking booking
// counts.
//
// Query: ?month=YYYY-MM  (defaults to the current month in server TZ)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');

    let year: number;
    let monthIndex: number;
    if (monthParam) {
      if (!/^\d{4}-\d{2}$/.test(monthParam)) {
        return NextResponse.json({ error: 'month must be YYYY-MM' }, { status: 400 });
      }
      const [y, m] = monthParam.split('-').map(Number);
      year = y;
      monthIndex = m - 1;
      if (monthIndex < 0 || monthIndex > 11) {
        return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
      }
    } else {
      const now = new Date();
      year = now.getFullYear();
      monthIndex = now.getMonth();
    }

    const sb = getStudioSupabaseAdmin();
    const dates = await computeUnavailableDates(sb, year, monthIndex);

    return NextResponse.json(
      { dates },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (e) {
    console.error('[public unavailable-dates] failed', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
