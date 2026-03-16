'use client';

import { FormEvent, useState } from 'react';

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  message: string;
};

const initialForm: ContactForm = {
  name: '',
  email: '',
  phone: '',
  projectType: '',
  budgetRange: '',
  timeline: '',
  message: '',
};

export default function ContactPageContent() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          eventType: form.projectType,
          service: form.projectType,
          message: `${form.message}\n\nBudget: ${form.budgetRange || 'Not specified'}\nTimeline: ${form.timeline || 'Not specified'}`,
        }),
      });

      const data = await response.json().catch(() => ({ success: false }));
      if (!response.ok || !data.success) {
        setStatus('error');
        setError(data.error || 'Unable to submit the form.');
        return;
      }

      setStatus('success');
      setForm(initialForm);
    } catch {
      setStatus('error');
      setError('Network error. Please try again.');
    }
  }

  const inputClasses =
    'w-full px-4 py-3 bg-white border-2 border-brand-border text-brand-dark text-sm placeholder:text-neutral-400 focus:outline-none focus:border-brand-accent transition-colors duration-200';
  const labelClasses = 'block text-[10px] font-bold text-brand-dark uppercase tracking-widest font-mono mb-2';

  return (
    <section className="py-20 lg:py-24 bg-brand-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-5 block">Contact</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
            START A<br />
            <span className="text-stroke">PROJECT.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-10">
          <form onSubmit={handleSubmit} className="border-4 border-brand-border bg-white p-6 sm:p-8 lg:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className={labelClasses}>Name *</label>
                <input id="name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClasses} />
              </div>
              <div>
                <label htmlFor="email" className={labelClasses}>Email *</label>
                <input id="email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputClasses} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className={labelClasses}>Phone</label>
                <input id="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputClasses} />
              </div>
              <div>
                <label htmlFor="projectType" className={labelClasses}>Project Type *</label>
                <select
                  id="projectType"
                  required
                  value={form.projectType}
                  onChange={(e) => setForm((p) => ({ ...p, projectType: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="">Select project type</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Music Video">Music Video</option>
                  <option value="Branded Content">Branded Content</option>
                  <option value="Photography">Photography</option>
                  <option value="Post-Production">Post-Production</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="budgetRange" className={labelClasses}>Budget Range</label>
                <select
                  id="budgetRange"
                  value={form.budgetRange}
                  onChange={(e) => setForm((p) => ({ ...p, budgetRange: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="">Select budget</option>
                  <option value="$5k-$15k">$5k - $15k</option>
                  <option value="$15k-$35k">$15k - $35k</option>
                  <option value="$35k-$75k">$35k - $75k</option>
                  <option value="$75k+">$75k+</option>
                </select>
              </div>
              <div>
                <label htmlFor="timeline" className={labelClasses}>Timeline</label>
                <select id="timeline" value={form.timeline} onChange={(e) => setForm((p) => ({ ...p, timeline: e.target.value }))} className={inputClasses}>
                  <option value="">Select timeline</option>
                  <option value="Under 2 weeks">Under 2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="2+ months">2+ months</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className={labelClasses}>Project Brief</label>
              <textarea
                id="message"
                rows={6}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className={inputClasses}
                placeholder="Goals, deliverables, and context."
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-4 border-brand-dark shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200 disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Enquiry'}
            </button>

            {status === 'success' ? <p className="text-sm text-green-700">Thanks. We received your request.</p> : null}
            {status === 'error' ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>

          <div className="space-y-8">
            <div className="border-4 border-brand-border bg-brand-dark p-8 text-white">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Direct Contact</p>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-mono uppercase text-white/50 mb-2">Email</p>
                  <a href="mailto:studio@opusfesta.com" className="text-2xl font-bold tracking-tight hover:text-brand-accent transition-colors">studio@opusfesta.com</a>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-white/50 mb-2">Phone</p>
                  <a href="tel:+255799242475" className="text-xl font-bold tracking-tight hover:text-brand-accent transition-colors">+255 799 242 475</a>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-white/50 mb-2">Studio Address</p>
                  <p className="text-white/70 font-light">
                    Plot 185C, RM A25, Samaki Wabichi Annex,
                    <br />
                    Mbezi Beach, Dar es Salaam, Tanzania
                    <br />
                    P.O.Box 7787
                  </p>
                </div>
              </div>
            </div>

            <div className="border-4 border-brand-border overflow-hidden bg-white">
              <iframe
                title="OpusStudio Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=39.1970%2C-6.7605%2C39.2754%2C-6.7002&amp;layer=mapnik&amp;marker=-6.7303%2C39.2362"
                className="w-full h-[280px] border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
