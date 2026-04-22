import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

const SELECT = 'id, start_date, end_date, reason, created_at, updated_at, created_by, updated_by';

const CreateSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason:     z.string().trim().min(1).max(200),
});

// ─── GET /api/admin/blackouts ────────────────────────────────────────────
// Optional ?date_from and ?date_to narrow results to blackouts that overlap
// the given range. Without params, returns all upcoming + active blackouts.
export async function GET(request: Request) {
  try {
    await requireStudioRole('studio_viewer');

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    const sb = getStudioSupabaseAdmin();
    let query = sb
      .from('studio_blackouts')
      .select(SELECT)
      .order('start_date', { ascending: true });

    if (dateFrom) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
        return NextResponse.json({ error: 'date_from must be YYYY-MM-DD' }, { status: 400 });
      }
      query = query.gte('end_date', dateFrom);
    }
    if (dateTo) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        return NextResponse.json({ error: 'date_to must be YYYY-MM-DD' }, { status: 400 });
      }
      query = query.lte('start_date', dateTo);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[blackouts] list failed', error);
      return NextResponse.json({ error: 'Failed to load blackouts' }, { status: 500 });
    }
    return NextResponse.json({ blackouts: data ?? [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST /api/admin/blackouts ───────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { userId } = await requireStudioRole('studio_admin');

    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.end_date < parsed.data.start_date) {
      return NextResponse.json({ error: 'end_date must be on or after start_date' }, { status: 400 });
    }

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_blackouts')
      .insert({
        start_date: parsed.data.start_date,
        end_date:   parsed.data.end_date,
        reason:     parsed.data.reason,
        created_by: userId,
        updated_by: userId,
      })
      .select(SELECT)
      .single();

    if (error) {
      console.error('[blackouts] insert failed', error);
      return NextResponse.json({ error: 'Failed to create blackout' }, { status: 500 });
    }

    return NextResponse.json({ blackout: data }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
