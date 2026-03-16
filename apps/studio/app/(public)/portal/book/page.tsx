'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BsCheckLg } from 'react-icons/bs';
import confetti from 'canvas-confetti';
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

  const fireConfetti = useCallback(() => {
    // Initial burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D6492A', '#171717', '#FDF5F3', '#E8735A', '#C43D22'],
    });

    // Side cannons with slight delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#D6492A', '#171717', '#E8735A'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#D6492A', '#171717', '#E8735A'],
      });
    }, 200);

    // Final sparkle burst
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#D6492A', '#FDF5F3', '#E8735A'],
        scalar: 0.8,
      });
    }, 500);
  }, []);

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
      fireConfetti();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'service', label: 'Service', num: 1 },
    { key: 'slot', label: 'Date & Time', num: 2 },
    { key: 'intake', label: 'Details', num: 3 },
    { key: 'review', label: 'Review', num: 4 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.3em] mb-2">
          Start Your Project
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Book a Session
        </h1>
        <p className="text-brand-muted mt-3 max-w-lg mx-auto">
          Select your service, pick a date, tell us about your event, and we&apos;ll handle the rest.
        </p>
      </div>

      {/* Step indicator */}
      {step !== 'success' && (
        <div className="border-3 border-brand-border bg-white p-4 shadow-brutal-sm">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;

              return (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-8 h-8 flex items-center justify-center text-xs font-mono font-bold border-2 transition-all shrink-0
                      ${isCompleted
                        ? 'bg-brand-accent border-brand-accent text-white'
                        : isCurrent
                          ? 'bg-brand-dark border-brand-dark text-white'
                          : 'bg-white border-brand-border text-brand-muted'
                      }
                    `}>
                      {isCompleted ? <BsCheckLg className="w-3 h-3" /> : s.num}
                    </div>
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider hidden sm:block ${
                      isCurrent ? 'text-brand-dark' : isCompleted ? 'text-brand-accent' : 'text-brand-muted'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 ${
                      i < currentStepIndex ? 'bg-brand-accent' : 'bg-brand-border/20'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Step content */}
      {step === 'service' && (
        <ServiceSelector onSelect={handleServiceSelect} />
      )}

      {step === 'slot' && (
        <div className="space-y-4">
          <button
            onClick={() => setStep('service')}
            className="text-sm font-bold text-brand-muted hover:text-brand-dark font-mono transition-colors"
          >
            ← Back to services
          </button>
          <SlotPicker onSlotSelected={handleSlotSelected} />
        </div>
      )}

      {step === 'intake' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              fetch('/api/booking/hold', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holdToken }),
              });
              setStep('slot');
            }}
            className="text-sm font-bold text-brand-muted hover:text-brand-dark font-mono transition-colors"
          >
            ← Back to date selection
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
          <div className="w-16 h-16 border-3 border-brand-accent bg-brand-accent mx-auto mb-6 flex items-center justify-center">
            <BsCheckLg className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark font-mono uppercase mb-4">
            Request Submitted!
          </h2>
          <p className="text-brand-muted max-w-md mx-auto mb-2">
            We&apos;ve received your booking request. Our team will review it and
            send you a personalized quote within 24 hours.
          </p>
          <p className="text-sm text-brand-muted mb-8">
            A confirmation email has been sent to <strong className="text-brand-dark">{formData?.email}</strong>.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/portal"
              className="border-3 border-brand-border bg-brand-dark text-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal"
            >
              View My Bookings
            </a>
            {viewToken && (
              <a
                href={`/book/status/${viewToken}`}
                className="border-3 border-brand-border bg-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-bg transition-colors"
              >
                Track Status
              </a>
            )}
            <a
              href="/"
              className="border-3 border-brand-border bg-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-bg transition-colors"
            >
              Back Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-brand-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-brand-muted font-mono text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    }>
      <BookPageContent />
    </Suspense>
  );
}
