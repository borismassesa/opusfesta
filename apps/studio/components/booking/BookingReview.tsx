'use client';

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

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: 'Morning (8am - 12pm)',
  afternoon: 'Afternoon (1pm - 5pm)',
  'all-day': 'Full Day (8am - 5pm)',
};

export default function BookingReview({ service, date, timeSlot, formData, holdExpiresAt, onConfirm, onBack, loading }: Props) {
  const expiresIn = Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000));
  const minutes = Math.floor(expiresIn / 60);
  const seconds = expiresIn % 60;

  return (
    <div className="space-y-6">
      {expiresIn > 0 && expiresIn < 300 && (
        <div className="border-3 border-brand-accent bg-brand-panel p-4 text-center">
          <span className="text-sm font-bold text-brand-accent font-mono">
            SLOT HELD FOR {minutes}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      )}

      <div className="border-3 border-brand-border bg-white">
        <div className="bg-brand-dark text-white px-6 py-3">
          <h3 className="font-mono font-bold uppercase tracking-wider text-sm">Booking Summary</h3>
        </div>
        <div className="divide-y divide-brand-border">
          <Row label="Service" value={service} />
          <Row label="Date" value={new Date(date).toLocaleDateString('en-TZ', { dateStyle: 'full' })} />
          <Row label="Time" value={TIME_SLOT_LABELS[timeSlot] || timeSlot} />
          <Row label="Name" value={formData.name} />
          <Row label="Email" value={formData.email} />
          {formData.phone && <Row label="Phone" value={formData.phone} />}
          {formData.whatsapp && <Row label="WhatsApp" value={formData.whatsapp} />}
          <Row label="Event Type" value={formData.event_type} />
          {formData.location && <Row label="Location" value={formData.location} />}
          {formData.guest_count && <Row label="Guests" value={formData.guest_count} />}
          {formData.message && <Row label="Details" value={formData.message} />}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 border-3 border-brand-border bg-white px-6 py-4 font-mono font-bold uppercase tracking-wider hover:bg-brand-bg transition-colors"
        >
          ← BACK
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 border-3 border-brand-border bg-brand-dark text-white px-6 py-4 font-mono font-bold uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50"
        >
          {loading ? 'SUBMITTING...' : 'CONFIRM →'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-6 py-3">
      <span className="w-32 font-bold text-sm text-brand-muted font-mono uppercase shrink-0">{label}</span>
      <span className="text-brand-dark">{value}</span>
    </div>
  );
}
