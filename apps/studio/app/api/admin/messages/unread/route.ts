import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/messages/unread — returns total unread + per-booking counts
export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();

    const { data: rows } = await db
      .from('studio_messages')
      .select('booking_id')
      .eq('sender_type', 'client')
      .is('read_at', null);

    const byBooking: Record<string, number> = {};
    let total = 0;
    for (const row of rows || []) {
      if (row.booking_id) {
        byBooking[row.booking_id] = (byBooking[row.booking_id] || 0) + 1;
        total++;
      }
    }

    return NextResponse.json({ total, byBooking });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
