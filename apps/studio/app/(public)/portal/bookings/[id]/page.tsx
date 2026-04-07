'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BsArrowLeft, BsCalendar3, BsClock, BsGeoAlt, BsPeople, BsCash, BsFileText, BsCheckCircle } from 'react-icons/bs';
import { useClientAuth } from '@/components/portal/ClientAuthProvider';
import StatusBadge from '@/components/portal/StatusBadge';
import PortalLoader from '@/components/portal/PortalLoader';
import BookingChat from '@/components/portal/BookingChat';

interface BookingDetail {
  booking: {
    id: string;
    name: string;
    email: string;
    event_type: string;
    event_date: string | null;
    event_time_slot: string | null;
    service: string | null;
    location: string | null;
    lifecycle_status: string;
    guest_count: number | null;
    total_amount_tzs: number;
    deposit_amount_tzs: number;
    balance_due_tzs: number;
    balance_due_date: string | null;
    currency: string;
    created_at: string;
    confirmed_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
  };
  quotes: Array<{
    id: string;
    quote_number: string;
    total_tzs: number;
    deposit_amount_tzs: number;
    valid_until: string;
    sent_at: string;
    accepted_at: string | null;
    rejected_at: string | null;
    expired_at: string | null;
  }>;
  contracts: Array<{
    id: string;
    contract_number: string;
    sent_at: string;
    sign_deadline: string | null;
    signed_at: string | null;
  }>;
  payments: Array<{
    id: string;
    payment_type: string;
    amount_tzs: number;
    provider: string;
    receipt_url: string | null;
    paid_at: string;
  }>;
  timeline: Array<{
    id: string;
    event_type: string;
    from_status: string | null;
    to_status: string | null;
    description: string | null;
    created_at: string;
  }>;
}

