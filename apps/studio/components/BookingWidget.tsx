'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WEEKDAY_LABELS_SHORT } from '@/lib/availability';

// ─── Types ───────────────────────────────────────────────────────────────
type Step = 'datetime' | 'details' | 'done';

interface BookingResult {
  id: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  status: string;
  client_name: string;
}

interface PublicService {
  id: string;
  title: string;
  description: string;
  price: string;
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  notes: string;
  consent: boolean;
  hp: string;
}

// ─── Constants ───────────────────────────────────────────────────────────
const DEFAULT_DURATION = 60;
const TIMEZONE_LABEL = 'Africa/Dar es Salaam · EAT';
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Date helpers ────────────────────────────────────────────────────────
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function mondayIndex(d: Date): number {
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}
function buildMonthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - mondayIndex(first));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
function formatLongDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Drawer ──────────────────────────────────────────────────────────────
interface BookingWidgetProps {
  defaultOpen?: boolean;
  closeHref?: string;
}

export default function BookingWidget({ defaultOpen = true, closeHref = '/' }: BookingWidgetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);

  // Preserve the element that had focus before the drawer opened so we can
  // restore it on close (WCAG focus-return requirement).
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      returnFocusRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    setTimeout(() => router.push(closeHref), 180);
  };

  const [step, setStep] = useState<Step>('datetime');
  const [anchor, setAnchor] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [services, setServices] = useState<PublicService[]>([]);
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);

  const [form, setForm] = useState<ContactForm>({
    name: '', email: '', phone: '', notes: '', consent: false, hp: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [conflictFlash, setConflictFlash] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  // ── Services (public) ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch('/api/services')
      .then((r) => (r.ok ? r.json() : { services: [] }))
      .then((d) => { if (!cancelled) setServices(d.services ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // ── Unavailable dates for the visible month ──────────────────────────
  const monthKey = `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, '0')}`;
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bookings/unavailable-dates?month=${monthKey}`)
      .then((r) => (r.ok ? r.json() : { dates: [] }))
      .then((d) => { if (!cancelled) setUnavailable(new Set<string>(d.dates ?? [])); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [monthKey]);

  // ── Slots for the selected date ──────────────────────────────────────
  const loadSlots = useCallback((date: string) => {
    setSlotsLoading(true);
    setSlots(null);
    fetch(`/api/bookings/slots?date=${date}&duration=${DEFAULT_DURATION}`)
      .then((r) => (r.ok ? r.json() : { slots: [] }))
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const pickDate = (d: Date) => {
    const iso = isoDate(d);
    if (unavailable.has(iso)) return;
    setSelectedDate(iso);
    setSelectedTime(null);
  };

  const goPrev = () => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1));
  const goNext = () => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1));

  const canContinueToDetails = !!(selectedDate && selectedTime);
  const canSubmit = !!(form.name.trim() && form.email.trim().includes('@') && form.consent);

  // Close-confirm if the user has entered form data — avoids silent loss.
  const handleClose = () => {
    const dirty =
      form.name.trim() || form.email.trim() || form.phone.trim() || form.notes.trim();
    if (step === 'details' && dirty) {
      if (!window.confirm('Close the booking? Your details will be lost.')) return;
    }
    close();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: form.name.trim(),
          client_email: form.email.trim(),
          client_phone: form.phone.trim() || null,
          service_id: selectedService?.id ?? null,
          service_name: selectedService?.title ?? null,
          booking_date: selectedDate,
          start_time: selectedTime,
          duration_minutes: DEFAULT_DURATION,
          notes: form.notes.trim() || null,
          hp: form.hp,
        }),
      });

      if (res.status === 409) {
        // Someone took the slot between pick and submit. Refresh slots,
        // bounce the user back a step, and let them try again.
        const j = await res.json().catch(() => ({}));
        setConflictFlash(j.error || 'That time was just taken. Pick another.');
        setSelectedTime(null);
        loadSlots(selectedDate);
        setStep('datetime');
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (HTTP ${res.status})`);
      }
      const j = await res.json();
      if (j.hp) { setStep('done'); return; }
      setResult(j.booking);
      setStep('done');
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  // ARIA live region for screen-reader step announcements
  const stepAnnouncement = useMemo(() => {
    if (step === 'datetime') return 'Step 1 of 3 · Date and time';
    if (step === 'details')  return 'Step 2 of 3 · Your details';
    return 'Step 3 of 3 · Confirmed';
  }, [step]);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Book a session"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <span className="sr-only" aria-live="polite">{stepAnnouncement}</span>

      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={handleClose}
        className="flex-1 bg-black/40 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <aside
        className={`w-full max-w-[520px] bg-white flex flex-col transition-transform duration-200 shadow-[-24px_0_60px_rgba(0,0,0,0.12)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <header className="px-7 pt-7 pb-6 flex items-start justify-between gap-4 shrink-0 border-b border-neutral-100">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-neutral-900 leading-tight">
              Book a session
            </h2>
            <p className="text-[13px] text-neutral-500 mt-1">
              Pick a time that works — we&apos;ll confirm within a day.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3 L13 13 M13 3 L3 13" />
            </svg>
          </button>
        </header>

        <Progress step={step} />

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {conflictFlash && step === 'datetime' && (
            <div className="mx-7 mt-5 px-3.5 py-2.5 bg-amber-50 border border-amber-200 text-[13px] text-amber-800 rounded-lg">
              {conflictFlash} <button className="underline" onClick={() => setConflictFlash(null)}>dismiss</button>
            </div>
          )}

          {step === 'datetime' && (
            <DateTimeStep
              anchor={anchor}
              goPrev={goPrev}
              goNext={goNext}
              unavailable={unavailable}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              slots={slots}
              slotsLoading={slotsLoading}
              pickDate={pickDate}
              pickTime={setSelectedTime}
              services={services}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
            />
          )}
          {step === 'details' && selectedDate && selectedTime && (
            <DetailsStep
              date={selectedDate}
              time={selectedTime}
              service={selectedService}
              form={form}
              setForm={setForm}
              onSubmit={submit}
              error={submitError}
            />
          )}
          {step === 'done' && (
            <DoneStep
              result={result}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              service={selectedService}
              onClose={handleClose}
            />
          )}
        </div>

        {/* Footer */}
        {step !== 'done' && (
          <footer className="px-7 py-4 border-t border-neutral-100 flex items-center justify-between gap-3 shrink-0 bg-white">
            {step === 'datetime' ? (
              <>
                <span className="text-[11px] text-neutral-400 tabular-nums">{TIMEZONE_LABEL}</span>
                <button
                  type="button"
                  onClick={() => canContinueToDetails && setStep('details')}
                  disabled={!canContinueToDetails}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900 text-white text-[13px] font-medium rounded-full hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
                >
                  Continue
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2 L8 6 L4 10" /></svg>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  className="text-[13px] font-medium text-neutral-500 hover:text-neutral-900 px-2 py-2 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="booking-details-form"
                  disabled={submitting || !canSubmit}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900 text-white text-[13px] font-medium rounded-full hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending…' : 'Request booking'}
                </button>
              </>
            )}
          </footer>
        )}
      </aside>
    </div>
  );
}

// ─── Progress stepper ────────────────────────────────────────────────────
function Progress({ step }: { step: Step }) {
  const items: { key: Step; label: string; n: number }[] = [
    { key: 'datetime', label: 'Date & time',  n: 1 },
    { key: 'details',  label: 'Your details', n: 2 },
    { key: 'done',     label: 'Confirmed',    n: 3 },
  ];
  const activeIdx = items.findIndex((i) => i.key === step);
  return (
    <div className="px-7 pt-5 pb-5 border-b border-neutral-100">
      <ol className="flex items-center gap-3">
        {items.map((item, i) => {
          const state: 'done' | 'active' | 'pending' =
            i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending';
          const isLast = i === items.length - 1;
          return (
            <li key={item.key} className="flex items-center gap-3 flex-1">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold shrink-0 transition-colors ${
                  state === 'active' || state === 'done' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {state === 'done' ? (
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6 L5 8 L9 4" />
                  </svg>
                ) : item.n}
              </span>
              <span className={`text-[12px] font-medium whitespace-nowrap transition-colors ${state === 'pending' ? 'text-neutral-400' : 'text-neutral-900'}`}>
                {item.label}
              </span>
              {!isLast && (
                <span aria-hidden className={`flex-1 h-px transition-colors ${state === 'done' ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Step 1 ──────────────────────────────────────────────────────────────
function DateTimeStep({
  anchor, goPrev, goNext, unavailable,
  selectedDate, selectedTime, slots, slotsLoading,
  pickDate, pickTime,
  services, selectedService, setSelectedService,
}: {
  anchor: Date;
  goPrev: () => void;
  goNext: () => void;
  unavailable: Set<string>;
  selectedDate: string | null;
  selectedTime: string | null;
  slots: string[] | null;
  slotsLoading: boolean;
  pickDate: (d: Date) => void;
  pickTime: (t: string) => void;
  services: PublicService[];
  selectedService: PublicService | null;
  setSelectedService: (s: PublicService | null) => void;
}) {
  const grid = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Keyboard navigation across the calendar grid (arrow keys + home/end).
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onCellKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let next = idx;
    if (e.key === 'ArrowRight')      next = Math.min(41, idx + 1);
    else if (e.key === 'ArrowLeft')  next = Math.max(0, idx - 1);
    else if (e.key === 'ArrowDown')  next = Math.min(41, idx + 7);
    else if (e.key === 'ArrowUp')    next = Math.max(0, idx - 7);
    else if (e.key === 'Home')       next = Math.floor(idx / 7) * 7;
    else if (e.key === 'End')        next = Math.floor(idx / 7) * 7 + 6;
    else return;
    e.preventDefault();
    cellRefs.current[next]?.focus();
  };

  return (
    <div className="px-7 py-6 space-y-7">

      {/* Service picker */}
      {services.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h4 className="text-[13px] font-semibold text-neutral-900">What kind of session?</h4>
            {selectedService && (
              <button
                onClick={() => setSelectedService(null)}
                className="text-[11px] text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {services.map((s) => {
              const active = selectedService?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(active ? null : s)}
                  aria-pressed={active}
                  className={`text-left px-3.5 py-3 rounded-xl border transition-colors ${
                    active
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <p className="text-[13px] font-semibold text-neutral-900 truncate">{s.title}</p>
                  {s.price && (
                    <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{s.price}</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Calendar */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-neutral-900 tabular-nums">
            {MONTH_NAMES[anchor.getMonth()]} {anchor.getFullYear()}
          </h3>
          <div className="flex items-center gap-1">
            <button onClick={goPrev} aria-label="Previous month" className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">
              <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 2 L3 6 L7 10" /></svg>
            </button>
            <button onClick={goNext} aria-label="Next month" className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">
              <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 2 L9 6 L5 10" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {[1, 2, 3, 4, 5, 6, 0].map((wd) => (
            <div key={wd} className="text-center text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-1">
              {WEEKDAY_LABELS_SHORT[wd].slice(0, 1)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label="Pick a date">
          {grid.map((d, idx) => {
            const iso = isoDate(d);
            const isOutOfMonth = d.getMonth() !== anchor.getMonth();
            const isPast = d < today;
            const isBlocked = unavailable.has(iso) || isPast;
            const isSelected = selectedDate === iso;
            const isToday = sameDay(d, new Date());
            const isDisabled = isBlocked || isOutOfMonth;
            const label = formatLongDate(iso);

            return (
              <div key={iso} className="flex items-center justify-center" role="gridcell">
                <button
                  ref={(el) => { cellRefs.current[idx] = el; }}
                  onClick={() => !isDisabled && pickDate(d)}
                  onKeyDown={(e) => onCellKey(e, idx)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  aria-label={label}
                  tabIndex={isDisabled ? -1 : (selectedDate === iso || (!selectedDate && isToday) ? 0 : -1)}
                  className={[
                    'w-9 h-9 text-[13px] font-medium tabular-nums transition-colors rounded-full',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40',
                    isOutOfMonth ? 'text-transparent pointer-events-none' : '',
                    isDisabled && !isOutOfMonth ? 'text-neutral-300 cursor-not-allowed' : '',
                    !isDisabled && !isSelected ? 'text-neutral-900 hover:bg-neutral-100' : '',
                    isSelected ? 'bg-neutral-900 text-white' : '',
                    isToday && !isSelected && !isDisabled ? 'ring-1 ring-neutral-300' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {d.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Times */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h4 className="text-[13px] font-semibold text-neutral-900">
            {selectedDate ? 'Available times' : 'Pick a date first'}
          </h4>
          {selectedDate && (
            <span className="text-[11px] text-neutral-500">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          )}
        </div>

        {!selectedDate && <p className="text-[13px] text-neutral-400">Tap any open date above to see times.</p>}

        {selectedDate && slotsLoading && (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 bg-neutral-100 animate-pulse rounded-full" />
            ))}
          </div>
        )}

        {selectedDate && !slotsLoading && slots && slots.length === 0 && (
          <div className="py-6 text-center border border-dashed border-neutral-200 rounded-lg">
            <p className="text-[13px] text-neutral-500">No times left this day.</p>
            <p className="text-[12px] text-neutral-400 mt-1">Try another date.</p>
          </div>
        )}

        {selectedDate && !slotsLoading && slots && slots.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((t) => {
              const isSelected = selectedTime === t;
              return (
                <button
                  key={t}
                  onClick={() => pickTime(t)}
                  aria-pressed={isSelected}
                  className={`h-9 text-[12px] font-medium tabular-nums rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
                    isSelected
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-900'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────────
function DetailsStep({
  date, time, service, form, setForm, onSubmit, error,
}: {
  date: string;
  time: string;
  service: PublicService | null;
  form: ContactForm;
  setForm: React.Dispatch<React.SetStateAction<ContactForm>>;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}) {
  const inputClasses =
    'w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg text-neutral-900 text-[14px] placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all';
  const labelClasses = 'block text-[12px] font-medium text-neutral-700 mb-1.5';

  return (
    <form id="booking-details-form" onSubmit={onSubmit} className="px-7 py-6 space-y-5">
      {/* Summary card */}
      <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1.5">Your request</p>
        <p className="text-[14px] font-semibold text-neutral-900 leading-tight">{formatLongDate(date)}</p>
        <p className="text-[13px] text-neutral-500 mt-0.5 tabular-nums">{time} · {DEFAULT_DURATION} min · {TIMEZONE_LABEL}</p>
        {service && <p className="text-[13px] text-neutral-900 mt-2 font-medium">{service.title}{service.price && <span className="text-neutral-500 font-normal"> · {service.price}</span>}</p>}
      </div>

      <div>
        <label htmlFor="bw-name" className={labelClasses}>Full name</label>
        <input id="bw-name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClasses} placeholder="Jane Doe" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bw-email" className={labelClasses}>Email</label>
          <input id="bw-email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputClasses} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="bw-phone" className={labelClasses}>Phone <span className="text-neutral-400">· optional</span></label>
          <input id="bw-phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputClasses} placeholder="+255…" />
        </div>
      </div>
      <div>
        <label htmlFor="bw-notes" className={labelClasses}>What&apos;s the shoot about? <span className="text-neutral-400">· optional</span></label>
        <textarea
          id="bw-notes"
          rows={4}
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          className={`${inputClasses} resize-y`}
          placeholder="Style · party size · location preferences · anything that helps us prep."
        />
      </div>

      {/* Consent */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm((p) => ({ ...p, consent: e.target.checked }))}
          className="mt-0.5 w-4 h-4 accent-neutral-900 shrink-0"
          required
        />
        <span className="text-[12px] text-neutral-600 leading-relaxed">
          I agree to the{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900">privacy policy</a>
          {' '}and{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900">booking terms</a>.
          My request is confirmed after the studio replies within a day.
        </span>
      </label>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.hp}
        onChange={(e) => setForm((p) => ({ ...p, hp: e.target.value }))}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
      />

      {error && (
        <div className="border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </form>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────────
function DoneStep({
  result, selectedDate, selectedTime, service, onClose,
}: {
  result: BookingResult | null;
  selectedDate: string | null;
  selectedTime: string | null;
  service: PublicService | null;
  onClose: () => void;
}) {
  const date = result?.booking_date ?? selectedDate;
  const time = result?.start_time ? result.start_time.slice(0, 5) : selectedTime;

  return (
    <div className="px-7 py-12 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-5">
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13 L10 18 L20 7" />
        </svg>
      </div>
      <h2 className="text-[22px] font-semibold tracking-tight text-neutral-900 mb-2">
        Request sent
      </h2>
      <p className="text-[14px] text-neutral-500 max-w-[380px] mx-auto leading-relaxed">
        {result?.client_name ? `Thanks, ${result.client_name}. ` : 'Thanks. '}
        We&apos;ve received your booking for {date ? formatLongDate(date) : 'the chosen date'}
        {time && <> at <span className="tabular-nums">{time}</span></>}
        {service && <>{` · ${service.title}`}</>}. A confirmation is on its way to your email.
      </p>
      {result?.id && (
        <p className="mt-5 text-[11px] text-neutral-400 tabular-nums">
          Reference · {result.id.slice(0, 8)}
        </p>
      )}
      <button
        onClick={onClose}
        className="mt-7 inline-flex items-center gap-1.5 px-5 py-2.5 bg-neutral-900 text-white text-[13px] font-medium rounded-full hover:bg-neutral-800 active:scale-[0.98] transition-all"
      >
        Done
      </button>
    </div>
  );
}
