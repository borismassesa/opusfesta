'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BsEnvelope, BsShieldLock, BsArrowRight, BsGoogle } from 'react-icons/bs';
import { useClientAuth } from './ClientAuthProvider';

type Stage = 'email' | 'code' | 'verifying';

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  cancelled: 'Google sign-in was cancelled.',
  unverified: 'Your Google email is not verified. Please use email sign-in instead.',
  error: 'Something went wrong with Google sign-in. Please try again.',
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useClientAuth();

  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const returnTo = searchParams.get('returnTo') || '/portal';

  // Handle Google OAuth error from redirect
  useEffect(() => {
    const googleError = searchParams.get('google_error');
    if (googleError) {
      setError(GOOGLE_ERROR_MESSAGES[googleError] || GOOGLE_ERROR_MESSAGES.error);
    }
  }, [searchParams]);

  // Handle magic link token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyToken(token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verifyToken(token: string) {
    setStage('verifying');
    setError('');

    try {
      const res = await fetch('/api/client-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid or expired link');
        setStage('email');
        return;
      }

      await refresh();
      router.push(returnTo);
    } catch {
      setError('Verification failed. Please try again.');
      setStage('email');
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

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
        setError(data.error || 'Failed to send code');
        return;
      }

      setCodeSent(true);
      setStage('code');
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code || code.length < 6) return;

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
        setError(data.error || 'Invalid code');
        return;
      }

      await refresh();
      router.push(returnTo);
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (stage === 'verifying') {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-3 border-brand-accent border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-brand-muted font-mono text-sm uppercase tracking-widest">Signing you in...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.3em] mb-2">
          Client Portal
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          {stage === 'email' ? 'Sign In or Create Account' : 'Enter Your Code'}
        </h1>
        <p className="text-brand-muted mt-3 text-sm">
          {stage === 'email'
            ? "Enter your email — we'll send you a one-time code. New here? An account is created automatically."
            : `We sent a 6-digit code to ${email}`
          }
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold mb-6">
          {error}
        </div>
      )}

      {stage === 'email' ? (
        <div className="space-y-5">
          {/* Google Sign In */}
          <button
            type="button"
            disabled={googleLoading}
            onClick={() => {
              setGoogleLoading(true);
              window.location.href = `/api/client-auth/google?returnTo=${encodeURIComponent(returnTo)}`;
            }}
            className="w-full border-3 border-brand-border bg-white text-brand-dark px-6 py-3.5 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-bg transition-colors shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-brand-dark/30 border-t-brand-dark animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[3px] bg-brand-border" />
            <span className="text-xs font-mono font-bold text-brand-muted uppercase tracking-wider">or</span>
            <div className="flex-1 h-[3px] bg-brand-border" />
          </div>

          {/* Email Sign In */}
          <form onSubmit={handleSendCode}>
            <div className="border-3 border-brand-border bg-white shadow-brutal">
              <div className="bg-brand-dark px-6 py-3 flex items-center gap-2">
                <BsEnvelope className="w-4 h-4 text-brand-accent" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Email Address</span>
              </div>
              <div className="p-6">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full border-3 border-brand-border px-4 py-3 font-mono text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full mt-4 border-3 border-brand-border bg-brand-dark text-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Code
                      <BsArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <div className="border-3 border-brand-border bg-white shadow-brutal">
            <div className="bg-brand-dark px-6 py-3 flex items-center gap-2">
              <BsShieldLock className="w-4 h-4 text-brand-accent" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Verification Code</span>
            </div>
            <div className="p-6">
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                className="w-full border-3 border-brand-border px-4 py-3 font-mono text-2xl text-center tracking-[0.5em] text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-brand-muted font-mono mt-2 text-center">
                Check your inbox for the 6-digit code
              </p>
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full mt-4 border-3 border-brand-border bg-brand-dark text-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Sign In
                    <BsArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStage('email'); setCode(''); setError(''); }}
                  className="text-xs font-mono text-brand-muted hover:text-brand-dark transition-colors"
                >
                  ← Change email
                </button>
                {codeSent && (
                  <button
                    type="button"
                    onClick={() => { setCode(''); handleSendCode(new Event('submit') as unknown as React.FormEvent); }}
                    className="text-xs font-mono text-brand-accent hover:text-brand-dark transition-colors"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Footer */}
      <p className="text-center text-[11px] text-brand-muted mt-6 font-mono">
        No password needed — sign in with Google or we&apos;ll email you a one-time code.
      </p>
    </div>
  );
}
