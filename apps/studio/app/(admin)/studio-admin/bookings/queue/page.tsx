'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatTZS } from '@/lib/booking-types';

interface QueueData {
  intakes: Array<{ id: string; name: string; email: string; event_type: string; event_date: string | null; created_at: string }>;
  expiringHolds: Array<{ id: string; date: string; time_slot: string; expires_at: string; held_by_email: string | null }>;
  expiringQuotes: Array<{ id: string; valid_until: string; studio_bookings: { id: string; name: string; event_type: string } }>;
  expiringContracts: Array<{ id: string; sign_deadline: string; studio_bookings: { id: string; name: string; event_type: string } }>;
  depositPending: Array<{ id: string; name: string; event_type: string; deposit_amount_tzs: number; created_at: string }>;
  todayBookings: Array<{ id: string; name: string; event_type: string; event_time_slot: string; location: string | null }>;
  overdueBalances: Array<{ id: string; name: string; balance_due_tzs: number; balance_due_date: string }>;
}

export default function QueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bookings/queue');
      const data = await res.json();
      setQueue(data);
    } catch (e) {
      console.error('Failed to load queue:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 border-3 border-brand-border bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  if (!queue) return null;

  const totalActions = queue.intakes.length + queue.depositPending.length + queue.overdueBalances.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
            Booking Queue
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {totalActions > 0 ? `${totalActions} items need attention` : 'All clear!'}
          </p>
        </div>
        <button
          onClick={() => router.push('/studio-admin/bookings')}
          className="border-2 border-brand-border bg-white px-4 py-2 text-xs font-mono font-bold hover:bg-brand-bg transition-colors"
        >
          ALL BOOKINGS
        </button>
      </div>

      {/* New Intakes */}
      {queue.intakes.length > 0 && (
        <Section title="NEEDS QUALIFICATION" count={queue.intakes.length} color="blue">
          {queue.intakes.map(b => (
            <QueueRow
              key={b.id}
              onClick={() => router.push(`/admin/bookings/${b.id}`)}
              primary={`${b.name} — ${b.event_type}`}
              secondary={b.email}
              meta={timeAgo(b.created_at)}
            />
          ))}
        </Section>
      )}

      {/* Deposit Pending */}
      {queue.depositPending.length > 0 && (
        <Section title="AWAITING DEPOSIT" count={queue.depositPending.length} color="orange">
          {queue.depositPending.map(b => (
            <QueueRow
              key={b.id}
              onClick={() => router.push(`/admin/bookings/${b.id}`)}
              primary={`${b.name} — ${b.event_type}`}
              secondary={formatTZS(b.deposit_amount_tzs)}
              meta={timeAgo(b.created_at)}
            />
          ))}
        </Section>
      )}

      {/* Today's Bookings */}
      {queue.todayBookings.length > 0 && (
        <Section title="TODAY'S EVENTS" count={queue.todayBookings.length} color="green">
          {queue.todayBookings.map(b => (
            <QueueRow
              key={b.id}
              onClick={() => router.push(`/admin/bookings/${b.id}`)}
              primary={`${b.name} — ${b.event_type}`}
              secondary={b.event_time_slot}
              meta={b.location || ''}
            />
          ))}
        </Section>
      )}

      {/* Overdue Balances */}
      {queue.overdueBalances.length > 0 && (
        <Section title="OVERDUE BALANCES" count={queue.overdueBalances.length} color="red">
          {queue.overdueBalances.map(b => (
            <QueueRow
              key={b.id}
              onClick={() => router.push(`/admin/bookings/${b.id}`)}
              primary={b.name}
              secondary={formatTZS(b.balance_due_tzs)}
              meta={`Due ${new Date(b.balance_due_date).toLocaleDateString('en-TZ', { dateStyle: 'short' })}`}
            />
          ))}
        </Section>
      )}

      {/* Expiring Items */}
      {(queue.expiringQuotes.length > 0 || queue.expiringContracts.length > 0) && (
        <Section title="EXPIRING SOON" count={queue.expiringQuotes.length + queue.expiringContracts.length} color="amber">
          {queue.expiringQuotes.map(q => (
            <QueueRow
              key={q.id}
              onClick={() => router.push(`/admin/bookings/${q.studio_bookings.id}`)}
              primary={`Quote: ${q.studio_bookings.name}`}
              secondary={q.studio_bookings.event_type}
              meta={`Expires ${new Date(q.valid_until).toLocaleString('en-TZ', { dateStyle: 'short', timeStyle: 'short' })}`}
            />
          ))}
          {queue.expiringContracts.map(c => (
            <QueueRow
              key={c.id}
              onClick={() => router.push(`/admin/bookings/${c.studio_bookings.id}`)}
              primary={`Contract: ${c.studio_bookings.name}`}
              secondary={c.studio_bookings.event_type}
              meta={`Deadline ${new Date(c.sign_deadline).toLocaleString('en-TZ', { dateStyle: 'short', timeStyle: 'short' })}`}
            />
          ))}
        </Section>
      )}

      {totalActions === 0 && queue.todayBookings.length === 0 && (
        <div className="border-3 border-green-300 bg-green-50 p-8 text-center">
          <p className="text-green-700 font-bold font-mono">NO ITEMS NEED ATTENTION</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-300 bg-blue-50',
    orange: 'border-orange-300 bg-orange-50',
    green: 'border-green-300 bg-green-50',
    red: 'border-red-300 bg-red-50',
    amber: 'border-amber-300 bg-amber-50',
  };

  return (
    <div className={`border-3 ${colorMap[color] || 'border-brand-border bg-white'}`}>
      <div className="px-4 py-2 flex justify-between items-center border-b-2 border-inherit">
        <span className="font-mono font-bold text-xs uppercase tracking-wider">{title}</span>
        <span className="bg-brand-dark text-white px-2 py-0.5 text-xs font-mono font-bold">{count}</span>
      </div>
      <div className="divide-y divide-inherit">
        {children}
      </div>
    </div>
  );
}

function QueueRow({ primary, secondary, meta, onClick }: { primary: string; secondary: string; meta: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors">
      <div>
        <span className="font-bold text-sm text-brand-dark block">{primary}</span>
        <span className="text-xs text-brand-muted">{secondary}</span>
      </div>
      <span className="text-xs text-brand-muted font-mono shrink-0 ml-4">{meta}</span>
    </button>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
