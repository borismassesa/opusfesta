import { NextRequest, NextResponse } from 'next/server';
import { getPortalClient } from '@/lib/portal-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getStudioSupabaseAdmin();

  // Fetch booking with ownership check (match by client_id or email)
  const { data: booking, error } = await db
    .from('studio_bookings')
    .select(`
      id, name, email, event_type, event_date, event_time_slot, service, location,
      lifecycle_status, status, guest_count, total_amount_tzs, deposit_amount_tzs,
      balance_due_tzs, balance_due_date, currency, reschedule_count,
      created_at, confirmed_at, completed_at, cancelled_at, cancellation_reason
    `)
    .eq('id', id)
    .or(`client_id.eq.${client.id},email.ilike.${client.email}`)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Fetch related data in parallel
  const [quotesRes, contractsRes, paymentsRes, eventsRes] = await Promise.all([
    db.from('studio_quotes')
      .select('id, quote_number, total_tzs, deposit_amount_tzs, deposit_percent, valid_until, sent_at, accepted_at, rejected_at, expired_at, notes')
      .eq('booking_id', id)
      .order('created_at', { ascending: false }),
    db.from('studio_contracts')
      .select('id, contract_number, sent_at, sign_deadline, signed_at')
      .eq('booking_id', id)
      .order('created_at', { ascending: false }),
    db.from('studio_payments')
      .select('id, payment_type, amount_tzs, provider, receipt_url, paid_at')
      .eq('booking_id', id)
      .order('paid_at', { ascending: false }),
    db.from('studio_booking_events')
      .select('id, event_type, from_status, to_status, description, created_at')
      .eq('booking_id', id)
      .order('created_at', { ascending: true }),
  ]);

  return NextResponse.json({
    booking,
    quotes: quotesRes.data || [],
    contracts: contractsRes.data || [],
    payments: paymentsRes.data || [],
    timeline: eventsRes.data || [],
  });
}
