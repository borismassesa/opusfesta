"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { BsArrowRight } from 'react-icons/bs';

type SecondFactorStrategy = 'phone_code' | 'email_code' | 'email_link' | 'totp' | 'backup_code';

type SecondFactorOption = {
  id: string;
  strategy: SecondFactorStrategy;
  label: string;
  hint: string;
  requiresPreparation: boolean;
  supported: boolean;
  safeIdentifier?: string;
  phoneNumberId?: string;
  emailAddressId?: string;
};

type SignInResultLike = {
  status: string | null;
  createdSessionId?: string | null;
  supportedSecondFactors?: unknown[] | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getClerkErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) return fallback;

  const errors = error.errors;
  if (!Array.isArray(errors) || errors.length === 0 || !isRecord(errors[0])) {
    return fallback;
  }

  const clerkError = errors[0];
  if (typeof clerkError.longMessage === 'string') return clerkError.longMessage;
  if (typeof clerkError.message === 'string') return clerkError.message;

  return fallback;
}

function mapSecondFactorOptions(factors: unknown[] | null | undefined): SecondFactorOption[] {
  if (!Array.isArray(factors)) return [];

  return factors.flatMap((factor): SecondFactorOption[] => {
    if (!isRecord(factor) || typeof factor.strategy !== 'string') return [];

    switch (factor.strategy) {
      case 'phone_code':
        return [{
          id: typeof factor.phoneNumberId === 'string' ? `phone:${factor.phoneNumberId}` : 'phone:default',
          strategy: 'phone_code',
          label: 'Phone code',
          hint: `Send a code to ${typeof factor.safeIdentifier === 'string' ? factor.safeIdentifier : 'your phone'}.`,
          requiresPreparation: true,
          supported: true,
          safeIdentifier: typeof factor.safeIdentifier === 'string' ? factor.safeIdentifier : undefined,
          phoneNumberId: typeof factor.phoneNumberId === 'string' ? factor.phoneNumberId : undefined,
        }];
      case 'email_code':
        return [{
          id: typeof factor.emailAddressId === 'string' ? `email:${factor.emailAddressId}` : 'email:default',
          strategy: 'email_code',
          label: 'Email code',
          hint: `Send a code to ${typeof factor.safeIdentifier === 'string' ? factor.safeIdentifier : 'your email'}.`,
          requiresPreparation: true,
          supported: true,
          safeIdentifier: typeof factor.safeIdentifier === 'string' ? factor.safeIdentifier : undefined,
          emailAddressId: typeof factor.emailAddressId === 'string' ? factor.emailAddressId : undefined,
        }];
      case 'totp':
        return [{
          id: 'totp',
          strategy: 'totp',
          label: 'Authenticator app',
          hint: 'Enter the six-digit code from your authenticator app.',
          requiresPreparation: false,
          supported: true,
        }];
      case 'backup_code':
        return [{
          id: 'backup',
          strategy: 'backup_code',
          label: 'Backup code',
          hint: 'Enter one of your saved backup codes.',
          requiresPreparation: false,
          supported: true,
        }];
      case 'email_link':
        return [{
          id: typeof factor.emailAddressId === 'string' ? `email-link:${factor.emailAddressId}` : 'email-link:default',
          strategy: 'email_link',
          label: 'Email link',
          hint: `Verification by email link is not supported in this custom admin form${typeof factor.safeIdentifier === 'string' ? ` for ${factor.safeIdentifier}` : ''}.`,
          requiresPreparation: true,
          supported: false,
          safeIdentifier: typeof factor.safeIdentifier === 'string' ? factor.safeIdentifier : undefined,
          emailAddressId: typeof factor.emailAddressId === 'string' ? factor.emailAddressId : undefined,
        }];
      default:
        return [];
    }
  });
}

