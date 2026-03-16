'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { BsPerson, BsEnvelope, BsPhone, BsWhatsapp, BsCalendar3, BsGeoAlt, BsPeople, BsChatLeftText, BsLock } from 'react-icons/bs';
import { EVENT_TYPES } from '@/lib/booking-types';

interface Props {
  onSubmit: (data: IntakeFormData) => void;
  loading?: boolean;
  defaultService?: string;
}

export interface IntakeFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  event_type: string;
  location: string;
  guest_count: string;
  message: string;
}

export default function IntakeForm({ onSubmit, loading, defaultService }: Props) {
  const { user } = useUser();

  // Pre-fill from Clerk user
  const clerkEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const clerkName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '';

  const [form, setForm] = useState<IntakeFormData>({
    name: clerkName,
    email: clerkEmail,
    phone: '',
    whatsapp: '',
    event_type: '',
    location: '',
    guest_count: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeFormData, string>>>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.event_type) newErrors.event_type = 'Please select an event type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, email: clerkEmail });
  }

  function update(name: keyof IntakeFormData, value: string) {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {defaultService && (
        <div className="border-3 border-brand-accent bg-brand-panel p-4 flex items-center gap-3">
          <BsCalendar3 className="w-4 h-4 text-brand-accent shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-brand-muted font-mono uppercase tracking-wider block">Selected Service</span>
            <span className="font-bold text-brand-dark">{defaultService}</span>
          </div>
        </div>
      )}

      {/* Contact info */}
      <div className="border-3 border-brand-border bg-white shadow-brutal">
        <div className="bg-brand-dark text-white px-6 py-3">
          <h3 className="font-mono font-bold uppercase tracking-wider text-sm">Contact Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              icon={<BsPerson className="w-4 h-4" />}
              label="Full Name"
              required
              type="text"
              value={form.name}
              onChange={v => update('name', v)}
              error={errors.name}
              placeholder="John Doe"
            />
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-2 font-mono uppercase tracking-wider">
                <span className="text-brand-muted"><BsEnvelope className="w-4 h-4" /></span>
                Email Address <span className="text-brand-accent">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={clerkEmail}
                  disabled
                  className="w-full border-3 border-brand-border/40 bg-brand-bg px-4 py-3 text-brand-muted font-mono cursor-not-allowed"
                />
                <BsLock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted/50" />
              </div>
              <p className="text-[10px] text-brand-muted mt-1 font-mono">
                Linked to your account
              </p>
            </div>
            <Field
              icon={<BsPhone className="w-4 h-4" />}
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={v => update('phone', v)}
              placeholder="+255 7XX XXX XXX"
            />
            <Field
              icon={<BsWhatsapp className="w-4 h-4" />}
              label="WhatsApp Number"
              type="tel"
              value={form.whatsapp}
              onChange={v => update('whatsapp', v)}
              placeholder="+255 7XX XXX XXX"
            />
          </div>
        </div>
      </div>

      {/* Event details */}
      <div className="border-3 border-brand-border bg-white shadow-brutal">
        <div className="bg-brand-dark text-white px-6 py-3">
          <h3 className="font-mono font-bold uppercase tracking-wider text-sm">Event Details</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-2 font-mono uppercase tracking-wider">
              <BsCalendar3 className="w-3.5 h-3.5 text-brand-muted" />
              Event Type <span className="text-brand-accent">*</span>
            </label>
            <select
              value={form.event_type}
              onChange={e => update('event_type', e.target.value)}
              className={`
                w-full border-3 bg-white px-4 py-3 text-brand-dark font-mono focus:border-brand-accent focus:outline-none appearance-none
                ${errors.event_type ? 'border-red-500' : 'border-brand-border'}
              `}
            >
              <option value="">Select event type...</option>
              {EVENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.event_type && <p className="text-red-500 text-xs mt-1 font-bold">{errors.event_type}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              icon={<BsGeoAlt className="w-4 h-4" />}
              label="Event Location"
              type="text"
              value={form.location}
              onChange={v => update('location', v)}
              placeholder="Venue name or city"
            />
            <Field
              icon={<BsPeople className="w-4 h-4" />}
              label="Expected Guests"
              type="number"
              value={form.guest_count}
              onChange={v => update('guest_count', v)}
              placeholder="e.g. 200"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-2 font-mono uppercase tracking-wider">
              <BsChatLeftText className="w-3.5 h-3.5 text-brand-muted" />
              Additional Details
            </label>
            <textarea
              value={form.message}
              onChange={e => update('message', e.target.value)}
              rows={4}
              className="w-full border-3 border-brand-border bg-white px-4 py-3 text-brand-dark font-mono focus:border-brand-accent focus:outline-none resize-none placeholder:text-brand-muted/50"
              placeholder="Tell us about your vision, special requirements, or any questions..."
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full border-3 border-brand-border bg-brand-dark text-white px-8 py-4 font-mono font-bold text-lg uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'SUBMITTING...' : 'CONTINUE TO REVIEW →'}
      </button>
    </form>
  );
}

function Field({
  icon,
  label,
  required,
  type,
  value,
  onChange,
  error,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-2 font-mono uppercase tracking-wider">
        <span className="text-brand-muted">{icon}</span>
        {label} {required && <span className="text-brand-accent">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full border-3 bg-white px-4 py-3 text-brand-dark font-mono focus:border-brand-accent focus:outline-none placeholder:text-brand-muted/50
          ${error ? 'border-red-500' : 'border-brand-border'}
        `}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}
    </div>
  );
}
