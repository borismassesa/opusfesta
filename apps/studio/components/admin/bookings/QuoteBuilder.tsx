'use client';

import { useState, useEffect } from 'react';
import { formatTZS } from '@/lib/booking-types';

interface LineItem {
  description: string;
  quantity: number;
  unit_price_tzs: number;
  item_type: 'package' | 'add_on' | 'custom';
  package_id?: string;
  add_on_id?: string;
}

interface PackageOption {
  id: string;
  name: string;
  base_price_tzs: number;
}

interface AddOnOption {
  id: string;
  name: string;
  price_tzs: number;
}

interface Props {
  bookingId: string;
  onQuoteSent: () => void;
}

export default function QuoteBuilder({ bookingId, onQuoteSent }: Props) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [addOns, setAddOns] = useState<AddOnOption[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [notes, setNotes] = useState('');
  const [depositPercent, setDepositPercent] = useState(50);
  const [validHours, setValidHours] = useState(72);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/packages').then(r => r.json()),
      fetch('/api/admin/add-ons').then(r => r.json()),
    ]).then(([pRes, aRes]) => {
      setPackages(pRes.packages || []);
      setAddOns(aRes.addOns || []);
    });
  }, []);

  const subtotal = lineItems.reduce((sum, li) => sum + li.unit_price_tzs * li.quantity, 0);
  const total = subtotal - discount;
  const depositAmount = Math.ceil(total * depositPercent / 100);

  function addCustomItem() {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price_tzs: 0, item_type: 'custom' }]);
  }

  function addPackageItem(pkg: PackageOption) {
    setLineItems([...lineItems, {
      description: pkg.name,
      quantity: 1,
      unit_price_tzs: pkg.base_price_tzs,
      item_type: 'package',
      package_id: pkg.id,
    }]);
  }

  function addAddOnItem(addon: AddOnOption) {
    setLineItems([...lineItems, {
      description: addon.name,
      quantity: 1,
      unit_price_tzs: addon.price_tzs,
      item_type: 'add_on',
      add_on_id: addon.id,
    }]);
  }

  function updateItem(index: number, updates: Partial<LineItem>) {
    setLineItems(items => items.map((item, i) => i === index ? { ...item, ...updates } : item));
  }

  function removeItem(index: number) {
    setLineItems(items => items.filter((_, i) => i !== index));
  }

  async function handleSend() {
    if (lineItems.length === 0) {
      setError('Add at least one line item');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_items: lineItems,
          discount_tzs: discount,
          discount_reason: discountReason || undefined,
          deposit_percent: depositPercent,
          notes: notes || undefined,
          valid_hours: validHours,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      onQuoteSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send quote');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={addCustomItem}
          className="border-2 border-brand-border bg-white px-3 py-1.5 text-xs font-mono font-bold hover:bg-brand-bg transition-colors"
        >
          + CUSTOM ITEM
        </button>
        {packages.map(pkg => (
          <button
            key={pkg.id}
            onClick={() => addPackageItem(pkg)}
            className="border-2 border-brand-accent bg-brand-panel px-3 py-1.5 text-xs font-mono font-bold hover:bg-brand-accent hover:text-white transition-colors"
          >
            + {pkg.name}
          </button>
        ))}
        {addOns.map(addon => (
          <button
            key={addon.id}
            onClick={() => addAddOnItem(addon)}
            className="border-2 border-brand-secondary bg-white px-3 py-1.5 text-xs font-mono font-bold hover:bg-brand-secondary hover:text-white transition-colors"
          >
            + {addon.name}
          </button>
        ))}
      </div>

      {lineItems.length > 0 && (
        <div className="border-2 border-brand-border">
          <div className="grid grid-cols-[1fr_80px_120px_40px] gap-2 px-4 py-2 bg-brand-dark text-white text-xs font-mono font-bold uppercase">
            <span>Description</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Unit Price</span>
            <span></span>
          </div>
          {lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_120px_40px] gap-2 px-4 py-2 border-t border-brand-border/30 items-center">
              <input
                value={item.description}
                onChange={e => updateItem(i, { description: e.target.value })}
                className="border-2 border-brand-border px-2 py-1 text-sm font-mono w-full"
                placeholder="Description"
              />
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={e => updateItem(i, { quantity: parseInt(e.target.value) || 1 })}
                className="border-2 border-brand-border px-2 py-1 text-sm font-mono text-center w-full"
              />
              <input
                type="number"
                min={0}
                value={item.unit_price_tzs}
                onChange={e => updateItem(i, { unit_price_tzs: parseInt(e.target.value) || 0 })}
                className="border-2 border-brand-border px-2 py-1 text-sm font-mono text-right w-full"
              />
              <button
                onClick={() => removeItem(i)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ×
              </button>
            </div>
          ))}
          <div className="border-t-2 border-brand-border px-4 py-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Subtotal</span>
              <span className="font-bold">{formatTZS(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Discount</span>
                <span>-{formatTZS(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-brand-border/30 pt-1">
              <span>Total</span>
              <span>{formatTZS(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-accent font-bold">
              <span>Deposit ({depositPercent}%)</span>
              <span>{formatTZS(depositAmount)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-mono font-bold text-brand-muted mb-1">DISCOUNT (TZS)</label>
          <input
            type="number"
            min={0}
            value={discount}
            onChange={e => setDiscount(parseInt(e.target.value) || 0)}
            className="w-full border-2 border-brand-border px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-mono font-bold text-brand-muted mb-1">DISCOUNT REASON</label>
          <input
            value={discountReason}
            onChange={e => setDiscountReason(e.target.value)}
            className="w-full border-2 border-brand-border px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-mono font-bold text-brand-muted mb-1">DEPOSIT %</label>
          <input
            type="number"
            min={1}
            max={100}
            value={depositPercent}
            onChange={e => setDepositPercent(parseInt(e.target.value) || 50)}
            className="w-full border-2 border-brand-border px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-mono font-bold text-brand-muted mb-1">VALID (HOURS)</label>
          <input
            type="number"
            min={1}
            value={validHours}
            onChange={e => setValidHours(parseInt(e.target.value) || 72)}
            className="w-full border-2 border-brand-border px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono font-bold text-brand-muted mb-1">NOTES</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full border-2 border-brand-border px-3 py-2 text-sm font-mono resize-none"
          placeholder="Additional notes for the client..."
        />
      </div>

      {error && (
        <div className="border-2 border-red-500 bg-red-50 px-4 py-2 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending || lineItems.length === 0}
        className="w-full border-3 border-brand-border bg-brand-dark text-white px-6 py-3 font-mono font-bold uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50"
      >
        {sending ? 'SENDING...' : 'SEND QUOTE TO CLIENT'}
      </button>
    </div>
  );
}
