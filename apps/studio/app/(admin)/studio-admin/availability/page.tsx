'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BsPlusLg, BsTrash, BsExclamationTriangle, BsCheckCircle, BsGlobeAmericas,
  BsXLg,
} from 'react-icons/bs';
import {
  type Blackout, type WeekdayRule, WEEKDAY_LABELS_LONG,
} from '@/lib/availability';

// Mon-first display order. JS convention 0=Sun..6=Sat.
const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIMEZONE_LABEL = 'Africa/Dar_es_Salaam';

function hhmm(v: string): string {
  return v.slice(0, 5);
}

export default function AvailabilityPage() {
  const [rules, setRules] = useState<WeekdayRule[]>([]);
  const [originalRules, setOriginalRules] = useState<WeekdayRule[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const loadAll = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/admin/availability').then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),
      fetch('/api/admin/blackouts').then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),
    ])
      .then(([a, b]) => {
        const sortedRules: WeekdayRule[] = (a?.weekdays ?? []).map((r: WeekdayRule) => ({
          ...r,
          open_time: hhmm(r.open_time),
          close_time: hhmm(r.close_time),
        }));
        setRules(sortedRules);
        setOriginalRules(sortedRules);
        setBlackouts(b?.blackouts ?? []);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const setRule = (weekday: number, patch: Partial<WeekdayRule>) => {
    setRules((prev) => prev.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)));
  };

  const isDirty = useMemo(
    () => JSON.stringify(rules) !== JSON.stringify(originalRules),
    [rules, originalRules]
  );

  const summary = useMemo(() => summarise(rules), [rules]);

  const saveHours = async () => {
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      const changed = rules.filter((r) => {
        const orig = originalRules.find((o) => o.weekday === r.weekday);
        return !orig ||
          orig.is_open !== r.is_open ||
          orig.open_time !== r.open_time ||
          orig.close_time !== r.close_time;
      });
      if (changed.length === 0) { setSaving(false); return; }

      const res = await fetch('/api/admin/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekdays: changed.map((r) => ({
            weekday: r.weekday,
            is_open: r.is_open,
            open_time: r.open_time,
            close_time: r.close_time,
          })),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = await res.json();
      const next: WeekdayRule[] = (j.weekdays ?? []).map((r: WeekdayRule) => ({
        ...r,
        open_time: hhmm(r.open_time),
        close_time: hhmm(r.close_time),
      }));
      setRules(next);
      setOriginalRules(next);
      setFlash('Saved');
      setTimeout(() => setFlash(null), 2200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => setRules(originalRules);

  const addBlackout = async (start_date: string, end_date: string, reason: string) => {
    const res = await fetch('/api/admin/blackouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_date, end_date, reason }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || `HTTP ${res.status}`);
    }
    const j = await res.json();
    setBlackouts((prev) => [...prev, j.blackout].sort((a, b) => a.start_date.localeCompare(b.start_date)));
  };

  const removeBlackout = async (id: string) => {
    if (!window.confirm('Remove this blackout date? Bookings will be allowed again.')) return;
    const res = await fetch(`/api/admin/blackouts/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    setBlackouts((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="max-w-[960px] mx-auto space-y-6 pb-20">

      {loading && rules.length === 0 && (
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-[var(--admin-sidebar-border)]" />
          <div className="h-80 bg-[var(--admin-sidebar-border)]" />
          <div className="h-40 bg-[var(--admin-sidebar-border)]" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-white border border-red-200 p-4 flex items-start gap-3">
          <BsExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-red-700">Couldn&apos;t load availability.</p>
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
          <button onClick={loadAll} className="text-[12px] font-medium text-red-700 hover:underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Summary strip ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[var(--admin-sidebar-border)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[12px] font-semibold text-[var(--admin-foreground)]">
                  {summary}
                </span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
              <BsGlobeAmericas className="w-3 h-3" />
              {TIMEZONE_LABEL}
            </span>
          </div>

          {/* ── Working hours ─────────────────────────────────────────── */}
          <section className="bg-white border border-[var(--admin-sidebar-border)]">
            <header className="px-5 py-3 border-b border-[var(--admin-sidebar-border)]">
              <h2 className="text-[14px] font-bold text-[var(--admin-foreground)]">Working hours</h2>
              <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">
                Bookings outside these windows are blocked.
              </p>
            </header>

            <ul>
              {WEEKDAY_DISPLAY_ORDER.map((wd) => {
                const rule = rules.find((r) => r.weekday === wd);
                if (!rule) return null;
                return (
                  <WeekdayRow key={wd} rule={rule} onChange={(patch) => setRule(wd, patch)} />
                );
              })}
            </ul>
          </section>

          {/* ── Time off ──────────────────────────────────────────────── */}
          <TimeOffSection blackouts={blackouts} onAdd={addBlackout} onRemove={removeBlackout} />
        </>
      )}

      {/* ── Sticky save bar (only when dirty) ─────────────────────────── */}
      {isDirty && (
        <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[var(--admin-sidebar-border)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-30">
          <div className="max-w-[960px] mx-auto px-6 py-3 flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-[var(--admin-foreground)]">
              Unsaved changes
            </span>
            <div className="flex items-center gap-3">
              {flash && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                  <BsCheckCircle className="w-3.5 h-3.5" />
                  {flash}
                </span>
              )}
              <button
                onClick={discardChanges}
                disabled={saving}
                className="text-[12px] font-medium px-3 py-2 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] disabled:opacity-50"
              >
                Discard
              </button>
              <button
                onClick={saveHours}
                disabled={saving}
                className="text-[12px] font-semibold px-4 py-2 bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary line ────────────────────────────────────────────────────────
function summarise(rules: WeekdayRule[]): string {
  const openDays = rules.filter((r) => r.is_open);
  if (openDays.length === 0) return 'Closed every day';
  const uniqWindows = new Set(openDays.map((r) => `${r.open_time}-${r.close_time}`));
  if (openDays.length === 7 && uniqWindows.size === 1) {
    const w = [...uniqWindows][0];
    const [o, c] = w.split('-');
    return `Open 7 days · ${o} – ${c}`;
  }
  if (uniqWindows.size === 1) {
    const w = [...uniqWindows][0];
    const [o, c] = w.split('-');
    return `Open ${openDays.length} day${openDays.length === 1 ? '' : 's'} · ${o} – ${c}`;
  }
  return `Open ${openDays.length} day${openDays.length === 1 ? '' : 's'} · mixed hours`;
}

// ─── Weekday row ─────────────────────────────────────────────────────────
// Cal.com-style: compact single-line rows. Filled dot = open, outline = closed.
// Closed days collapse to "Unavailable" — no disabled inputs, no noise.
function WeekdayRow({
  rule, onChange,
}: {
  rule: WeekdayRule;
  onChange: (patch: Partial<WeekdayRule>) => void;
}) {
  return (
    <li className="flex items-center gap-6 px-6 py-4 border-b border-[var(--admin-sidebar-border)] last:border-b-0 hover:bg-[var(--admin-sidebar-accent)]/30 transition-colors">

      {/* Day label (3-letter mono caps) */}
      <span className="text-[12px] font-mono font-semibold uppercase tracking-[0.14em] text-[var(--admin-foreground)] w-[44px] shrink-0">
        {WEEKDAY_SHORT[rule.weekday]}
      </span>

      {/* Open / Closed — radio group */}
      <fieldset className="flex items-center gap-4 shrink-0">
        <legend className="sr-only">{WEEKDAY_LABELS_LONG[rule.weekday]} availability</legend>
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name={`day-${rule.weekday}`}
            checked={rule.is_open}
            onChange={() => onChange({ is_open: true })}
            className="accent-[var(--admin-primary)] cursor-pointer"
          />
          <span className="text-[12px] text-[var(--admin-foreground)]">Open</span>
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name={`day-${rule.weekday}`}
            checked={!rule.is_open}
            onChange={() => onChange({ is_open: false })}
            className="accent-[var(--admin-primary)] cursor-pointer"
          />
          <span className="text-[12px] text-[var(--admin-foreground)]">Closed</span>
        </label>
      </fieldset>

      {/* Inline editor or "Unavailable" */}
      {rule.is_open ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="time"
            value={rule.open_time}
            onChange={(e) => onChange({ open_time: e.target.value })}
            aria-label={`Open time for ${WEEKDAY_LABELS_LONG[rule.weekday]}`}
            className="text-[13px] px-2 py-1 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)] tabular-nums w-[110px]"
          />
          <span className="text-[var(--admin-muted)] text-[13px]">–</span>
          <input
            type="time"
            value={rule.close_time}
            onChange={(e) => onChange({ close_time: e.target.value })}
            aria-label={`Close time for ${WEEKDAY_LABELS_LONG[rule.weekday]}`}
            className="text-[13px] px-2 py-1 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)] tabular-nums w-[110px]"
          />
        </div>
      ) : (
        <span className="flex-1 text-[12px] text-[var(--admin-muted)]">Unavailable</span>
      )}
    </li>
  );
}

// ─── Time off section ────────────────────────────────────────────────────
function TimeOffSection({
  blackouts, onAdd, onRemove,
}: {
  blackouts: Blackout[];
  onAdd: (start: string, end: string, reason: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const upcoming = blackouts.filter((b) => b.end_date >= todayIso());
  const past = blackouts.filter((b) => b.end_date < todayIso());

  return (
    <section className="bg-white border border-[var(--admin-sidebar-border)]">
      <header className="px-5 py-3 border-b border-[var(--admin-sidebar-border)] flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--admin-foreground)]">
            Time off
            {upcoming.length > 0 && (
              <span className="ml-2 text-[11px] font-normal text-[var(--admin-muted)] tabular-nums">
                {upcoming.length} upcoming
              </span>
            )}
          </h2>
          <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">
            Days the studio is closed — holidays, travel, or studio maintenance.
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 bg-[var(--admin-primary)] text-white px-3 py-2 text-[12px] font-semibold hover:bg-[var(--admin-primary)]/90 transition-colors"
          >
            <BsPlusLg className="w-3 h-3" />
            Add time off
          </button>
        )}
      </header>

      {adding && (
        <AddBlackoutForm
          onSubmit={async (s, e, r) => { await onAdd(s, e, r); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {blackouts.length === 0 && !adding ? (
        <div className="px-5 py-10 text-center">
          <p className="text-[13px] font-semibold text-[var(--admin-foreground)]">No time off scheduled.</p>
          <p className="text-[11px] text-[var(--admin-muted)] mt-1">
            Add a holiday or studio closure so bookings skip those days automatically.
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <ul className="divide-y divide-[var(--admin-sidebar-border)]">
              {upcoming.map((b) => (
                <BlackoutRow key={b.id} blackout={b} onRemove={onRemove} />
              ))}
            </ul>
          )}
          {past.length > 0 && (
            <>
              <button
                onClick={() => setShowPast((v) => !v)}
                className="w-full px-5 py-2 text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] hover:bg-[var(--admin-sidebar-accent)]/50 text-left transition-colors border-t border-[var(--admin-sidebar-border)]"
              >
                {showPast ? '▾' : '▸'} Past {past.length} {past.length === 1 ? 'entry' : 'entries'}
              </button>
              {showPast && (
                <ul className="divide-y divide-[var(--admin-sidebar-border)] opacity-60">
                  {past.map((b) => (
                    <BlackoutRow key={b.id} blackout={b} onRemove={onRemove} />
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

// ─── Add-blackout inline form (reveals on Add click) ─────────────────────
function AddBlackoutForm({
  onSubmit, onCancel,
}: {
  onSubmit: (start: string, end: string, reason: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onStartChange = (v: string) => {
    setStart(v);
    if (!end || end < v) setEnd(v);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(start, end, reason.trim());
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to add');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="px-5 py-4 border-b border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-accent)]/30">
      <div className="grid grid-cols-[1fr_1fr_2fr_auto] gap-3 items-end">
        <LabelledInput label="From" type="date" required value={start} onChange={onStartChange} />
        <LabelledInput label="To"   type="date" required value={end}   onChange={setEnd} />
        <LabelledInput label="Reason" required value={reason} onChange={setReason} placeholder="Eid · travel · studio refit…" />
        <div className="flex items-center gap-1">
          <button
            type="submit"
            disabled={submitting || !start || !end || !reason.trim()}
            className="inline-flex items-center gap-2 bg-[var(--admin-primary)] text-white px-4 py-2 text-[12px] font-semibold hover:bg-[var(--admin-primary)]/90 disabled:opacity-50 transition-colors whitespace-nowrap h-[38px]"
          >
            <BsPlusLg className="w-3 h-3" />
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="p-2 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] hover:bg-[var(--admin-sidebar-accent)] transition-colors h-[38px]"
          >
            <BsXLg className="w-3 h-3" />
          </button>
        </div>
      </div>
      {formError && (
        <p className="mt-2 text-[12px] text-red-700">{formError}</p>
      )}
    </form>
  );
}

// ─── Blackout row ────────────────────────────────────────────────────────
function BlackoutRow({ blackout, onRemove }: { blackout: Blackout; onRemove: (id: string) => Promise<void> }) {
  const [removing, setRemoving] = useState(false);
  const start = new Date(`${blackout.start_date}T00:00:00`);
  const end = new Date(`${blackout.end_date}T00:00:00`);
  const range = blackout.start_date === blackout.end_date
    ? start.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    : `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  const spanDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  return (
    <li className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
      <div className="min-w-0 flex items-baseline gap-3">
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--admin-foreground)] truncate">{blackout.reason}</p>
          <p className="text-[11px] text-[var(--admin-muted)] tabular-nums mt-0.5">
            {range}
            <span className="mx-1">·</span>
            {spanDays} day{spanDays === 1 ? '' : 's'}
          </p>
        </div>
      </div>
      <button
        onClick={async () => { setRemoving(true); await onRemove(blackout.id); setRemoving(false); }}
        disabled={removing}
        aria-label={`Remove blackout for ${blackout.reason}`}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--admin-muted)] hover:text-red-600 disabled:opacity-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <BsTrash className="w-3 h-3" />
        {removing ? 'Removing…' : 'Remove'}
      </button>
    </li>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────
function LabelledInput({
  label, value, onChange, type = 'text', required, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)] mb-1">
        {label}{required && <span className="text-[var(--admin-primary)] ml-1">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13px] px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)] h-[38px]"
      />
    </label>
  );
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
