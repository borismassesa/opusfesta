'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { formatTZS } from '@/lib/booking-types';

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const paymentResult = searchParams.get('payment');

  const [booking, setBooking] = useState<{
    name: string;
    event_type: string;
    deposit_amount_tzs: number;
    balance_due_tzs: number;
    lifecycle_status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booking/payment/info?token=${token}`);
        if (!res.ok) throw new Error('Failed to load payment info');
        const json = await res.json();
        setBooking(json.booking);
      } catch {
        setError('Unable to load payment information.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handlePay(paymentType: 'deposit' | 'balance') {
    setInitiating(true);
    setError(null);
    try {
      const res = await fetch('/api/booking/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, paymentType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Redirect to Flutterwave checkout
      window.location.href = data.paymentLink;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment initiation failed');
      setInitiating(false);
    }
  }

  if (loading) {
    return <div className="h-64 border-3 border-brand-border bg-white animate-pulse" />;
  }

  if (paymentResult === 'success') {
    return (
      <div className="border-3 border-green-500 bg-green-50 p-12 text-center shadow-brutal">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-green-700 font-mono uppercase mb-4">
          Payment Successful!
        </h2>
        <p className="text-green-600 max-w-md mx-auto">
          Your payment has been received. You&apos;ll receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  if (paymentResult === 'failed') {
    return (
      <div className="border-3 border-red-500 bg-red-50 p-12 text-center">
        <h2 className="text-2xl font-bold text-red-700 font-mono uppercase mb-4">
          Payment Failed
        </h2>
        <p className="text-red-600 mb-6">
          Your payment could not be processed. Please try again.
        </p>
        {booking && (
          <button
            onClick={() => handlePay('deposit')}
            className="border-3 border-brand-border bg-brand-dark text-white px-8 py-4 font-mono font-bold uppercase tracking-wider hover:bg-brand-accent transition-colors shadow-brutal"
          >
            TRY AGAIN
          </button>
        )}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="border-3 border-red-500 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Payment Unavailable</h2>
        <p className="text-red-600">{error || 'Unable to load payment information.'}</p>
      </div>
    );
  }

  const showDeposit = booking.lifecycle_status === 'deposit_pending' && booking.deposit_amount_tzs > 0;
  const showBalance = booking.lifecycle_status === 'confirmed' && booking.balance_due_tzs > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Make Payment
        </h1>
        <p className="text-brand-muted mt-1">
          {booking.name} — {booking.event_type}
        </p>
      </div>

      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {showDeposit && (
        <div className="border-3 border-brand-border bg-white p-8 text-center space-y-4">
          <h2 className="font-bold text-brand-dark font-mono uppercase text-sm">Deposit Payment</h2>
          <p className="text-4xl font-bold text-brand-dark">{formatTZS(booking.deposit_amount_tzs)}</p>
          <p className="text-brand-muted text-sm">
            50% non-refundable deposit to confirm your booking
          </p>
          <p className="text-brand-muted text-xs">
            Pay via Mobile Money (Airtel, Vodacom/M-Pesa, Tigo, HaloPesa) or Card
          </p>
          <button
            onClick={() => handlePay('deposit')}
            disabled={initiating}
            className="border-3 border-brand-border bg-brand-dark text-white px-8 py-4 font-mono font-bold text-lg uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50"
          >
            {initiating ? 'CONNECTING...' : 'PAY DEPOSIT'}
          </button>
        </div>
      )}

      {showBalance && (
        <div className="border-3 border-brand-border bg-white p-8 text-center space-y-4">
          <h2 className="font-bold text-brand-dark font-mono uppercase text-sm">Balance Payment</h2>
          <p className="text-4xl font-bold text-brand-dark">{formatTZS(booking.balance_due_tzs)}</p>
          <p className="text-brand-muted text-sm">Remaining balance for your booking</p>
          <button
            onClick={() => handlePay('balance')}
            disabled={initiating}
            className="border-3 border-brand-border bg-brand-dark text-white px-8 py-4 font-mono font-bold text-lg uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50"
          >
            {initiating ? 'CONNECTING...' : 'PAY BALANCE'}
          </button>
        </div>
      )}

      {!showDeposit && !showBalance && (
        <div className="border-3 border-green-500 bg-green-50 p-8 text-center">
          <h2 className="text-xl font-bold text-green-700">All Payments Complete</h2>
          <p className="text-green-600 mt-1">No outstanding payments for this booking.</p>
        </div>
      )}
    </div>
  );
}
