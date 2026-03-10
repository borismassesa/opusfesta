import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_articles').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ articles: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_editor');
    const body = await req.json();
    const { title, slug, excerpt, body_html, cover_image, category } = body;
    if (!title || !slug || !excerpt || !body_html || !cover_image || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const insert: Record<string, unknown> = {
      title, slug, excerpt, body_html, cover_image, category,
      author: body.author || 'OpusFesta Studio', is_published: body.is_published || false,
      seo_title: body.seo_title || null, seo_description: body.seo_description || null,
    };
    if (body.is_published && !body.published_at) insert.published_at = new Date().toISOString();
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_articles').insert(insert).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ article: data }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
