'use client';

import Link from 'next/link';
import { BsExclamationTriangle, BsArrowRight } from 'react-icons/bs';

interface PendingAction {
  id: string;
  event_type: string;
  lifecycle_status: string;
  event_date: string | null;
}

const ACTION_LABELS: Record<string, { label: string; cta: string }> = {
  quote_sent: { label: 'has a quote ready for review', cta: 'Review Quote' },
  contract_sent: { label: 'has a contract ready to sign', cta: 'View Contract' },
  deposit_pending: { label: 'is awaiting deposit payment', cta: 'Make Payment' },
};

export default function PendingActionBanner({ actions }: { actions: PendingAction[] }) {
  if (actions.length === 0) return null;

  // Show the most urgent action (first in priority order)
  const priorityOrder = ['deposit_pending', 'contract_sent', 'quote_sent'];
  const sorted = [...actions].sort(
    (a, b) =>
      priorityOrder.indexOf(a.lifecycle_status) -
      priorityOrder.indexOf(b.lifecycle_status)
  );
  const top = sorted[0];
  const config = ACTION_LABELS[top.lifecycle_status];
  if (!config) return null;

  return (
    <div className="border-3 border-brand-accent bg-brand-accent/5 p-4 shadow-brutal-accent">
      <div className="flex items-start gap-3">
        <BsExclamationTriangle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-brand-dark font-mono uppercase tracking-wider">
            Action Required
          </p>
          <p className="text-xs text-brand-muted mt-1">
            Your <span className="font-semibold text-brand-dark">{top.event_type}</span> booking{' '}
            {config.label}.
            {actions.length > 1 && (
              <span className="text-brand-accent font-semibold">
                {' '}
                +{actions.length - 1} more action{actions.length - 1 > 1 ? 's' : ''}
              </span>
            )}
          </p>
          <Link
            href={`/portal/bookings/${top.id}`}
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-mono font-bold text-brand-accent hover:text-brand-dark uppercase tracking-wider transition-colors"
          >
            {config.cta} <BsArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
