import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_messages').select('*').eq('booking_id', id).order('created_at', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { content, sender = 'admin' } = await req.json();
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_messages').insert({ booking_id: id, content, sender }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
