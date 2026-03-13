import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimeSlot(value: string) {
  return value === 'all-day' || /^\d{2}:\d{2}$/.test(value);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  try {
    await requireStudioRole('studio_editor');
    const { date } = await params;
    const decodedDate = decodeURIComponent(date);
    if (!isIsoDate(decodedDate)) {
      return NextResponse.json({ error: 'Invalid date. Expected YYYY-MM-DD' }, { status: 400 });
    }

    const time = _req.nextUrl.searchParams.get('time');
    if (time && !isValidTimeSlot(time)) {
      return NextResponse.json({ error: 'Invalid time slot. Expected HH:MM or all-day' }, { status: 400 });
    }

    let query = getStudioSupabaseAdmin().from('studio_availability').delete().eq('date', decodedDate);
    if (time) {
      query = query.eq('time_slot', time);
    }

    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
