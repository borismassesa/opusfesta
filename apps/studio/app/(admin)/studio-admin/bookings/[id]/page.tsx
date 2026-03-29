'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BsArrowLeft, BsTrash, BsSend, BsChatSquareText, BsBoxArrowUpRight } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminLifecycleBadge from '@/components/admin/ui/AdminLifecycleBadge';
import { AdminTextarea } from '@/components/admin/ui/AdminInput';
import { ConfirmDeleteModal } from '@/components/admin/ui/AdminModal';
import QuoteBuilder from '@/components/studio-admin/bookings/QuoteBuilder';
import ContractEditor from '@/components/studio-admin/bookings/ContractEditor';
import PaymentTracker from '@/components/studio-admin/bookings/PaymentTracker';
import BookingTimeline from '@/components/booking/BookingTimeline';
import type { BookingWithRelations, BookingLifecycleStatus } from '@/lib/booking-types';
import { formatTZS } from '@/lib/booking-types';
import type { StudioMessage } from '@/lib/studio-types';

const MAX_PREVIEW_MESSAGES = 3;

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = useCallback(async () => {
    const [bRes, mRes] = await Promise.all([
      fetch(`/api/studio-admin/bookings/${id}`).then(r => r.json()),
      fetch(`/api/studio-admin/bookings/${id}/messages`).then(r => r.json()).catch(() => ({ messages: [] })),
    ]);
    setBooking(bRes.booking);
    setNotes(bRes.booking?.admin_notes || '');
    setMessages(mRes.messages || []);
  }, [id]);

  useEffect(() => { loadBooking(); }, [loadBooking]);

  async function handleAction(action: string, body?: Record<string, unknown>) {
    setActionLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/studio-admin/bookings/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await loadBooking();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  const handleSaveNotes = async () => {
    setSaving(true);
    await fetch(`/api/studio-admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes }),
    });
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/studio-admin/bookings/${id}`, { method: 'DELETE' });
    router.push('/studio-admin/bookings?deleted=1');
  };

  if (!booking) return <div className="bg-white border-3 border-brand-border h-64 animate-pulse" />;

  const ls = booking.lifecycle_status as BookingLifecycleStatus;
  const showQuoteBuilder = ls === 'qualified';
  const showContractEditor = ls === 'quote_accepted';
  const showPaymentTracker = ['contract_signed', 'deposit_pending', 'confirmed', 'rescheduled', 'completed'].includes(ls);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <AdminButton variant="ghost" onClick={() => router.push('/studio-admin/bookings')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
        <div className="flex gap-2">
          {ls === 'intake_submitted' && (
            <AdminButton onClick={() => handleAction('qualify')} loading={actionLoading === 'qualify'}>
              Qualify
            </AdminButton>
          )}
          {ls === 'confirmed' && (
            <AdminButton onClick={() => handleAction('cancel', { reason: 'Admin cancelled' })} variant="danger" loading={actionLoading === 'cancel'}>
              Cancel
            </AdminButton>
          )}
          <AdminButton variant="danger" size="sm" onClick={() => setShowDelete(true)} icon={<BsTrash className="w-4 h-4" />}>
            Delete
          </AdminButton>
        </div>
      </div>

      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">{error}</div>
      )}

      {/* Booking Info */}
      <div className="bg-white border-3 border-brand-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-brand-dark">{booking.name}</h2>
          <AdminLifecycleBadge status={ls} size="md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <Info label="Email" value={booking.email} />
          {booking.phone && <Info label="Phone" value={booking.phone} />}
          <Info label="Event Type" value={booking.event_type} />
          {booking.service && <Info label="Service" value={booking.service} />}
          {booking.event_date && <Info label="Event Date" value={new Date(booking.event_date).toLocaleDateString('en-TZ', { dateStyle: 'long' })} />}
          {booking.event_time_slot && <Info label="Time Slot" value={booking.event_time_slot} />}
          {booking.location && <Info label="Location" value={booking.location} />}
          {booking.guest_count && <Info label="Guests" value={String(booking.guest_count)} />}
          {booking.total_amount_tzs > 0 && <Info label="Total" value={formatTZS(booking.total_amount_tzs)} />}
          {booking.deposit_amount_tzs > 0 && <Info label="Deposit" value={formatTZS(booking.deposit_amount_tzs)} />}
          {booking.balance_due_tzs > 0 && <Info label="Balance Due" value={`${formatTZS(booking.balance_due_tzs)}${booking.balance_due_date ? ` by ${booking.balance_due_date}` : ''}`} />}
          <Info label="Submitted" value={new Date(booking.created_at).toLocaleString('en-TZ')} />
        </div>
        {booking.message && (
          <div className="mt-4 p-4 bg-brand-bg border-2 border-brand-border">
            <p className="text-xs text-brand-muted font-mono font-bold mb-1">CLIENT MESSAGE</p>
            <p className="text-sm text-brand-dark">{booking.message}</p>
          </div>
        )}
      </div>

      {/* Quote Section */}
      {showQuoteBuilder && (
        <Section title="Build & Send Quote">
          <QuoteBuilder bookingId={booking.id} onQuoteSent={loadBooking} />
        </Section>
      )}

      {/* Existing Quotes */}
      {booking.quotes.length > 0 && !showQuoteBuilder && (
        <Section title={`Quotes (${booking.quotes.length})`}>
          {booking.quotes.map(q => (
            <div key={q.id} className="border-2 border-brand-border p-4 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono font-bold text-sm">{q.quote_number}</span>
                <span className="text-sm text-brand-muted">
                  {q.accepted_at ? '✓ Accepted' : q.rejected_at ? '✕ Rejected' : q.expired_at ? '⏰ Expired' : 'Pending'}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-bold">{formatTZS(q.total_tzs)}</span>
                <span className="text-brand-muted ml-2">
                  (deposit: {formatTZS(q.deposit_amount_tzs)})
                </span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Contract Section */}
      {showContractEditor && (
        <Section title="Create & Send Contract">
          <ContractEditor booking={booking} onContractSent={loadBooking} />
        </Section>
      )}

      {/* Existing Contracts */}
      {booking.contracts.length > 0 && !showContractEditor && (
        <Section title={`Contracts (${booking.contracts.length})`}>
          {booking.contracts.map(c => (
            <div key={c.id} className="border-2 border-brand-border p-4 mb-3">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sm">{c.contract_number}</span>
                <span className="text-sm text-brand-muted">
                  {c.signed_at ? `✓ Signed ${new Date(c.signed_at).toLocaleDateString()}` : c.voided_at ? '✕ Voided' : 'Unsigned'}
                </span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Payment Section */}
      {showPaymentTracker && (
        <Section title="Payments">
          <PaymentTracker booking={booking} onPaymentRecorded={loadBooking} />
        </Section>
      )}

      {/* Timeline */}
      <Section title="Timeline">
        <BookingTimeline events={booking.events} />
      </Section>

      {/* Messages Preview */}
      <Section title="Messages">
        {messages.length === 0 ? (
          <div className="text-center py-4">
            <BsChatSquareText className="w-8 h-8 text-brand-border mx-auto mb-3" />
            <p className="text-sm text-brand-muted mb-3">No messages yet.</p>
            <Link
              href={`/studio-admin/messages?booking=${id}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-accent hover:underline"
            >
              <BsSend className="w-3.5 h-3.5" />
              Start a conversation in Messages
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {messages.slice(-MAX_PREVIEW_MESSAGES).map(m => {
                const isAdmin = (m.sender_type || m.sender) === 'admin';
                return (
                  <div key={m.id} className={`p-3 text-sm ${isAdmin ? 'bg-brand-accent/5 border-l-3 border-brand-accent ml-8' : 'bg-blue-50 border-l-3 border-blue-400 mr-8'}`}>
                    <p className="text-brand-dark line-clamp-2">{m.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-brand-muted">
                        {m.sender_name || (isAdmin ? 'Studio Admin' : 'Client')} · {new Date(m.created_at).toLocaleString()}
                      </span>
                      {!isAdmin && !m.read_at && (
                        <span className="text-[10px] font-mono text-blue-500 font-bold">NEW</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {messages.length > MAX_PREVIEW_MESSAGES && (
              <p className="text-xs text-brand-muted mb-3">
                Showing last {MAX_PREVIEW_MESSAGES} of {messages.length} messages
              </p>
            )}
            <Link
              href={`/studio-admin/messages?booking=${id}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-accent hover:underline"
            >
              <BsBoxArrowUpRight className="w-3.5 h-3.5" />
              Open full conversation in Messages
            </Link>
          </>
        )}
      </Section>

      {/* Admin Notes */}
      <Section title="Admin Notes">
        <AdminTextarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes..." />
        <AdminButton onClick={handleSaveNotes} loading={saving} className="mt-3">Save Notes</AdminButton>
      </Section>

      <ConfirmDeleteModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Booking"
        description="This will permanently delete this booking, all quotes, contracts, payments, and messages."
        loading={deleting}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-brand-muted text-xs font-mono font-bold uppercase block">{label}</span>
      <span className="text-brand-dark font-medium">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-3 border-brand-border">
      <div className="px-6 py-3 border-b-2 border-brand-border bg-brand-bg">
        <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-brand-dark">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