export default function AdminSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('redirect_url') || '/admin';
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'credentials' | 'second-factor'>('credentials');
  const [secondFactorOptions, setSecondFactorOptions] = useState<SecondFactorOption[]>([]);
  const [selectedSecondFactor, setSelectedSecondFactor] = useState<SecondFactorOption | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      router.replace(next);
    }
  }, [isSignedIn, next, router]);

  const completeSignIn = async (createdSessionId: string | null | undefined) => {
    if (!createdSessionId) {
      setError('Sign in completed, but no session was created.');
      setIsLoading(false);
      return;
    }

    if (!setActive) {
      setError('Sign in completed, but the session could not be activated in this browser.');
      setIsLoading(false);
      return;
    }

    await setActive({ session: createdSessionId });
    router.push(next);
  };

  const selectSecondFactor = async (option: SecondFactorOption) => {
    if (!signIn) return;

    setSelectedSecondFactor(option);
    setVerificationCode('');
    setError(null);
    setInfoMessage(option.hint);

    if (!option.supported) {
      setError('This verification method is not supported in the custom admin portal yet.');
      return;
    }

    if (!option.requiresPreparation) {
      return;
    }

    setIsLoading(true);

    try {
      const preparedResult = await signIn.prepareSecondFactor(
        option.strategy === 'phone_code'
          ? { strategy: 'phone_code', phoneNumberId: option.phoneNumberId }
          : { strategy: 'email_code', emailAddressId: option.emailAddressId }
      );

      if (preparedResult.status === 'complete') {
        await completeSignIn(preparedResult.createdSessionId);
        return;
      }

      if (option.strategy === 'phone_code') {
        setInfoMessage(`A verification code was sent to ${option.safeIdentifier ?? 'your phone'}.`);
      } else if (option.strategy === 'email_code') {
        setInfoMessage(`A verification code was sent to ${option.safeIdentifier ?? 'your email'}.`);
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Unable to start verification for this account.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInStatus = async (result: SignInResultLike) => {
    if (result.status === 'complete') {
      await completeSignIn(result.createdSessionId);
      return;
    }

    if (result.status === 'needs_second_factor') {
      const options = mapSecondFactorOptions(result.supportedSecondFactors);
      const supportedOption = options.find((option) => option.supported);

      if (!supportedOption) {
        setError('This account requires a second factor that this admin portal does not support yet.');
        setIsLoading(false);
        return;
      }

      setStep('second-factor');
      setSecondFactorOptions(options);
      await selectSecondFactor(supportedOption);
      return;
    }

    if (result.status === 'needs_new_password') {
      setError('This account must reset its password before admin sign-in can continue.');
      setIsLoading(false);
      return;
    }

    setError('This sign-in flow could not be completed in the admin portal.');
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      await handleSignInStatus(result);
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Invalid credentials. Please attempt again.'));
      setIsLoading(false);
    }
  };

  const handleSecondFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn || !selectedSecondFactor) return;

    if (!selectedSecondFactor.supported) {
      setError('This verification method is not supported in the custom admin portal yet.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptSecondFactor(
        selectedSecondFactor.strategy === 'phone_code'
          ? { strategy: 'phone_code', code: verificationCode }
          : selectedSecondFactor.strategy === 'email_code'
            ? { strategy: 'email_code', code: verificationCode }
            : selectedSecondFactor.strategy === 'totp'
              ? { strategy: 'totp', code: verificationCode }
              : { strategy: 'backup_code', code: verificationCode }
      );

      await handleSignInStatus(result);
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Verification failed. Please try again.'));
      setIsLoading(false);
    }
  };

  const resetToCredentials = () => {
    setStep('credentials');
    setSecondFactorOptions([]);
    setSelectedSecondFactor(null);
    setVerificationCode('');
    setInfoMessage(null);
    setError(null);
  };

  const canResendCode =
    selectedSecondFactor?.strategy === 'phone_code' || selectedSecondFactor?.strategy === 'email_code';

  const verificationLabel = selectedSecondFactor?.strategy === 'backup_code' ? 'Backup Code' : 'Verification Code';
  const verificationPlaceholder = selectedSecondFactor?.strategy === 'backup_code' ? 'Enter your backup code' : 'Enter the code';

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#171717] flex items-center justify-center p-6 selection:bg-[#171717] selection:text-[#FDFBF7]" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="w-full max-w-[420px] flex flex-col pt-12 pb-24">
        
        {/* Monogram / Header */}
        <div className="mb-20 text-center flex flex-col items-center">
          <Link href="/" className="group flex flex-col items-center gap-6">
            <div className="relative flex h-[72px] w-[72px] items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <Image 
                src="/studio-logo.png" 
                alt="OpusStudio Logo" 
                width={40} 
                height={47} 
                unoptimized
                className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                priority
              />
            </div>
            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#8A7662]">OpusStudio</span>
              <span className="text-xs uppercase tracking-[0.35em] text-[#171717] font-light">Operations Center</span>
            </div>
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full">
          {error && (
            <div className="mb-8 p-4 border border-red-200 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest text-center transition-all duration-300">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-8 p-4 border border-[#171717]/10 bg-[#171717]/[0.03] text-[#171717] text-[10px] uppercase tracking-widest text-center transition-all duration-300">
              {infoMessage}
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-10 relative">
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent border-b border-[#171717]/20 py-4 text-sm text-[#171717] placeholder-transparent focus:outline-none focus:border-[#171717] transition-colors duration-500 rounded-none"
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 top-4 text-[10px] uppercase tracking-[0.25em] text-[#8A7662] transition-all duration-500 peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#171717] peer-valid:-top-4 peer-valid:text-[10px]"
                >
                  Email Address
                </label>
              </div>

              <div className="relative group mt-2">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent border-b border-[#171717]/20 py-4 text-sm tracking-widest text-[#171717] placeholder-transparent focus:outline-none focus:border-[#171717] transition-colors duration-500 rounded-none"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 top-4 text-[10px] uppercase tracking-[0.25em] text-[#8A7662] transition-all duration-500 peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#171717] peer-valid:-top-4 peer-valid:text-[10px]"
                >
                  Password
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isLoaded}
                className="group relative mt-10 flex h-[60px] w-full items-center justify-between border border-[#171717] bg-[#171717] px-6 text-white transition-colors duration-700 hover:bg-transparent hover:text-[#171717] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-[11px] uppercase font-bold tracking-[0.3em] mt-0.5">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </span>
                {isLoading ? (
                  <div className="flex items-center gap-[4px] mr-2">
                    <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <BsArrowRight className="text-xl transition-transform duration-500 group-hover:translate-x-3" />
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A7662]">
                  Additional verification
                </p>
                <h1 className="text-2xl font-semibold tracking-[-0.03em]">
                  Confirm your identity
                </h1>
              </div>

              {secondFactorOptions.length > 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {secondFactorOptions.map((option) => {
                    const isSelected = selectedSecondFactor?.id === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => void selectSecondFactor(option)}
                        disabled={isLoading || !option.supported}
                        className={`border px-4 py-3 text-left text-[10px] uppercase tracking-[0.22em] transition-colors ${
                          isSelected
                            ? 'border-[#171717] bg-[#171717] text-white'
                            : 'border-[#171717]/15 bg-transparent text-[#171717]'
                        } ${!option.supported ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#171717]'}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <form onSubmit={handleSecondFactorSubmit} className="flex flex-col gap-10 relative">
                <div className="relative group">
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    autoComplete={selectedSecondFactor?.strategy === 'backup_code' ? 'off' : 'one-time-code'}
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-[#171717]/20 py-4 text-sm tracking-[0.2em] uppercase text-[#171717] placeholder-transparent focus:outline-none focus:border-[#171717] transition-colors duration-500 rounded-none"
                  />
                  <label
                    htmlFor="verificationCode"
                    className="absolute left-0 top-4 text-[10px] uppercase tracking-[0.25em] text-[#8A7662] transition-all duration-500 peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#171717] peer-valid:-top-4 peer-valid:text-[10px]"
                  >
                    {verificationLabel}
                  </label>
                  <p className="mt-3 text-[11px] text-[#8A7662]">
                    {selectedSecondFactor?.hint ?? verificationPlaceholder}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isLoaded || !selectedSecondFactor?.supported}
                  className="group relative mt-2 flex h-[60px] w-full items-center justify-between border border-[#171717] bg-[#171717] px-6 text-white transition-colors duration-700 hover:bg-transparent hover:text-[#171717] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-[11px] uppercase font-bold tracking-[0.3em] mt-0.5">
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </span>
                  {isLoading ? (
                    <div className="flex items-center gap-[4px] mr-2">
                      <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <BsArrowRight className="text-xl transition-transform duration-500 group-hover:translate-x-3" />
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between gap-4 text-[9px] uppercase tracking-[0.3em] text-[#8A7662]">
                <button
                  type="button"
                  onClick={resetToCredentials}
                  className="hover:text-[#171717] transition-colors duration-500"
                >
                  Use another account
                </button>
                {canResendCode && selectedSecondFactor && (
                  <button
                    type="button"
                    onClick={() => void selectSecondFactor(selectedSecondFactor)}
                    disabled={isLoading}
                    className="hover:text-[#171717] transition-colors duration-500 disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer text */}
          <div className="mt-24 text-center flex flex-col gap-5 items-center">
            <button className="text-[9px] uppercase tracking-[0.3em] text-[#8A7662] hover:text-[#171717] transition-colors duration-500 w-max border-b border-transparent hover:border-[#171717] pb-1">
              Recover Password
            </button>
            <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-[#171717]/50 mt-10">
              &copy; {new Date().getFullYear()} OpusStudio Operation
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
