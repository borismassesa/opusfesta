import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_services').select('*').order('sort_order');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ services: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_editor');
    const body = await req.json();
    const { title, description, price, cover_image } = body;
    if (!title || !description || !price || !cover_image) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_services').insert({
      title, description, price, cover_image, includes: body.includes || [],
      is_active: body.is_active ?? true, sort_order: body.sort_order || 0,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ service: data }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
