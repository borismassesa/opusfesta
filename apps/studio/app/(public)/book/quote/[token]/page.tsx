'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatTZS } from '@/lib/booking-types';

interface QuoteData {
  booking: { name: string; event_type: string; email: string };
  quote: {
    quote_number: string;
    total_tzs: number;
    deposit_amount_tzs: number;
    deposit_percent: number;
    discount_tzs: number;
    discount_reason: string | null;
    notes: string | null;
    valid_until: string;
    accepted_at: string | null;
    line_items: Array<{
      description: string;
      quantity: number;
      unit_price_tzs: number;
      total_tzs: number;
    }>;
  };
}

export default function QuoteViewPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booking/quote/view?token=${token}`);
        if (!res.ok) throw new Error('Failed to load quote');
        const json = await res.json();
        setData(json);
        if (json.quote?.accepted_at) setAccepted(true);
      } catch {
        setError('Unable to load quote. The link may have expired.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch('/api/booking/quote/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      setAccepted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept quote');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return <div className="h-64 border-3 border-brand-border bg-white animate-pulse" />;
  }

  if (error && !data) {
    return (
      <div className="border-3 border-red-500 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Quote Unavailable</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { booking, quote } = data;
  const isExpired = new Date(quote.valid_until) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Your Quote
        </h1>
        <p className="text-brand-muted mt-1">
          Quote {quote.quote_number} for {booking.name}
        </p>
      </div>

      {accepted && (
        <div className="border-3 border-green-500 bg-green-50 p-6 text-center">
          <h2 className="text-xl font-bold text-green-700">Quote Accepted!</h2>
          <p className="text-green-600 mt-1">We&apos;ll send you a contract to sign shortly.</p>
        </div>
      )}

      <div className="border-3 border-brand-border bg-white">
        <div className="bg-brand-dark text-white px-6 py-3 flex justify-between items-center">
          <span className="font-mono font-bold text-sm uppercase tracking-wider">
            Quote Details
          </span>
          <span className="font-mono text-xs text-brand-muted">
            {quote.quote_number}
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-brand-border">
              <th className="text-left px-6 py-3 font-mono text-sm uppercase text-brand-muted">Item</th>
              <th className="text-center px-3 py-3 font-mono text-sm uppercase text-brand-muted">Qty</th>
              <th className="text-right px-6 py-3 font-mono text-sm uppercase text-brand-muted">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quote.line_items.map((li, i) => (
              <tr key={i} className="border-b border-brand-border/30">
                <td className="px-6 py-3 text-brand-dark">{li.description}</td>
                <td className="px-3 py-3 text-center text-brand-muted">{li.quantity}</td>
                <td className="px-6 py-3 text-right font-bold">{formatTZS(li.total_tzs)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t-3 border-brand-border px-6 py-4 space-y-2">
          {quote.discount_tzs > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">
                Discount{quote.discount_reason ? ` (${quote.discount_reason})` : ''}
              </span>
              <span className="text-red-500 font-bold">-{formatTZS(quote.discount_tzs)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatTZS(quote.total_tzs)}</span>
          </div>
          <div className="flex justify-between text-sm text-brand-accent font-bold">
            <span>Deposit Required ({quote.deposit_percent}%)</span>
            <span>{formatTZS(quote.deposit_amount_tzs)}</span>
          </div>
        </div>
      </div>

      {quote.notes && (
        <div className="border-3 border-brand-border bg-brand-panel p-4">
          <span className="text-sm font-bold text-brand-muted font-mono block mb-1">NOTES</span>
          <p className="text-brand-dark text-sm">{quote.notes}</p>
        </div>
      )}

      <div className="border-3 border-brand-border bg-white p-4 flex justify-between items-center">
        <span className="text-sm text-brand-muted">
          Valid until {new Date(quote.valid_until).toLocaleDateString('en-TZ', { dateStyle: 'full' })}
        </span>
        {isExpired && !accepted && (
          <span className="text-red-500 font-bold text-sm font-mono">EXPIRED</span>
        )}
      </div>

      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {!accepted && !isExpired && (
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full border-3 border-brand-border bg-brand-dark text-white px-8 py-4 font-mono font-bold text-lg uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50"
        >
          {accepting ? 'ACCEPTING...' : 'ACCEPT QUOTE'}
        </button>
      )}
    </div>
  );
}
