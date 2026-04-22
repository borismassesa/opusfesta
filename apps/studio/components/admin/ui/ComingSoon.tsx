import type { ReactNode } from 'react';
import Link from 'next/link';
import { BsClock } from 'react-icons/bs';

interface ComingSoonProps {
  title: string;
  tagline: string;
  capabilities: string[];
  slice?: string;
  icon?: ReactNode;
}

export default function ComingSoon({ title, tagline, capabilities, slice, icon }: ComingSoonProps) {
  return (
    <div className="max-w-[720px] mx-auto py-12">
      <div className="bg-white border border-[var(--admin-sidebar-border)] p-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-11 h-11 bg-[var(--admin-primary)]/10 flex items-center justify-center shrink-0 text-[var(--admin-primary)]">
            {icon ?? <BsClock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-primary)]">
                Coming soon
              </span>
              {slice && (
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                  · {slice}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--admin-foreground)] tracking-tight">{title}</h1>
            <p className="text-sm text-[var(--admin-muted)] mt-1.5">{tagline}</p>
          </div>
        </div>

        <div className="border-t border-[var(--admin-sidebar-border)] pt-6 mt-6">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)] mb-3">
            What this module will do
          </p>
          <ul className="space-y-2">
            {capabilities.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-[13px] text-[var(--admin-foreground)]">
                <span className="w-1 h-1 rounded-full bg-[var(--admin-primary)] mt-2 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex items-center gap-3 text-[12px]">
          <Link
            href="/studio-admin"
            className="text-[var(--admin-primary)] font-medium hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
