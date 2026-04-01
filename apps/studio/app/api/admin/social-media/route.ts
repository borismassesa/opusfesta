import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const { data, error } = await getStudioSupabaseAdmin()
      .from('studio_settings')
      .select('value')
      .eq('key', 'social_media_links')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine initially
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let links = [];
    if (data && data.value) {
      try {
        links = JSON.parse(data.value);
      } catch (e) {
        links = [];
      }
    }

    return NextResponse.json({ links });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_admin');
    const { links } = await req.json();

    if (!Array.isArray(links)) {
      return NextResponse.json({ error: 'Links must be an array' }, { status: 400 });
    }

    const { error } = await getStudioSupabaseAdmin()
      .from('studio_settings')
      .upsert({ key: 'social_media_links', value: JSON.stringify(links) }, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, links });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
