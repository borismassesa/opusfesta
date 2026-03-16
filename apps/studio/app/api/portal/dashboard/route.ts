import { NextResponse } from 'next/server';
import { getPortalClient } from '@/lib/portal-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/portal/dashboard — aggregated dashboard stats for the logged-in client
export async function GET() {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getStudioSupabaseAdmin();
  const normalizedEmail = client.email.toLowerCase().trim();

  // Fetch all bookings for this client (by client_id + email)
  const [byClientId, byEmail] = await Promise.all([
    db
      .from('studio_bookings')
      .select('id, event_type, event_date, event_time_slot, service, lifecycle_status, balance_due_tzs, total_amount_tzs, deposit_amount_tzs, created_at')
      .eq('client_id', client.id)
      .order('event_date', { ascending: true }),
    db
      .from('studio_bookings')
      .select('id, event_type, event_date, event_time_slot, service, lifecycle_status, balance_due_tzs, total_amount_tzs, deposit_amount_tzs, created_at')
      .ilike('email', normalizedEmail)
      .order('event_date', { ascending: true }),
  ]);

  // Merge and deduplicate
  const seen = new Set<string>();
  const allBookings: Record<string, unknown>[] = [];
  for (const b of [...(byClientId.data || []), ...(byEmail.data || [])]) {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      allBookings.push(b);
    }
  }

  // Active bookings (not completed or cancelled)
  const activeBookings = allBookings.filter(
    (b) => !['completed', 'cancelled'].includes(b.lifecycle_status as string)
  );

  // Outstanding balance (sum of balance_due_tzs across active bookings)
  const outstandingBalance = activeBookings.reduce((sum, b) => {
    return sum + (Number(b.balance_due_tzs) || 0);
  }, 0);

  // Total spent (sum of total_amount_tzs for completed bookings)
  const totalSpent = allBookings
    .filter((b) => b.lifecycle_status === 'completed')
    .reduce((sum, b) => sum + (Number(b.total_amount_tzs) || 0), 0);

  // Next upcoming event (earliest future event_date among active bookings)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const upcomingBookings = activeBookings
    .filter((b) => b.event_date && (b.event_date as string) >= todayStr)
    .sort((a, b) => (a.event_date as string).localeCompare(b.event_date as string));

  const nextEvent = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  // Pending actions — bookings that need client action
  const ACTION_STATUSES = ['quote_sent', 'contract_sent', 'deposit_pending'];
  const pendingActions = activeBookings.filter((b) =>
    ACTION_STATUSES.includes(b.lifecycle_status as string)
  );

  // Unread messages count
  const bookingIds = allBookings.map((b) => b.id as string);
  let unreadMessages = 0;

  if (bookingIds.length > 0) {
    const { count } = await db
      .from('studio_messages')
      .select('id', { count: 'exact', head: true })
      .in('booking_id', bookingIds)
      .eq('sender_type', 'admin')
      .is('read_at', null);
    unreadMessages = count || 0;
  }

  return NextResponse.json({
    stats: {
      activeBookings: activeBookings.length,
      totalBookings: allBookings.length,
      unreadMessages,
      outstandingBalance,
      totalSpent,
    },
    nextEvent: nextEvent
      ? {
          id: nextEvent.id,
          event_type: nextEvent.event_type,
          event_date: nextEvent.event_date,
          event_time_slot: nextEvent.event_time_slot,
          service: nextEvent.service,
          lifecycle_status: nextEvent.lifecycle_status,
        }
      : null,
    pendingActions: pendingActions.map((b) => ({
      id: b.id,
      event_type: b.event_type,
      lifecycle_status: b.lifecycle_status,
      event_date: b.event_date,
    })),
  });
}
