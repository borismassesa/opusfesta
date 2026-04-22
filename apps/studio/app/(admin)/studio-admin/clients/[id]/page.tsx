'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BsEnvelope, BsWhatsapp, BsTrash, BsArrowLeft, BsCheckCircle,
  BsExclamationTriangle, BsPlusLg, BsXLg,
} from 'react-icons/bs';
import { type StudioClient, initialsOf, mailtoUrl, waMeUrl } from '@/lib/clients';
import {
  type Booking, STATUS_ACCENT, STATUS_LABEL, formatTime, formatTzs, addMinutes,
} from '@/lib/bookings';

interface ApiResponse {
  client: StudioClient;
  bookings: Booking[];
}

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/clients/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: ApiResponse) => setData(d))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const patchClient = async (patch: Partial<StudioClient>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = await res.json();
      setData((prev) => (prev ? { ...prev, client: j.client } : prev));
      setFlash('Saved');
      window.setTimeout(() => setFlash(null), 2000);
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
      return false;
    }
  };

  const deleteClient = async () => {
    if (!window.confirm('Delete this client? Their bookings remain but will no longer link here.')) return;
    const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/studio-admin/clients');
  };

  const stats = useMemo(() => {
    if (!data) return { total: 0, revenue: 0, first: null as string | null, last: null as string | null };
    const bs = data.bookings;
    if (bs.length === 0) return { total: 0, revenue: 0, first: null, last: null };
    const revenue = bs.reduce((s, b) => s + (b.quoted_amount_tzs ?? 0), 0);
    const sorted = [...bs].sort((a, b) => a.booking_date.localeCompare(b.booking_date));
    return {
      total: bs.length,
      revenue,
      first: sorted[0].booking_date,
      last: sorted[sorted.length - 1].booking_date,
    };
  }, [data]);

  if (loading && !data) {
    return (
      <div className="max-w-[1200px] mx-auto animate-pulse space-y-4">
        <div className="h-24 bg-[var(--admin-sidebar-border)]" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-80 bg-[var(--admin-sidebar-border)] col-span-2" />
          <div className="h-80 bg-[var(--admin-sidebar-border)]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <Link href="/studio-admin/clients" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--admin-primary)] hover:underline mb-4">
          <BsArrowLeft className="w-3 h-3" /> Back to clients
        </Link>
        <div className="bg-white border border-red-200 p-5 flex items-start gap-3">
          <BsExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-red-700">Couldn&apos;t load this client.</p>
            <p className="text-[12px] text-red-600 mt-0.5">{error ?? 'Not found'}</p>
            <button onClick={load} className="mt-2 text-[12px] font-medium text-red-700 hover:underline">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  const { client, bookings } = data;

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">

      {/* Back link */}
      <Link
        href="/studio-admin/clients"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] transition-colors"
      >
        <BsArrowLeft className="w-3 h-3" /> Clients
      </Link>

      {/* Hero */}
      <header className="bg-white border border-[var(--admin-sidebar-border)] p-6 flex items-start gap-5 flex-wrap">
        <span className="inline-flex items-center justify-center w-14 h-14 bg-[var(--admin-primary)]/15 text-[var(--admin-primary)] text-[16px] font-bold shrink-0">
          {initialsOf(client.name)}
        </span>
        <div className="flex-1 min-w-[240px]">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-foreground)]">{client.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--admin-muted)]">
            <span>{client.email}</span>
            {client.phone && <span className="tabular-nums">{client.phone}</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-[var(--admin-muted)] tabular-nums">
            <span><strong className="text-[var(--admin-foreground)]">{stats.total}</strong> {stats.total === 1 ? 'booking' : 'bookings'}</span>
            {stats.revenue > 0 && <span><strong className="text-[var(--admin-foreground)]">{formatTzs(stats.revenue)}</strong> quoted lifetime</span>}
            {stats.first && <span>Since {new Date(`${stats.first}T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={mailtoUrl(client.email)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 border border-[var(--admin-sidebar-border)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] transition-colors"
          >
            <BsEnvelope className="w-3.5 h-3.5" />
            Email
          </a>
          {waMeUrl(client.phone) && (
            <a
              href={waMeUrl(client.phone) ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 border border-[var(--admin-sidebar-border)] hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <BsWhatsapp className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          )}
        </div>
      </header>

      {flash && (
        <div className="flex items-center gap-1.5 text-[12px] text-emerald-700">
          <BsCheckCircle className="w-3.5 h-3.5" />
          {flash}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5">

        {/* Left — Booking history */}
        <section className="bg-white border border-[var(--admin-sidebar-border)]">
          <header className="px-5 py-3 border-b border-[var(--admin-sidebar-border)] flex items-baseline justify-between">
            <h2 className="text-[13px] font-semibold text-[var(--admin-foreground)]">Booking history</h2>
            <span className="text-[11px] text-[var(--admin-muted)] tabular-nums">
              {bookings.length} {bookings.length === 1 ? 'entry' : 'entries'}
            </span>
          </header>
          {bookings.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[12px] text-[var(--admin-muted)]">No bookings yet.</p>
              <p className="text-[11px] text-[var(--admin-muted)] mt-1">This client was added manually or via a form submission.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--admin-sidebar-border)]">
              {bookings.map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </ul>
          )}
        </section>

        {/* Right — Contact, tags, notes, danger zone */}
        <aside className="space-y-5">
          <EditableContactCard client={client} onSave={patchClient} />
          <TagsCard client={client} onSave={patchClient} />
          <NotesCard client={client} onSave={patchClient} />

          <section className="bg-white border border-[var(--admin-sidebar-border)] p-5">
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)] mb-3">Danger zone</h3>
            <button
              onClick={deleteClient}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              <BsTrash className="w-3 h-3" />
              Delete client
            </button>
            <p className="text-[11px] text-[var(--admin-muted)] mt-2">
              Bookings are kept. The client profile is soft-deleted and can be restored from the database.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

// ─── Booking row ─────────────────────────────────────────────────────────
function BookingRow({ booking }: { booking: Booking }) {
  const accent = STATUS_ACCENT[booking.status];
  const endTime = addMinutes(booking.start_time, booking.duration_minutes);
  const isTerminal = booking.status === 'cancelled' || booking.status === 'no_show';

  const dateLabel = new Date(`${booking.booking_date}T00:00:00`)
    .toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  // Compose the single detail line. Parts join with middle-dot separators.
  const details: string[] = [`${formatTime(booking.start_time)} – ${endTime}`];
  if (booking.service_name) details.push(booking.service_name);
  if (booking.location)     details.push(booking.location);

  return (
    <li className={`relative group hover:bg-[var(--admin-sidebar-accent)]/40 transition-colors ${isTerminal ? 'opacity-60' : ''}`}>
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />
      <div className="pl-6 pr-5 py-4 flex items-start justify-between gap-5">

        {/* Left — date + detail line */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[var(--admin-foreground)]">
            {dateLabel}
          </p>
          <p className="text-[12px] text-[var(--admin-muted)] mt-1 truncate tabular-nums">
            {details.join(' · ')}
          </p>
        </div>

        {/* Right — status + commercials */}
        <div className="flex flex-col items-end gap-1 shrink-0 text-right">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.12em] px-2 py-0.5 whitespace-nowrap"
            style={{ color: accent, backgroundColor: `${accent}14` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            {STATUS_LABEL[booking.status]}
          </span>
          {booking.quoted_amount_tzs != null ? (
            <span className="text-[13px] font-semibold text-[var(--admin-foreground)] tabular-nums mt-0.5">
              {formatTzs(booking.quoted_amount_tzs)}
            </span>
          ) : null}
          {booking.deposit_paid ? (
            <span className="text-[10px] text-emerald-600 font-medium tabular-nums">
              Deposit paid
            </span>
          ) : booking.deposit_amount_tzs != null ? (
            <span className="text-[10px] text-amber-600 tabular-nums">
              {formatTzs(booking.deposit_amount_tzs)} due
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

// ─── Contact card (editable) ─────────────────────────────────────────────
function EditableContactCard({
  client, onSave,
}: {
  client: StudioClient;
  onSave: (patch: Partial<StudioClient>) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: client.name, email: client.email, phone: client.phone ?? '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft({ name: client.name, email: client.email, phone: client.phone ?? '' });
  }, [client, editing]);

  const save = async () => {
    setSaving(true);
    const ok = await onSave({
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim() || null,
    } as Partial<StudioClient>);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <section className="bg-white border border-[var(--admin-sidebar-border)] p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">Contact</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-[11px] font-medium text-[var(--admin-primary)] hover:underline">
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-3">
          <Field label="Name" value={draft.name} onChange={(v) => setDraft((p) => ({ ...p, name: v }))} />
          <Field label="Email" type="email" value={draft.email} onChange={(v) => setDraft((p) => ({ ...p, email: v }))} />
          <Field label="Phone" value={draft.phone} onChange={(v) => setDraft((p) => ({ ...p, phone: v }))} />
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(false)} className="text-[12px] font-medium px-3 py-2 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !draft.name.trim() || !draft.email.trim()}
              className="text-[12px] font-semibold px-3 py-2 bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]/90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <dl className="space-y-2 text-[12px]">
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--admin-muted)]">Name</dt>
            <dd className="text-[var(--admin-foreground)] mt-0.5">{client.name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--admin-muted)]">Email</dt>
            <dd className="text-[var(--admin-foreground)] mt-0.5 break-all">{client.email}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--admin-muted)]">Phone</dt>
            <dd className="text-[var(--admin-foreground)] mt-0.5 tabular-nums">{client.phone || '—'}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

// ─── Tags card ───────────────────────────────────────────────────────────
const COMMON_TAGS = ['VIP', 'Repeat', 'Referral', 'Wedding', 'Portrait', 'Brand'];

function TagsCard({
  client, onSave,
}: {
  client: StudioClient;
  onSave: (patch: Partial<StudioClient>) => Promise<boolean>;
}) {
  const [pending, setPending] = useState('');

  const addTag = async (raw: string) => {
    const tag = raw.trim();
    if (!tag || client.tags.includes(tag)) return;
    await onSave({ tags: [...client.tags, tag] } as Partial<StudioClient>);
  };

  const removeTag = async (tag: string) => {
    await onSave({ tags: client.tags.filter((t) => t !== tag) } as Partial<StudioClient>);
  };

  const suggestions = COMMON_TAGS.filter((t) => !client.tags.includes(t));

  return (
    <section className="bg-white border border-[var(--admin-sidebar-border)] p-5">
      <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)] mb-3">Tags</h3>

      {client.tags.length === 0 ? (
        <p className="text-[11px] text-[var(--admin-muted)] mb-3">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {client.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-1 bg-[var(--admin-sidebar-accent)] text-[var(--admin-foreground)]">
              {t}
              <button
                onClick={() => removeTag(t)}
                aria-label={`Remove ${t}`}
                className="text-[var(--admin-muted)] hover:text-red-600 transition-colors"
              >
                <BsXLg className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); if (pending.trim()) { addTag(pending); setPending(''); } }}
        className="flex items-center gap-2"
      >
        <input
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          placeholder="Add a tag…"
          className="flex-1 px-3 py-2 text-[12px] bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)]"
        />
        <button
          type="submit"
          disabled={!pending.trim()}
          aria-label="Add tag"
          className="p-2 border border-[var(--admin-sidebar-border)] text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:border-[var(--admin-primary)] disabled:opacity-40 transition-colors"
        >
          <BsPlusLg className="w-3 h-3" />
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--admin-muted)] mb-1.5">Suggestions</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((t) => (
              <button
                key={t}
                onClick={() => addTag(t)}
                className="text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-1 border border-dashed border-[var(--admin-sidebar-border)] text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:border-[var(--admin-primary)] transition-colors"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Notes card ──────────────────────────────────────────────────────────
function NotesCard({
  client, onSave,
}: {
  client: StudioClient;
  onSave: (patch: Partial<StudioClient>) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(client.notes ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(client.notes ?? ''); }, [client.notes]);

  const dirty = draft !== (client.notes ?? '');

  const save = async () => {
    setSaving(true);
    await onSave({ notes: draft.trim() || null } as Partial<StudioClient>);
    setSaving(false);
  };

  return (
    <section className="bg-white border border-[var(--admin-sidebar-border)] p-5">
      <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)] mb-3">Internal notes</h3>
      <textarea
        rows={5}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Preferences, past feedback, anything worth remembering before the next shoot."
        className="w-full px-3 py-2 text-[13px] bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)] resize-y"
      />
      {dirty && (
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={() => setDraft(client.notes ?? '')}
            className="text-[11px] font-medium text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] px-2 py-1"
          >
            Discard
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="text-[11px] font-semibold px-3 py-1.5 bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary)]/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save notes'}
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Tiny field primitive ────────────────────────────────────────────────
function Field({
  label, value, onChange, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)] mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13px] px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)]"
      />
    </label>
  );
}
