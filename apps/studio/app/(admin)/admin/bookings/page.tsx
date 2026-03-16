'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminLifecycleBadge from '@/components/admin/ui/AdminLifecycleBadge';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminToast from '@/components/admin/ui/AdminToast';
import AdminPagination from '@/components/admin/ui/AdminPagination';
import { STATUS_LABELS } from '@/lib/booking-state-machine';
import { formatTZS } from '@/lib/booking-types';
import type { BookingLifecycleStatus } from '@/lib/booking-types';

const lifecycleFilters: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'intake_submitted', label: 'New Intakes' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'quote_accepted', label: 'Quote Accepted' },
  { value: 'contract_sent', label: 'Contract Sent' },
  { value: 'contract_signed', label: 'Contract Signed' },
  { value: 'deposit_pending', label: 'Deposit Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/bookings?lifecycle_status=${filter}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { setBookings(d.bookings || []); setTotalPages(d.totalPages || 1); })
      .finally(() => setLoading(false));
  }, [filter, page]);

  return (
    <div className="space-y-4">
      <AdminToast />
      <AdminPageHeader
        title="Bookings"
        description="Track and manage all client bookings through their lifecycle — from initial inquiry to completed event. Use filters to find bookings by status."
        tips={[
          'Each booking moves through stages: Intake → Qualified → Quote → Contract → Deposit → Confirmed → Completed.',
          'Use the "Queue" view for action items that need your attention (new intakes, pending deposits, overdue follow-ups).',
          'Click any booking to see full details, update its status, add notes, or send communications.',
          'Cancelled bookings are kept for records but hidden from the active pipeline.',
        ]}
      />

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/bookings/new"
          className="border-2 border-brand-dark bg-brand-dark text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors"
        >
          + New Booking
        </Link>
        <Link
          href="/admin/bookings/queue"
          className="border-2 border-brand-accent bg-brand-accent text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-dark hover:border-brand-dark transition-colors"
        >
          Operational Queue
        </Link>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {lifecycleFilters.map((f) => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-2 ${
              filter === f.value
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'bg-white text-brand-muted border-brand-border hover:bg-brand-bg hover:text-brand-dark'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <div className="bg-white border-3 border-brand-border h-64 animate-pulse" /> : (
        <>
          <AdminTable
            data={bookings} keyField="id" emptyMessage="No bookings found."
            onRowClick={(b) => router.push(`/admin/bookings/${b.id}`)}
            columns={[
              { key: 'name', header: 'Client', render: (b) => <span className="font-bold text-brand-dark">{b.name as string}</span> },
              { key: 'email', header: 'Email', render: (b) => <span className="text-sm">{b.email as string}</span> },
              { key: 'event_type', header: 'Event', render: (b) => <span className="text-sm">{b.event_type as string}</span> },
              { key: 'lifecycle_status', header: 'Status', render: (b) => (
                <AdminLifecycleBadge status={(b.lifecycle_status || 'intake_submitted') as BookingLifecycleStatus} />
              )},
              { key: 'total_amount_tzs', header: 'Total', render: (b) => (
                <span className="text-sm font-mono">{(b.total_amount_tzs as number) > 0 ? formatTZS(b.total_amount_tzs as number) : '—'}</span>
              )},
              { key: 'event_date', header: 'Event Date', render: (b) => (
                <span className="text-sm">{b.event_date ? new Date(b.event_date as string).toLocaleDateString('en-TZ', { dateStyle: 'medium' }) : '—'}</span>
              )},
              { key: 'created_at', header: 'Created', render: (b) => (
                <span className="text-sm text-brand-muted">{new Date(b.created_at as string).toLocaleDateString()}</span>
              )},
            ]}
          />
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
