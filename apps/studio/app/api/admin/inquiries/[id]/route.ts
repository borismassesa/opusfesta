import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

const UpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'closed_won', 'closed_lost', 'spam']).optional(),
  assigned_to: z.string().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_inquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ inquiry: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireStudioRole('studio_editor');
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.status === 'contacted') updates.contacted_at = new Date().toISOString();
    if (parsed.data.status === 'closed_won' || parsed.data.status === 'closed_lost') {
      updates.closed_at = new Date().toISOString();
    }

    const sb = getStudioSupabaseAdmin();
    const { data, error } = await sb
      .from('studio_inquiries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ inquiry: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
