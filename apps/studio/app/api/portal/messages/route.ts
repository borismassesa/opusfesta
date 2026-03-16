import { NextResponse } from 'next/server';
import { getPortalClient } from '@/lib/portal-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/portal/messages — returns unread counts + recent conversations
export async function GET() {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getStudioSupabaseAdmin();

  // Get all booking IDs belonging to this client
  const { data: bookings } = await db
    .from('studio_bookings')
    .select('id, event_type, service')
    .or(`client_id.eq.${client.id},email.ilike.${client.email}`);

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ unreadTotal: 0, conversations: [] });
  }

  const bookingIds = bookings.map(b => b.id);

  // Get unread counts (admin messages not yet read by client)
  const { data: unreadRows } = await db
    .from('studio_messages')
    .select('booking_id')
    .in('booking_id', bookingIds)
    .eq('sender_type', 'admin')
    .is('read_at', null);

  const unreadByBooking: Record<string, number> = {};
  let unreadTotal = 0;
  for (const row of unreadRows || []) {
    if (row.booking_id) {
      unreadByBooking[row.booking_id] = (unreadByBooking[row.booking_id] || 0) + 1;
      unreadTotal++;
    }
  }

  // Get the latest message per booking for conversation list
  const { data: allMessages } = await db
    .from('studio_messages')
    .select('booking_id, content, sender_type, sender_name, created_at')
    .in('booking_id', bookingIds)
    .order('created_at', { ascending: false });

  // Group: keep only the latest message per booking
  const latestByBooking: Record<string, { content: string; sender_type: string; sender_name: string | null; created_at: string }> = {};
  for (const msg of allMessages || []) {
    if (msg.booking_id && !latestByBooking[msg.booking_id]) {
      latestByBooking[msg.booking_id] = {
        content: msg.content,
        sender_type: msg.sender_type,
        sender_name: msg.sender_name,
        created_at: msg.created_at,
      };
    }
  }

  // Build conversation list (only bookings that have messages)
  const conversations = bookings
    .filter(b => latestByBooking[b.id])
    .map(b => ({
      booking_id: b.id,
      event_type: b.event_type,
      service: b.service,
      unread_count: unreadByBooking[b.id] || 0,
      last_message: latestByBooking[b.id],
    }))
    .sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());

  return NextResponse.json({ unreadTotal, unreadByBooking, conversations });
}
