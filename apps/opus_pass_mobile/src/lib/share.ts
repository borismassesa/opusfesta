/**
 * Slug + share-link helpers for the public invite hub (apps/opus_pass's
 * `/i/<slug>`). Ported from apps/opus_pass/src/lib/dashboard/share.ts —
 * kept in sync deliberately, so a slug generated on mobile matches exactly
 * what web would have generated for the same couple.
 */

/** Salutations that aren't a guest's actual first name — skipped so a name
 *  like "Mr Boris Massesa" reduces to "Boris", not "Mr". */
const NAME_TITLES = new Set([
  'mr', 'mrs', 'ms', 'miss', 'mx', 'dr', 'prof', 'rev', 'sir', 'madam', 'chief', 'eng', 'engr', 'capt',
  'mzee', 'bwana', 'bi', 'bibi', 'ndugu',
]);

function skipTitles(words: string[]): number {
  let i = 0;
  while (i < words.length - 1 && NAME_TITLES.has(words[i].replace(/\.$/, '').toLowerCase())) i++;
  const word = words[i];
  if (!word || NAME_TITLES.has(word.replace(/\.$/, '').toLowerCase())) return -1;
  return i;
}

function firstNameOf(name: string): string {
  const words = name.trim().split(/\s+/);
  const i = skipTitles(words);
  return i === -1 ? name : words[i];
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
    .slice(0, 60);
}

/** Build a public-invite slug base from the couple's first names ("asha-na-juma"). */
export function coupleSlugBase(partner1: string | null, partner2: string | null): string {
  const firstNames = [partner1, partner2].filter((n): n is string => Boolean(n)).map(firstNameOf);
  const base = slugify(firstNames.join(' na '));
  return base || 'harusi';
}

/** The app's public origin, used to build absolute links for sharing. */
export function publicOrigin(): string {
  return (process.env.EXPO_PUBLIC_OPUS_PASS_URL || 'https://opuspass.opusfesta.com').replace(/\/$/, '');
}

export function publicInvitePath(slug: string): string {
  return `/i/${slug}`;
}

export function publicInviteUrl(slug: string): string {
  return `${publicOrigin()}${publicInvitePath(slug)}`;
}

/** Bilingual (SW/EN) broadcast message for the public, forwardable invite link. */
export function publicInviteMessage(coupleNames: string, link: string): string {
  return (
    `Karibu kwenye harusi ya ${coupleNames}! 💚\n` +
    `Bonyeza kuona mwaliko na kuthibitisha ujio wako: ${link}\n` +
    `\n` +
    `You're invited to ${coupleNames}'s wedding! ` +
    `Tap to view the invitation and RSVP: ${link}`
  );
}

/** Bilingual ask for guests to send their contact details. */
export function collectAddressesMessage(coupleNames: string, link: string): string {
  return (
    `Habari! 💚 ${coupleNames} wanaweka orodha ya wageni wa harusi yao. ` +
    `Tafadhali tuma majina, namba na anwani yako hapa: ${link}\n` +
    `\n` +
    `Hi! ${coupleNames} are putting together their wedding guest list. ` +
    `Please share your contact details here: ${link}`
  );
}

/** Bilingual nudge for guests who haven't replied yet. */
export function rsvpReminderMessage(coupleNames: string, link: string): string {
  return (
    `Habari! 💚 Ni ukumbusho mpole — ${coupleNames} bado wanasubiri jibu lako. ` +
    `Tafadhali tujibu hapa: ${link}\n` +
    `\n` +
    `Hi! A gentle reminder — ${coupleNames} would still love to know if you can make it. ` +
    `Please RSVP here: ${link}`
  );
}

/** Bilingual day-of logistics note (venue, time, directions live on the hub). */
export function dayOfDetailsMessage(coupleNames: string, link: string): string {
  return (
    `Karibu kesho kwenye harusi ya ${coupleNames}! 💚 ` +
    `Angalia muda, eneo na maelekezo hapa: ${link}\n` +
    `\n` +
    `See you at ${coupleNames}'s wedding! ` +
    `Check the time, venue and directions here: ${link}`
  );
}

/** Bilingual general-update broadcast. */
export function updatesMessage(coupleNames: string, link: string): string {
  return (
    `Habari! 💚 Kuna taarifa mpya kuhusu harusi ya ${coupleNames}. ` +
    `Angalia hapa: ${link}\n` +
    `\n` +
    `Hi! There's an update about ${coupleNames}'s wedding. ` +
    `Take a look here: ${link}`
  );
}

/** Normalize a phone number to digits + country code for wa.me / sms links.
 *  Mirrors apps/opus_pass/src/lib/dashboard/share.ts. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  // Tanzania local format 0XXXXXXXXX -> 255XXXXXXXXX
  if (digits.startsWith('0')) digits = `255${digits.slice(1)}`;
  // Tanzania mobile typed without the leading 0 (7XXXXXXXX / 6XXXXXXXX).
  // Anything else must already carry its country code — we cannot guess it.
  if (/^[67]\d{8}$/.test(digits)) digits = `255${digits}`;
  return digits || null;
}

export function whatsappUrl(phone: string | null, message: string): string {
  const normalized = normalizePhone(phone);
  const base = normalized ? `https://wa.me/${normalized}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

const LONG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "April 21, 2027" — avoids relying on Intl.DateTimeFormat locale data on-device. */
export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return `${LONG_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
