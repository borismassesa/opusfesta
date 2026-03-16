import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    await requireStudioRole('studio_admin');
    const pageKey = req.nextUrl.searchParams.get('page') || 'home';
    const { data, error } = await getStudioSupabaseAdmin()
      .from('studio_page_sections')
      .select('*')
      .eq('page_key', pageKey)
      .order('sort_order', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sections: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_admin');
    const { page_key, section_key, content, sort_order } = await req.json();
    if (!page_key || !section_key) {
      return NextResponse.json({ error: 'page_key and section_key required' }, { status: 400 });
    }
    const { data, error } = await getStudioSupabaseAdmin()
      .from('studio_page_sections')
      .upsert(
        { page_key, section_key, content, sort_order: sort_order ?? 0 },
        { onConflict: 'page_key,section_key' }
      )
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ section: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
