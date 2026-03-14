'use client';

import { STATUS_LABELS, STATUS_COLORS } from '@/lib/booking-state-machine';
import type { StudioBookingEvent, BookingLifecycleStatus } from '@/lib/booking-types';

interface Props {
  events: StudioBookingEvent[];
  compact?: boolean;
}

const COLOR_CLASSES: Record<string, string> = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

export default function BookingTimeline({ events, compact }: Props) {
  if (events.length === 0) {
    return <p className="text-brand-muted text-sm">No events recorded yet.</p>;
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        const statusColor = event.to_status
          ? COLOR_CLASSES[STATUS_COLORS[event.to_status as BookingLifecycleStatus]] || 'bg-gray-400'
          : 'bg-gray-400';

        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 ${statusColor} shrink-0 mt-1.5`} />
              {!isLast && <div className="w-0.5 bg-brand-border flex-1 min-h-[24px]" />}
            </div>
            <div className={`pb-4 ${compact ? 'pb-2' : ''}`}>
              <div className="flex items-baseline gap-2">
                {event.to_status && (
                  <span className="font-bold text-sm text-brand-dark">
                    {STATUS_LABELS[event.to_status as BookingLifecycleStatus] || event.to_status}
                  </span>
                )}
                <span className="text-xs text-brand-muted font-mono">
                  {new Date(event.created_at).toLocaleString('en-TZ', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              {event.description && !compact && (
                <p className="text-sm text-brand-muted mt-0.5">{event.description}</p>
              )}
              {!compact && (
                <p className="text-xs text-brand-muted mt-0.5">
                  by {event.actor.replace('admin:', 'Admin ').replace('client:', '').replace('system', 'System')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
