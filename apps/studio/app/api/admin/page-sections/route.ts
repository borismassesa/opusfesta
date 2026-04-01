import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// ─── GET: fetch all sections for a page (admin view) ───────────────
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

// ─── POST: save section as draft (does NOT publish) ────────────────
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
        { page_key, section_key, draft_content: content, sort_order: sort_order ?? 0 },
        { onConflict: 'page_key,section_key' }
      )
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // No revalidatePath — drafts do not affect the public site
    return NextResponse.json({ section: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PATCH: publish draft(s) → copies draft_content to content ─────
export async function PATCH(req: NextRequest) {
  try {
    await requireStudioRole('studio_admin');
    const { page_key, section_key, publish_all } = await req.json();
    if (!page_key) {
      return NextResponse.json({ error: 'page_key required' }, { status: 400 });
    }

    const sb = getStudioSupabaseAdmin();

    if (publish_all) {
      // Publish every section on this page that has a pending draft
      const { data: drafts, error: fetchErr } = await sb
        .from('studio_page_sections')
        .select('id, draft_content')
        .eq('page_key', page_key)
        .not('draft_content', 'is', null);

      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

      if (!drafts || drafts.length === 0) {
        return NextResponse.json({ published: true, count: 0 });
      }

      for (const row of drafts) {
        const { error: updateErr } = await sb
          .from('studio_page_sections')
          .update({ content: row.draft_content, draft_content: null })
          .eq('id', row.id);
        if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      revalidatePath('/', 'layout');
      return NextResponse.json({ published: true, count: drafts.length });
    }

    if (section_key) {
      // Publish a single section
      const { data: row, error: fetchErr } = await sb
        .from('studio_page_sections')
        .select('id, draft_content')
        .eq('page_key', page_key)
        .eq('section_key', section_key)
        .not('draft_content', 'is', null)
        .maybeSingle();

      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

      if (!row) {
        return NextResponse.json({ published: true, message: 'No draft to publish' });
      }

      const { error: updateErr } = await sb
        .from('studio_page_sections')
        .update({ content: row.draft_content, draft_content: null })
        .eq('id', row.id);

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

      revalidatePath('/', 'layout');
      return NextResponse.json({ published: true });
    }

    return NextResponse.json({ error: 'section_key or publish_all required' }, { status: 400 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
