'use client';

import Link from 'next/link';
import { BsCalendar3, BsClock, BsChevronRight } from 'react-icons/bs';
import StatusBadge from './StatusBadge';

interface Booking {
  id: string;
  event_type: string;
  event_date: string | null;
  event_time_slot: string | null;
  service: string | null;
  lifecycle_status: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatSlot(slot: string) {
  if (slot.includes('-')) {
    const [from, to] = slot.split('-');
    return `${formatTime(from)} – ${formatTime(to)}`;
  }
  return slot;
}

const NEXT_ACTION: Record<string, string> = {
  quote_sent: 'Review Quote →',
  contract_sent: 'Sign Contract →',
  deposit_pending: 'Make Payment →',
  intake_submitted: 'Awaiting Review',
  qualified: 'Quote Coming Soon',
};

export default function BookingCard({ booking }: { booking: Booking }) {
  const action = NEXT_ACTION[booking.lifecycle_status];

  return (
    <Link
      href={`/portal/bookings/${booking.id}`}
      className="block border-3 border-brand-border bg-white hover:border-brand-accent hover:shadow-brutal-accent transition-all group"
    >
      <div className="p-5 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Type + Service */}
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h3 className="font-bold text-brand-dark font-mono text-sm uppercase tracking-wider">
              {booking.event_type}
            </h3>
            <StatusBadge status={booking.lifecycle_status} />
          </div>

          {booking.service && (
            <p className="text-xs text-brand-muted mb-2">{booking.service}</p>
          )}

          {/* Date & Time */}
          <div className="flex items-center gap-4 text-xs text-brand-muted">
            {booking.event_date && (
              <span className="flex items-center gap-1">
                <BsCalendar3 className="w-3 h-3" />
                {formatDate(booking.event_date)}
              </span>
            )}
            {booking.event_time_slot && (
              <span className="flex items-center gap-1">
                <BsClock className="w-3 h-3" />
                {formatSlot(booking.event_time_slot)}
              </span>
            )}
          </div>

          {/* Next action hint */}
          {action && (
            <p className="mt-3 text-xs font-mono font-bold text-brand-accent">
              {action}
            </p>
          )}
        </div>

        <BsChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-accent transition-colors shrink-0 mt-1" />
      </div>
    </Link>
  );
}
