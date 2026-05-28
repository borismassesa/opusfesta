import type { GuestContact } from './types'

/** Path (no origin) to a guest's public RSVP page. */
export function rsvpPath(token: string): string {
  return `/rsvp/${token}`
}

/** Absolute RSVP URL given a browser/runtime origin. */
export function rsvpUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}${rsvpPath(token)}`
}

/** Path to the couple's public Contact Collector page. */
export function collectorPath(token: string): string {
  return `/collect/${token}`
}

/** Absolute Contact Collector URL given a browser/runtime origin. */
export function collectorUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}${collectorPath(token)}`
}

export function collectorShareMessage(coupleNames: string, link: string): string {
  return (
    `Habari! 💚 ${coupleNames} wanaweka orodha ya wageni wa harusi yao. ` +
    `Tafadhali tuma majina, namba na email yako kwa kubonyeza: ${link}\n` +
    `\n` +
    `Hi! ${coupleNames} are putting together their wedding guest list. ` +
    `Please share your contact details here: ${link}`
  )
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
  const firstName = guestName.split(/\s+/)[0] || guestName
  return (
    `Karibu ${firstName}! 💚\n` +
    `${coupleNames} wanafurahi kukukaribisha kwenye harusi yao.\n` +
    `Tafadhali tujibu hapa: ${rsvpLink}\n` +
    `\n` +
    `Hi ${firstName}! ${coupleNames} would love to see you at their wedding. ` +
    `Please RSVP here: ${rsvpLink}`
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
