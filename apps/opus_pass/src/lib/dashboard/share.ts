import type { GuestContact } from './types'

/**
 * The app's public origin, used to build absolute links for sharing + OG tags.
 * opus_pass serves at the root of its own subdomain (no basePath).
 */
export function publicOrigin(): string {
  return (process.env.NEXT_PUBLIC_OPUS_PASS_URL || 'https://opuspass.opusfesta.com').replace(/\/$/, '')
}

/** Slugify free text for a URL handle: lowercase, ASCII, dash-separated. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/&/g, ' na ') // "Asha & Juma" -> "asha na juma"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Build a public-invite slug base from the couple's names ("asha-na-juma"). */
export function coupleSlugBase(partner1: string | null, partner2: string | null): string {
  const base = slugify([partner1, partner2].filter(Boolean).join(' na '))
  return base || 'harusi'
}

/** Path to the couple's public invitation hub. */
export function invitePath(slug: string): string {
  return `/i/${slug}`
}

/** Absolute public-invite URL given a runtime origin. */
export function inviteUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/$/, '')}${invitePath(slug)}`
}

/** Bilingual (SW/EN) broadcast message for the public, forwardable invite link. */
export function publicInviteMessage(coupleNames: string, link: string): string {
  return (
    `Karibu kwenye harusi ya ${coupleNames}! 💚\n` +
    `Bonyeza kuona mwaliko na kuthibitisha ujio wako: ${link}\n` +
    `\n` +
    `You're invited to ${coupleNames}'s wedding! ` +
    `Tap to view the invitation and RSVP: ${link}`
  )
}

/** Long, human date for a DATE/ISO string, e.g. "12 July 2026". Empty if null. */
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

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

/** Path to the couple's public self-pledge page. */
export function pledgePath(token: string): string {
  return `/pledge/${token}`
}

/** Absolute self-pledge URL given a browser/runtime origin. */
export function pledgeUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}${pledgePath(token)}`
}

/** Bilingual (SW/EN) initial ask sent to invite someone to pledge. */
export function pledgeRequestMessage(coupleNames: string, link: string): string {
  return (
    `Habari! 💚 ${coupleNames} wanaandaa harusi yao na wangependa mchango wako. ` +
    `Tafadhali weka kiasi unachoweza kuchangia hapa: ${link}\n` +
    `\n` +
    `Hi! ${coupleNames} are preparing their wedding and would value your contribution. ` +
    `Please pledge what you can here: ${link}`
  )
}

/** Bilingual (SW/EN) follow-up reminder for a pledge that's still owing.
 *  Optionally appends the couple's "how to pay" instructions. */
export function pledgeReminderMessage(
  coupleNames: string,
  contributorName: string,
  amountLabel: string,
  dueLabel: string | null,
  paymentInstructions?: string | null,
): string {
  const firstName = contributorName.split(/\s+/)[0] || contributorName
  const dueSw = dueLabel ? ` kabla ya ${dueLabel}` : ''
  const dueEn = dueLabel ? ` by ${dueLabel}` : ''
  const pay = paymentInstructions?.trim() ? `\n\nMalipo / How to pay:\n${paymentInstructions.trim()}` : ''
  return (
    `Habari ${firstName}! 💚 Ni kumbusho la upole kuhusu mchango wako wa ${amountLabel} ` +
    `kwa harusi ya ${coupleNames}${dueSw}. Asante sana kwa msaada wako!\n` +
    `\n` +
    `Hi ${firstName}! A gentle reminder about your pledge of ${amountLabel} ` +
    `for ${coupleNames}'s wedding${dueEn}. Thank you so much for your support!` +
    pay
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

/** A gentle follow-up for guests who were invited but haven't replied yet. */
export function reminderMessage(
  coupleNames: string,
  guestName: string,
  rsvpLink: string
): string {
  const firstName = guestName.split(/\s+/)[0] || guestName
  return (
    `Habari ${firstName}! 💚\n` +
    `Ni ukumbusho mpole — ${coupleNames} bado wanasubiri jibu lako.\n` +
    `Tafadhali tujibu hapa: ${rsvpLink}\n` +
    `\n` +
    `Hi ${firstName}! Just a gentle reminder — ${coupleNames} would still love to know if you can make it. ` +
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
