import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { checkBookingSlot } from '@/lib/booking-conflicts';
import { upsertClientFromBooking } from '@/lib/client-sync';
import {
  sendClientBookingConfirmation,
  sendAdminBookingNotification,
} from '@/lib/booking-emails';

// Public endpoint — creates a pending booking from the self-serve widget at
// /book. Separate from the admin POST at /api/admin/bookings so the public
// path can't set internal fields (status, assigned staff, internal notes,
// quoted amounts). Admin triages from the inbox/list after.
//
// Anti-abuse: the Zod schema caps string lengths, rejects obvious junk,
// and the server-side conflict check blocks overbooking. Rate limiting
// belongs in middleware and is a separate slice.

const PublicCreateSchema = z.object({
  client_name:        z.string().trim().min(1).max(200),
  client_email:       z.string().trim().email().max(320),
  client_phone:       z.string().trim().max(50).optional().nullable(),
  service_id:         z.string().uuid().optional().nullable(),
  service_name:       z.string().trim().max(200).optional().nullable(),
  booking_date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time:         z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  duration_minutes:   z.number().int().positive().max(1440).default(60),
  notes:              z.string().trim().max(2000).optional().nullable(),
  // Honeypot — a hidden field in the form that real users never see or fill.
  // If a bot populates it, we silently drop the request.
  hp:                 z.string().optional().nullable(),
});

const BOOKING_SELECT = 'id, booking_date, start_time, duration_minutes, status, service_name, client_name';

export async function POST(request: Request) {
  try {
    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = PublicCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const input = parsed.data;

    // Silent honeypot trip — respond 200 so bots don't retry, but write nothing.
    if (input.hp && input.hp.trim() !== '') {
      return NextResponse.json({ ok: true, hp: true });
    }

    const sb = getStudioSupabaseAdmin();

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

    const clientId = await upsertClientFromBooking(sb, {
      email: input.client_email,
      name: input.client_name,
      phone: input.client_phone ?? null,
      actorUserId: null, // public booking — no admin user
    });

    const { data, error } = await sb
      .from('studio_bookings')
      .insert({
        client_id:        clientId,
        client_name:      input.client_name,
        client_email:     input.client_email,
        client_phone:     input.client_phone ?? null,
        service_id:       input.service_id ?? null,
        service_name:     input.service_name ?? null,
        booking_date:     input.booking_date,
        start_time:       input.start_time,
        duration_minutes: input.duration_minutes,
        status:           'pending',
        notes:            input.notes ?? null,
        created_by:       null,
        updated_by:       null,
      })
      .select(BOOKING_SELECT)
      .single();

    if (error) {
      console.error('[public bookings] insert failed', error);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // Fire confirmation emails. Both soft-fail so the booking still saves
    // even if Resend is down. Awaited in parallel to keep response fast.
    const adminEmail = process.env.BOOKING_NOTIFICATION_EMAIL || process.env.RESEND_FROM_EMAIL;
    const emailInput = {
      id: data.id as string,
      client_name: input.client_name,
      client_email: input.client_email,
      client_phone: input.client_phone ?? null,
      service_name: input.service_name ?? null,
      booking_date: input.booking_date,
      start_time: input.start_time,
      duration_minutes: input.duration_minutes,
      quoted_amount_tzs: null,
      notes: input.notes ?? null,
    };
    await Promise.allSettled([
      sendClientBookingConfirmation(emailInput),
      adminEmail
        ? sendAdminBookingNotification(emailInput, adminEmail.replace(/^.*<|>.*$/g, '').trim())
        : Promise.resolve(),
    ]);

    // Return a minimal confirmation — never leak internal fields, deposits,
    // or internal notes.
    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (e) {
    console.error('[public bookings] unexpected', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
