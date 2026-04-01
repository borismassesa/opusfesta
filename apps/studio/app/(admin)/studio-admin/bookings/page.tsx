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
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'upcoming', label: 'Upcoming Events' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled / Archived' },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [filter, setFilter] = useState('pipeline');
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
        title="Bookings Pipeline"
        description="Track and manage all client bookings at a macro level. Switch tabs to see your active pipeline, upcoming confirmed events, and historical records."
        tips={[
          'Pipeline: Follow bookings progressing through qualification, quotes, and deposits.',
          'Upcoming Events: Locked-in bookings with active dates waiting to happen.',
          'Queue: If you need to see urgent action items across all stages, use the Operational Queue.',
        ]}
      />

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/studio-admin/bookings/new"
          className="border-2 border-brand-dark bg-brand-dark text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors"
        >
          + New Booking
        </Link>
        <Link
          href="/studio-admin/bookings/queue"
          className="border-2 border-brand-accent bg-brand-accent text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-dark hover:border-brand-dark transition-colors"
        >
          Operational Queue
        </Link>
      </div>

      <div className="flex border-b border-gray-200 mt-2 mb-6">
        {lifecycleFilters.map((f) => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-6 py-3.5 text-sm font-semibold border-b-[3px] -mb-[1px] transition-all ${
              filter === f.value
                ? 'border-brand-dark text-black bg-transparent'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 bg-transparent'
            }`}
            style={{ borderRadius: 0 }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <div className="bg-white border-3 border-brand-border h-64 animate-pulse" /> : (
        <>
          <AdminTable
            data={bookings} keyField="id" emptyMessage="No bookings found."
            onRowClick={(b) => router.push(`/studio-admin/bookings/${b.id}`)}
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
