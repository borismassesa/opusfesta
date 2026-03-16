'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function PortalSignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-8">
        <p className="text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.3em] mb-2">
          Client Portal
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Create Account
        </h1>
        <p className="text-brand-muted mt-3 text-sm">
          Sign up to track your bookings, view quotes, and manage payments.
        </p>
      </div>

      <SignUp
        routing="path"
        path="/portal/signup"
        signInUrl="/portal/login"
        fallbackRedirectUrl="/portal"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            cardBox: 'shadow-brutal border-3 border-brand-border',
            card: 'bg-white',
            headerTitle: 'font-mono font-bold uppercase tracking-wider text-brand-dark',
            headerSubtitle: 'font-mono text-brand-muted text-xs',
            socialButtonsBlockButton:
              'border-3 border-brand-border font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-bg transition-colors shadow-brutal-sm hover:shadow-none',
            socialButtonsBlockButtonText: 'font-mono font-bold text-xs uppercase tracking-wider',
            dividerLine: 'bg-brand-border',
            dividerText: 'font-mono text-brand-muted text-xs uppercase tracking-wider',
            formFieldLabel: 'font-mono text-xs font-bold text-brand-muted uppercase tracking-wider',
            formFieldInput:
              'border-3 border-brand-border font-mono text-brand-dark focus:border-brand-accent focus:ring-0 rounded-none',
            formButtonPrimary:
              'bg-brand-dark border-3 border-brand-dark font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal rounded-none',
            footerActionLink: 'text-brand-accent font-mono font-bold hover:text-brand-dark',
            formFieldAction: 'text-brand-accent font-mono text-xs hover:text-brand-dark',
            alert: 'border-3 border-red-500 bg-red-50 rounded-none',
            alertText: 'font-mono text-sm',
            otpCodeFieldInput: 'border-3 border-brand-border font-mono rounded-none',
            footer: 'hidden',
          },
        }}
      />

      <p className="text-center text-sm text-brand-muted mt-6">
        Already have an account?{' '}
        <Link href="/portal/login" className="font-bold text-brand-accent hover:text-brand-dark transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
