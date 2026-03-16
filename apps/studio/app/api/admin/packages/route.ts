import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_packages').select('*').order('sort_order');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ packages: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_editor');
    const body = await req.json();
    if (!body.name || body.base_price_tzs === undefined) return NextResponse.json({ error: 'name and base_price_tzs are required' }, { status: 400 });
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_packages').insert({
      name: body.name, description: body.description || null, base_price_tzs: body.base_price_tzs,
      service_id: body.service_id || null, duration_minutes: body.duration_minutes || null,
      is_active: body.is_active ?? true, sort_order: body.sort_order || 0,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ package: data }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
