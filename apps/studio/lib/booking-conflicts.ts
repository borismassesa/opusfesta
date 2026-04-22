// Server-side validation for booking slot availability.
// Used by POST /api/admin/bookings and PATCH /api/admin/bookings/[id].

import type { SupabaseClient } from '@supabase/supabase-js';
import { timeToMinutes, validateAgainstWeekday, type WeekdayRule } from './availability';

export interface SlotCheckInput {
  booking_date: string;      // YYYY-MM-DD
  start_time: string;        // HH:MM[:SS]
  duration_minutes: number;
  /** When editing, pass the row's id so the check ignores itself. */
  excludeBookingId?: string;
}

export interface SlotConflict {
  code: 'closed_weekday' | 'outside_hours' | 'blackout' | 'overlap' | 'internal';
  message: string;
}

// These statuses mean "this booking is still blocking that time slot."
// Cancelled and no_show are ignored — they free the slot back up.
const BLOCKING_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed'];

export async function checkBookingSlot(
  db: SupabaseClient,
  input: SlotCheckInput,
): Promise<SlotConflict | null> {
  const { booking_date, start_time, duration_minutes, excludeBookingId } = input;

  const startMin = timeToMinutes(start_time);
  const endMin = startMin + duration_minutes;

  // Parse the date in UTC terms is fine — we only need the day-of-week.
  // Using T00:00:00 anchors it to midnight so getUTCDay stays stable.
  const weekday = new Date(`${booking_date}T00:00:00Z`).getUTCDay();

  // 1) Weekday rule
  const { data: rules, error: ruleErr } = await db
    .from('studio_availability')
    .select('weekday, is_open, open_time, close_time')
    .eq('weekday', weekday)
    .maybeSingle();

  if (ruleErr) {
    console.error('[booking-conflicts] weekday lookup failed', ruleErr);
    return { code: 'internal', message: 'Could not verify studio hours' };
  }

  const windowErr = validateAgainstWeekday(startMin, endMin, rules as WeekdayRule | undefined);
  if (windowErr) {
    const code: SlotConflict['code'] = rules?.is_open === false ? 'closed_weekday' : 'outside_hours';
    return { code, message: windowErr };
  }

  // 2) Blackout (any blackout that covers this date)
  const { data: blackouts, error: bErr } = await db
    .from('studio_blackouts')
    .select('id, reason, start_date, end_date')
    .lte('start_date', booking_date)
    .gte('end_date', booking_date)
    .limit(1);

  if (bErr) {
    console.error('[booking-conflicts] blackout lookup failed', bErr);
    return { code: 'internal', message: 'Could not verify blackout dates' };
  }

  if (blackouts && blackouts.length > 0) {
    return {
      code: 'blackout',
      message: `That date is marked unavailable (${blackouts[0].reason})`,
    };
  }

  // 3) Overlap with other live bookings on the same day
  let query = db
    .from('studio_bookings')
    .select('id, start_time, duration_minutes, client_name, status')
    .eq('booking_date', booking_date)
    .is('deleted_at', null)
    .in('status', BLOCKING_STATUSES);

  if (excludeBookingId) query = query.neq('id', excludeBookingId);

  const { data: sameDay, error: overlapErr } = await query;
  if (overlapErr) {
    console.error('[booking-conflicts] overlap query failed', overlapErr);
    return { code: 'internal', message: 'Could not verify conflicts' };
  }

  for (const other of sameDay ?? []) {
    const otherStart = timeToMinutes(other.start_time);
    const otherEnd = otherStart + other.duration_minutes;
    // Intervals overlap iff start < otherEnd AND end > otherStart.
    if (startMin < otherEnd && endMin > otherStart) {
      const otherStartHhmm = other.start_time.slice(0, 5);
      return {
        code: 'overlap',
        message: `Conflicts with ${other.client_name} at ${otherStartHhmm}`,
      };
    }
  }

  return null;
}