function formatDate(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function formatSlot(slot: string) {
  if (slot.includes('-')) {
    const [from, to] = slot.split('-');
    return `${formatTime(from)} – ${formatTime(to)}`;
  }
  return slot;
}

function formatTZS(amount: number) {
  return `TZS ${amount.toLocaleString()}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function BookingDetailPage() {
  const params = useParams();
  const { client, loading: clientLoading } = useClientAuth();
  const [data, setData] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooking = useCallback(async (retries = 2) => {
    try {
      const res = await fetch(`/api/portal/bookings/${params.id}`);
      if (res.ok) {
        setData(await res.json());
        setLoading(false);
        return;
      }
      if (res.status === 401 && retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchBooking(retries - 1);
      }
      setError('Booking not found');
      setLoading(false);
    } catch {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchBooking(retries - 1);
      }
      setError('Failed to load booking');
      setLoading(false);
    }
  }, [params.id]);

  // Wait for client profile to be ready before fetching booking
  useEffect(() => {
    if (!params.id || clientLoading) return;
    if (!client) {
      setLoading(false);
      setError('Unable to load profile');
      return;
    }
    fetchBooking();
  }, [params.id, client, clientLoading, fetchBooking]);

  if (clientLoading) {
    return <PortalLoader message="Loading booking" />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-24 bg-brand-bg animate-pulse" />
        <div className="border-3 border-brand-border/30 bg-white p-8 animate-pulse space-y-4">
          <div className="h-5 w-64 bg-brand-bg" />
          <div className="h-4 w-48 bg-brand-bg" />
          <div className="h-4 w-32 bg-brand-bg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/portal" className="text-sm font-bold text-brand-muted hover:text-brand-dark font-mono transition-colors flex items-center gap-1">
          <BsArrowLeft className="w-3 h-3" /> Back to bookings
        </Link>
        <div className="border-3 border-red-500 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-bold">{error || 'Booking not found'}</p>
        </div>
      </div>
    );
  }

  const { booking, quotes, contracts, payments, timeline } = data;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/portal" className="text-sm font-bold text-brand-muted hover:text-brand-dark font-mono transition-colors flex items-center gap-1">
        <BsArrowLeft className="w-3 h-3" /> Back to bookings
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-dark font-mono uppercase tracking-wider">
            {booking.event_type}
          </h1>
          {booking.service && (
            <p className="text-sm text-brand-muted mt-1">{booking.service}</p>
          )}
        </div>
        <StatusBadge status={booking.lifecycle_status} />
      </div>

      {/* Booking details card */}
      <div className="border-3 border-brand-border bg-white shadow-brutal">
        <div className="bg-brand-dark px-6 py-3 flex items-center gap-2">
          <BsCalendar3 className="w-4 h-4 text-brand-accent" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Booking Details</span>
        </div>
        <div className="divide-y divide-brand-border/20">
          {booking.event_date && (
            <Row icon={<BsCalendar3 />} label="Date" value={formatDate(booking.event_date)} />
          )}
          {booking.event_time_slot && (
            <Row icon={<BsClock />} label="Time" value={formatSlot(booking.event_time_slot)} />
          )}
          {booking.location && (
            <Row icon={<BsGeoAlt />} label="Location" value={booking.location} />
          )}
          {booking.guest_count && (
            <Row icon={<BsPeople />} label="Guests" value={String(booking.guest_count)} />
          )}
          <Row icon={<BsClock />} label="Submitted" value={formatDateTime(booking.created_at)} />
        </div>
      </div>

      {/* Financial summary */}
      {booking.total_amount_tzs > 0 && (
        <div className="border-3 border-brand-border bg-white shadow-brutal">
          <div className="bg-brand-dark px-6 py-3 flex items-center gap-2">
            <BsCash className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Payment Summary</span>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted font-mono">Total</span>
              <span className="font-bold text-brand-dark">{formatTZS(booking.total_amount_tzs)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted font-mono">Deposit</span>
              <span className="font-bold text-brand-dark">{formatTZS(booking.deposit_amount_tzs)}</span>
            </div>
            {booking.balance_due_tzs > 0 && (
              <div className="flex justify-between text-sm border-t border-brand-border/20 pt-3">
                <span className="text-brand-muted font-mono">Balance Due</span>
                <span className="font-bold text-brand-accent">{formatTZS(booking.balance_due_tzs)}</span>
              </div>
            )}
            {booking.balance_due_date && (
              <p className="text-[11px] text-brand-muted font-mono text-right">
                Due by {formatDate(booking.balance_due_date)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quotes */}
      {quotes.length > 0 && (
        <div className="border-3 border-brand-border bg-white shadow-brutal">
          <div className="bg-brand-dark px-6 py-3 flex items-center gap-2">
            <BsFileText className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Quotes</span>
          </div>
          <div className="divide-y divide-brand-border/20">
            {quotes.map(q => (
              <div key={q.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sm text-brand-dark">{q.quote_number}</span>
                  <span className="ml-3 text-sm text-brand-muted">{formatTZS(q.total_tzs)}</span>
                </div>
                <div>
                  {q.accepted_at ? (
                    <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                      <BsCheckCircle className="w-3 h-3" /> Accepted
                    </span>
                  ) : q.expired_at ? (
                    <span className="text-xs font-mono font-bold text-gray-400">Expired</span>
                  ) : q.rejected_at ? (
                    <span className="text-xs font-mono font-bold text-red-500">Declined</span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-brand-accent">Pending Review</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contracts */}
      {contracts.length > 0 && (
        <div className="border-3 border-brand-border bg-white shadow-brutal">
          <div className="bg-brand-dark px-6 py-3 flex items-center gap-2">
            <BsFileText className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Contracts</span>
          </div>
          <div className="divide-y divide-brand-border/20">
            {contracts.map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-brand-dark">{c.contract_number}</span>
                {c.signed_at ? (
                  <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <BsCheckCircle className="w-3 h-3" /> Signed
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-brand-accent">Awaiting Signature</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {payments.length > 0 && (
        <div className="border-3 border-brand-border bg-white shadow-brutal">
          <div className="bg-brand-dark px-6 py-3 flex items-center gap-2">
            <BsCash className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Payments</span>
          </div>
          <div className="divide-y divide-brand-border/20">
            {payments.map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sm text-brand-dark capitalize">{p.payment_type}</span>
                  <span className="ml-3 text-sm text-brand-muted">{formatTZS(p.amount_tzs)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-brand-muted font-mono block">{formatDateTime(p.paid_at)}</span>
                  <span className="text-[10px] text-brand-muted font-mono capitalize">{p.provider}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages / Chat */}
      <BookingChat bookingId={booking.id} />

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="border-3 border-brand-border bg-white shadow-brutal">
          <div className="bg-brand-dark px-6 py-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Activity Timeline</span>
          </div>
          <div className="p-6">
            <div className="space-y-0">
              {timeline.map((event, i) => (
                <div key={event.id} className="flex gap-4">
                  {/* Dot and line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 shrink-0 border-2 ${
                      i === timeline.length - 1 ? 'border-brand-accent bg-brand-accent' : 'border-brand-border bg-white'
                    }`} />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-brand-border/30 min-h-[24px]" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 -mt-1">
                    <p className="text-sm text-brand-dark">
                      {event.description || event.event_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-brand-muted font-mono mt-0.5">
                      {formatDateTime(event.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancellation notice */}
      {booking.lifecycle_status === 'cancelled' && booking.cancellation_reason && (
        <div className="border-3 border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            <strong>Cancellation reason:</strong> {booking.cancellation_reason}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3">
      <span className="text-brand-muted w-4 shrink-0">{icon}</span>
      <span className="text-xs font-mono font-bold text-brand-muted uppercase w-24 shrink-0">{label}</span>
      <span className="text-sm text-brand-dark">{value}</span>
    </div>
  );
}
