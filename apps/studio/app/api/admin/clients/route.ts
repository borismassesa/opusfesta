import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// ─── GET /api/admin/clients ──────────────────────────────────────────────
// Optional:
//   ?search=<term>  — matches name or email (case-insensitive, partial)
//   ?tag=<label>    — filters clients that carry the given tag
//   ?limit=<n>      — default 100, max 500
//
// Response rows include denormalised booking stats computed via a joined
// query so the list can show "X bookings · last on …" at a glance.
export async function GET(request: Request) {
  try {
    await requireStudioRole('studio_viewer');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() ?? '';
    const tag = searchParams.get('tag')?.trim() ?? '';
    const limit = Math.min(Number(searchParams.get('limit') ?? '100'), 500);

    const sb = getStudioSupabaseAdmin();
    let query = sb
      .from('studio_clients')
      .select('id, name, email, phone, notes, tags, created_at, updated_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (search) {
      const like = `%${search.replace(/%/g, '')}%`;
      query = query.or(`name.ilike.${like},email.ilike.${like}`);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: clients, error } = await query;
    if (error) {
      console.error('[clients] list failed', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    // Pull booking stats for visible clients in a single round trip.
    const ids = (clients ?? []).map((c) => c.id);
    const statsMap = new Map<string, { total_bookings: number; last_booking_at: string | null; total_quoted_tzs: number }>();

    if (ids.length > 0) {
      const { data: bookings } = await sb
        .from('studio_bookings')
        .select('client_id, booking_date, quoted_amount_tzs, status')
        .in('client_id', ids)
        .is('deleted_at', null);

      for (const b of bookings ?? []) {
        if (!b.client_id) continue;
        const prev = statsMap.get(b.client_id as string);
        const amount = (b.quoted_amount_tzs as number | null) ?? 0;
        if (!prev) {
          statsMap.set(b.client_id as string, {
            total_bookings: 1,
            last_booking_at: b.booking_date as string,
            total_quoted_tzs: amount,
          });
        } else {
          prev.total_bookings += 1;
          prev.total_quoted_tzs += amount;
          if (!prev.last_booking_at || (b.booking_date as string) > prev.last_booking_at) {
            prev.last_booking_at = b.booking_date as string;
          }
        }
      }
    }

    const enriched = (clients ?? []).map((c) => ({
      ...c,
      total_bookings: statsMap.get(c.id)?.total_bookings ?? 0,
      last_booking_at: statsMap.get(c.id)?.last_booking_at ?? null,
      total_quoted_tzs: statsMap.get(c.id)?.total_quoted_tzs ?? 0,
    }));

    return NextResponse.json({ clients: enriched });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[clients] GET unexpected', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
