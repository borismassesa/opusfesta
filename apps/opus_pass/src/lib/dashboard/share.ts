import type { GuestContact } from './types'

/** Path (no origin) to a guest's public RSVP page. */
export function rsvpPath(token: string): string {
  return `/rsvp/${token}`
}

/** Absolute RSVP URL given a browser/runtime origin. */
export function rsvpUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}${rsvpPath(token)}`
}

/** Normalize a phone number to digits + leading country code for wa.me / sms. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  // Tanzania local format 0XXXXXXXXX -> 255XXXXXXXXX
  if (digits.startsWith('0')) digits = `255${digits.slice(1)}`
  return digits || null
}

export function inviteMessage(
  coupleNames: string,
  guestName: string,
  rsvpLink: string
): string {
  return (
    `Hi ${guestName}! ${coupleNames} would love for you to join their celebration. ` +
    `Please view the details and RSVP here: ${rsvpLink}`
  )
}

export function whatsappShareUrl(
  guest: Pick<GuestContact, 'whatsapp_phone' | 'phone' | 'full_name'>,
  message: string
): string {
  const phone = normalizePhone(guest.whatsapp_phone ?? guest.phone)
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message)}`
}

export function smsShareUrl(
  guest: Pick<GuestContact, 'phone' | 'whatsapp_phone'>,
  message: string
): string {
  const phone = normalizePhone(guest.phone ?? guest.whatsapp_phone)
  return `sms:${phone ?? ''}?&body=${encodeURIComponent(message)}`
}

export function emailShareUrl(
  guest: Pick<GuestContact, 'email'>,
  subject: string,
  message: string
): string {
  return `mailto:${guest.email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
}
