import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_resources').select('*').order('name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ resources: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_editor');
    const body = await req.json();
    if (!body.name || !body.type) return NextResponse.json({ error: 'name and type are required' }, { status: 400 });
    if (!['staff', 'room', 'equipment'].includes(body.type)) return NextResponse.json({ error: 'type must be staff, room, or equipment' }, { status: 400 });
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db.from('studio_resources').insert({
      name: body.name, type: body.type, description: body.description || null,
      is_active: body.is_active ?? true, metadata: body.metadata || {},
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ resource: data }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
