'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BsCalendar2Check, BsCalendar3, BsPlusLg, BsExclamationTriangle } from 'react-icons/bs';
import BookingForm from '@/components/admin/bookings/BookingForm';
import {
  type Booking,
  type ServiceOption,
  STATUS_ACCENT,
  STATUS_LABEL,
  STATUS_OPTIONS,
  addMinutes,
  formatDate,
  formatTime,
  formatTzs,
} from '@/lib/bookings';

interface ServiceDoc {
  id: string;
  published_content?: { title?: string } | null;
  draft_content?: { title?: string } | null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceOption[]>([]);

  const [selected, setSelected] = useState<Booking | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/admin/bookings${qs}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setBookings(d.bookings ?? []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

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

  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const arr = map.get(b.booking_date) ?? [];
      arr.push(b);
      map.set(b.booking_date, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [bookings]);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="text-[12px] font-medium px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="text-[11px] text-[var(--admin-muted)] tabular-nums">
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-[var(--admin-primary)] text-white px-3 py-2 text-[12px] font-semibold hover:bg-[var(--admin-primary)]/90 transition-colors"
        >
          <BsPlusLg className="w-3 h-3" />
          New booking
        </button>
      </div>

      {loading && bookings.length === 0 ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-[var(--admin-sidebar-border)]" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border border-red-200 p-5 flex items-start gap-3">
          <BsExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-red-700">Couldn&apos;t load bookings.</p>
            <p className="text-[12px] text-red-600 mt-0.5">{error}</p>
            <button
              onClick={load}
              className="mt-2 text-[12px] font-medium text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-[var(--admin-sidebar-border)] p-12 text-center">
          <BsCalendar2Check className="w-8 h-8 text-[var(--admin-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-muted)]">
            No {statusFilter || 'bookings'} yet.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-[var(--admin-primary)] hover:underline"
          >
            <BsPlusLg className="w-3 h-3" /> Create your first booking
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[var(--admin-sidebar-border)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--admin-sidebar-accent)]/40 border-b border-[var(--admin-sidebar-border)]">
                <Th className="w-[4px] p-0" />
                <Th className="w-[110px]">Time</Th>
                <Th>Client</Th>
                <Th>Service</Th>
                <Th className="w-[160px]">Location</Th>
                <Th className="w-[140px] text-right">Amount</Th>
                <Th className="w-[130px] text-right">Deposit</Th>
                <Th className="w-[24px] p-0" />
              </tr>
            </thead>
            <tbody>
              {grouped.map(([date, items]) => {
                const dayQuoted = items.reduce((sum, b) => sum + (b.quoted_amount_tzs ?? 0), 0);
                const dayConfirmed = items.filter((b) => b.status === 'confirmed').length;

                return (
                  <DayBlock
                    key={date}
                    date={date}
                    items={items}
                    dayQuoted={dayQuoted}
                    dayConfirmed={dayConfirmed}
                    onSelect={setSelected}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <BookingForm
          mode="create"
          services={services}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); load(); }}
        />
      )}

