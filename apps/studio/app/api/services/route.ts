import { NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// Public — exposes published services for the booking widget and any other
// marketing surface that needs a lightweight catalogue. Only published
// fields are returned (title, description, price-as-string).

interface RawDoc {
  id: string;
  published_content: { title?: string; description?: string; price?: string; sort_order?: number } | null;
  updated_at: string;
}

export async function GET() {
  try {
    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_documents')
      .select('id, published_content, updated_at')
      .eq('type', 'service')
      .is('deleted_at', null)
      .not('published_content', 'is', null);

    if (error) {
      console.error('[public services] failed', error);
      return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
    }

    const services = ((data ?? []) as RawDoc[])
      .map((d) => ({
        id: d.id,
        title: d.published_content?.title ?? '',
        description: d.published_content?.description ?? '',
        price: d.published_content?.price ?? '',
        sort_order: d.published_content?.sort_order ?? 0,
      }))
      .filter((s) => s.title)
      .sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json(
      { services },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (e) {
    console.error('[public services] unexpected', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
