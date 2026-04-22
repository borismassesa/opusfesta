import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { checkBookingSlot } from '@/lib/booking-conflicts';

type RouteContext = { params: Promise<{ id: string }> };

const VALID_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;

const BOOKING_SELECT = [
  'id',
  'client_name', 'client_email', 'client_phone',
  'service_id', 'service_name',
  'booking_date', 'start_time', 'duration_minutes',
  'status',
  'quoted_amount_tzs', 'deposit_amount_tzs', 'deposit_paid',
  'location', 'notes', 'internal_notes',
  'confirmed_at', 'completed_at', 'cancelled_at', 'cancellation_reason',
  'created_at', 'updated_at', 'created_by', 'updated_by',
].join(', ');

// Every field optional; status transitions auto-populate matching timestamps.
const UpdateBookingSchema = z.object({
  client_name:          z.string().trim().min(1).max(200).optional(),
  client_email:         z.string().trim().email().max(320).optional(),
  client_phone:         z.string().trim().max(50).nullable().optional(),
  service_id:           z.string().uuid().nullable().optional(),
  service_name:         z.string().trim().max(200).nullable().optional(),
  booking_date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time:           z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  duration_minutes:     z.number().int().positive().max(1440).optional(),
  status:               z.enum(VALID_STATUSES).optional(),
  quoted_amount_tzs:    z.number().int().nonnegative().nullable().optional(),
  deposit_amount_tzs:   z.number().int().nonnegative().nullable().optional(),
  deposit_paid:         z.boolean().optional(),
  location:             z.string().trim().max(500).nullable().optional(),
  notes:                z.string().trim().max(5000).nullable().optional(),
  internal_notes:       z.string().trim().max(5000).nullable().optional(),
  cancellation_reason:  z.string().trim().max(500).nullable().optional(),
});

// ---------------------------------------------------------------------------
// GET /api/admin/bookings/[id]
// ---------------------------------------------------------------------------
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_bookings')
      .select(BOOKING_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('[bookings] get failed', error);
      return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ booking: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/bookings/[id]
// ---------------------------------------------------------------------------
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = UpdateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const input = parsed.data;

    // Only write keys the caller actually included. Avoids clobbering
    // untouched fields with undefined/nulls.
    const patch: Record<string, unknown> = { updated_by: userId };
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined) patch[k] = v;
    }

    // Auto-stamp lifecycle timestamps on status transitions.
    if (input.status) {
      const now = new Date().toISOString();
      if (input.status === 'confirmed') patch.confirmed_at = now;
      if (input.status === 'completed') patch.completed_at = now;
      if (input.status === 'cancelled') patch.cancelled_at = now;
    }

    const sb = getStudioSupabaseAdmin();

    // If this edit changes schedule/duration or the status moves back into
    // a "blocking" state, re-run the conflict check. Skip when moving to
    // cancelled/no_show since those free the slot.
    const touchesSchedule = input.booking_date !== undefined ||
                            input.start_time   !== undefined ||
                            input.duration_minutes !== undefined ||
                            input.status !== undefined;
    const willBlock = input.status !== 'cancelled' && input.status !== 'no_show';

    if (touchesSchedule && willBlock) {
      // Load the existing row so we can fall back to its values for any
      // fields the caller didn't send.
      const { data: current, error: curErr } = await sb
        .from('studio_bookings')
        .select('booking_date, start_time, duration_minutes, status')
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle();
      if (curErr) {
        console.error('[bookings] load for conflict check failed', curErr);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
      }
      if (!current) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const conflict = await checkBookingSlot(sb, {
        booking_date:     (input.booking_date     ?? current.booking_date)     as string,
        start_time:       (input.start_time       ?? current.start_time)       as string,
        duration_minutes: (input.duration_minutes ?? current.duration_minutes) as number,
        excludeBookingId: id,
      });
      if (conflict) {
        const statusCode = conflict.code === 'internal' ? 500 : 409;
        return NextResponse.json(
          { error: conflict.message, code: conflict.code },
          { status: statusCode }
        );
      }
    }

    const { data, error } = await sb
      .from('studio_bookings')
      .update(patch)
      .eq('id', id)
      .is('deleted_at', null)
      .select(BOOKING_SELECT)
      .maybeSingle();

    if (error) {
      console.error('[bookings] update failed', error);
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ booking: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[bookings] PATCH unexpected error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/bookings/[id]  — soft delete
// ---------------------------------------------------------------------------
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await requireStudioRole('studio_editor');
    const { id } = await params;

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_bookings')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[bookings] delete failed', error);
      return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
