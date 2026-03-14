import { NextRequest, NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'month parameter required (YYYY-MM)' }, { status: 400 });
    }

    const startDate = `${month}-01`;
    const [year, monthNum] = month.split('-').map(Number);
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const db = getStudioSupabaseAdmin();

    // Fetch availability settings, active holds, and booked dates in parallel
    const [availabilityRes, holdsRes, bookedRes, blackoutsRes] = await Promise.all([
      db.from('studio_availability')
        .select('date, time_slot, is_available, note')
        .gte('date', startDate)
        .lte('date', endDate),

      db.from('studio_slot_holds')
        .select('date, time_slot, expires_at')
        .eq('is_active', true)
        .gte('date', startDate)
        .lte('date', endDate),

      db.from('studio_bookings')
        .select('event_date, event_time_slot')
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .in('lifecycle_status', [
          'intake_submitted', 'qualified', 'quote_sent', 'quote_accepted',
          'contract_sent', 'contract_signed', 'deposit_pending', 'confirmed', 'rescheduled',
        ]),

      db.from('studio_blackout_periods')
        .select('start_date, end_date, reason')
        .lte('start_date', endDate)
        .gte('end_date', startDate),
    ]);

    // Build a map of unavailable slots
    const unavailableSlots = new Set<string>();

    // Mark explicitly unavailable dates
    (availabilityRes.data || []).forEach((a) => {
      if (!a.is_available) {
        unavailableSlots.add(`${a.date}|${a.time_slot}`);
      }
    });

    // Mark held slots
    (holdsRes.data || []).forEach((h) => {
      if (new Date(h.expires_at) > new Date()) {
        unavailableSlots.add(`${h.date}|${h.time_slot}`);
      }
    });

    // Mark booked slots
    (bookedRes.data || []).forEach((b) => {
      if (b.event_date && b.event_time_slot) {
        unavailableSlots.add(`${b.event_date}|${b.event_time_slot}`);
      }
    });

    // Build blackout date set
    const blackoutDates = new Set<string>();
    (blackoutsRes.data || []).forEach((bp) => {
      const start = new Date(bp.start_date);
      const end = new Date(bp.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        blackoutDates.add(d.toISOString().split('T')[0]);
      }
    });

    // Generate available slots for each day
    const timeSlots = ['morning', 'afternoon', 'all-day'];
    const days: Array<{
      date: string;
      slots: Array<{ time_slot: string; available: boolean }>;
      blackout: boolean;
    }> = [];

    for (let day = 1; day <= lastDay; day++) {
      const date = `${month}-${String(day).padStart(2, '0')}`;
      const isBlackout = blackoutDates.has(date);
      const isPast = new Date(date) < new Date(new Date().toISOString().split('T')[0]);

      const slots = timeSlots.map((ts) => ({
        time_slot: ts,
        available: !isPast && !isBlackout && !unavailableSlots.has(`${date}|${ts}`),
      }));

      days.push({ date, slots, blackout: isBlackout });
    }

    return NextResponse.json({ month, days });
  } catch (error) {
    console.error('[AVAILABILITY]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
