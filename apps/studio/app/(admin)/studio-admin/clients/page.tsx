'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BsPersonLinesFill, BsSearch, BsExclamationTriangle,
  BsPencil, BsTrash,
} from 'react-icons/bs';
import { type StudioClientListRow, initialsOf } from '@/lib/clients';
import { formatTzs } from '@/lib/bookings';

function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—';
  const then = new Date(`${iso}T00:00:00`).getTime();
  const diff = Date.now() - then;
  const days = Math.round(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 0 && days < 30) return `${days}d ago`;
  if (days < 0 && days > -30) return `In ${Math.abs(days)}d`;
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<StudioClientListRow[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 250ms debounce so every keystroke doesn't fire a request.
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(id);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const qs = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
    fetch(`/api/admin/clients${qs}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setClients(d.clients ?? []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? Their bookings are kept but will no longer link to this client.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const totals = useMemo(() => {
    const totalClients = clients.length;
    const withBookings = clients.filter((c) => c.total_bookings > 0).length;
    const revenue = clients.reduce((sum, c) => sum + c.total_quoted_tzs, 0);
    return { totalClients, withBookings, revenue };
  }, [clients]);

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="relative w-full max-w-[420px]">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--admin-muted)] pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            aria-label="Search clients"
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)]"
          />
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[var(--admin-muted)] tabular-nums">
          <span>{totals.totalClients} {totals.totalClients === 1 ? 'client' : 'clients'}</span>
          <span>{totals.withBookings} with bookings</span>
          {totals.revenue > 0 && <span>{formatTzs(totals.revenue)} quoted lifetime</span>}
        </div>
      </div>

      {/* Content */}
      {loading && clients.length === 0 ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-[var(--admin-sidebar-border)]" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border border-red-200 p-5 flex items-start gap-3">
          <BsExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-red-700">Couldn&apos;t load clients.</p>
            <p className="text-[12px] text-red-600 mt-0.5">{error}</p>
            <button onClick={load} className="mt-2 text-[12px] font-medium text-red-700 hover:underline">
              Try again
            </button>
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white border border-[var(--admin-sidebar-border)] p-12 text-center">
          <BsPersonLinesFill className="w-8 h-8 text-[var(--admin-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-muted)]">
            {debouncedSearch ? 'No clients match that search.' : 'No clients yet.'}
          </p>
          {!debouncedSearch && (
            <p className="text-[11px] text-[var(--admin-muted)] mt-1">
              Client records are created automatically when a booking comes in.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[var(--admin-sidebar-border)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--admin-sidebar-accent)]/40 border-b border-[var(--admin-sidebar-border)]">
                <Th>Client</Th>
                <Th className="w-[180px]">Phone</Th>
                <Th className="w-[120px] text-right">Bookings</Th>
                <Th className="w-[160px] text-right">Last booking</Th>
                <Th className="w-[140px] text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const deleting = deletingId === c.id;
                return (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/studio-admin/clients/${c.id}`)}
                    className={`group border-b border-[var(--admin-sidebar-border)] last:border-b-0 hover:bg-[var(--admin-sidebar-accent)]/60 cursor-pointer transition-colors ${deleting ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Td>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex items-center justify-center w-9 h-9 bg-[var(--admin-primary)]/15 text-[var(--admin-primary)] text-[11px] font-bold shrink-0">
                          {initialsOf(c.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[var(--admin-foreground)] truncate">{c.name}</p>
                          <p className="text-[11px] text-[var(--admin-muted)] truncate">{c.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      {c.phone ? (
                        <span className="text-[12px] text-[var(--admin-foreground)] tabular-nums">{c.phone}</span>
                      ) : (
                        <span className="text-[12px] text-[var(--admin-muted)]">—</span>
                      )}
                    </Td>
                    <Td className="text-right tabular-nums">
                      {c.total_bookings > 0 ? (
                        <span className="text-[13px] font-semibold text-[var(--admin-foreground)]">{c.total_bookings}</span>
                      ) : (
                        <span className="text-[12px] text-[var(--admin-muted)]">—</span>
                      )}
                    </Td>
                    <Td className="text-right tabular-nums">
                      <span className="text-[12px] text-[var(--admin-foreground)]">{formatRelativeDate(c.last_booking_at)}</span>
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Link
                          href={`/studio-admin/clients/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Edit ${c.name}`}
                          title="Edit"
                          className="inline-flex items-center justify-center w-7 h-7 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-sidebar-accent)] transition-colors"
                        >
                          <BsPencil className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.name); }}
                          disabled={deleting}
                          aria-label={`Delete ${c.name}`}
                          title="Delete"
                          className="inline-flex items-center justify-center w-7 h-7 text-[var(--admin-muted)] hover:text-red-600 hover:bg-[var(--admin-sidebar-accent)] transition-colors disabled:opacity-40"
                        >
                          <BsTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)] ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
