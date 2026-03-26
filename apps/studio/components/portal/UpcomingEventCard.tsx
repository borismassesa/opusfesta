'use client';

import Link from 'next/link';
import { BsCalendar3, BsClock, BsArrowRight } from 'react-icons/bs';
import StatusBadge from './StatusBadge';

interface UpcomingEvent {
  id: string;
  event_type: string;
  event_date: string;
  event_time_slot: string | null;
  service: string | null;
  lifecycle_status: string;
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCountdownLabel(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} days away`;
  if (days <= 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} away`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} away`;
}

export default function UpcomingEventCard({ event }: { event: UpcomingEvent }) {
  const daysUntil = getDaysUntil(event.event_date);
  const countdownLabel = getCountdownLabel(daysUntil);
  const isImminent = daysUntil <= 3;

  return (
    <Link
      href={`/portal/bookings/${event.id}`}
      className={`block border-3 bg-white transition-all group ${
        isImminent
          ? 'border-brand-accent shadow-brutal-accent'
          : 'border-brand-border shadow-brutal hover:border-brand-accent hover:shadow-brutal-accent'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">
            Next Event
          </span>
          <span
            className={`text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider ${
              isImminent ? 'text-brand-accent' : 'text-brand-dark'
            }`}
          >
            {countdownLabel}
          </span>
        </div>

        {/* Countdown number for imminent events */}
        {daysUntil <= 7 && daysUntil >= 0 && (
          <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
            <span
              className={`text-3xl sm:text-4xl font-bold font-mono tracking-tighter ${
                isImminent ? 'text-brand-accent' : 'text-brand-dark'
              }`}
            >
              {daysUntil}
            </span>
            <span className="text-[11px] sm:text-xs font-mono text-brand-muted uppercase tracking-wider">
              {daysUntil === 1 ? 'day' : 'days'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-2">
          <h3 className="font-bold text-brand-dark font-mono text-xs sm:text-sm uppercase tracking-wider">
            {event.event_type}
          </h3>
          <StatusBadge status={event.lifecycle_status} />
        </div>

        {event.service && (
          <p className="text-[11px] sm:text-xs text-brand-muted mb-2">{event.service}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-[11px] sm:text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <BsCalendar3 className="w-3 h-3 shrink-0" />
            {formatDate(event.event_date)}
          </span>
          {event.event_time_slot && (
            <span className="flex items-center gap-1">
              <BsClock className="w-3 h-3 shrink-0" />
              {formatSlot(event.event_time_slot)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-2.5 sm:mt-3 text-[11px] sm:text-xs font-mono font-bold text-brand-accent group-hover:text-brand-dark uppercase tracking-wider transition-colors">
          View Details <BsArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}
