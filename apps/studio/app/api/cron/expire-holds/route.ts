import { NextRequest, NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getStudioSupabaseAdmin();
  const now = new Date().toISOString();
  const results: Record<string, number> = {};

  // 1. Expire slot holds past expires_at
  const { data: expiredHolds } = await db
    .from('studio_slot_holds')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('expires_at', now)
    .select('id');
  results.expired_holds = expiredHolds?.length || 0;

  // 2. Expire quotes past valid_until
  const { data: expiredQuotes } = await db
    .from('studio_quotes')
    .select('id, booking_id')
    .is('expired_at', null)
    .is('accepted_at', null)
    .is('rejected_at', null)
    .lt('valid_until', now);

  if (expiredQuotes && expiredQuotes.length > 0) {
    for (const quote of expiredQuotes) {
      await db
        .from('studio_quotes')
        .update({ expired_at: now })
        .eq('id', quote.id);

      // Check if booking is still in quote_sent — if so, cancel it
      const { data: booking } = await db
        .from('studio_bookings')
        .select('id, lifecycle_status')
        .eq('id', quote.booking_id)
        .eq('lifecycle_status', 'quote_sent')
        .single();

      if (booking) {
        await db
          .from('studio_bookings')
          .update({
            lifecycle_status: 'cancelled',
            cancellation_reason: 'Quote expired without response',
            cancelled_at: now,
          })
          .eq('id', booking.id);

        await db.from('studio_booking_events').insert({
          booking_id: booking.id,
          event_type: 'status_change',
          from_status: 'quote_sent',
          to_status: 'cancelled',
          actor_type: 'system',
          metadata: { reason: 'Quote expired' },
        });
      }
    }
    results.expired_quotes = expiredQuotes.length;
  } else {
    results.expired_quotes = 0;
  }

  // 3. Find unsigned contracts past sign_deadline
  const { data: expiredContracts } = await db
    .from('studio_contracts')
    .select('id, booking_id')
    .is('signed_at', null)
    .is('voided_at', null)
    .lt('sign_deadline', now);

  if (expiredContracts && expiredContracts.length > 0) {
    for (const contract of expiredContracts) {
      await db
        .from('studio_contracts')
        .update({ voided_at: now })
        .eq('id', contract.id);

      const { data: booking } = await db
        .from('studio_bookings')
        .select('id, lifecycle_status')
        .eq('id', contract.booking_id)
        .eq('lifecycle_status', 'contract_sent')
        .single();

      if (booking) {
        await db
          .from('studio_bookings')
          .update({
            lifecycle_status: 'cancelled',
            cancellation_reason: 'Contract expired unsigned',
            cancelled_at: now,
          })
          .eq('id', booking.id);

        await db.from('studio_booking_events').insert({
          booking_id: booking.id,
          event_type: 'status_change',
          from_status: 'contract_sent',
          to_status: 'cancelled',
          actor_type: 'system',
          metadata: { reason: 'Contract sign deadline expired' },
        });
      }
    }
    results.expired_contracts = expiredContracts.length;
  } else {
    results.expired_contracts = 0;
  }

  // 4. Expire deposit_pending bookings after 24 hours with no payment
  const depositDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: expiredDeposits } = await db
    .from('studio_bookings')
    .select('id')
    .eq('lifecycle_status', 'deposit_pending')
    .lt('updated_at', depositDeadline);

  if (expiredDeposits && expiredDeposits.length > 0) {
    for (const booking of expiredDeposits) {
      // Check if any payment was made
      const { count } = await db
        .from('studio_payments')
        .select('id', { count: 'exact', head: true })
        .eq('booking_id', booking.id);

      if (!count || count === 0) {
        await db
          .from('studio_bookings')
          .update({
            lifecycle_status: 'cancelled',
            cancellation_reason: 'Deposit not received within 24 hours',
            cancelled_at: now,
          })
          .eq('id', booking.id);

        await db.from('studio_booking_events').insert({
          booking_id: booking.id,
          event_type: 'status_change',
          from_status: 'deposit_pending',
          to_status: 'cancelled',
          actor_type: 'system',
          metadata: { reason: 'Deposit deadline expired' },
        });
      }
    }
    results.expired_deposits = expiredDeposits.length;
  } else {
    results.expired_deposits = 0;
  }

  return NextResponse.json({ ok: true, results });
}
