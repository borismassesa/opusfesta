'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminBadge from '@/components/admin/ui/AdminBadge';
import AdminToast from '@/components/admin/ui/AdminToast';
import { BsEnvelope, BsCalendar, BsArrowRight } from 'react-icons/bs';
import type { StudioBookingStatus } from '@/lib/studio-types';

interface Booking {
  id: string;
  name: string;
  email: string;
  event_type: string;
  status: StudioBookingStatus;
  message: string | null;
  created_at: string;
}

export default function MessagesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/bookings?status=all&page=1')
      .then((r) => r.json())
      .then((d) => {
        const all = (d.bookings || []) as Booking[];
        setBookings(all.filter((b) => b.status !== 'cancelled'));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <AdminToast />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 h-24 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <BsEnvelope className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => router.push(`/admin/bookings/${booking.id}`)}
              className="w-full bg-white border border-gray-200 p-4 text-left hover:shadow-sm hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">{booking.name}</h3>
                    <AdminBadge status={booking.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <BsEnvelope className="w-3 h-3" />
                      {booking.email}
                    </span>
                    <span>{booking.event_type}</span>
                    <span className="flex items-center gap-1">
                      <BsCalendar className="w-3 h-3" />
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {booking.message && (
                    <p className="text-xs text-gray-400 truncate max-w-xl">{booking.message}</p>
                  )}
                </div>
                <BsArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-accent transition-colors mt-1 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
