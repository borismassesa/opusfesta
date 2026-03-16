'use client';

import Link from 'next/link';
import { BsPerson, BsArrowRight } from 'react-icons/bs';

interface Props {
  email: string;
}

export default function CreateAccountPrompt({ email }: Props) {
  return (
    <div className="border-3 border-brand-accent/30 bg-brand-panel p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 border-2 border-brand-accent/40 flex items-center justify-center shrink-0 bg-brand-accent/10">
          <BsPerson className="w-5 h-5 text-brand-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-brand-dark text-sm font-mono uppercase tracking-wider mb-1">
            Track Your Bookings
          </h3>
          <p className="text-sm text-brand-muted mb-3">
            Sign in to your portal to track this booking, view quotes, sign contracts, and manage all your sessions in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-2 border-3 border-brand-border bg-brand-dark text-white px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal"
            >
              Sign In
              <BsArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/portal/signup"
              className="inline-flex items-center gap-2 border-3 border-brand-accent bg-brand-accent text-white px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider hover:bg-brand-dark hover:border-brand-dark transition-colors shadow-brutal"
            >
              Create Account
              <BsArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
