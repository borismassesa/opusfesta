import { NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// Public endpoint — no auth required, used by the marketing site to render
// Studio Hours on /contact (and anywhere else that needs them). Uses the
// service role internally so RLS can remain service-role-only.
//
// Returns only the non-sensitive fields (weekday, is_open, open_time,
// close_time) — never user IDs or timestamps.

export async function GET() {
  try {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_availability')
      .select('weekday, is_open, open_time, close_time')
      .order('weekday', { ascending: true });

    if (error) {
      console.error('[public availability] failed', error);
      return NextResponse.json({ error: 'Failed to load hours' }, { status: 500 });
    }

    // Cache for 60s on the edge + allow stale-while-revalidate so a single
    // admin edit reflects on the public site within a minute without us
    // hammering the DB on every contact-page view.
    return NextResponse.json(
      { weekdays: data ?? [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (e) {
    console.error('[public availability] unexpected', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
