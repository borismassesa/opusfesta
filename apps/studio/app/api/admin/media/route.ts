import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try { await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.storage.from('studio-assets').list('studio', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const files = (data || []).map((f) => ({
      name: f.name, size: f.metadata?.size || 0, created_at: f.created_at,
      publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/studio-assets/studio/${f.name}`,
    }));
    return NextResponse.json({ files });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try { await requireStudioRole('studio_editor');
    const { path } = await req.json();
    if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 });
    const { error } = await getStudioSupabaseAdmin().storage.from('studio-assets').remove([path]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