      {selected && (
        <BookingForm
          mode="edit"
          booking={selected}
          services={services}
          onClose={() => setSelected(null)}
          onSaved={(updated) => { setSelected(updated); load(); }}
          onDeleted={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table primitives (page-local)
// ---------------------------------------------------------------------------
function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)] ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function DayBlock({
  date, items, dayQuoted, dayConfirmed, onSelect,
}: {
  date: string;
  items: Booking[];
  dayQuoted: number;
  dayConfirmed: number;
  onSelect: (b: Booking) => void;
}) {
  return (
    <>
      <tr className="bg-[var(--admin-sidebar-accent)]">
        <td colSpan={8} className="px-4 py-2.5 border-t-2 border-b border-[var(--admin-sidebar-border)]">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-mono font-bold uppercase tracking-[0.18em] text-[var(--admin-foreground)]">
                {formatDate(date)}
              </span>
              <span className="text-[11px] text-[var(--admin-muted)] tabular-nums">
                {items.length} {items.length === 1 ? 'session' : 'sessions'}
                {dayConfirmed > 0 && ` · ${dayConfirmed} confirmed`}
              </span>
            </div>
            {dayQuoted > 0 && (
              <span className="text-[11px] font-semibold text-[var(--admin-foreground)] tabular-nums">
                {formatTzs(dayQuoted)}{' '}
                <span className="font-normal text-[var(--admin-muted)]">quoted</span>
              </span>
            )}
          </div>
        </td>
      </tr>

      {items.map((b) => {
        const endTime = addMinutes(b.start_time, b.duration_minutes);
        const accent = STATUS_ACCENT[b.status];
        const isTerminal = b.status === 'cancelled' || b.status === 'no_show';

        return (
          <tr
            key={b.id}
            onClick={() => onSelect(b)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(b);
              }
            }}
            className={`group border-b border-[var(--admin-sidebar-border)] last:border-b-0 hover:bg-[var(--admin-sidebar-accent)]/60 cursor-pointer transition-colors ${
              isTerminal ? 'opacity-60' : ''
            }`}
          >
            <td className="p-0 w-[4px]" style={{ backgroundColor: accent }} />

            <Td>
              <p className="text-[13px] font-bold tabular-nums text-[var(--admin-foreground)] leading-none">
                {formatTime(b.start_time)}
              </p>
              <p className="text-[10px] font-mono text-[var(--admin-muted)] tabular-nums mt-1">
                {b.duration_minutes} min
              </p>
            </Td>

            <Td>
              <div className="flex items-baseline gap-2 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--admin-foreground)] truncate">
                  {b.client_name}
                </p>
                <span
                  className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] shrink-0"
                  style={{ color: accent }}
                >
                  {STATUS_LABEL[b.status]}
                </span>
              </div>
              <p className="text-[11px] text-[var(--admin-muted)] truncate mt-0.5">
                {b.client_email}
              </p>
            </Td>

            <Td>
              {b.service_name ? (
                <span className="text-[12px] text-[var(--admin-foreground)] truncate block">
                  {b.service_name}
                </span>
              ) : (
                <span className="text-[12px] text-[var(--admin-muted)]">—</span>
              )}
            </Td>

            <Td>
              {b.location ? (
                <span className="text-[12px] text-[var(--admin-foreground)] truncate block">
                  {b.location}
                </span>
              ) : (
                <span className="text-[12px] text-[var(--admin-muted)]">—</span>
              )}
            </Td>

            <Td className="text-right tabular-nums">
              {b.quoted_amount_tzs != null ? (
                <span className="text-[13px] font-semibold text-[var(--admin-foreground)]">
                  {formatTzs(b.quoted_amount_tzs)}
                </span>
              ) : (
                <span className="text-[12px] text-[var(--admin-muted)]">—</span>
              )}
              <span className="sr-only">ends at {endTime}</span>
            </Td>

            <Td className="text-right tabular-nums">
              {b.deposit_paid ? (
                <span className="text-[11px] font-semibold text-emerald-600">Paid</span>
              ) : b.deposit_amount_tzs != null ? (
                <span className="text-[11px] text-amber-600">
                  {formatTzs(b.deposit_amount_tzs)} due
                </span>
              ) : (
                <span className="text-[12px] text-[var(--admin-muted)]">—</span>
              )}
            </Td>

            <Td className="p-0 text-right pr-3">
              <div className="inline-flex items-center gap-2">
                <Link
                  href={`/studio-admin/calendar?view=day&date=${b.booking_date}`}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Open ${b.booking_date} on calendar`}
                  title="Open on calendar"
                  className="text-[var(--admin-muted)] opacity-30 group-hover:opacity-100 hover:text-[var(--admin-primary)] transition-opacity"
                >
                  <BsCalendar3 className="w-3.5 h-3.5" />
                </Link>
                <span
                  aria-hidden
                  className="text-[var(--admin-muted)] opacity-30 group-hover:opacity-100 transition-opacity text-[16px] leading-none"
                >
                  ›
                </span>
              </div>
            </Td>
          </tr>
        );
      })}
    </>
  );
}
