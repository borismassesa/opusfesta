import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { ASSETS_BUCKET } from '@/lib/cms/assets';

type RouteContext = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  alt_text: z.string().max(500).nullable().optional(),
  hotspot_x: z.number().min(0).max(1).optional(),
  hotspot_y: z.number().min(0).max(1).optional(),
});

// ─── GET /api/admin/assets/[id] ──────────────────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ asset: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PATCH /api/admin/assets/[id] ────────────────────────────────────────────
// Updates alt_text / hotspot. Does NOT replace the underlying file.
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_editor');
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_assets')
      .update(parsed.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 });
    return NextResponse.json({ asset: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/assets/[id] ───────────────────────────────────────────
// Deletes the row AND the underlying storage object.
// NOTE: This does NOT check if documents still reference the asset.
// A dangling reference will show a broken image; Phase 4 will add reference
// tracking if needed.
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_editor');
    const { id } = await params;

    const sb = getStudioSupabaseAdmin();

    const { data: current, error: fetchErr } = await sb
      .from('studio_assets')
      .select('path')
      .eq('id', id)
      .single();
    if (fetchErr || !current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete storage object first. Even if the row delete fails, removing the
    // file is the bigger win — orphan rows are cheap, orphan files cost storage.
    const { error: storageErr } = await sb.storage.from(ASSETS_BUCKET).remove([current.path]);
    if (storageErr) {
      console.error('[assets] storage delete failed', storageErr);
    }

    const { error: rowErr } = await sb.from('studio_assets').delete().eq('id', id);
    if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
