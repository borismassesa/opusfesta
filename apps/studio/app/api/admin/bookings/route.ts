import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { createBookingAsAdmin } from '@/lib/booking-service';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const lifecycleStatus = searchParams.get('lifecycle_status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));

    let query = db.from('studio_bookings').select('*', { count: 'exact' });

    if (lifecycleStatus && lifecycleStatus !== 'all') {
      if (lifecycleStatus === 'pipeline') {
        query = query.in('lifecycle_status', ['intake_submitted', 'qualified', 'quote_sent', 'quote_accepted', 'contract_sent', 'contract_signed', 'deposit_pending', 'reschedule_requested']);
      } else if (lifecycleStatus === 'upcoming') {
        query = query.in('lifecycle_status', ['confirmed', 'rescheduled']);
      } else if (lifecycleStatus === 'completed') {
        query = query.eq('lifecycle_status', 'completed');
      } else if (lifecycleStatus === 'cancelled') {
        query = query.in('lifecycle_status', ['cancelled', 'draft', 'slot_held']);
      } else {
        query = query.eq('lifecycle_status', lifecycleStatus);
      }
    } else if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, count, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ bookings: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / PAGE_SIZE) });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clerkId } = await requireStudioRole('studio_editor');
    const body = await req.json();

    // Validate required fields
    const { name, email, event_type } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: 'Client email is required' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    if (!event_type?.trim()) return NextResponse.json({ error: 'Event type is required' }, { status: 400 });

    const initialStatus = body.initial_status === 'intake_submitted' ? 'intake_submitted' : 'qualified';

    const booking = await createBookingAsAdmin(
      {
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone || undefined,
        whatsapp: body.whatsapp || undefined,
        event_type: body.event_type,
        event_date: body.event_date || undefined,
        event_time_slot: body.event_time_slot || undefined,
        location: body.location || undefined,
        service: body.service || undefined,
        guest_count: body.guest_count ? parseInt(body.guest_count) : undefined,
        message: body.message || undefined,
        admin_notes: body.admin_notes || undefined,
        source: body.source || undefined,
      },
      initialStatus,
      clerkId
    );

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    const message = e instanceof Error ? e.message : 'Failed to create booking';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
