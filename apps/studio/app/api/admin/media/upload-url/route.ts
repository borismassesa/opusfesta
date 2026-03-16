import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try { await requireStudioRole('studio_editor');
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 });
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(contentType)) return NextResponse.json({ error: 'Unsupported file type. Accepted: JPEG, PNG, WebP, AVIF, MP4, WebM, MOV' }, { status: 400 });
    const path = `studio/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.storage.from('studio-assets').createSignedUploadUrl(path);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/studio-assets/${path}`;
    // Extract the token from the signed URL for client-side upload
    const token = new URL(data.signedUrl).searchParams.get('token') ?? '';
    revalidatePath('/', 'layout');
    return NextResponse.json({ signedUrl: data.signedUrl, publicUrl, path, token });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
