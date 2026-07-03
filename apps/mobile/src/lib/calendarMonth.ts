// Pure month-grid date math for the vendor Availability calendar. No RN/
// Supabase imports so it can be unit-tested under plain Node.

export interface MonthGridCell {
  date: string; // YYYY-MM-DD
  day: number;
  inCurrentMonth: boolean;
}

function toISODate(year: number, monthIndex: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Builds a full 6-row (42-cell) month grid starting on Sunday, padded with
 * the trailing days of the previous month and the leading days of the next
 * so every week row is complete.
 */
export function getMonthGridDates(year: number, monthIndex: number): MonthGridCell[] {
  const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1));
  const firstWeekday = firstOfMonth.getUTCDay(); // 0 = Sunday
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const daysInPrevMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();

  const cells: MonthGridCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const [y, m] = monthIndex === 0 ? [year - 1, 11] : [year, monthIndex - 1];
    cells.push({ date: toISODate(y, m, day), day, inCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: toISODate(year, monthIndex, day), day, inCurrentMonth: true });
  }

  let nextDay = 1;
  while (cells.length < 42) {
    const [y, m] = monthIndex === 11 ? [year + 1, 0] : [year, monthIndex + 1];
    cells.push({ date: toISODate(y, m, nextDay), day: nextDay, inCurrentMonth: false });
    nextDay++;
  }

  return cells;
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
