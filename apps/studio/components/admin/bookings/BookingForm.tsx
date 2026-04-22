'use client';

import { useState } from 'react';
import { BsTrash, BsExclamationTriangle } from 'react-icons/bs';
import type { Booking, BookingStatus, ServiceOption } from '@/lib/bookings';
import { STATUS_OPTIONS, formatTime } from '@/lib/bookings';

interface FormProps {
  mode: 'create' | 'edit';
  booking?: Booking;
  services: ServiceOption[];
  /** Prefill date when creating from a calendar cell (YYYY-MM-DD). */
  defaultDate?: string;
  /** Prefill start time when creating from a week/day time slot (HH:MM). */
  defaultStartTime?: string;
  onClose: () => void;
  onSaved: (b: Booking) => void;
  onDeleted?: () => void;
}

interface FormState {
  client_name: string;
  client_email: string;
  client_phone: string;
  service_id: string;
  service_name: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  status: BookingStatus;
  quoted_amount_tzs: string;
  deposit_amount_tzs: string;
  deposit_paid: boolean;
  location: string;
  notes: string;
  internal_notes: string;
  cancellation_reason: string;
}

function bookingToForm(b?: Booking, defaultDate?: string, defaultStartTime?: string): FormState {
  return {
    client_name:         b?.client_name ?? '',
    client_email:        b?.client_email ?? '',
    client_phone:        b?.client_phone ?? '',
    service_id:          b?.service_id ?? '',
    service_name:        b?.service_name ?? '',
    booking_date:        b?.booking_date ?? defaultDate ?? '',
    start_time:          b ? formatTime(b.start_time) : (defaultStartTime ?? '10:00'),
    duration_minutes:    b?.duration_minutes ?? 60,
    status:              b?.status ?? 'pending',
    quoted_amount_tzs:   b?.quoted_amount_tzs?.toString() ?? '',
    deposit_amount_tzs:  b?.deposit_amount_tzs?.toString() ?? '',
    deposit_paid:        b?.deposit_paid ?? false,
    location:            b?.location ?? '',
    notes:               b?.notes ?? '',
    internal_notes:      b?.internal_notes ?? '',
    cancellation_reason: b?.cancellation_reason ?? '',
  };
}

