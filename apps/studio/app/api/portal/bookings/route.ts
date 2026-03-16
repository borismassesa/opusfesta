import { NextResponse } from 'next/server';
import { getPortalClient } from '@/lib/portal-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

const BOOKING_FIELDS = `
  id, name, email, event_type, event_date, event_time_slot, service, location,
  lifecycle_status, status, guest_count, total_amount_tzs, deposit_amount_tzs,
  balance_due_tzs, created_at, confirmed_at, completed_at, client_id
`;

export async function GET() {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getStudioSupabaseAdmin();
  const normalizedEmail = client.email.toLowerCase().trim();

  // Fetch bookings by client_id (linked) and by email (unlinked) separately
  // to avoid PostgREST .or() parsing issues with special characters in emails
  const [byClientId, byEmail] = await Promise.all([
    db
      .from('studio_bookings')
      .select(BOOKING_FIELDS)
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
    db
      .from('studio_bookings')
      .select(BOOKING_FIELDS)
      .ilike('email', normalizedEmail)
      .order('created_at', { ascending: false }),
  ]);

  if (byClientId.error) {
    console.error('[PORTAL] bookings by client_id error:', byClientId.error.message);
  }
  if (byEmail.error) {
    console.error('[PORTAL] bookings by email error:', byEmail.error.message);
  }

  // Merge and deduplicate (a booking matched by both client_id AND email)
  const seen = new Set<string>();
  const allBookings: Record<string, unknown>[] = [];

  for (const b of [...(byClientId.data || []), ...(byEmail.data || [])]) {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      allBookings.push(b);
    }
  }

  // Sort by created_at descending
  allBookings.sort((a, b) =>
    new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
  );

  // Auto-link any bookings that match by email but don't have client_id set
  const unlinked = allBookings.filter(b => !b.client_id && (b.email as string)?.toLowerCase() === normalizedEmail);
  if (unlinked.length > 0) {
    const unlinkedIds = unlinked.map(b => b.id as string);
    await db
      .from('studio_bookings')
      .update({ client_id: client.id })
      .in('id', unlinkedIds);

    // Update local data to reflect the link
    for (const b of allBookings) {
      if (unlinkedIds.includes(b.id as string)) {
        b.client_id = client.id;
      }
    }
  }

  return NextResponse.json({ bookings: allBookings });
}
