// Shared booking types, formatters, and status metadata.
// Lives here (not in a page file) so both the bookings list and the
// calendar can render the same data with the same conventions.

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  service_id: string | null;
  service_name: string | null;
  booking_date: string;      // YYYY-MM-DD
  start_time: string;        // HH:MM:SS
  duration_minutes: number;
  status: BookingStatus;
  quoted_amount_tzs: number | null;
  deposit_amount_tzs: number | null;
  deposit_paid: boolean;
  location: string | null;
  notes: string | null;
  internal_notes: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceOption {
  id: string;
  title: string;
}

// Left accent colour per status. 3-4px border, solid, no-nonsense.
export const STATUS_ACCENT: Record<BookingStatus, string> = {
  pending:     '#F59E0B', // amber
  confirmed:   '#10B981', // emerald
  in_progress: '#3B82F6', // blue
  completed:   '#6B7280', // slate
  cancelled:   '#EF4444', // red
  no_show:     '#EF4444',
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending:     'Pending',
  confirmed:   'Confirmed',
  in_progress: 'In progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
  no_show:     'No-show',
};

export const STATUS_OPTIONS: { value: BookingStatus | ''; label: string }[] = [
  { value: '',            label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'confirmed',   label: 'Confirmed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
  { value: 'no_show',     label: 'No show' },
];

// ─── Formatters ──────────────────────────────────────────────────────────
export function formatTzs(value: number | null | undefined): string {
  if (value == null) return '—';
  return `TSh ${value.toLocaleString('en-US')}`;
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatTime(hhmmss: string): string {
  const [h, m] = hhmmss.split(':');
  return `${h}:${m}`;
}

export function addMinutes(hhmmss: string, minutes: number): string {
  const [h, m] = hhmmss.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