export default function BookingForm({
  mode, booking, services, defaultDate, defaultStartTime, onClose, onSaved, onDeleted,
}: FormProps) {
  const [form, setForm] = useState<FormState>(() => bookingToForm(booking, defaultDate, defaultStartTime));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onServiceChange = (id: string) => {
    const svc = services.find((s) => s.id === id);
    set('service_id', id);
    if (svc) set('service_name', svc.title);
  };

  const toInt = (s: string) => (s.trim() === '' ? null : Math.max(0, Math.round(Number(s))));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);

    const body: Record<string, unknown> = {
      client_name:        form.client_name.trim(),
      client_email:       form.client_email.trim(),
      client_phone:       form.client_phone.trim() || null,
      service_id:         form.service_id || null,
      service_name:       form.service_name.trim() || null,
      booking_date:       form.booking_date,
      start_time:         form.start_time,
      duration_minutes:   Number(form.duration_minutes) || 60,
      status:             form.status,
      quoted_amount_tzs:  toInt(form.quoted_amount_tzs),
      deposit_amount_tzs: toInt(form.deposit_amount_tzs),
      deposit_paid:       form.deposit_paid,
      location:           form.location.trim() || null,
      notes:              form.notes.trim() || null,
      internal_notes:     form.internal_notes.trim() || null,
    };
    if (form.status === 'cancelled') {
      body.cancellation_reason = form.cancellation_reason.trim() || null;
    }

    try {
      const url = mode === 'create'
        ? '/api/admin/bookings'
        : `/api/admin/bookings/${booking!.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = await res.json();
      onSaved(j.booking);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!booking || !onDeleted) return;
    if (!window.confirm('Delete this booking? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onDeleted();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-start justify-center pt-10 pb-10 overflow-auto z-50"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[var(--admin-sidebar-border)] w-full max-w-2xl"
      >
        <div className="px-6 py-4 border-b border-[var(--admin-sidebar-border)] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
              {mode === 'create' ? 'New booking' : 'Edit booking'}
            </p>
            <h2 className="text-lg font-bold text-[var(--admin-foreground)] mt-0.5">
              {mode === 'create' ? 'Capture a new session' : (booking?.client_name ?? 'Edit')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] text-xl leading-none"
            aria-label="Close"
          >×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">Client</legend>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Full name" required value={form.client_name} onChange={(v) => set('client_name', v)} />
              <Input label="Email" required type="email" value={form.client_email} onChange={(v) => set('client_email', v)} />
            </div>
            <Input label="Phone" value={form.client_phone} onChange={(v) => set('client_phone', v)} />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">Schedule</legend>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Date" type="date" required value={form.booking_date} onChange={(v) => set('booking_date', v)} />
              <Input label="Start time" type="time" required value={form.start_time} onChange={(v) => set('start_time', v)} />
              <Input label="Duration (min)" type="number" value={String(form.duration_minutes)} onChange={(v) => set('duration_minutes', Number(v) || 60)} />
            </div>
            <Input label="Location" value={form.location} onChange={(v) => set('location', v)} placeholder="Studio · outdoor · client venue…" />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">Service &amp; commercials</legend>
            <Select label="Service" value={form.service_id} onChange={onServiceChange} options={[{ value: '', label: '— none —' }, ...services.map((s) => ({ value: s.id, label: s.title }))]} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Quoted (TZS)" type="number" value={form.quoted_amount_tzs} onChange={(v) => set('quoted_amount_tzs', v)} placeholder="e.g. 500000" />
              <Input label="Deposit (TZS)" type="number" value={form.deposit_amount_tzs} onChange={(v) => set('deposit_amount_tzs', v)} placeholder="e.g. 100000" />
            </div>
            <label className="flex items-center gap-2 text-[12px] text-[var(--admin-foreground)]">
              <input
                type="checkbox"
                checked={form.deposit_paid}
                onChange={(e) => set('deposit_paid', e.target.checked)}
                className="accent-[var(--admin-primary)]"
              />
              Deposit paid
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">Status</legend>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.slice(1).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('status', opt.value as BookingStatus)}
                  className={`text-[11px] font-semibold px-3 py-1.5 border transition-colors ${
                    form.status === opt.value
                      ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]'
                      : 'border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] hover:bg-[var(--admin-sidebar-accent)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {form.status === 'cancelled' && (
              <Input
                label="Cancellation reason"
                value={form.cancellation_reason}
                onChange={(v) => set('cancellation_reason', v)}
                placeholder="Why was this cancelled?"
              />
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">Notes</legend>
            <Textarea label="Client-visible notes" value={form.notes} onChange={(v) => set('notes', v)} rows={2} />
            <Textarea label="Internal notes" value={form.internal_notes} onChange={(v) => set('internal_notes', v)} rows={2} placeholder="Only visible to studio staff." />
          </fieldset>

          {err && (
            <div className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 flex items-start gap-2">
              <BsExclamationTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-[var(--admin-sidebar-border)] flex items-center justify-between gap-3 bg-[var(--admin-sidebar-accent)]/40">
          {mode === 'edit' && onDeleted ? (
            <button
              type="button"
              onClick={doDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <BsTrash className="w-3 h-3" />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[12px] font-medium px-3 py-2 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-[12px] font-semibold px-4 py-2 bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]/90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create booking' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Tiny form primitives ────────────────────────────────────────────────
function Input({
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
        className="w-full text-[13px] px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)]"
      />
    </label>
  );
}

function Textarea({
  label, value, onChange, rows = 3, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)] mb-1">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13px] px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)] resize-y"
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)] mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13px] px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
