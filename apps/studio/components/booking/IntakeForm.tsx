'use client';

import { useState } from 'react';

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

const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Send Off',
  'Kitchen Party',
  'Corporate Event',
  'Portrait Session',
  'Fashion Shoot',
  'Product Photography',
  'Other',
];

export default function IntakeForm({ onSubmit, loading, defaultService }: Props) {
  const [form, setForm] = useState<IntakeFormData>({
    name: '',
    email: '',
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.event_type) newErrors.event_type = 'Event type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  function field(name: keyof IntakeFormData, label: string, type = 'text', required = false) {
    return (
      <div>
        <label className="block text-sm font-bold text-brand-dark mb-1 font-mono uppercase tracking-wider">
          {label} {required && <span className="text-brand-accent">*</span>}
        </label>
        <input
          type={type}
          value={form[name]}
          onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))}
          className="w-full border-3 border-brand-border bg-white px-4 py-3 text-brand-dark font-mono focus:border-brand-accent focus:outline-none"
        />
        {errors[name] && <p className="text-red-500 text-xs mt-1 font-bold">{errors[name]}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {defaultService && (
        <div className="border-3 border-brand-accent bg-brand-panel p-4">
          <span className="text-sm font-bold text-brand-muted font-mono">SELECTED SERVICE:</span>
          <span className="font-bold text-brand-dark ml-2">{defaultService}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('name', 'Full Name', 'text', true)}
        {field('email', 'Email Address', 'email', true)}
        {field('phone', 'Phone Number', 'tel')}
        {field('whatsapp', 'WhatsApp Number', 'tel')}
      </div>

      <div>
        <label className="block text-sm font-bold text-brand-dark mb-1 font-mono uppercase tracking-wider">
          Event Type <span className="text-brand-accent">*</span>
        </label>
        <select
          value={form.event_type}
          onChange={e => setForm(prev => ({ ...prev, event_type: e.target.value }))}
          className="w-full border-3 border-brand-border bg-white px-4 py-3 text-brand-dark font-mono focus:border-brand-accent focus:outline-none appearance-none"
        >
          <option value="">Select event type...</option>
          {EVENT_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.event_type && <p className="text-red-500 text-xs mt-1 font-bold">{errors.event_type}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('location', 'Event Location')}
        {field('guest_count', 'Expected Guest Count', 'number')}
      </div>

      <div>
        <label className="block text-sm font-bold text-brand-dark mb-1 font-mono uppercase tracking-wider">
          Additional Details
        </label>
        <textarea
          value={form.message}
          onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
          rows={4}
          className="w-full border-3 border-brand-border bg-white px-4 py-3 text-brand-dark font-mono focus:border-brand-accent focus:outline-none resize-none"
          placeholder="Tell us about your vision, special requirements, or any questions..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full border-3 border-brand-border bg-brand-dark text-white px-8 py-4 font-mono font-bold text-lg uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'SUBMITTING...' : 'SUBMIT BOOKING REQUEST'}
      </button>
    </form>
  );
}
