import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_articles').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ article: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_editor');
    const { id } = await params;
    const body = await req.json();
    if (body.is_published && !body.published_at) body.published_at = new Date().toISOString();
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_articles').update(body).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ article: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_admin');
    const { id } = await params;
    const db = getStudioSupabaseAdmin();
    const { error } = await db.from('studio_articles').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
