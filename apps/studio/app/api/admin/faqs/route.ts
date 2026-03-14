import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try { await requireStudioRole('studio_viewer');
    const { data, error } = await getStudioSupabaseAdmin().from('studio_faqs').select('*').order('sort_order');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ faqs: data || [] });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try { await requireStudioRole('studio_editor'); const body = await req.json();
    if (!body.question || !body.answer) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const { data, error } = await getStudioSupabaseAdmin().from('studio_faqs').insert({
      question: body.question, answer: body.answer, is_published: body.is_published ?? true, sort_order: body.sort_order || 0,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ faq: data }, { status: 201 });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
