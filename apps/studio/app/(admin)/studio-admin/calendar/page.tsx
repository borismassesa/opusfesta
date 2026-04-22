'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BsChevronLeft, BsChevronRight, BsPlusLg, BsExclamationTriangle,
  BsArrowUpRightCircle,
} from 'react-icons/bs';
import BookingForm from '@/components/admin/bookings/BookingForm';
import {
  type Booking,
  type ServiceOption,
  STATUS_ACCENT,
  STATUS_LABEL,
  addMinutes,
  formatTime,
  formatTzs,
} from '@/lib/bookings';
import {
  type Blackout,
  type WeekdayRule,
  isDateInBlackout,
  timeToMinutes,
} from '@/lib/availability';

interface ServiceDoc {
  id: string;
  published_content?: { title?: string } | null;
  draft_content?: { title?: string } | null;
}

type ViewMode = 'day' | 'week' | 'month';

// ─── Constants ───────────────────────────────────────────────────────────
const TIME_START_HOUR = 7;          // grid starts at 07:00
const TIME_END_HOUR   = 21;         // …ends at 21:00 (14 rows)
const HOUR_PX         = 56;
const GRID_HEIGHT_PX  = (TIME_END_HOUR - TIME_START_HOUR) * HOUR_PX;
const MIN_BLOCK_PX    = 24;
const VIEW_STORAGE_KEY = 'studio-admin.calendar.view';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));
const WEEKDAY_LABELS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKDAY_LABELS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Date helpers ────────────────────────────────────────────────────────
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function mondayIndex(d: Date): number {
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}

function startOfWeek(d: Date): Date {
  const s = new Date(d);
  s.setDate(d.getDate() - mondayIndex(d));
  s.setHours(0, 0, 0, 0);
  return s;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
}

function buildMonthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = addDays(first, -mondayIndex(first));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

// ─── Time-grid math ──────────────────────────────────────────────────────
function timeToTopPx(hhmmss: string): number {
  const [h, m] = hhmmss.split(':').map(Number);
  const mins = (h - TIME_START_HOUR) * 60 + m;
  return (mins / 60) * HOUR_PX;
}

function durationToHeightPx(minutes: number): number {
  return Math.max((minutes / 60) * HOUR_PX, MIN_BLOCK_PX);
}

function pxToTimeString(px: number): string {
  const totalMins = Math.max(0, Math.round((px / HOUR_PX) * 60));
  const snapped = Math.round(totalMins / 15) * 15; // snap to 15-min
  const totalFromMidnight = TIME_START_HOUR * 60 + snapped;
  const h = Math.floor(totalFromMidnight / 60) % 24;
  const m = totalFromMidnight % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Page (wraps content in Suspense for useSearchParams) ────────────────
export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarContent />
    </Suspense>
  );
}

function CalendarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [view, setView] = useState<ViewMode>('month');
  const [anchor, setAnchor] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });

  // Initial state: URL wins if present, else localStorage, else defaults.
  // Runs once on mount — consumes search params so we don't loop on URL writes.
  const didHydrate = useRef(false);
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    const qView = searchParams.get('view');
    const qDate = searchParams.get('date');

    if (qView === 'day' || qView === 'week' || qView === 'month') {
      setView(qView);
    } else {
      try {
        const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
        if (saved === 'day' || saved === 'week' || saved === 'month') setView(saved);
      } catch { /* ignore */ }
    }

    if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
      const [y, m, d] = qDate.split('-').map(Number);
      setAnchor(new Date(y, m - 1, d));
    }
  }, [searchParams]);

  // Push current state into the URL so the page is shareable/bookmarkable.
  // Skips the first render until hydration has run, so we don't clobber
  // the incoming URL before it's been read.
  useEffect(() => {
    if (!didHydrate.current) return;
    const params = new URLSearchParams();
    params.set('view', view);
    params.set('date', isoDate(anchor));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [view, anchor, pathname, router]);

  const chooseView = (next: ViewMode) => {
    setView(next);
    try { window.localStorage.setItem(VIEW_STORAGE_KEY, next); } catch { /* ignore */ }
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [availability, setAvailability] = useState<WeekdayRule[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [createFor, setCreateFor] = useState<{ date: string; time?: string } | null>(null);

  // ── Visible range for data fetch + grid rendering ─────────────────────
  const range = useMemo(() => computeRange(view, anchor), [view, anchor]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const from = isoDate(range.from);
    const to = isoDate(range.to);
    Promise.all([
      fetch(`/api/admin/bookings?date_from=${from}&date_to=${to}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Bookings HTTP ${r.status}`)))),
      fetch(`/api/admin/blackouts?date_from=${from}&date_to=${to}`).then((r) => (r.ok ? r.json() : { blackouts: [] })),
      fetch('/api/admin/availability').then((r) => (r.ok ? r.json() : { weekdays: [] })),
    ])
      .then(([b, k, a]) => {
        setBookings(b.bookings ?? []);
        setBlackouts(k.blackouts ?? []);
        setAvailability(a.weekdays ?? []);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [range.from, range.to]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch('/api/admin/documents/service')
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        const docs: ServiceDoc[] = d?.documents ?? [];
        setServices(
          docs.map((s) => ({
            id: s.id,
            title: (s.published_content?.title ?? s.draft_content?.title ?? 'Untitled service') as string,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const arr = map.get(b.booking_date) ?? [];
      arr.push(b);
      map.set(b.booking_date, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [bookings]);

  const today = new Date();
  const title = formatTitle(view, anchor);

  // ── Navigation ────────────────────────────────────────────────────────
  const goPrev = () => setAnchor(navigate(view, anchor, -1));
  const goNext = () => setAnchor(navigate(view, anchor, +1));

  const selectedDayBookings = selectedDay
    ? byDate.get(isoDate(selectedDay)) ?? []
    : [];

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        {/* Left: view switcher */}
        <ViewSwitcher current={view} onChange={chooseView} />

        {/* Center: month/date navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            aria-label={`Previous ${view}`}
            className="p-2 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] hover:bg-[var(--admin-sidebar-accent)] transition-colors"
          >
            <BsChevronLeft className="w-3.5 h-3.5" />
          </button>
          <h1 className="text-lg font-bold text-[var(--admin-foreground)] tracking-tight mx-2 min-w-[220px] text-center">
            {title}
          </h1>
          <button
            onClick={goNext}
            aria-label={`Next ${view}`}
            className="p-2 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] hover:bg-[var(--admin-sidebar-accent)] transition-colors"
          >
            <BsChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: create CTA */}
        <button
          onClick={() => setCreateFor({ date: isoDate(today) })}
          className="inline-flex items-center gap-2 bg-[var(--admin-primary)] text-white px-3 py-2 text-[12px] font-semibold hover:bg-[var(--admin-primary)]/90 transition-colors"
        >
          <BsPlusLg className="w-3 h-3" />
          New booking
        </button>
      </div>

      {/* ── Error banner (non-blocking) ──────────────────────────────── */}
      {error && (
        <div className="mb-4 bg-white border border-red-200 p-3 flex items-start gap-2">
          <BsExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-red-700">Couldn&apos;t load bookings.</p>
            <p className="text-[11px] text-red-600">{error}</p>
          </div>
          <button
            onClick={load}
            className="text-[11px] font-medium text-red-700 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Active view ──────────────────────────────────────────────── */}
      {view === 'month' && (
        <MonthView
          anchor={anchor}
          today={today}
          byDate={byDate}
          blackouts={blackouts}
          loading={loading}
          onPickDay={(d) => setSelectedDay(d)}
          onPickBooking={(b) => setSelectedBooking(b)}
          onCreate={(d) => setCreateFor({ date: d })}
        />
      )}

      {view === 'week' && (
        <TimeGridView
          days={getWeekDays(anchor)}
          today={today}
          byDate={byDate}
          availability={availability}
          blackouts={blackouts}
          onPickBooking={(b) => setSelectedBooking(b)}
          onCreate={(date, time) => setCreateFor({ date, time })}
        />
      )}

      {view === 'day' && (
        <TimeGridView
          days={[new Date(anchor)]}
          today={today}
          byDate={byDate}
          availability={availability}
          blackouts={blackouts}
          onPickBooking={(b) => setSelectedBooking(b)}
          onCreate={(date, time) => setCreateFor({ date, time })}
        />
      )}

      {/* ── Legend ───────────────────────────────────────────────────── */}
      <Legend />

      {/* ── Day detail side panel (month view only) ──────────────────── */}
      {selectedDay && (
        <DayPanel
          date={selectedDay}
          bookings={selectedDayBookings}
          onClose={() => setSelectedDay(null)}
          onOpenBooking={(b) => setSelectedBooking(b)}
          onCreate={() => setCreateFor({ date: isoDate(selectedDay) })}
        />
      )}

      {/* ── Create modal ─────────────────────────────────────────────── */}
      {createFor && (
        <BookingForm
          mode="create"
          services={services}
          defaultDate={createFor.date}
          defaultStartTime={createFor.time}
          onClose={() => setCreateFor(null)}
          onSaved={() => { setCreateFor(null); load(); }}
        />
      )}

      {/* ── Edit modal ───────────────────────────────────────────────── */}
      {selectedBooking && (
        <BookingForm
          mode="edit"
          booking={selectedBooking}
          services={services}
          onClose={() => setSelectedBooking(null)}
          onSaved={(updated) => { setSelectedBooking(updated); load(); }}
          onDeleted={() => { setSelectedBooking(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Range + navigation per view ─────────────────────────────────────────
function computeRange(view: ViewMode, anchor: Date): { from: Date; to: Date } {
  if (view === 'month') {
    const grid = buildMonthGrid(anchor);
    return { from: grid[0], to: grid[grid.length - 1] };
  }
  if (view === 'week') {
    const start = startOfWeek(anchor);
    return { from: start, to: addDays(start, 6) };
  }
  return { from: anchor, to: anchor };
}

function navigate(view: ViewMode, anchor: Date, delta: 1 | -1): Date {
  if (view === 'month') return new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1);
  if (view === 'week') return addDays(anchor, 7 * delta);
  return addDays(anchor, delta);
}

function formatTitle(view: ViewMode, anchor: Date): string {
  if (view === 'month') return `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;
  if (view === 'week') {
    const s = startOfWeek(anchor);
    const e = addDays(s, 6);
    const year = e.getFullYear();
    if (s.getMonth() === e.getMonth()) {
      return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${year}`;
    }
    return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${year}`;
  }
  return `${WEEKDAY_LABELS_FULL[mondayIndex(anchor)]}, ${anchor.getDate()} ${MONTH_SHORT[anchor.getMonth()]} ${anchor.getFullYear()}`;
}

function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// ─── View switcher ───────────────────────────────────────────────────────
function ViewSwitcher({ current, onChange }: { current: ViewMode; onChange: (v: ViewMode) => void }) {
  const options: { value: ViewMode; label: string }[] = [
    { value: 'day',   label: 'Day'   },
    { value: 'week',  label: 'Week'  },
    { value: 'month', label: 'Month' },
  ];
  return (
    <div role="radiogroup" aria-label="Calendar view" className="inline-flex gap-1">
      {options.map(({ value, label }) => {
        const active = current === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(value)}
            className={`text-[11px] font-semibold px-3.5 py-1.5 transition-colors ${
              active
                ? 'bg-[var(--admin-primary)] text-white'
                : 'text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/10'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Month view ──────────────────────────────────────────────────────────
function MonthView({
  anchor, today, byDate, blackouts, loading, onPickDay, onPickBooking, onCreate,
}: {
  anchor: Date;
  today: Date;
  byDate: Map<string, Booking[]>;
  blackouts: Blackout[];
  loading: boolean;
  onPickDay: (d: Date) => void;
  onPickBooking: (b: Booking) => void;
  onCreate: (isoDate: string) => void;
}) {
  const grid = useMemo(() => buildMonthGrid(anchor), [anchor]);

  return (
    <div className="bg-white border border-[var(--admin-sidebar-border)]">
      <div className="grid grid-cols-7 border-b border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-accent)]/40">
        {WEEKDAY_LABELS_SHORT.map((d, i) => (
          <div
            key={d}
            className={`px-2 py-2 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)] ${
              i >= 5 ? 'bg-[var(--admin-sidebar-accent)]/40' : ''
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6" style={{ minHeight: '660px' }}>
        {grid.map((cellDate, idx) => {
          const key = isoDate(cellDate);
          const cellBookings = byDate.get(key) ?? [];
          const col = idx % 7;
          const row = Math.floor(idx / 7);
          const blackout = isDateInBlackout(key, blackouts);
          return (
            <MonthDayCell
              key={key}
              date={cellDate}
              bookings={cellBookings}
              blackout={blackout}
              isOutOfMonth={cellDate.getMonth() !== anchor.getMonth()}
              isWeekend={cellDate.getDay() === 0 || cellDate.getDay() === 6}
              isToday={sameDay(cellDate, today)}
              borderRight={col < 6}
              borderBottom={row < 5}
              loading={loading}
              onClickDay={() => onPickDay(cellDate)}
              onClickBooking={onPickBooking}
              onCreate={() => onCreate(key)}
            />
          );
        })}
      </div>
    </div>
  );
}

function MonthDayCell({
  date, bookings, blackout, isOutOfMonth, isWeekend, isToday,
  borderRight, borderBottom, loading, onClickDay, onClickBooking, onCreate,
}: {
  date: Date;
  bookings: Booking[];
  blackout: Blackout | null;
  isOutOfMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  borderRight: boolean;
  borderBottom: boolean;
  loading: boolean;
  onClickDay: () => void;
  onClickBooking: (b: Booking) => void;
  onCreate: () => void;
}) {
  const shown = bookings.slice(0, 3);
  const extra = bookings.length - shown.length;

  return (
    <div
      onClick={onClickDay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClickDay();
        }
      }}
      className={`group relative p-1.5 text-left cursor-pointer transition-colors min-h-[110px] ${
        borderRight ? 'border-r border-[var(--admin-sidebar-border)]' : ''
      } ${borderBottom ? 'border-b border-[var(--admin-sidebar-border)]' : ''} ${
        blackout
          ? 'bg-red-50/70'
          : isOutOfMonth
          ? 'bg-[var(--admin-sidebar-accent)]/20'
          : isWeekend
          ? 'bg-[var(--admin-sidebar-accent)]/20'
          : 'bg-white'
      } hover:bg-[var(--admin-sidebar-accent)]/50`}
      title={blackout ? `Blackout: ${blackout.reason}` : undefined}
    >
      {blackout && (
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #EF4444 5px, #EF4444 6px)',
          }}
        />
      )}
      <div className="flex items-center justify-between mb-1 relative">
        <span
          className={`inline-flex items-center justify-center text-[12px] font-semibold tabular-nums ${
            isToday
              ? 'w-6 h-6 rounded-full bg-[var(--admin-primary)] text-white'
              : isOutOfMonth
              ? 'text-[var(--admin-muted)]/60 ml-1'
              : 'text-[var(--admin-foreground)] ml-1'
          }`}
        >
          {date.getDate()}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onCreate(); }}
          aria-label={`Create booking on ${date.toDateString()}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--admin-muted)] hover:text-[var(--admin-primary)]"
        >
          <BsPlusLg className="w-2.5 h-2.5" />
        </button>
      </div>

      <div className="space-y-1 relative">
        {blackout && (
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-red-600 pl-1 truncate">
            Closed · {blackout.reason}
          </p>
        )}
        {loading && bookings.length === 0 ? null : shown.map((b) => (
          <MonthChip
            key={b.id}
            booking={b}
            onClick={(e) => { e.stopPropagation(); onClickBooking(b); }}
          />
        ))}

        {extra > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onClickDay(); }}
            className="text-[10px] text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] pl-1"
          >
            +{extra} more
          </button>
        )}
      </div>
    </div>
  );
}

function MonthChip({
  booking, onClick,
}: {
  booking: Booking;
  onClick: (e: React.MouseEvent) => void;
}) {
  const accent = STATUS_ACCENT[booking.status];
  const isTerminal = booking.status === 'cancelled' || booking.status === 'no_show';
  return (
    <button
      onClick={onClick}
      aria-label={`${formatTime(booking.start_time)} ${booking.client_name} — ${STATUS_LABEL[booking.status]}`}
      className={`w-full text-left block relative ${isTerminal ? 'opacity-60 line-through' : ''}`}
    >
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />
      <div
        className="pl-2 pr-1.5 py-0.5 hover:brightness-95 transition"
        style={{ backgroundColor: `${accent}14` }}
      >
        <p className="text-[10px] text-[var(--admin-foreground)] truncate tabular-nums">
          <span className="font-semibold">{formatTime(booking.start_time)}</span>
          <span className="mx-1 text-[var(--admin-muted)]">·</span>
          <span>{booking.client_name}</span>
        </p>
      </div>
    </button>
  );
}

// ─── Time-grid view (shared by Week + Day) ───────────────────────────────
function TimeGridView({
  days, today, byDate, availability, blackouts, onPickBooking, onCreate,
}: {
  days: Date[];
  today: Date;
  byDate: Map<string, Booking[]>;
  availability: WeekdayRule[];
  blackouts: Blackout[];
  onPickBooking: (b: Booking) => void;
  onCreate: (isoDate: string, time: string) => void;
}) {
  const hours = useMemo(
    () => Array.from({ length: TIME_END_HOUR - TIME_START_HOUR + 1 }, (_, i) => TIME_START_HOUR + i),
    []
  );
  const isDayView = days.length === 1;

  return (
    <div className="bg-white border border-[var(--admin-sidebar-border)]">
      {/* Header row: empty corner + day headers */}
      <div
        className="grid border-b border-[var(--admin-sidebar-border)]"
        style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}
      >
        <div className="border-r border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-accent)]/40" />
        {days.map((d, i) => {
          const isToday = sameDay(d, today);
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div
              key={isoDate(d)}
              className={`px-3 py-2 text-center ${i < days.length - 1 ? 'border-r border-[var(--admin-sidebar-border)]' : ''} ${
                isWeekend && !isDayView ? 'bg-[var(--admin-sidebar-accent)]/40' : 'bg-[var(--admin-sidebar-accent)]/40'
              }`}
            >
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                {WEEKDAY_LABELS_SHORT[mondayIndex(d)]}
              </p>
              <p
                className={`mt-1 text-[16px] font-bold tabular-nums ${
                  isToday
                    ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--admin-primary)] text-white'
                    : 'text-[var(--admin-foreground)]'
                }`}
              >
                {d.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scroll area: hour rail + day columns */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))`,
            height: `${GRID_HEIGHT_PX}px`,
          }}
        >
          {/* Hour rail */}
          <div className="relative border-r border-[var(--admin-sidebar-border)]">
            {hours.slice(0, -1).map((h, i) => (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-start justify-end pr-2 pt-0.5"
                style={{ top: `${i * HOUR_PX}px`, height: `${HOUR_PX}px` }}
              >
                <span className="text-[10px] font-mono tabular-nums text-[var(--admin-muted)]">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, i) => {
            const key = isoDate(d);
            return (
              <TimeDayColumn
                key={key}
                date={d}
                bookings={byDate.get(key) ?? []}
                weekdayRule={availability.find((a) => a.weekday === d.getDay())}
                blackout={isDateInBlackout(key, blackouts)}
                isLast={i === days.length - 1}
                isToday={sameDay(d, today)}
                onPickBooking={onPickBooking}
                onCreate={onCreate}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimeDayColumn({
  date, bookings, weekdayRule, blackout, isLast, isToday, onPickBooking, onCreate,
}: {
  date: Date;
  bookings: Booking[];
  weekdayRule: WeekdayRule | undefined;
  blackout: Blackout | null;
  isLast: boolean;
  isToday: boolean;
  onPickBooking: (b: Booking) => void;
  onCreate: (isoDate: string, time: string) => void;
}) {
  const colRef = useRef<HTMLDivElement>(null);
  const hours = TIME_END_HOUR - TIME_START_HOUR;

  // Determine blocked regions within the visible grid (07:00 – 21:00).
  // If blacked-out → whole grid is blocked. Otherwise respect weekday rule.
  const gridStartMin = TIME_START_HOUR * 60;
  const gridEndMin = TIME_END_HOUR * 60;
  const isFullyBlocked = !!blackout || weekdayRule?.is_open === false;

  let closedBefore: { top: number; height: number } | null = null;
  let closedAfter: { top: number; height: number } | null = null;

  if (!isFullyBlocked && weekdayRule?.is_open) {
    const openMin = Math.max(gridStartMin, timeToMinutes(weekdayRule.open_time));
    const closeMin = Math.min(gridEndMin, timeToMinutes(weekdayRule.close_time));
    if (openMin > gridStartMin) {
      closedBefore = {
        top: 0,
        height: ((openMin - gridStartMin) / 60) * HOUR_PX,
      };
    }
    if (closeMin < gridEndMin) {
      closedAfter = {
        top: ((closeMin - gridStartMin) / 60) * HOUR_PX,
        height: ((gridEndMin - closeMin) / 60) * HOUR_PX,
      };
    }
  }

  const handleEmptyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only create when the user clicks the empty background (not a block
    // or a closed-hours overlay).
    if (e.target !== e.currentTarget) return;
    if (!colRef.current) return;
    const rect = colRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const time = pxToTimeString(y);
    onCreate(isoDate(date), time);
  };

  const currentTimeOffsetPx = isToday ? computeNowOffsetPx() : null;

  return (
    <div
      ref={colRef}
      onClick={handleEmptyClick}
      className={`relative group ${isLast ? '' : 'border-r border-[var(--admin-sidebar-border)]'} hover:bg-[var(--admin-sidebar-accent)]/10 transition-colors cursor-pointer`}
    >
      {/* Fully blocked (blackout or closed weekday) — striped red overlay */}
      {isFullyBlocked && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.06), rgba(239,68,68,0.06) 6px, rgba(239,68,68,0.14) 6px, rgba(239,68,68,0.14) 12px)',
          }}
        >
          <p className="pt-3 text-center text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-red-600">
            {blackout ? blackout.reason : 'Closed'}
          </p>
        </div>
      )}

      {/* Closed-hours bands (inside an otherwise-open day) */}
      {!isFullyBlocked && closedBefore && (
        <div
          aria-hidden
          className="absolute left-0 right-0 pointer-events-none bg-[var(--admin-sidebar-accent)]/70"
          style={{ top: `${closedBefore.top}px`, height: `${closedBefore.height}px` }}
        />
      )}
      {!isFullyBlocked && closedAfter && (
        <div
          aria-hidden
          className="absolute left-0 right-0 pointer-events-none bg-[var(--admin-sidebar-accent)]/70"
          style={{ top: `${closedAfter.top}px`, height: `${closedAfter.height}px` }}
        />
      )}

      {/* Hour gridlines */}
      {Array.from({ length: hours }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute left-0 right-0 border-t border-[var(--admin-sidebar-border)]"
          style={{ top: `${i * HOUR_PX}px` }}
        />
      ))}

      {/* Half-hour dashed gridlines (subtler) */}
      {Array.from({ length: hours }, (_, i) => (
        <div
          key={`half-${i}`}
          aria-hidden
          className="absolute left-0 right-0 border-t border-dashed border-[var(--admin-sidebar-border)]/50"
          style={{ top: `${i * HOUR_PX + HOUR_PX / 2}px` }}
        />
      ))}

      {/* Current time line (today only) */}
      {currentTimeOffsetPx != null && (
        <div
          aria-hidden
          className="absolute left-0 right-0 z-10 pointer-events-none"
          style={{ top: `${currentTimeOffsetPx}px` }}
        >
          <div className="h-px bg-[var(--admin-primary)]" />
          <div className="absolute -top-[3px] -left-[3px] w-[7px] h-[7px] rounded-full bg-[var(--admin-primary)]" />
        </div>
      )}

      {/* Bookings */}
      {bookings.map((b) => (
        <TimeBlock
          key={b.id}
          booking={b}
          onClick={(e) => { e.stopPropagation(); onPickBooking(b); }}
        />
      ))}
    </div>
  );
}

function TimeBlock({ booking, onClick }: { booking: Booking; onClick: (e: React.MouseEvent) => void }) {
  const accent = STATUS_ACCENT[booking.status];
  const top = timeToTopPx(booking.start_time);
  const height = durationToHeightPx(booking.duration_minutes);
  const endTime = addMinutes(booking.start_time, booking.duration_minutes);
  const isTerminal = booking.status === 'cancelled' || booking.status === 'no_show';
  // Blocks < ~45 min can only fit one line of text.
  const isShort = height < 48;

  return (
    <button
      onClick={onClick}
      className={`absolute left-0.5 right-0.5 text-left overflow-hidden hover:brightness-95 transition-all ${
        isTerminal ? 'opacity-60' : ''
      }`}
      style={{ top: `${top}px`, height: `${height}px`, backgroundColor: `${accent}14` }}
      aria-label={`${formatTime(booking.start_time)} – ${endTime}, ${booking.client_name}, ${STATUS_LABEL[booking.status]}`}
    >
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />
      <div className={`pl-2.5 pr-1.5 ${isShort ? 'py-0.5' : 'py-1'}`}>
        <p className="text-[10px] font-mono tabular-nums text-[var(--admin-foreground)] truncate">
          <span className="font-bold">{formatTime(booking.start_time)}</span>
          {!isShort && <span className="text-[var(--admin-muted)]"> – {endTime}</span>}
        </p>
        <p
          className={`text-[11px] font-semibold text-[var(--admin-foreground)] truncate ${isTerminal ? 'line-through' : ''}`}
          style={{ color: accent }}
        >
          {booking.client_name}
        </p>
        {!isShort && height > 72 && booking.service_name && (
          <p className="text-[10px] text-[var(--admin-muted)] truncate mt-0.5">{booking.service_name}</p>
        )}
      </div>
    </button>
  );
}

function computeNowOffsetPx(): number | null {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (h < TIME_START_HOUR || h >= TIME_END_HOUR) return null;
  const mins = (h - TIME_START_HOUR) * 60 + m;
  return (mins / 60) * HOUR_PX;
}

// ─── Day detail side panel (month view) ──────────────────────────────────
function DayPanel({
  date, bookings, onClose, onOpenBooking, onCreate,
}: {
  date: Date;
  bookings: Booking[];
  onClose: () => void;
  onOpenBooking: (b: Booking) => void;
  onCreate: () => void;
}) {
  const totalQuoted = bookings.reduce((sum, b) => sum + (b.quoted_amount_tzs ?? 0), 0);
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const dateLabel = date.toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-label={`Schedule for ${dateLabel}`}
    >
      <button aria-label="Close panel" onClick={onClose} className="flex-1 bg-black/30" />

      <aside className="w-full max-w-[400px] bg-white border-l border-[var(--admin-sidebar-border)] flex flex-col shadow-lg">
        <header className="px-5 py-4 border-b border-[var(--admin-sidebar-border)] flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
              {bookings.length === 0 ? 'Clear day' : `${bookings.length} session${bookings.length === 1 ? '' : 's'}`}
              {confirmedCount > 0 && ` · ${confirmedCount} confirmed`}
            </p>
            <h2 className="text-[15px] font-bold text-[var(--admin-foreground)] mt-0.5">
              {dateLabel}
            </h2>
            {totalQuoted > 0 && (
              <p className="text-[11px] text-[var(--admin-muted)] mt-1 tabular-nums">
                {formatTzs(totalQuoted)} quoted
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] text-xl leading-none"
            aria-label="Close"
          >×</button>
        </header>

        <div className="px-5 py-3 border-b border-[var(--admin-sidebar-border)]">
          <button
            onClick={onCreate}
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--admin-primary)] text-white px-3 py-2 text-[12px] font-semibold hover:bg-[var(--admin-primary)]/90 transition-colors"
          >
            <BsPlusLg className="w-3 h-3" />
            New booking for this day
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {bookings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[12px] text-[var(--admin-muted)]">
                Nothing on the calendar. Use the button above to add a session.
              </p>
            </div>
          ) : (
            <ul>
              {bookings.map((b) => (
                <li key={b.id}><PanelRow booking={b} onOpen={() => onOpenBooking(b)} /></li>
              ))}
            </ul>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-accent)]/40">
          <Link
            href="/studio-admin/bookings"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--admin-primary)] hover:underline"
          >
            Open in Bookings list
            <BsArrowUpRightCircle className="w-3 h-3" />
          </Link>
        </footer>
      </aside>
    </div>
  );
}

function PanelRow({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  const accent = STATUS_ACCENT[booking.status];
  const endTime = addMinutes(booking.start_time, booking.duration_minutes);
  const isTerminal = booking.status === 'cancelled' || booking.status === 'no_show';

  return (
    <button
      onClick={onOpen}
      className={`group w-full text-left relative block border-b border-[var(--admin-sidebar-border)] last:border-b-0 hover:bg-[var(--admin-sidebar-accent)]/60 transition-colors ${
        isTerminal ? 'opacity-60' : ''
      }`}
    >
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />
      <div className="pl-4 pr-4 py-3">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span className="text-[13px] font-bold tabular-nums text-[var(--admin-foreground)]">
            {formatTime(booking.start_time)} – {endTime}
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
            {STATUS_LABEL[booking.status]}
          </span>
        </div>
        <p className="text-[13px] font-semibold text-[var(--admin-foreground)] truncate">{booking.client_name}</p>
        <p className="text-[11px] text-[var(--admin-muted)] truncate mt-0.5">
          {booking.service_name ?? 'No service'}
          {booking.location && ` · ${booking.location}`}
        </p>
        {booking.quoted_amount_tzs != null && (
          <p className="text-[11px] text-[var(--admin-muted)] tabular-nums mt-1">
            {formatTzs(booking.quoted_amount_tzs)}
            {booking.deposit_paid && <span className="ml-2 text-emerald-600 font-semibold">· Deposit paid</span>}
          </p>
        )}
      </div>
    </button>
  );
}

// ─── Status colour legend (rendered below the grid) ──────────────────────
function Legend() {
  const items: { key: keyof typeof STATUS_ACCENT; label: string }[] = [
    { key: 'pending',   label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
      {items.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]"
        >
          <span className="w-2.5 h-2.5" style={{ backgroundColor: STATUS_ACCENT[key] }} />
          {label}
        </span>
      ))}
    </div>
  );
}
