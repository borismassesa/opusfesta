import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { ASSETS_BUCKET } from '@/lib/cms/assets';

// Max upload size — enforced at the route level to catch oversized files
// before we invoke Supabase Storage (which has its own limits too).
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

// ─── POST /api/admin/assets ──────────────────────────────────────────────────
// Accepts a multipart upload:
//   - file       (required) — the image file
//   - blurhash   (required) — precomputed client-side
//   - width      (required) — integer, client-measured
//   - height     (required) — integer, client-measured
//   - alt_text   (optional) — accessibility string
//
// Uploads to the studio-assets bucket, inserts a studio_assets row, and
// returns the asset record for the editor to reference.
export async function POST(request: Request) {
  try {
    const { userId } = await requireStudioRole('studio_editor');

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `File exceeds ${MAX_BYTES / (1024 * 1024)}MB limit` }, { status: 413 });
    }
    if (!ALLOWED_MIMES.has(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 });
    }

    const blurhash = String(form.get('blurhash') ?? '').trim();
    const widthStr = form.get('width');
    const heightStr = form.get('height');
    const width = widthStr != null ? parseInt(String(widthStr), 10) : NaN;
    const height = heightStr != null ? parseInt(String(heightStr), 10) : NaN;
    if (!blurhash || !Number.isFinite(width) || !Number.isFinite(height)) {
      return NextResponse.json({ error: 'Missing blurhash/width/height' }, { status: 400 });
    }

    const altText = String(form.get('alt_text') ?? '').trim() || null;

    // Build a sanitized storage path: YYYY/MM/<uuid>.<ext>
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const id = crypto.randomUUID();
    const path = `${yyyy}/${mm}/${id}.${ext}`;

    const sb = getStudioSupabaseAdmin();

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadErr } = await sb.storage.from(ASSETS_BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadErr) {
      console.error('[assets] upload failed', uploadErr);
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // Insert row
    const { data, error } = await sb
      .from('studio_assets')
      .insert({
        bucket: ASSETS_BUCKET,
        path,
        mime: file.type,
        size_bytes: file.size,
        width,
        height,
        blurhash,
        alt_text: altText,
        uploaded_by: userId,
        hotspot_x: 0.5,
        hotspot_y: 0.5,
      })
      .select('*')
      .single();

    if (error || !data) {
      // Best-effort cleanup — if the DB insert failed, don't leave an orphan in storage
      await sb.storage.from(ASSETS_BUCKET).remove([path]).catch(() => { /* noop */ });
      return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ asset: data }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[assets] unexpected error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
