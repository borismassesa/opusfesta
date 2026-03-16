import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;
    const db = getStudioSupabaseAdmin();

    const { data, error } = await db
      .from('studio_messages')
      .select('*')
      .eq('booking_id', id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Only mark as read when explicitly requested (e.g. when admin opens the conversation)
    const markRead = req.nextUrl.searchParams.get('mark_read');
    if (markRead === 'true') {
      const now = new Date().toISOString();
      await db
        .from('studio_messages')
        .update({ read_at: now })
        .eq('booking_id', id)
        .eq('sender_type', 'client')
        .is('read_at', null)
        .lte('created_at', now);
    }

    return NextResponse.json({ messages: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_editor');
    const { id } = await params;
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const db = getStudioSupabaseAdmin();
    const { data, error } = await db
      .from('studio_messages')
      .insert({
        booking_id: id,
        content,
        sender: 'admin',
        sender_type: 'admin',
        sender_name: 'Studio Admin',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ message: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
