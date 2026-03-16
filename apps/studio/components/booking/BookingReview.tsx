'use client';

import { useState, useEffect } from 'react';
import { BsClock, BsCheckCircle } from 'react-icons/bs';
import type { IntakeFormData } from './IntakeForm';

interface Props {
  service: string;
  date: string;
  timeSlot: string;
  formData: IntakeFormData;
  holdExpiresAt: string;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatSlotDisplay(slot: string) {
  if (slot.includes('-')) {
    const [from, to] = slot.split('-');
    return `${formatTime(from)} – ${formatTime(to)}`;
  }
  const labels: Record<string, string> = {
    morning: 'Morning (8am – 12pm)',
    afternoon: 'Afternoon (1pm – 5pm)',
    'all-day': 'Full Day (8am – 5pm)',
  };
  return labels[slot] || slot;
}

function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return remaining;
}

export default function BookingReview({ service, date, timeSlot, formData, holdExpiresAt, onConfirm, onBack, loading }: Props) {
  const remaining = useCountdown(holdExpiresAt);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining > 0 && remaining < 300;
  const isExpired = remaining <= 0;

  return (
    <div className="space-y-6">
      {/* Hold timer */}
      {isUrgent && !isExpired && (
        <div className="border-3 border-brand-accent bg-brand-panel p-4 flex items-center justify-center gap-3">
          <BsClock className="w-4 h-4 text-brand-accent animate-pulse" />
          <span className="text-sm font-bold text-brand-accent font-mono">
            SLOT RESERVED — {minutes}:{String(seconds).padStart(2, '0')} REMAINING
          </span>
        </div>
      )}

      {isExpired && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-center">
          <span className="text-sm font-bold text-red-700 font-mono">
            SLOT RESERVATION EXPIRED — Please go back and select a new time.
          </span>
        </div>
      )}

      {/* Summary card */}
      <div className="border-3 border-brand-border bg-white shadow-brutal">
        <div className="bg-brand-dark text-white px-6 py-4 flex items-center gap-3">
          <BsCheckCircle className="w-4 h-4 text-brand-accent" />
          <h3 className="font-mono font-bold uppercase tracking-wider text-sm">Review Your Booking</h3>
        </div>

        <div className="divide-y divide-brand-border/30">
          <Row label="Service" value={service} highlight />
          <Row label="Date" value={new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
          <Row label="Time" value={formatSlotDisplay(timeSlot)} />

          <div className="px-6 py-2 bg-brand-bg">
            <span className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-widest">Your Details</span>
          </div>

          <Row label="Name" value={formData.name} />
          <Row label="Email" value={formData.email} />
          {formData.phone && <Row label="Phone" value={formData.phone} />}
          {formData.whatsapp && <Row label="WhatsApp" value={formData.whatsapp} />}
          <Row label="Event" value={formData.event_type} />
          {formData.location && <Row label="Location" value={formData.location} />}
          {formData.guest_count && <Row label="Guests" value={formData.guest_count} />}
          {formData.message && <Row label="Details" value={formData.message} />}
        </div>
      </div>

      {/* Info note */}
      <div className="border-3 border-brand-border bg-brand-panel p-4">
        <p className="text-sm text-brand-muted">
          <strong className="text-brand-dark">What happens next?</strong> Our team will review your request and send you a personalized quote within 24 hours. You&apos;ll receive a confirmation email at <strong className="text-brand-dark">{formData.email}</strong>.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 border-3 border-brand-border bg-white px-6 py-4 font-mono font-bold uppercase tracking-wider hover:bg-brand-bg transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading || isExpired}
          className="flex-1 border-3 border-brand-border bg-brand-dark text-white px-6 py-4 font-mono font-bold uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Confirm Booking →'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex px-6 py-3 ${highlight ? 'bg-brand-accent/5' : ''}`}>
      <span className="w-28 sm:w-32 font-bold text-xs text-brand-muted font-mono uppercase shrink-0 pt-0.5">{label}</span>
      <span className={`text-brand-dark text-sm ${highlight ? 'font-bold' : ''}`}>{value}</span>
    </div>
  );
}
