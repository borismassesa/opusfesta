import type { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const VARIANT_STYLES: Record<Variant, string> = {
  default: 'bg-[var(--admin-muted-surface)] text-[var(--admin-muted)]',
  success: 'bg-[var(--admin-primary)]/15 text-[var(--admin-primary)]',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-[var(--admin-accent)] text-[var(--admin-accent-foreground)]',
};

interface AdminBadgeProps {
  children: ReactNode;
  variant?: Variant;
}

export default function AdminBadge({ children, variant = 'default' }: AdminBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide capitalize ${VARIANT_STYLES[variant]}`}
    >
      {children}
    </span>
  );
}
