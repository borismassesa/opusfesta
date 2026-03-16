import { NextRequest, NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DEFAULT_WORKING_HOURS: Record<string, { open: boolean; from: string; to: string }> = {
  sunday: { open: false, from: '09:00', to: '17:00' },
  monday: { open: true, from: '09:00', to: '18:00' },
  tuesday: { open: true, from: '09:00', to: '18:00' },
  wednesday: { open: true, from: '09:00', to: '18:00' },
  thursday: { open: true, from: '09:00', to: '18:00' },
  friday: { open: true, from: '09:00', to: '18:00' },
  saturday: { open: true, from: '10:00', to: '15:00' },
};

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

    // Fetch all data in parallel (including working hours from settings)
    const [availabilityRes, holdsRes, bookedRes, blackoutsRes, settingsRes] = await Promise.all([
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

      db.from('studio_settings')
        .select('value')
        .eq('key', 'working_hours')
        .single(),
    ]);

    // Parse working hours from settings or use defaults
    const workingHours: Record<string, { open: boolean; from: string; to: string }> =
      settingsRes.data?.value
        ? { ...DEFAULT_WORKING_HOURS, ...(settingsRes.data.value as Record<string, { open: boolean; from: string; to: string }>) }
        : DEFAULT_WORKING_HOURS;

    // Build a map of unavailable slots
    const unavailableSlots = new Set<string>();
    const allDayBlocked = new Set<string>();

    // Mark explicitly unavailable dates / all-day blocks
    (availabilityRes.data || []).forEach((a) => {
      if (!a.is_available) {
        if (a.time_slot === 'all-day') {
          allDayBlocked.add(a.date);
        }
        unavailableSlots.add(`${a.date}|${a.time_slot}`);
      }
    });

    // Mark held slots (only if hold hasn't expired)
    const now = new Date();
    (holdsRes.data || []).forEach((h) => {
      if (new Date(h.expires_at) > now) {
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

    // Generate availability for each day using working hours
    const todayStr = now.toISOString().split('T')[0];

    const days: Array<{
      date: string;
      dayOfWeek: string;
      hours: { from: string; to: string } | null;
      slots: Array<{ time_slot: string; label: string; available: boolean }>;
      blackout: boolean;
      closed: boolean;
    }> = [];

    for (let day = 1; day <= lastDay; day++) {
      const date = `${month}-${String(day).padStart(2, '0')}`;
      const isBlackout = blackoutDates.has(date);
      const isPast = date < todayStr;
      const isDayBlocked = allDayBlocked.has(date);

      const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
      const dayKey = DAY_KEYS[dayOfWeek];
      const dayHours = workingHours[dayKey];
      const isClosed = !dayHours?.open;

      // Generate the time slot for this day based on working hours
      const slots: Array<{ time_slot: string; label: string; available: boolean }> = [];

      if (!isClosed && !isBlackout && !isPast && !isDayBlocked) {
        // Full day slot using actual working hours
        const fullSlot = `${dayHours.from}-${dayHours.to}`;
        const isFullDayTaken = unavailableSlots.has(`${date}|${fullSlot}`) || unavailableSlots.has(`${date}|all-day`);

        slots.push({
          time_slot: fullSlot,
          label: `Full Day — From ${formatTime(dayHours.from)} to ${formatTime(dayHours.to)}`,
          available: !isFullDayTaken,
        });

        // Split into morning/afternoon if hours span enough time
        const fromH = parseInt(dayHours.from.split(':')[0]);
        const toH = parseInt(dayHours.to.split(':')[0]);
        const midpoint = Math.floor((fromH + toH) / 2);

        if (toH - fromH >= 4) {
          const midStr = `${String(midpoint).padStart(2, '0')}:00`;
          const morningSlot = `${dayHours.from}-${midStr}`;
          const afternoonSlot = `${midStr}-${dayHours.to}`;

          const isMorningTaken = unavailableSlots.has(`${date}|${morningSlot}`) || unavailableSlots.has(`${date}|morning`);
          const isAfternoonTaken = unavailableSlots.has(`${date}|${afternoonSlot}`) || unavailableSlots.has(`${date}|afternoon`);

          slots.push({
            time_slot: morningSlot,
            label: `Morning — From ${formatTime(dayHours.from)} to ${formatTime(midStr)}`,
            available: !isMorningTaken && !isFullDayTaken,
          });

          slots.push({
            time_slot: afternoonSlot,
            label: `Afternoon — From ${formatTime(midStr)} to ${formatTime(dayHours.to)}`,
            available: !isAfternoonTaken && !isFullDayTaken,
          });
        }
      }

      days.push({
        date,
        dayOfWeek: dayKey,
        hours: isClosed ? null : { from: dayHours.from, to: dayHours.to },
        slots,
        blackout: isBlackout,
        closed: isClosed || isDayBlocked,
      });
    }

    return NextResponse.json({ month, days, workingHours });
  } catch (error) {
    console.error('[AVAILABILITY]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
