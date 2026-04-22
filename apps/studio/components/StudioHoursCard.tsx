'use client';

import { useEffect, useState } from 'react';
import { WEEKDAY_LABELS_SHORT } from '@/lib/availability';

interface Day {
  weekday: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface Row {
  label: string;
  time: string | null;
}

// Sort weekdays Mon-first (JS convention is Sun=0). Sunday gets bumped
// to sort-key 7 so it lands at the end of the week.
function weekSortKey(w: number): number {
  return w === 0 ? 7 : w;
}

function hhmm(t: string): string {
  return t.slice(0, 5);
}

/**
 * Group consecutive identical weekday windows into ranges for compact display.
 * Mon/Tue/Wed/Thu/Fri at 09:00–18:00 → "Mon – Fri · 09:00 – 18:00".
 * Single days or mismatches stay on their own row.
 */
function buildRows(days: Day[]): Row[] {
  const ordered = [...days].sort((a, b) => weekSortKey(a.weekday) - weekSortKey(b.weekday));
  const rows: Row[] = [];

  let runStart: Day | null = null;
  let runEnd: Day | null = null;

  const flushRun = () => {
    if (!runStart || !runEnd) return;
    const label =
      runStart.weekday === runEnd.weekday
        ? WEEKDAY_LABELS_SHORT[runStart.weekday]
        : `${WEEKDAY_LABELS_SHORT[runStart.weekday]} – ${WEEKDAY_LABELS_SHORT[runEnd.weekday]}`;
    const time = runStart.is_open ? `${hhmm(runStart.open_time)} – ${hhmm(runStart.close_time)}` : null;
    rows.push({ label, time });
    runStart = null;
    runEnd = null;
  };

  for (const d of ordered) {
    const sameAsRun =
      runStart &&
      runStart.is_open === d.is_open &&
      runStart.open_time === d.open_time &&
      runStart.close_time === d.close_time;
    if (sameAsRun) {
      runEnd = d;
    } else {
      flushRun();
      runStart = d;
      runEnd = d;
    }
  }
  flushRun();
  return rows;
}

export default function StudioHoursCard() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/availability')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => { if (!cancelled) setDays(d.weekdays ?? []); })
      .catch(() => { if (!cancelled) setErrored(true); });
    return () => { cancelled = true; };
  }, []);

  // Silent skeleton while loading — the page doesn't shift once data lands.
  if (days === null && !errored) {
    return (
      <div className="border-4 border-brand-border bg-brand-dark p-8 text-white">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Studio Hours</p>
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // If the fetch failed, don't block the rest of the page — render nothing.
  if (errored || !days || days.length === 0) return null;

  const rows = buildRows(days);
  const hasOpenDay = days.some((d) => d.is_open);

  return (
    <div className="border-4 border-brand-border bg-brand-dark p-8 text-white">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Studio Hours</p>

      {hasOpenDay ? (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline gap-4">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-white/50 w-[100px] shrink-0">
                {r.label}
              </span>
              <span className={`text-[15px] tabular-nums ${r.time ? 'text-white' : 'text-white/40'}`}>
                {r.time ?? 'Closed'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[15px] text-white/70">
          Currently by appointment only — send a message and we&apos;ll arrange a time.
        </p>
      )}

      <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
        All times in East Africa Time
      </p>
    </div>
  );
}
