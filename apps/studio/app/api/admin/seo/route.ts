import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try { await requireStudioRole('studio_viewer');
    const { data, error } = await getStudioSupabaseAdmin().from('studio_seo').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ seo: data || [] });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try { await requireStudioRole('studio_editor'); const body = await req.json();
    if (!body.page_key) return NextResponse.json({ error: 'page_key required' }, { status: 400 });
    const { data, error } = await getStudioSupabaseAdmin().from('studio_seo').upsert({
      page_key: body.page_key, title: body.title || null, description: body.description || null, og_image: body.og_image || null,
    }, { onConflict: 'page_key' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ seo: data });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
