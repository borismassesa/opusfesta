'use client';

import { useState, useEffect, useRef } from 'react';
import { serviceNames } from '@/lib/data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledService?: string;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type BookingDraft = {
  currentStep: number;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  preferredDate: string;
  location: string;
  service: string;
  message: string;
  updatedAt: number;
};

const journeySteps = [
  { title: 'Service', subtitle: 'Choose your focus' },
  { title: 'Event', subtitle: 'Share event essentials' },
  { title: 'Contact', subtitle: 'How we should reach you' },
  { title: 'Review', subtitle: 'Final notes and submit' },
];

const eventTypeSuggestions = ['Wedding', 'Engagement', 'Corporate Event', 'Brand Launch', 'Private Celebration'];
const BOOKING_DRAFT_KEY = 'opusfesta_studio_booking_draft_v1';
const BOOKING_DRAFT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export default function BookingModal({ isOpen, onClose, prefilledService }: BookingModalProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const finalStepIndex = journeySteps.length - 1;
  const schedulingUrl =
    process.env.NEXT_PUBLIC_STUDIO_BOOKING_CALL_URL ||
    'mailto:studio@opusfesta.com?subject=Schedule%20my%20discovery%20call';

  function clearDraft() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(BOOKING_DRAFT_KEY);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFormState('idle');
      setErrorMessage('');
      setStepError('');

      const fallbackStep = prefilledService ? 1 : 0;
      let draft: Partial<BookingDraft> | null = null;

      if (typeof window !== 'undefined') {
        try {
          const rawDraft = window.localStorage.getItem(BOOKING_DRAFT_KEY);
          if (rawDraft) {
            const parsedDraft = JSON.parse(rawDraft) as BookingDraft;
            const isFresh = Date.now() - parsedDraft.updatedAt <= BOOKING_DRAFT_MAX_AGE_MS;
            draft = isFresh ? parsedDraft : null;
            if (!isFresh) {
              window.localStorage.removeItem(BOOKING_DRAFT_KEY);
            }
          }
        } catch {
          window.localStorage.removeItem(BOOKING_DRAFT_KEY);
        }
      }

      setName(draft?.name ?? '');
      setEmail(draft?.email ?? '');
      setPhone(draft?.phone ?? '');
      setEventType(draft?.eventType ?? '');
      setPreferredDate(draft?.preferredDate ?? '');
      setLocation(draft?.location ?? '');
      setService(prefilledService || draft?.service || '');
      setMessage(draft?.message ?? '');

      const restoredStep = typeof draft?.currentStep === 'number' ? draft.currentStep : fallbackStep;
      const boundedStep = Math.min(finalStepIndex, Math.max(0, restoredStep));
      setCurrentStep(prefilledService ? Math.max(1, boundedStep) : boundedStep);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, prefilledService, finalStepIndex]);

  useEffect(() => {
    if (!isOpen || formState === 'success') return;
    if (typeof window === 'undefined') return;

    const draftPayload: BookingDraft = {
      currentStep,
      name,
      email,
      phone,
      eventType,
      preferredDate,
      location,
      service,
      message,
      updatedAt: Date.now(),
    };

    try {
      window.localStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draftPayload));
    } catch {
      // Ignore storage errors.
    }
  }, [isOpen, formState, currentStep, name, email, phone, eventType, preferredDate, location, service, message]);

  useEffect(() => {
    if (!isOpen) return;
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, isOpen]);

  function validateStep(step: number): string {
    if (step === 1 && !eventType.trim()) {
      return 'Please add your event type before continuing.';
    }

    if (step === 2) {
      if (!name.trim()) {
        return 'Please add your full name.';
      }
      if (!email.trim()) {
        return 'Please add your email address.';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return 'Please provide a valid email address.';
      }
    }

    return '';
  }

  function goToNextStep() {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setStepError(validationError);
      return;
    }

    setStepError('');
    setCurrentStep((prev) => Math.min(prev + 1, finalStepIndex));
  }

  function goToPreviousStep() {
    setStepError('');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (currentStep < finalStepIndex) {
      goToNextStep();
      return;
    }

    const eventError = validateStep(1);
    if (eventError) {
      setCurrentStep(1);
      setStepError(eventError);
      return;
    }

    const contactError = validateStep(2);
    if (contactError) {
      setCurrentStep(2);
      setStepError(contactError);
      return;
    }

    setFormState('submitting');
    setErrorMessage('');
    setStepError('');

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, eventType, preferredDate, location, service, message }),
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data.success) {
        setFormState('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }

      clearDraft();
      setFormState('success');
    } catch {
      setFormState('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  }

  const inputClasses =
    'w-full px-4 py-3 bg-white border-2 border-brand-border text-brand-dark text-sm font-sans placeholder:text-neutral-400 focus:outline-none focus:border-brand-accent transition-colors duration-200';

  const labelClasses = 'block text-[10px] font-bold text-brand-dark uppercase tracking-widest font-mono mb-2';
  const selectedService = service || 'Not selected yet';
  const selectedDate = preferredDate || 'Flexible';
  const selectedLocation = location || 'TBD';

  return (
    <div
      className={`fixed inset-0 z-[60] transition-all duration-500 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`absolute inset-0 h-dvh w-full bg-brand-bg border-0 overflow-hidden transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[90vh] sm:w-[560px] sm:border-4 sm:border-brand-border sm:shadow-brutal-xl ${
          isOpen
            ? 'translate-y-0 opacity-100 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:scale-100'
            : 'translate-y-full opacity-0 sm:-translate-x-1/2 sm:-translate-y-[48%] sm:scale-95'
        }`}
      >
        <div className="px-6 sm:px-12 py-6 sm:py-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono block mb-1">
                Booking
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tighter">LET&apos;S TALK.</h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-dark/50 hover:text-brand-dark transition-colors group"
            >
              <div className="w-8 h-8 border-2 border-brand-border flex items-center justify-center group-hover:border-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
            </button>
          </div>

          {formState === 'success' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 border-4 border-brand-accent flex items-center justify-center mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6F3393" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-brand-dark tracking-tighter mb-3">BOOKING RECEIVED.</h3>
              <p className="text-neutral-500 font-light leading-relaxed max-w-sm mb-8">
                Thank you! We&apos;ll review your enquiry and get back to you within 24 hours.
              </p>
              <p className="text-[10px] font-mono text-brand-accent uppercase tracking-widest mb-4">
                Next Step: Schedule Your Call
              </p>
              <a
                href={schedulingUrl}
                target={schedulingUrl.startsWith('http') ? '_blank' : undefined}
                rel={schedulingUrl.startsWith('http') ? 'noreferrer' : undefined}
                className="inline-flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200 mb-3"
              >
                Book a Discovery Call
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-transparent text-brand-dark text-xs font-bold uppercase tracking-widest border-2 border-brand-border shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:border-brand-accent hover:text-brand-accent transition-all duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="mb-7">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-mono text-brand-dark/60 uppercase tracking-widest">
                    Step {currentStep + 1} of {journeySteps.length}
                  </p>
                  <p className="text-[10px] font-mono text-brand-accent uppercase tracking-widest">Booking Journey</p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {journeySteps.map((step, index) => {
                    const isActive = currentStep === index;
                    const isCompleted = currentStep > index;

                    return (
                      <div key={step.title} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-8 w-8 border-2 flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-200 ${
                              isCompleted
                                ? 'bg-brand-accent border-brand-accent text-white'
                                : isActive
                                  ? 'bg-brand-dark border-brand-dark text-white'
                                  : 'border-brand-border text-brand-dark/50'
                            }`}
                          >
                            {isCompleted ? 'OK' : `0${index + 1}`}
                          </div>
                          {index < journeySteps.length - 1 && (
                            <div className={`h-[2px] flex-1 ${currentStep > index ? 'bg-brand-accent' : 'bg-brand-border/25'}`} />
                          )}
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">{step.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 border-l-4 border-brand-accent pl-4">
                  <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest font-mono">
                    {journeySteps[currentStep].title}
                  </p>
                  <p className="text-sm text-neutral-500 font-light">{journeySteps[currentStep].subtitle}</p>
                </div>
              </div>

              <div ref={contentRef} className="flex-1 overflow-y-auto">
                <div className="border-2 border-brand-border bg-white p-5 sm:p-6">
                  {currentStep === 0 && (
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] font-bold text-brand-dark uppercase tracking-widest font-mono mb-3">
                          Which service are you exploring?
                        </p>
                        <p className="text-sm text-neutral-500 font-light leading-relaxed">
                          Pick one to help us tailor the conversation. You can still change this later.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {serviceNames.map((serviceName) => (
                          <button
                            key={serviceName}
                            type="button"
                            onClick={() => {
                              setService(serviceName);
                              setStepError('');
                            }}
                            className={`text-left px-4 py-3 border-2 text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                              service === serviceName
                                ? 'bg-brand-accent border-brand-accent text-white shadow-brutal-sm'
                                : 'bg-brand-bg border-brand-border text-brand-dark hover:border-brand-accent hover:text-brand-accent'
                            }`}
                          >
                            {serviceName}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setService('');
                          setStepError('');
                        }}
                        className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50 hover:text-brand-accent transition-colors"
                      >
                        Not sure yet
                      </button>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClasses}>Event Type *</label>
                          <input
                            type="text"
                            required
                            value={eventType}
                            onChange={(e) => {
                              setEventType(e.target.value);
                              setStepError('');
                            }}
                            placeholder="Wedding, gala, launch..."
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Preferred Date</label>
                          <input
                            type="date"
                            value={preferredDate}
                            onChange={(e) => {
                              setPreferredDate(e.target.value);
                              setStepError('');
                            }}
                            className={inputClasses}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClasses}>Location</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            setStepError('');
                          }}
                          placeholder="City, venue, or destination"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-brand-dark uppercase tracking-widest font-mono mb-2">
                          Quick picks
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {eventTypeSuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setEventType(option);
                                setStepError('');
                              }}
                              className={`px-3 py-2 border-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                                eventType === option
                                  ? 'bg-brand-dark border-brand-dark text-white'
                                  : 'border-brand-border text-brand-dark/70 hover:text-brand-accent hover:border-brand-accent'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClasses}>Name *</label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              setStepError('');
                            }}
                            placeholder="Your full name"
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Email *</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setStepError('');
                            }}
                            placeholder="you@example.com"
                            className={inputClasses}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClasses}>Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setStepError('');
                          }}
                          placeholder="+255 xxx xxx xxx"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div>
                        <label className={labelClasses}>Message</label>
                        <textarea
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            setStepError('');
                          }}
                          placeholder="Tell us about your event vision, priorities, and any must-capture moments."
                          rows={5}
                          className={`${inputClasses} resize-none`}
                        />
                      </div>

                      <div className="border-2 border-brand-border bg-brand-bg p-4 sm:p-5">
                        <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest font-mono mb-4">
                          Journey Summary
                        </p>
                        <div className="space-y-2.5 text-sm">
                          <p className="text-brand-dark"><span className="font-bold">Service:</span> {selectedService}</p>
                          <p className="text-brand-dark"><span className="font-bold">Event:</span> {eventType || 'Not set'}</p>
                          <p className="text-brand-dark"><span className="font-bold">Date:</span> {selectedDate}</p>
                          <p className="text-brand-dark"><span className="font-bold">Location:</span> {selectedLocation}</p>
                          <p className="text-brand-dark"><span className="font-bold">Contact:</span> {name || 'Not set'} ({email || 'No email'})</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {stepError && (
                <div className="mt-4 px-4 py-3 border-2 border-red-400 bg-red-50 text-red-700 text-sm">{stepError}</div>
              )}

              {formState === 'error' && (
                <div className="mt-4 px-4 py-3 border-2 border-red-400 bg-red-50 text-red-700 text-sm">{errorMessage}</div>
              )}

              <div className="mt-6 pt-6 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t-2 border-brand-border">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    disabled={currentStep === 0 || formState === 'submitting'}
                    className="inline-flex items-center justify-center px-5 py-4 border-4 border-brand-border text-brand-dark text-xs font-bold uppercase tracking-widest shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 disabled:opacity-35 disabled:hover:shadow-brutal-sm disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  >
                    Back
                  </button>

                  {currentStep < finalStepIndex ? (
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-4 border-brand-dark shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
                    >
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7l7 7l-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-4 border-brand-dark shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200 disabled:opacity-50 disabled:hover:shadow-brutal disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:bg-brand-dark disabled:hover:border-brand-dark"
                    >
                      {formState === 'submitting' ? (
                        <>
                          Sending...
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Send Enquiry
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14m-7-7l7 7l-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-[10px] leading-relaxed text-neutral-400 font-mono text-center mt-4 tracking-wide">
                  We typically respond within 24 hours.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
