'use client';

import { useRef, useEffect, useState } from 'react';

export default function NewsletterSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-brand-dark border-y-4 border-brand-border overflow-hidden"
    >
      <div className="absolute top-0 right-0 text-[20rem] lg:text-[30rem] font-bold text-white/[0.02] leading-none select-none pointer-events-none font-mono -translate-y-20">
        @
      </div>

      <div
        className={`max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div>
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
              Stay in the Loop
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-white leading-[0.95] mb-4">
              BEHIND-THE-SCENES,
              <br />
              <span className="text-stroke-light text-transparent">DIRECT TO YOU.</span>
            </h2>
            <p className="text-white/40 text-base lg:text-lg leading-relaxed font-light max-w-md">
              Monthly updates with exclusive behind-the-scenes content, booking availability, and early access to new work.
            </p>
          </div>

          <div>
            {submitted ? (
              <div className="border-4 border-brand-accent p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-brand-accent flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                    You&apos;re In
                  </h3>
                </div>
                <p className="text-white/40 text-sm leading-relaxed font-light">
                  Welcome to the list. Keep an eye on your inbox for our next update.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOUR EMAIL ADDRESS"
                    required
                    className="flex-1 px-6 py-4 bg-transparent border-4 border-white/20 text-white text-xs font-bold uppercase tracking-widest placeholder:text-white/20 focus:outline-none focus:border-brand-accent transition-colors sm:border-r-0"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-brand-accent text-white text-xs font-bold uppercase tracking-widest border-4 border-brand-accent shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
