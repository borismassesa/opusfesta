import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getBookingWithRelations } from '@/lib/booking-service';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;

    // Try to get booking with full relations
    const booking = await getBookingWithRelations(id);
    if (!booking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_editor');
    const { id } = await params;
    const body = await req.json();
    const db = getStudioSupabaseAdmin();

    const updates: Record<string, unknown> = {};
    if (body.status) updates.status = body.status;
    if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;
    if (body.status === 'contacted' || body.status === 'quoted') updates.responded_at = new Date().toISOString();

    const { data, error } = await db.from('studio_bookings').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking: data });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_admin');
    const { id } = await params;
    const db = getStudioSupabaseAdmin();
    const { error } = await db.from('studio_bookings').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
