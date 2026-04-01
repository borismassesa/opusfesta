'use client';

import { useState } from 'react';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import { EVENT_TYPES, BOOKING_SOURCES } from '@/lib/booking-types';

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  event_type: string;
  service: string;
  event_date: string;
  event_time_slot: string;
  location: string;
  guest_count: string;
  message: string;
  initial_status: 'qualified' | 'intake_submitted';
  source: string;
  admin_notes: string;
}

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>;
}

const eventTypeOptions = [
  { value: '', label: 'Select event type...' },
  ...EVENT_TYPES.map(t => ({ value: t, label: t })),
];

const statusOptions = [
  { value: 'qualified', label: 'Qualified (ready for quote)' },
  { value: 'intake_submitted', label: 'New Intake (needs review)' },
];

const sourceOptions = [
  { value: '', label: 'Select source...' },
  ...BOOKING_SOURCES.map(s => ({ value: s, label: s })),
];

export default function BookingForm({ onSubmit }: BookingFormProps) {
  const [form, setForm] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    event_type: '',
    service: '',
    event_date: '',
    event_time_slot: '',
    location: '',
    guest_count: '',
    message: '',
    initial_status: 'qualified',
    source: '',
    admin_notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof BookingFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  function validate(): boolean {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Client name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.event_type) newErrors.event_type = 'Please select an event type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Information */}
      <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-[var(--admin-radius)]">
        <div className="px-6 py-3 border-b border-[var(--admin-border)]">
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[var(--admin-foreground)]">Client Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Full Name *"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              error={errors.name}
              placeholder="John Doe"
            />
            <AdminInput
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              error={errors.email}
              placeholder="john@example.com"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+255 7XX XXX XXX"
            />
            <AdminInput
              label="WhatsApp Number"
              type="tel"
              value={form.whatsapp}
              onChange={e => set('whatsapp', e.target.value)}
              placeholder="+255 7XX XXX XXX"
            />
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-[var(--admin-radius)]">
        <div className="px-6 py-3 border-b border-[var(--admin-border)]">
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[var(--admin-foreground)]">Event Details</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminSelect
              label="Event Type *"
              value={form.event_type}
              onChange={e => set('event_type', e.target.value)}
              options={eventTypeOptions}
              error={errors.event_type}
            />
            <AdminInput
              label="Service"
              value={form.service}
              onChange={e => set('service', e.target.value)}
              placeholder="e.g. Photography, Videography"
              hint="Optional — can be set later in the quote"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Event Date"
              type="date"
              value={form.event_date}
              onChange={e => set('event_date', e.target.value)}
            />
            <AdminInput
              label="Time Slot"
              value={form.event_time_slot}
              onChange={e => set('event_time_slot', e.target.value)}
              placeholder="e.g. 09:00 - 14:00"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Location"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="Venue name or address"
            />
            <AdminInput
              label="Expected Guests"
              type="number"
              value={form.guest_count}
              onChange={e => set('guest_count', e.target.value)}
              placeholder="e.g. 200"
            />
          </div>
          <AdminTextarea
            label="Client Message / Details"
            value={form.message}
            onChange={e => set('message', e.target.value)}
            placeholder="Any details the client shared about their event..."
            rows={3}
          />
        </div>
      </div>

      {/* Admin Options */}
      <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-[var(--admin-radius)]">
        <div className="px-6 py-3 border-b border-[var(--admin-border)]">
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[var(--admin-foreground)]">Admin Options</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminSelect
              label="Starting Status"
              value={form.initial_status}
              onChange={e => set('initial_status', e.target.value)}
              options={statusOptions}
            />
            <AdminSelect
              label="How did they reach out?"
              value={form.source}
              onChange={e => set('source', e.target.value)}
              options={sourceOptions}
            />
          </div>
          <AdminTextarea
            label="Admin Notes"
            value={form.admin_notes}
            onChange={e => set('admin_notes', e.target.value)}
            placeholder="Internal notes about this booking (not visible to the client)..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AdminButton type="submit" loading={loading}>
          Create Booking
        </AdminButton>
        <p className="text-xs text-[var(--admin-muted)]">
          The booking will be created and you&apos;ll be redirected to the booking detail page.
        </p>
      </div>
    </form>
  );
}
