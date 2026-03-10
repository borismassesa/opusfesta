'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminBadge from '@/components/admin/ui/AdminBadge';
import AdminToast from '@/components/admin/ui/AdminToast';
import AdminPagination from '@/components/admin/ui/AdminPagination';
import type { StudioBooking, StudioBookingStatus } from '@/lib/studio-types';

const statuses = ['all', 'new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled'];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/bookings?status=${status}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { setBookings(d.bookings || []); setTotalPages(d.totalPages || 1); })
      .finally(() => setLoading(false));
  }, [status, page]);

  return (
    <div className="space-y-4">
      <AdminToast />
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${status === s ? 'bg-brand-accent text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <div className="bg-white border border-gray-200 h-64 animate-pulse" /> : (
        <>
          <AdminTable
            data={bookings} keyField="id" emptyMessage="No bookings found."
            onRowClick={(b) => router.push(`/admin/bookings/${b.id}`)}
            columns={[
              { key: 'name', header: 'Name', render: (b) => <span className="font-medium text-gray-900">{b.name}</span> },
              { key: 'email', header: 'Email', render: (b) => b.email },
              { key: 'event_type', header: 'Event', render: (b) => b.event_type },
              { key: 'service', header: 'Service', render: (b) => b.service || '—' },
              { key: 'preferred_date', header: 'Date', render: (b) => b.preferred_date || '—' },
              { key: 'status', header: 'Status', render: (b) => <AdminBadge status={b.status as StudioBookingStatus} /> },
              { key: 'created_at', header: 'Created', render: (b) => new Date(b.created_at).toLocaleDateString() },
            ]}
          />
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
