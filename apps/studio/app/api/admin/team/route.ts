import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try { await requireStudioRole('studio_viewer');
    const { data, error } = await getStudioSupabaseAdmin().from('studio_team_members').select('*').order('sort_order');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ members: data || [] });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try { await requireStudioRole('studio_editor'); const body = await req.json();
    if (!body.name || !body.role) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const { data, error } = await getStudioSupabaseAdmin().from('studio_team_members').insert({
      name: body.name, role: body.role, bio: body.bio || null, avatar_url: body.avatar_url || null,
      is_published: body.is_published ?? true, sort_order: body.sort_order || 0, social_links: body.social_links || {},
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ member: data }, { status: 201 });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
