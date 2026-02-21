'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function ProcessSection() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<number>(0);
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(id, el);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Array.from(refs.current.entries()).find(
              ([, el]) => el === entry.target
            )?.[0];
            if (id) setVisibleItems((prev) => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      id: 'step-1',
      number: '01',
      title: 'ENQUIRY',
      description: 'Tell us about your event, your vision, and the moments that matter most. We respond within 24 hours.',
      detail: 'Free consultation call',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      id: 'step-2',
      number: '02',
      title: 'PLANNING',
      description: 'We build a custom timeline and shot list tailored to your day. Every angle, every detail, mapped out in advance.',
      detail: 'Bespoke creative brief',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      ),
    },
    {
      id: 'step-3',
      number: '03',
      title: 'SHOOT DAY',
      description: 'Our team arrives early, captures everything — the quiet moments, the big reveals, the in-betweens nobody else notices.',
      detail: 'Full-day coverage',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      ),
    },
    {
      id: 'step-4',
      number: '04',
      title: 'DELIVERY',
      description: 'Cinematic edits, colour-graded photos, and a private online gallery — delivered within 4–6 weeks.',
      detail: 'Private gallery access',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
    },
  ];

  return (
    <section id="process" className="relative z-10 bg-brand-dark overflow-hidden">
      <div className="border-y-4 border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div
            ref={setRef('process-header')}
            className={`mb-20 lg:mb-24 transition-all duration-700 ${
              visibleItems.has('process-header')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div>
                <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
                  How It Works
                </span>
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter text-white leading-[0.85]">
                  OUR<br />
                  <span className="text-stroke-light">PROCESS.</span>
                </h2>
              </div>
              <p className="text-white/40 text-lg max-w-sm leading-relaxed font-light lg:text-right">
                From first contact to final delivery. Four clear steps, zero surprises.
              </p>
            </div>
          </div>

          <div
            ref={setRef('progress-bar')}
            className={`hidden lg:flex items-center mb-16 transition-all duration-700 delay-200 ${
              visibleItems.has('progress-bar')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => setActiveStep(index)}
                  aria-label={`Show ${step.title} step`}
                  className={`flex items-center gap-3 group cursor-pointer transition-all duration-300 ${
                    activeStep === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className={`w-10 h-10 border-4 flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                    activeStep === index
                      ? 'border-brand-accent bg-brand-accent text-white'
                      : 'border-white/30 text-white/50 group-hover:border-white/60'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                    activeStep === index ? 'text-white' : 'text-white/40'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-[4px] bg-white/10 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-brand-accent transition-all duration-500"
                      style={{ width: index < activeStep ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lg:hidden flex flex-col gap-0">
            {steps.map((step, index) => (
              <div
                key={step.id}
                ref={setRef(step.id)}
                className={`relative transition-all duration-700 ${
                  visibleItems.has(step.id)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="flex gap-6 sm:gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-brand-accent bg-brand-accent flex items-center justify-center text-white text-xs font-mono font-bold shrink-0">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-[4px] flex-1 bg-white/10 mt-0" />
                    )}
                  </div>

                  <div className="pb-12 sm:pb-16 pt-1 flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
                      {step.title}
                    </h3>
                    <p className="text-white/50 text-sm sm:text-base leading-relaxed font-light mb-4 max-w-md">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-brand-accent" />
                      <span className="text-[11px] font-mono text-brand-accent uppercase tracking-widest">
                        {step.detail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <div
              ref={setRef('step-display')}
              className={`relative border-4 border-white/20 shadow-brutal transition-all duration-700 ${
                visibleItems.has('step-display')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >

              <div className="relative z-10 p-8 lg:p-10 xl:p-14 flex items-start gap-8 lg:gap-10 xl:gap-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 border-4 border-white/20 flex items-center justify-center text-white/60 shrink-0">
                  {steps[activeStep].icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-brand-accent font-mono text-sm font-bold">
                      {steps[activeStep].number}
                    </span>
                    <span className="w-8 h-[2px] bg-brand-accent inline-block" />
                    <span className="text-white/30 font-mono text-xs uppercase tracking-widest">
                      Step {activeStep + 1} of {steps.length}
                    </span>
                  </div>

                  <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tighter mb-5">
                    {steps[activeStep].title}
                  </h3>

                  <p className="text-white/50 text-lg leading-relaxed font-light max-w-xl mb-8">
                    {steps[activeStep].description}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-brand-accent" />
                    <span className="text-xs font-mono text-brand-accent uppercase tracking-widest font-bold">
                      {steps[activeStep].detail}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  <button
                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    disabled={activeStep === 0}
                    aria-label="Show previous process step"
                    className={`w-12 h-12 border-4 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      activeStep === 0
                        ? 'border-white/10 text-white/20'
                        : 'border-white/30 text-white hover:bg-brand-accent hover:border-brand-accent shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    disabled={activeStep === steps.length - 1}
                    aria-label="Show next process step"
                    className={`w-12 h-12 border-4 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      activeStep === steps.length - 1
                        ? 'border-white/10 text-white/20'
                        : 'border-white/30 text-white hover:bg-brand-accent hover:border-brand-accent shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
