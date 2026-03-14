import type { ReactNode } from 'react';

interface AdminCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

export default function AdminCard({ title, value, subtitle, icon }: AdminCardProps) {
  return (
    <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-[var(--admin-shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-md)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="mt-0 text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--admin-muted)]">{title}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--admin-card-foreground)]">{value}</p>
          {subtitle && <p className="mt-1.5 text-sm text-[var(--admin-accent-foreground)]">{subtitle}</p>}
        </div>
        {icon && <div className="bg-[var(--admin-accent)] p-2.5 text-[var(--admin-accent-foreground)]">{icon}</div>}
      </div>
    </div>
  );
}
