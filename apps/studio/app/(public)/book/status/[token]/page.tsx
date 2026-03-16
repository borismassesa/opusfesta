'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BookingTimeline from '@/components/booking/BookingTimeline';
import { STATUS_LABELS } from '@/lib/booking-state-machine';
import { formatTZS, type BookingLifecycleStatus, type StudioBookingEvent } from '@/lib/booking-types';

interface BookingStatus {
  id: string;
  name: string;
  email: string;
  event_type: string;
  event_date: string | null;
  location: string | null;
  service: string | null;
  lifecycle_status: BookingLifecycleStatus;
  total_amount_tzs: number;
  deposit_amount_tzs: number;
  balance_due_tzs: number;
  balance_due_date: string | null;
  events: StudioBookingEvent[];
}

export default function BookingStatusPage() {
  const params = useParams();
  const token = params.token as string;
  const [booking, setBooking] = useState<BookingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booking/status?token=${token}`);
        if (!res.ok) throw new Error('Failed to load booking status');
        const json = await res.json();
        setBooking(json.booking);
      } catch {
        setError('Unable to load booking status. The link may have expired.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return <div className="h-64 border-3 border-brand-border bg-white animate-pulse" />;
  }

  if (error || !booking) {
    return (
      <div className="border-3 border-red-500 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Status Unavailable</h2>
        <p className="text-red-600">{error || 'Booking not found.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Booking Status
        </h1>
        <p className="text-brand-muted mt-1">
          {booking.name} — {booking.event_type}
        </p>
      </div>

      <div className="border-3 border-brand-border bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-sm font-bold text-brand-muted uppercase">Current Status</span>
          <span className="border-3 border-brand-border px-4 py-1.5 font-mono font-bold text-sm uppercase bg-brand-panel">
            {STATUS_LABELS[booking.lifecycle_status] || booking.lifecycle_status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {booking.event_date && (
            <div>
              <span className="font-bold text-brand-muted font-mono text-xs uppercase block">Event Date</span>
              <span className="text-brand-dark">{new Date(booking.event_date).toLocaleDateString('en-TZ', { dateStyle: 'long' })}</span>
            </div>
          )}
          {booking.location && (
            <div>
              <span className="font-bold text-brand-muted font-mono text-xs uppercase block">Location</span>
              <span className="text-brand-dark">{booking.location}</span>
            </div>
          )}
          {booking.service && (
            <div>
              <span className="font-bold text-brand-muted font-mono text-xs uppercase block">Service</span>
              <span className="text-brand-dark">{booking.service}</span>
            </div>
          )}
          {booking.total_amount_tzs > 0 && (
            <div>
              <span className="font-bold text-brand-muted font-mono text-xs uppercase block">Total</span>
              <span className="text-brand-dark font-bold">{formatTZS(booking.total_amount_tzs)}</span>
            </div>
          )}
        </div>

        {booking.balance_due_tzs > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-brand-border/30">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-brand-muted font-mono text-xs uppercase block">Balance Due</span>
                <span className="text-brand-dark font-bold">{formatTZS(booking.balance_due_tzs)}</span>
              </div>
              {booking.balance_due_date && (
                <span className="text-sm text-brand-muted">
                  by {new Date(booking.balance_due_date).toLocaleDateString('en-TZ', { dateStyle: 'medium' })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-3 border-brand-border bg-white p-6">
        <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-brand-dark mb-4">
          Timeline
        </h3>
        <BookingTimeline events={booking.events} />
      </div>
    </div>
  );
}
