import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { checkBookingSlot } from '@/lib/booking-conflicts';
import { upsertClientFromBooking } from '@/lib/client-sync';

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------
const VALID_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;
type BookingStatus = typeof VALID_STATUSES[number];

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

// Zod schema for POST.
// Accepts HH:MM or HH:MM:SS; date is YYYY-MM-DD.
const CreateBookingSchema = z.object({
  client_name:          z.string().trim().min(1).max(200),
  client_email:         z.string().trim().email().max(320),
  client_phone:         z.string().trim().max(50).optional().nullable(),
  service_id:           z.string().uuid().optional().nullable(),
  service_name:         z.string().trim().max(200).optional().nullable(),
  booking_date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time:           z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  duration_minutes:     z.number().int().positive().max(1440).default(60),
  status:               z.enum(VALID_STATUSES).default('pending'),
  quoted_amount_tzs:    z.number().int().nonnegative().optional().nullable(),
  deposit_amount_tzs:   z.number().int().nonnegative().optional().nullable(),
  deposit_paid:         z.boolean().default(false),
  location:             z.string().trim().max(500).optional().nullable(),
  notes:                z.string().trim().max(5000).optional().nullable(),
  internal_notes:       z.string().trim().max(5000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET /api/admin/bookings
//   ?status=pending|confirmed|...
//   ?date_from=YYYY-MM-DD   (inclusive)
//   ?date_to=YYYY-MM-DD     (inclusive)
//   ?limit=100              (capped at 500)
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    await requireStudioRole('studio_viewer');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limit = Math.min(Number(searchParams.get('limit') ?? '100'), 500);

    const sb = getStudioSupabaseAdmin();
    let query = sb
      .from('studio_bookings')
      .select(BOOKING_SELECT)
      .is('deleted_at', null)
      .order('booking_date', { ascending: true })
      .order('start_time',   { ascending: true })
      .limit(limit);

    if (status) {
      if (!VALID_STATUSES.includes(status as BookingStatus)) {
        return NextResponse.json(
          { error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      query = query.eq('status', status);
    }
    if (dateFrom) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
        return NextResponse.json({ error: 'date_from must be YYYY-MM-DD' }, { status: 400 });
      }
      query = query.gte('booking_date', dateFrom);
    }
    if (dateTo) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        return NextResponse.json({ error: 'date_to must be YYYY-MM-DD' }, { status: 400 });
      }
      query = query.lte('booking_date', dateTo);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[bookings] list query failed', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ bookings: data ?? [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[bookings] GET unexpected error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/bookings
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const { userId } = await requireStudioRole('studio_editor');

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = CreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const input = parsed.data;

    const now = new Date().toISOString();
    const sb = getStudioSupabaseAdmin();

    // Auto-create or link a client record from the email.
    const clientId = await upsertClientFromBooking(sb, {
      email: input.client_email,
      name: input.client_name,
      phone: input.client_phone ?? null,
      actorUserId: userId,
    });

    // Slot availability — blocks the write when there's a conflict.
    // Cancelled/no_show bookings never need to pass the check.
    if (input.status !== 'cancelled' && input.status !== 'no_show') {
      const conflict = await checkBookingSlot(sb, {
        booking_date: input.booking_date,
        start_time: input.start_time,
        duration_minutes: input.duration_minutes,
      });
      if (conflict) {
        const status = conflict.code === 'internal' ? 500 : 409;
        return NextResponse.json(
          { error: conflict.message, code: conflict.code },
          { status }
        );
      }
    }
    const { data, error } = await sb
      .from('studio_bookings')
      .insert({
        client_id:          clientId,
        client_name:        input.client_name,
        client_email:       input.client_email,
        client_phone:       input.client_phone ?? null,
        service_id:         input.service_id ?? null,
        service_name:       input.service_name ?? null,
        booking_date:       input.booking_date,
        start_time:         input.start_time,
        duration_minutes:   input.duration_minutes,
        status:             input.status,
        quoted_amount_tzs:  input.quoted_amount_tzs ?? null,
        deposit_amount_tzs: input.deposit_amount_tzs ?? null,
        deposit_paid:       input.deposit_paid,
        location:           input.location ?? null,
        notes:              input.notes ?? null,
        internal_notes:     input.internal_notes ?? null,
        confirmed_at:       input.status === 'confirmed' ? now : null,
        created_by:         userId,
        updated_by:         userId,
      })
      .select(BOOKING_SELECT)
      .single();

    if (error) {
      console.error('[bookings] insert failed', error);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[bookings] POST unexpected error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
