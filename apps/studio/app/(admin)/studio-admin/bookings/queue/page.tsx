'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatTZS } from '@/lib/booking-types';
import { 
  BsInboxFill, 
  BsWallet2, 
  BsCalendarHeartFill, 
  BsExclamationCircleFill, 
  BsClockHistory, 
  BsCheckCircleFill 
} from 'react-icons/bs';

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
          <div key={i} className="h-32 rounded-xl bg-white border border-gray-200 shadow-sm animate-pulse" />
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
          <h1 className="text-2xl font-bold font-sans tracking-tight text-brand-dark">
            Operational Queue
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {totalActions > 0 ? `You have ${totalActions} actionable item${totalActions === 1 ? '' : 's'} needing attention.` : 'All clear! Your inbox is zeroed out.'}
          </p>
        </div>
        <button
          onClick={() => router.push('/studio-admin/bookings')}
          className="border border-brand-border bg-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
        >
          View Full Pipeline
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* New Intakes */}
        {queue.intakes.length > 0 && (
          <Section title="Needs Qualification" icon={<BsInboxFill />} count={queue.intakes.length} color="blue">
            {queue.intakes.map(b => (
              <QueueRow
                key={b.id}
                onClick={() => router.push(`/studio-admin/bookings/${b.id}`)}
                primary={`${b.name} — ${b.event_type}`}
                secondary={b.email}
                meta={timeAgo(b.created_at)}
              />
            ))}
          </Section>
        )}

        {/* Deposit Pending */}
        {queue.depositPending.length > 0 && (
          <Section title="Awaiting Deposit" icon={<BsWallet2 />} count={queue.depositPending.length} color="orange">
            {queue.depositPending.map(b => (
              <QueueRow
                key={b.id}
                onClick={() => router.push(`/studio-admin/bookings/${b.id}`)}
                primary={`${b.name} — ${b.event_type}`}
                secondary={formatTZS(b.deposit_amount_tzs)}
                meta={timeAgo(b.created_at)}
              />
            ))}
          </Section>
        )}

        {/* Today's Bookings */}
        {queue.todayBookings.length > 0 && (
          <Section title="Today's Events" icon={<BsCalendarHeartFill />} count={queue.todayBookings.length} color="green">
            {queue.todayBookings.map(b => (
              <QueueRow
                key={b.id}
                onClick={() => router.push(`/studio-admin/bookings/${b.id}`)}
                primary={`${b.name} — ${b.event_type}`}
                secondary={b.event_time_slot}
                meta={b.location || ''}
              />
            ))}
          </Section>
        )}

        {/* Overdue Balances */}
        {queue.overdueBalances.length > 0 && (
          <Section title="Overdue Balances" icon={<BsExclamationCircleFill />} count={queue.overdueBalances.length} color="red">
            {queue.overdueBalances.map(b => (
              <QueueRow
                key={b.id}
                onClick={() => router.push(`/studio-admin/bookings/${b.id}`)}
                primary={b.name}
                secondary={formatTZS(b.balance_due_tzs)}
                meta={`Due ${new Date(b.balance_due_date).toLocaleDateString('en-TZ', { dateStyle: 'short' })}`}
              />
            ))}
          </Section>
        )}

        {/* Expiring Items */}
        {(queue.expiringQuotes.length > 0 || queue.expiringContracts.length > 0) && (
          <Section title="Expiring Soon" icon={<BsClockHistory />} count={queue.expiringQuotes.length + queue.expiringContracts.length} color="amber">
            {queue.expiringQuotes.map(q => (
              <QueueRow
                key={q.id}
                onClick={() => router.push(`/studio-admin/bookings/${q.studio_bookings.id}`)}
                primary={`Quote: ${q.studio_bookings.name}`}
                secondary={q.studio_bookings.event_type}
                meta={`Expires ${new Date(q.valid_until).toLocaleString('en-TZ', { dateStyle: 'short', timeStyle: 'short' })}`}
              />
            ))}
            {queue.expiringContracts.map(c => (
              <QueueRow
                key={c.id}
                onClick={() => router.push(`/studio-admin/bookings/${c.studio_bookings.id}`)}
                primary={`Contract: ${c.studio_bookings.name}`}
                secondary={c.studio_bookings.event_type}
                meta={`Deadline ${new Date(c.sign_deadline).toLocaleString('en-TZ', { dateStyle: 'short', timeStyle: 'short' })}`}
              />
            ))}
          </Section>
        )}

        {/* Zero Inbox State */}
        {totalActions === 0 && queue.todayBookings.length === 0 && queue.expiringQuotes.length === 0 && queue.expiringContracts.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4">
              <BsCheckCircleFill className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark tracking-tight">Inbox Zero</h3>
            <p className="text-brand-muted text-sm mt-2 text-center max-w-sm">
              You are completely caught up! There are no pending items that require immediate attention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, count, color, children }: { title: string; icon: React.ReactNode; count: number; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500 text-blue-600',
    orange: 'border-l-orange-500 text-orange-600',
    green: 'border-l-green-500 text-green-600',
    red: 'border-l-red-500 text-red-600',
    amber: 'border-l-amber-500 text-amber-600',
  };

  const activeColorClass = colorMap[color] || 'border-l-gray-300 text-gray-600';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 overflow-hidden ${activeColorClass}`}>
      <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          <span className="text-lg opacity-80">{icon}</span>
          <span className="font-semibold text-sm tracking-wide text-brand-dark">{title}</span>
        </div>
        <span className="bg-white border border-gray-200 rounded-full text-brand-dark px-2.5 py-0.5 text-xs font-bold shadow-sm">
          {count}
        </span>
      </div>
      <div className="divide-y divide-gray-100 text-brand-dark">
        {children}
      </div>
    </div>
  );
}

function QueueRow({ primary, secondary, meta, onClick }: { primary: string; secondary: string; meta: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
      <div>
        <span className="font-semibold text-[15px] block text-brand-dark group-hover:text-black transition-colors">{primary}</span>
        <span className="text-sm text-gray-500 mt-0.5 block">{secondary}</span>
      </div>
      <span className="text-xs text-brand-muted font-mono shrink-0 ml-4 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{meta}</span>
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
