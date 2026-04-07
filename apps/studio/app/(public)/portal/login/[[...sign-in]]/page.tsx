'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PortalLoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/portal';

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const sendCode = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/client-auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send code. Please try again.');
        return;
      }
      setStep('otp');
      setResendCooldown(60);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendCode();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/client-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code. Please try again.');
        return;
      }
      router.push(redirectUrl);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Escape the portal layout's padding and max-width constraints
    <div className="-mx-4 sm:-mx-6 -my-6 lg:-my-10 -mb-24 lg:-mb-10 flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] lg:min-h-screen">

      {/* ── Left panel: brand identity (desktop only) ── */}
      <div className="hidden lg:flex w-[420px] xl:w-[460px] shrink-0 bg-brand-dark flex-col justify-between p-12 relative overflow-hidden">
        {/* Oversized decorative letters */}
        <div className="absolute -bottom-6 -left-2 select-none pointer-events-none">
          <span className="text-[200px] xl:text-[220px] font-black font-mono leading-none text-white/[0.04] uppercase">
            OS
          </span>
        </div>

        {/* Top: logo */}
        <Link href="/" className="inline-flex flex-col gap-2 group">
          <span className="font-mono font-black text-white text-xl tracking-[0.12em] uppercase">
            Opus<span className="text-brand-accent">Studio</span>
          </span>
          <span className="w-8 h-[3px] bg-brand-accent group-hover:w-12 transition-all duration-300" />
        </Link>

        {/* Middle: hero copy + feature list */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-brand-accent font-mono text-[10px] font-bold uppercase tracking-[0.4em]">
              Client Portal
            </p>
            <h2 className="text-white font-black text-4xl xl:text-[44px] uppercase tracking-tight leading-[1.05]">
              Your story,<br />your portal.
            </h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-[280px] font-light">
              Manage your booking end-to-end — from your first quote to your final gallery delivery.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              'Booking status & timeline',
              'Quotes and contracts',
              'Payment tracking',
              'Direct messaging',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-brand-accent shrink-0" />
                <span className="text-white/55 text-[13px] font-mono">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: location */}
        <p className="text-white/20 text-[11px] font-mono uppercase tracking-[0.25em]">
          Dar es Salaam, Tanzania
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-brand-bg px-6 sm:px-12 py-14">
        <div className="w-full max-w-[360px]">

          {/* Mobile wordmark */}
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="font-mono font-black text-brand-dark text-xl tracking-[0.12em] uppercase">
              Opus<span className="text-brand-accent">Studio</span>
            </Link>
          </div>

          {/* Step progress */}
          <div className="flex gap-1.5 mb-8">
            <div className="h-[3px] flex-1 bg-brand-dark" />
            <div className={`h-[3px] flex-1 transition-colors duration-300 ${step === 'otp' ? 'bg-brand-dark' : 'bg-brand-dark/15'}`} />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-[0.4em] mb-3">
              {step === 'email' ? 'Step 1 of 2' : 'Step 2 of 2'}
            </p>
            {step === 'email' ? (
              <>
                <h1 className="text-[28px] font-black text-brand-dark uppercase tracking-tight leading-tight">
                  Sign In
                </h1>
                <p className="text-brand-muted text-sm mt-2 leading-relaxed">
                  Enter your email to receive a one-time code — no password needed.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-[28px] font-black text-brand-dark uppercase tracking-tight leading-tight">
                  Check Email
                </h1>
                <p className="text-brand-muted text-sm mt-2 leading-relaxed">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-brand-dark">{email}</span>
                </p>
              </>
            )}
          </div>

          {/* ── Email step ── */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full border-2 border-brand-dark/20 bg-white px-4 py-3.5 text-sm text-brand-dark placeholder:text-brand-muted/40 focus:border-brand-accent focus:outline-none transition-colors"
                />
              </div>

              {error && <ErrorBox message={error} />}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark text-white font-mono font-bold text-[11px] uppercase tracking-[0.2em] py-4 hover:bg-brand-accent transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending code...' : 'Continue →'}
              </button>
            </form>
          )}

          {/* ── OTP step ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="——————"
                  required
                  autoFocus
                  className="w-full border-2 border-brand-dark/20 bg-white px-4 py-4 font-mono text-[28px] text-brand-dark tracking-[0.55em] text-center placeholder:text-brand-muted/25 placeholder:tracking-[0.4em] focus:border-brand-accent focus:outline-none transition-colors"
                />
                <p className="text-[11px] font-mono text-brand-muted mt-2">
                  Expires in 10 minutes
                </p>
              </div>

              {error && <ErrorBox message={error} />}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-brand-dark text-white font-mono font-bold text-[11px] uppercase tracking-[0.2em] py-4 hover:bg-brand-accent transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Sign In →'}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setCode(''); }}
                  className="text-[11px] font-mono text-brand-muted hover:text-brand-dark transition-colors"
                >
                  ← Different email
                </button>
                {resendCooldown > 0 ? (
                  <span className="text-[11px] font-mono text-brand-muted">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setCode(''); setError(''); sendCode(); }}
                    className="text-[11px] font-mono text-brand-accent hover:text-brand-dark transition-colors font-bold"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-brand-dark/10">
            <Link
              href="/"
              className="text-[11px] font-mono text-brand-muted hover:text-brand-accent transition-colors tracking-wider"
            >
              ← Back to OpusStudio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 px-4 py-3">
      <span className="text-red-500 text-sm leading-none mt-0.5 shrink-0">!</span>
      <p className="text-xs text-red-700 leading-relaxed">{message}</p>
    </div>
  );
}
