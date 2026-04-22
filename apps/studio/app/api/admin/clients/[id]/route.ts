import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

type RouteContext = { params: Promise<{ id: string }> };

const CLIENT_SELECT = 'id, name, email, phone, notes, tags, created_at, updated_at';

const BOOKING_SELECT = [
  'id', 'booking_date', 'start_time', 'duration_minutes', 'status',
  'service_name', 'location', 'quoted_amount_tzs', 'deposit_amount_tzs',
  'deposit_paid', 'notes', 'created_at',
].join(', ');

const UpdateSchema = z.object({
  name:  z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  tags:  z.array(z.string().trim().min(1).max(60)).max(20).optional(),
});

// ─── GET /api/admin/clients/[id] ─────────────────────────────────────────
// Returns the client + a full booking history for quick recall.
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;

    const sb = getStudioSupabaseAdmin();
    const { data: client, error: clientErr } = await sb
      .from('studio_clients')
      .select(CLIENT_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (clientErr) {
      console.error('[clients] get failed', clientErr);
      return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
    }
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // All bookings for this client (active + past). Ordered most recent first.
    const { data: bookings } = await sb
      .from('studio_bookings')
      .select(BOOKING_SELECT)
      .eq('client_id', id)
      .is('deleted_at', null)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false });

    return NextResponse.json({ client, bookings: bookings ?? [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PATCH /api/admin/clients/[id] ───────────────────────────────────────
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { id } = await params;

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const input = parsed.data;

    const patch: Record<string, unknown> = { updated_by: userId };
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined) patch[k] = v;
    }

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_clients')
      .update(patch)
      .eq('id', id)
      .is('deleted_at', null)
      .select(CLIENT_SELECT)
      .maybeSingle();

    if (error) {
      // 23505 → unique violation on email.
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json({ error: 'Another client already uses that email' }, { status: 409 });
      }
      console.error('[clients] update failed', error);
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ client: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[clients] PATCH unexpected', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/clients/[id] ──────────────────────────────────────
// Soft delete. Booking rows keep their client_id FK but the client won't
// show in lists. Restoring is just a DB update to deleted_at = null.
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_admin');
    const { id } = await params;

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_clients')
      .update({ deleted_at: new Date().toISOString(), updated_by: userId })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[clients] delete failed', error);
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
