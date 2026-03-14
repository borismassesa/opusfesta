'use client';

import { useState } from 'react';
import type { BookingWithRelations } from '@/lib/booking-types';
import { formatTZS } from '@/lib/booking-types';

interface Props {
  booking: BookingWithRelations;
  onContractSent: () => void;
}

function generateContractTemplate(booking: BookingWithRelations): string {
  const quote = booking.quotes?.[0];
  const lineItems = quote?.line_items || [];

  const itemsHtml = lineItems.map(li =>
    `<tr><td>${li.description}</td><td style="text-align:center">${li.quantity}</td><td style="text-align:right">${formatTZS(li.total_tzs)}</td></tr>`
  ).join('');

  return `
<h1>SERVICE CONTRACT</h1>
<p><strong>Contract Date:</strong> ${new Date().toLocaleDateString('en-TZ', { dateStyle: 'long' })}</p>
<p><strong>Client:</strong> ${booking.name} (${booking.email})</p>
<p><strong>Event Type:</strong> ${booking.event_type}</p>
${booking.event_date ? `<p><strong>Event Date:</strong> ${new Date(booking.event_date).toLocaleDateString('en-TZ', { dateStyle: 'long' })}</p>` : ''}
${booking.location ? `<p><strong>Location:</strong> ${booking.location}</p>` : ''}

<h2>Services</h2>
<table style="width:100%;border-collapse:collapse">
<thead><tr><th style="text-align:left;border-bottom:2px solid #000;padding:8px">Item</th><th style="text-align:center;border-bottom:2px solid #000;padding:8px">Qty</th><th style="text-align:right;border-bottom:2px solid #000;padding:8px">Amount</th></tr></thead>
<tbody>${itemsHtml}</tbody>
</table>

${quote ? `
<p><strong>Total:</strong> ${formatTZS(quote.total_tzs)}</p>
<p><strong>Deposit Required:</strong> ${formatTZS(quote.deposit_amount_tzs)} (${quote.deposit_percent}%)</p>
` : ''}

<h2>Terms & Conditions</h2>
<ol>
<li><strong>Deposit:</strong> A 50% non-refundable deposit is required to confirm booking.</li>
<li><strong>Balance:</strong> Remaining balance is due 7 days before the event date.</li>
<li><strong>Late Payment:</strong> A 48-hour grace period applies after the balance due date. Failure to pay within this period will result in automatic cancellation with deposit forfeited.</li>
<li><strong>Cancellation:</strong>
  <ul>
    <li>14+ days before event: Balance refunded (deposit non-refundable)</li>
    <li>7-13 days before event: 50% of total amount refunded</li>
    <li>Less than 7 days: No refund</li>
  </ul>
</li>
<li><strong>Reschedule:</strong> First reschedule is free if requested 7+ days before the event. Subsequent reschedules incur a TZS 50,000 fee. Maximum 2 reschedules per booking.</li>
<li><strong>Deliverables:</strong> Final deliverables will be provided within 14 business days after the event.</li>
<li><strong>Usage Rights:</strong> OpusFesta Studio retains the right to use images/footage for portfolio and marketing purposes unless otherwise agreed in writing.</li>
</ol>

<p>By signing this contract, the client agrees to the terms and conditions outlined above.</p>
`.trim();
}

export default function ContractEditor({ booking, onContractSent }: Props) {
  const [contentHtml, setContentHtml] = useState(() => generateContractTemplate(booking));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentHtml }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      onContractSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send contract');
    } finally {
      setSending(false);
    }
  }

  // Contract HTML is authored by the authenticated admin via the textarea below.
  // This is trusted content from an authenticated studio_editor/studio_admin,
  // not user-generated input.

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setPreview(false)}
          className={`border-2 px-3 py-1.5 text-xs font-mono font-bold ${!preview ? 'border-brand-accent bg-brand-accent text-white' : 'border-brand-border bg-white'}`}
        >
          EDIT
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`border-2 px-3 py-1.5 text-xs font-mono font-bold ${preview ? 'border-brand-accent bg-brand-accent text-white' : 'border-brand-border bg-white'}`}
        >
          PREVIEW
        </button>
      </div>

      {preview ? (
        <div className="border-2 border-brand-border bg-white p-6 min-h-[300px]">
          <iframe
            srcDoc={contentHtml}
            className="w-full min-h-[300px] border-0"
            sandbox="allow-same-origin"
            title="Contract Preview"
          />
        </div>
      ) : (
        <textarea
          value={contentHtml}
          onChange={e => setContentHtml(e.target.value)}
          rows={20}
          className="w-full border-2 border-brand-border bg-white px-4 py-3 text-sm font-mono resize-y min-h-[300px]"
        />
      )}

      {error && (
        <div className="border-2 border-red-500 bg-red-50 px-4 py-2 text-red-700 text-sm font-bold">{error}</div>
      )}

      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full border-3 border-brand-border bg-brand-dark text-white px-6 py-3 font-mono font-bold uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50"
      >
        {sending ? 'SENDING...' : 'SEND CONTRACT TO CLIENT'}
      </button>
    </div>
  );
}
