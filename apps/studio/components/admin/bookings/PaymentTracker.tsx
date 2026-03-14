'use client';

import { useState } from 'react';
import { formatTZS } from '@/lib/booking-types';
import type { StudioPayment, BookingWithRelations } from '@/lib/booking-types';

interface Props {
  booking: BookingWithRelations;
  onPaymentRecorded: () => void;
}

export default function PaymentTracker({ booking, onPaymentRecorded }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'deposit' | 'balance'>('deposit');
  const [reference, setReference] = useState('');
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount_tzs, 0);

  async function handleRecord() {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setRecording(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum, paymentType, provider: 'manual', reference }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setShowForm(false);
      setAmount('');
      setReference('');
      onPaymentRecorded();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record payment');
    } finally {
      setRecording(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border-2 border-brand-border bg-white p-4 text-center">
          <div className="text-xs font-mono font-bold text-brand-muted uppercase">Total</div>
          <div className="text-lg font-bold text-brand-dark mt-1">{formatTZS(booking.total_amount_tzs)}</div>
        </div>
        <div className="border-2 border-green-300 bg-green-50 p-4 text-center">
          <div className="text-xs font-mono font-bold text-green-600 uppercase">Paid</div>
          <div className="text-lg font-bold text-green-700 mt-1">{formatTZS(totalPaid)}</div>
        </div>
        <div className="border-2 border-orange-300 bg-orange-50 p-4 text-center">
          <div className="text-xs font-mono font-bold text-orange-600 uppercase">Balance</div>
          <div className="text-lg font-bold text-orange-700 mt-1">{formatTZS(booking.balance_due_tzs)}</div>
          {booking.balance_due_date && (
            <div className="text-xs text-orange-500 mt-0.5">
              Due {new Date(booking.balance_due_date).toLocaleDateString('en-TZ', { dateStyle: 'medium' })}
            </div>
          )}
        </div>
      </div>

      {booking.payments.length > 0 && (
        <div className="border-2 border-brand-border">
          <div className="px-4 py-2 bg-brand-dark text-white text-xs font-mono font-bold uppercase flex">
            <span className="flex-1">Type</span>
            <span className="w-28 text-right">Amount</span>
            <span className="w-24 text-right">Provider</span>
            <span className="w-32 text-right">Date</span>
          </div>
          {booking.payments.map((p: StudioPayment) => (
            <div key={p.id} className="px-4 py-2 border-t border-brand-border/30 flex text-sm items-center">
              <span className="flex-1 font-mono uppercase text-xs font-bold">{p.payment_type}</span>
              <span className="w-28 text-right font-bold">{formatTZS(p.amount_tzs)}</span>
              <span className="w-24 text-right text-brand-muted text-xs font-mono">{p.provider}</span>
              <span className="w-32 text-right text-brand-muted text-xs">
                {new Date(p.paid_at).toLocaleDateString('en-TZ', { dateStyle: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="border-2 border-brand-border bg-white px-4 py-2 text-xs font-mono font-bold hover:bg-brand-bg transition-colors"
        >
          + RECORD MANUAL PAYMENT
        </button>
      ) : (
        <div className="border-2 border-brand-border bg-white p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-brand-muted mb-1">TYPE</label>
              <select
                value={paymentType}
                onChange={e => setPaymentType(e.target.value as 'deposit' | 'balance')}
                className="w-full border-2 border-brand-border px-3 py-2 text-sm font-mono"
              >
                <option value="deposit">Deposit</option>
                <option value="balance">Balance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-brand-muted mb-1">AMOUNT (TZS)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border-2 border-brand-border px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-brand-muted mb-1">REFERENCE</label>
              <input
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full border-2 border-brand-border px-3 py-2 text-sm font-mono"
                placeholder="M-Pesa ref, etc."
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
          <div className="flex gap-2">
            <button
              onClick={handleRecord}
              disabled={recording}
              className="border-2 border-brand-border bg-brand-dark text-white px-4 py-2 text-xs font-mono font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              {recording ? 'RECORDING...' : 'RECORD'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(null); }}
              className="border-2 border-brand-border bg-white px-4 py-2 text-xs font-mono font-bold hover:bg-brand-bg transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
