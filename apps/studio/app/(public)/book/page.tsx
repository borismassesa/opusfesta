'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ServiceSelector from '@/components/booking/ServiceSelector';
import SlotPicker from '@/components/booking/SlotPicker';
import IntakeForm, { type IntakeFormData } from '@/components/booking/IntakeForm';
import BookingReview from '@/components/booking/BookingReview';

type Step = 'service' | 'slot' | 'intake' | 'review' | 'success';

function BookPageContent() {
  const searchParams = useSearchParams();
  const prefilledService = searchParams.get('service') || '';
  const [step, setStep] = useState<Step>(prefilledService ? 'slot' : 'service');
  const [selectedService, setSelectedService] = useState(prefilledService);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [holdToken, setHoldToken] = useState('');
  const [holdExpiresAt, setHoldExpiresAt] = useState('');
  const [formData, setFormData] = useState<IntakeFormData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewToken, setViewToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleServiceSelect(service: string, packageId?: string) {
    setSelectedService(service);
    setSelectedPackageId(packageId);
    setStep('slot');
  }

  function handleSlotSelected(date: string, timeSlot: string, token: string, expiresAt: string) {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setHoldToken(token);
    setHoldExpiresAt(expiresAt);
    setStep('intake');
  }

  function handleIntakeSubmit(data: IntakeFormData) {
    setFormData(data);
    setStep('review');
  }

  async function handleConfirm() {
    if (!formData) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdToken,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          whatsapp: formData.whatsapp || undefined,
          event_type: formData.event_type,
          location: formData.location || undefined,
          service: selectedService,
          package_id: selectedPackageId,
          guest_count: formData.guest_count ? parseInt(formData.guest_count) : undefined,
          message: formData.message || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setViewToken(data.viewToken);
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'service', label: 'Service' },
    { key: 'slot', label: 'Date & Time' },
    { key: 'intake', label: 'Your Details' },
    { key: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Book a Session
        </h1>
        <p className="text-brand-muted mt-2">
          Select your service, pick a date, and tell us about your event.
        </p>
      </div>

      {step !== 'success' && (
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`flex-1 h-2 ${
                i <= currentStepIndex ? 'bg-brand-accent' : 'bg-brand-border/20'
              }`}
            />
          ))}
        </div>
      )}

      {step !== 'success' && (
        <div className="flex gap-4 text-sm font-mono">
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`${
                i === currentStepIndex
                  ? 'text-brand-accent font-bold'
                  : i < currentStepIndex
                    ? 'text-brand-dark'
                    : 'text-brand-muted'
              }`}
            >
              {i + 1}. {s.label}
            </span>
          ))}
        </div>
      )}

      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {step === 'service' && (
        <ServiceSelector onSelect={handleServiceSelect} />
      )}

      {step === 'slot' && (
        <div className="space-y-4">
          <button
            onClick={() => setStep('service')}
            className="text-sm font-bold text-brand-muted hover:text-brand-dark font-mono"
          >
            ← BACK TO SERVICES
          </button>
          <SlotPicker onSlotSelected={handleSlotSelected} />
        </div>
      )}

      {step === 'intake' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              // Release hold when going back
              fetch('/api/booking/hold', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holdToken }),
              });
              setStep('slot');
            }}
            className="text-sm font-bold text-brand-muted hover:text-brand-dark font-mono"
          >
            ← BACK TO DATE SELECTION
          </button>
          <IntakeForm
            onSubmit={handleIntakeSubmit}
            defaultService={selectedService}
          />
        </div>
      )}

      {step === 'review' && formData && (
        <BookingReview
          service={selectedService}
          date={selectedDate}
          timeSlot={selectedTimeSlot}
          formData={formData}
          holdExpiresAt={holdExpiresAt}
          onConfirm={handleConfirm}
          onBack={() => setStep('intake')}
          loading={submitting}
        />
      )}

      {step === 'success' && (
        <div className="border-3 border-brand-accent bg-white p-12 text-center shadow-brutal-accent">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-brand-dark font-mono uppercase mb-4">
            Request Submitted!
          </h2>
          <p className="text-brand-muted max-w-md mx-auto mb-8">
            We&apos;ve received your booking request. Our team will review it and
            send you a personalized quote within 24 hours.
          </p>
          <p className="text-sm text-brand-muted mb-6">
            A confirmation email has been sent to <strong>{formData?.email}</strong>.
          </p>
          <div className="flex gap-4 justify-center">
            {viewToken && (
              <a
                href={`/book/status/${viewToken}`}
                className="border-3 border-brand-border bg-brand-dark text-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal"
              >
                VIEW STATUS
              </a>
            )}
            <a
              href="/"
              className="border-3 border-brand-border bg-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-bg transition-colors"
            >
              BACK HOME
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-brand-muted font-mono tracking-widest text-sm uppercase">Loading Booking Form...</div>}>
      <BookPageContent />
    </Suspense>
  );
}
