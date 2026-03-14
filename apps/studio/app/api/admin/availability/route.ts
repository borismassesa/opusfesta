import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

const ALL_DAY_SLOT = 'all-day';

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isMonthKey(value: string) {
  return /^\d{4}-\d{2}$/.test(value);
}

function normalizeTimeSlot(slot?: string | null) {
  if (!slot || slot === ALL_DAY_SLOT) return ALL_DAY_SLOT;
  return /^\d{2}:\d{2}$/.test(slot) ? slot : null;
}

export async function GET(req: NextRequest) {
  try {
    await requireStudioRole('studio_viewer');
    const month = new URL(req.url).searchParams.get('month');
    if (!month || !isMonthKey(month)) {
      return NextResponse.json({ error: 'month parameter required (YYYY-MM)' }, { status: 400 });
    }

    const [year, monthNumber] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNumber, 1));
    const start = startDate.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);

    const { data, error } = await getStudioSupabaseAdmin()
      .from('studio_availability')
      .select('*')
      .gte('date', start)
      .lt('date', end)
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ availability: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_editor');
    const payload = await req.json();
    if (!Array.isArray(payload)) {
      return NextResponse.json({ error: 'Expected an array payload' }, { status: 400 });
    }

    const items = payload.map((item) => ({
      date: typeof item?.date === 'string' ? item.date : '',
      time_slot: normalizeTimeSlot(typeof item?.time_slot === 'string' ? item.time_slot : undefined),
      is_available: Boolean(item?.is_available),
      note: typeof item?.note === 'string' ? item.note : null,
    }));

    const hasInvalidItem = items.some((item) => !isIsoDate(item.date) || !item.time_slot);
    if (hasInvalidItem) {
      return NextResponse.json({ error: 'Invalid date or time_slot in payload' }, { status: 400 });
    }

    const db = getStudioSupabaseAdmin();
    const { error } = await db.from('studio_availability').upsert(
      items.map((item) => ({
        date: item.date,
        time_slot: item.time_slot,
        is_available: item.is_available,
        note: item.note || null,
      })),
      { onConflict: 'date,time_slot' }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
