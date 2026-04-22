import { NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { computeSlotsForDate } from '@/lib/booking-slots';

// Public — returns bookable start times for a given date + duration.
// Only returns slot start strings (HH:MM); never exposes existing booking
// details like client names or prices.
//
// Query:
//   ?date=YYYY-MM-DD  (required)
//   ?duration=60      (minutes, default 60)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const durationParam = searchParams.get('duration');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 });
    }
    const duration = durationParam ? Number(durationParam) : 60;
    if (!Number.isFinite(duration) || duration <= 0 || duration > 1440) {
      return NextResponse.json({ error: 'duration must be between 1 and 1440 minutes' }, { status: 400 });
    }

    const sb = getStudioSupabaseAdmin();
    const slots = await computeSlotsForDate(sb, {
      date,
      duration_minutes: duration,
      slot_step_minutes: 30,
    });

    return NextResponse.json(
      { date, duration, slots },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (e) {
    console.error('[public slots] failed', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
