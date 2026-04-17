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

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      console.error('[assets] GET fetch failed', { id, error });
      return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
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

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
    }
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload', issues: parsed.error.issues }, { status: 400 });
    }

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_assets')
      .update(parsed.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      console.error('[assets] PATCH update failed', { id, error });
      return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
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
    if (fetchErr) {
      if (fetchErr.code === 'PGRST116') return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      console.error('[assets] DELETE fetch failed', { id, error: fetchErr });
      return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
    }
    if (!current) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

    const { error: storageErr } = await sb.storage.from(ASSETS_BUCKET).remove([current.path]);
    if (storageErr) {
      console.error('[assets] storage delete failed — aborting row delete to avoid orphan file', { id, path: current.path, error: storageErr });
      return NextResponse.json({ error: 'Failed to delete asset file. Please retry.' }, { status: 500 });
    }

    const { error: rowErr } = await sb.from('studio_assets').delete().eq('id', id);
    if (rowErr) {
      console.error('[assets] row delete failed after storage delete — orphan file may exist', { id, path: current.path, error: rowErr });
      return NextResponse.json({ error: 'Failed to delete asset record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
