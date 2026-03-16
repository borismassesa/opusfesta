import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/messages/conversations
// Returns all bookings that have messages, with latest message + unread count
export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();

    // 1. Get all messages grouped info
    const { data: allMessages } = await db
      .from('studio_messages')
      .select('booking_id, content, sender_type, sender_name, read_at, created_at')
      .order('created_at', { ascending: false });

    if (!allMessages || allMessages.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Build per-booking data: latest message, unread count, total count
    const bookingMap: Record<string, {
      latest: { content: string; sender_type: string; sender_name: string | null; created_at: string };
      unread_count: number;
      message_count: number;
    }> = {};

    for (const msg of allMessages) {
      const bid = msg.booking_id;
      if (!bid) continue;

      if (!bookingMap[bid]) {
        bookingMap[bid] = {
          latest: { content: msg.content, sender_type: msg.sender_type, sender_name: msg.sender_name, created_at: msg.created_at },
          unread_count: 0,
          message_count: 0,
        };
      }
      bookingMap[bid].message_count++;
      if (msg.sender_type === 'client' && !msg.read_at) {
        bookingMap[bid].unread_count++;
      }
    }

    const bookingIds = Object.keys(bookingMap);
    if (bookingIds.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // 2. Fetch booking details for those IDs
    const { data: bookings } = await db
      .from('studio_bookings')
      .select('id, name, email, event_type, lifecycle_status, status')
      .in('id', bookingIds);

    const bookingLookup: Record<string, { name: string; email: string; event_type: string; lifecycle_status: string; status: string }> = {};
    for (const b of bookings || []) {
      bookingLookup[b.id] = b;
    }

    // 3. Build sorted conversations list
    const conversations = bookingIds
      .filter(bid => bookingLookup[bid])
      .map(bid => ({
        booking_id: bid,
        client_name: bookingLookup[bid].name,
        client_email: bookingLookup[bid].email,
        event_type: bookingLookup[bid].event_type,
        lifecycle_status: bookingLookup[bid].lifecycle_status || bookingLookup[bid].status,
        unread_count: bookingMap[bid].unread_count,
        message_count: bookingMap[bid].message_count,
        last_message: bookingMap[bid].latest,
      }))
      // Sort: unread first, then by latest message time
      .sort((a, b) => {
        if (a.unread_count > 0 && b.unread_count === 0) return -1;
        if (b.unread_count > 0 && a.unread_count === 0) return 1;
        return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
      });

    return NextResponse.json({ conversations });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
