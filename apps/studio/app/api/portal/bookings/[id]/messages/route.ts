import { NextRequest, NextResponse } from 'next/server';
import { getPortalClient } from '@/lib/portal-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getStudioSupabaseAdmin();

  // Verify booking ownership
  const { data: booking } = await db
    .from('studio_bookings')
    .select('id')
    .eq('id', id)
    .or(`client_id.eq.${client.id},email.ilike.${client.email}`)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Fetch all messages
  const { data: messages, error } = await db
    .from('studio_messages')
    .select('*')
    .eq('booking_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark admin messages as read (only ones created before this request)
  const now = new Date().toISOString();
  await db
    .from('studio_messages')
    .update({ read_at: now })
    .eq('booking_id', id)
    .eq('sender_type', 'admin')
    .is('read_at', null)
    .lte('created_at', now);

  return NextResponse.json({ messages: messages || [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getStudioSupabaseAdmin();

  // Verify booking ownership
  const { data: booking } = await db
    .from('studio_bookings')
    .select('id')
    .eq('id', id)
    .or(`client_id.eq.${client.id},email.ilike.${client.email}`)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const { content } = await req.json();
  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
  }

  const { data: message, error } = await db
    .from('studio_messages')
    .insert({
      booking_id: id,
      content: content.trim(),
      sender: 'client',
      sender_type: 'client',
      sender_name: client.name,
      sender_client_id: client.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message });
}
