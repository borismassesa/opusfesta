// Shared client (CRM-lite) types and helpers.

export interface StudioClient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Public-safe subset used by list rows (with joined booking stats).
export interface StudioClientListRow extends StudioClient {
  total_bookings: number;
  last_booking_at: string | null;
  total_quoted_tzs: number;
}

// Sanitise a free-form phone string into a wa.me-safe format.
// Keeps digits only; caller can prepend "+" if international.
export function phoneToWaMeDigits(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 ? digits : null;
}

export function waMeUrl(phone: string | null | undefined, message?: string): string | null {
  const digits = phoneToWaMeDigits(phone);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoUrl(email: string, subject?: string, body?: string): string {
  const qs = new URLSearchParams();
  if (subject) qs.set('subject', subject);
  if (body) qs.set('body', body);
  const query = qs.toString();
  return `mailto:${email}${query ? `?${query}` : ''}`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
