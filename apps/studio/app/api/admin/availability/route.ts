import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

const SELECT = 'weekday, is_open, open_time, close_time, updated_at, updated_by';

const WeekdayPatchSchema = z.object({
  weekday:    z.number().int().min(0).max(6),
  is_open:    z.boolean().optional(),
  open_time:  z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  close_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
});

const BulkPatchSchema = z.object({
  weekdays: z.array(WeekdayPatchSchema).min(1).max(7),
});

// ─── GET /api/admin/availability ─────────────────────────────────────────
export async function GET() {
  try {
    await requireStudioRole('studio_viewer');

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_availability')
      .select(SELECT)
      .order('weekday', { ascending: true });

    if (error) {
      console.error('[availability] list failed', error);
      return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
    }
    return NextResponse.json({ weekdays: data ?? [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PATCH /api/admin/availability ───────────────────────────────────────
// Bulk-update one or more weekday rules in a single request. The admin UI
// lets users edit all 7 rows and save together; this matches that shape.
export async function PATCH(request: Request) {
  try {
    const { userId } = await requireStudioRole('studio_admin');

    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const parsed = BulkPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Cross-field check: if both open and close are being set, open must
    // be before close. Matches the DB CHECK constraint.
    for (const w of parsed.data.weekdays) {
      if (w.open_time && w.close_time && w.open_time >= w.close_time) {
        return NextResponse.json(
          { error: `Weekday ${w.weekday}: open_time must be before close_time` },
          { status: 400 }
        );
      }
    }

    const sb = getStudioSupabaseAdmin();

    // Upsert-style: update only the fields the caller supplied per row.
    for (const w of parsed.data.weekdays) {
      const patch: Record<string, unknown> = { updated_by: userId };
      if (w.is_open    !== undefined) patch.is_open    = w.is_open;
      if (w.open_time  !== undefined) patch.open_time  = w.open_time;
      if (w.close_time !== undefined) patch.close_time = w.close_time;

      const { error } = await sb
        .from('studio_availability')
        .update(patch)
        .eq('weekday', w.weekday);

      if (error) {
        console.error('[availability] update failed', { weekday: w.weekday, error });
        return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 });
      }
    }

    const { data, error: refreshError } = await sb
      .from('studio_availability')
      .select(SELECT)
      .order('weekday', { ascending: true });

    if (refreshError) {
      return NextResponse.json({ error: 'Saved but failed to refresh' }, { status: 500 });
    }

    return NextResponse.json({ weekdays: data ?? [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[availability] PATCH unexpected', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
