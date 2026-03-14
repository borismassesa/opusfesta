import type { StudioBookingStatus } from '@/lib/studio-types';

const statusStyles: Record<StudioBookingStatus, string> = {
  new: 'bg-[var(--admin-secondary)] text-[var(--admin-secondary-foreground)]',
  contacted: 'bg-[var(--admin-accent)] text-[var(--admin-accent-foreground)]',
  quoted: 'bg-[rgba(255,136,0,0.16)] text-[var(--admin-accent-foreground)]',
  confirmed: 'bg-[var(--admin-primary)] text-[var(--admin-primary-foreground)]',
  completed: 'bg-[var(--admin-muted-surface)] text-[var(--admin-muted)]',
  cancelled: 'bg-[rgba(239,67,67,0.12)] text-[var(--admin-destructive)]',
};

export default function AdminBadge({ status }: { status: StudioBookingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
