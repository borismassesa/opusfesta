// Shared availability types and helpers. Used by admin UI + server conflict
// checks so the "is this slot bookable?" logic lives in one place.

export interface WeekdayRule {
  weekday: number;        // 0=Sun ... 6=Sat (JS convention)
  is_open: boolean;
  open_time: string;      // "HH:MM" or "HH:MM:SS"
  close_time: string;
}

export interface Blackout {
  id: string;
  start_date: string;     // YYYY-MM-DD
  end_date: string;       // YYYY-MM-DD (inclusive)
  reason: string;
  created_at: string;
  updated_at: string;
}

export const WEEKDAY_LABELS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

export const WEEKDAY_LABELS_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
] as const;

// Convert "HH:MM[:SS]" → minutes since midnight.
export function timeToMinutes(hhmmss: string): number {
  const [h, m] = hhmmss.split(':').map(Number);
  return h * 60 + m;
}

export function isDateInBlackout(isoDate: string, blackouts: Blackout[]): Blackout | null {
  for (const b of blackouts) {
    if (isoDate >= b.start_date && isoDate <= b.end_date) return b;
  }
  return null;
}

// Does the proposed [startMin, endMin] window fit inside the weekday's
// open hours? Returns null if OK, or a human-readable error.
export function validateAgainstWeekday(
  startMin: number,
  endMin: number,
  rule: WeekdayRule | undefined,
): string | null {
  if (!rule) return 'No availability rule found for this weekday';
  if (!rule.is_open) return `The studio is closed on ${WEEKDAY_LABELS_LONG[rule.weekday]}s`;
  const openMin = timeToMinutes(rule.open_time);
  const closeMin = timeToMinutes(rule.close_time);
  if (startMin < openMin) {
    return `Starts before opening time (${rule.open_time.slice(0, 5)})`;
  }
  if (endMin > closeMin) {
    return `Ends after closing time (${rule.close_time.slice(0, 5)})`;
  }
  return null;
}
