import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_projects').select('*').order('sort_order');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ projects: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_editor');
    const body = await req.json();
    const { title, slug, category, number, description, full_description, cover_image } = body;
    if (!title || !slug || !category || !number || !description || !full_description || !cover_image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_projects').insert({
      title, slug, category, number, description, full_description, cover_image,
      video_url: body.video_url || null, gallery_images: body.gallery_images || [],
      stats: body.stats || [], highlights: body.highlights || [],
      is_published: body.is_published || false, sort_order: body.sort_order || 0,
      seo_title: body.seo_title || null, seo_description: body.seo_description || null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ project: data }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
