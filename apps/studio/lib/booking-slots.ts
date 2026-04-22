// Server-side computation for available booking slots and unavailable dates.
// Used by the public booking widget at /book.

import type { SupabaseClient } from '@supabase/supabase-js';
import { timeToMinutes, type WeekdayRule } from './availability';

export interface SlotsInput {
  date: string;           // YYYY-MM-DD
  duration_minutes: number;
  slot_step_minutes?: number;  // default 30 — granularity of candidate slots
}

// Compute bookable start times for the given date, respecting:
//   • weekday working hours
//   • blackout dates
//   • existing non-cancelled bookings on that day
export async function computeSlotsForDate(
  db: SupabaseClient,
  input: SlotsInput,
): Promise<string[]> {
  const { date, duration_minutes } = input;
  const step = input.slot_step_minutes ?? 30;

  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();

  const { data: rule } = await db
    .from('studio_availability')
    .select('weekday, is_open, open_time, close_time')
    .eq('weekday', weekday)
    .maybeSingle<WeekdayRule>();

  if (!rule || !rule.is_open) return [];

  // Blackout short-circuit
  const { data: blackouts } = await db
    .from('studio_blackouts')
    .select('id')
    .lte('start_date', date)
    .gte('end_date', date)
    .limit(1);
  if (blackouts && blackouts.length > 0) return [];

  const openMin = timeToMinutes(rule.open_time);
  const closeMin = timeToMinutes(rule.close_time);

  // Existing blocking bookings on this date — anything that would collide.
  const BLOCKING = ['pending', 'confirmed', 'in_progress', 'completed'];
  const { data: existing } = await db
    .from('studio_bookings')
    .select('start_time, duration_minutes')
    .eq('booking_date', date)
    .is('deleted_at', null)
    .in('status', BLOCKING);

  const takenRanges = (existing ?? []).map((b) => {
    const s = timeToMinutes(b.start_time as string);
    return [s, s + (b.duration_minutes as number)] as const;
  });

  const slots: string[] = [];
  const lastValidStart = closeMin - duration_minutes;
  for (let start = openMin; start <= lastValidStart; start += step) {
    const end = start + duration_minutes;
    const collides = takenRanges.some(([ts, te]) => start < te && end > ts);
    if (!collides) {
      const h = Math.floor(start / 60);
      const m = start % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

// Compute dates within the given month that are hard-blocked (closed weekday
// or blackout). "Fully booked" days are intentionally NOT returned here —
// the slots endpoint will report no availability on those. This keeps the
// public API honest: a date shown as "available" may still have zero slots
// if every hour is taken, and the UI handles that gracefully.
export async function computeUnavailableDates(
  db: SupabaseClient,
  year: number,
  monthIndex: number,  // 0-11
): Promise<string[]> {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const firstIso = isoDate(firstDay);
  const lastIso = isoDate(lastDay);

  const [availRes, blackoutsRes] = await Promise.all([
    db.from('studio_availability').select('weekday, is_open'),
    db
      .from('studio_blackouts')
      .select('start_date, end_date')
      .lte('start_date', lastIso)
      .gte('end_date', firstIso),
  ]);

  const closedWeekdays = new Set<number>(
    (availRes.data ?? [])
      .filter((r: { weekday: number; is_open: boolean }) => !r.is_open)
      .map((r: { weekday: number }) => r.weekday),
  );

  const blackouts = (blackoutsRes.data ?? []) as { start_date: string; end_date: string }[];

  const unavailable: string[] = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const iso = isoDate(d);
    const dow = d.getDay();
    const inBlackout = blackouts.some((b) => iso >= b.start_date && iso <= b.end_date);
    if (closedWeekdays.has(dow) || inBlackout) {
      unavailable.push(iso);
    }
  }
  return unavailable;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
