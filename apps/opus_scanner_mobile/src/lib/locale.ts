import * as SecureStore from 'expo-secure-store'

/**
 * Port of apps/opus_scanner's lib/locale.ts. Same scoped EN/SW dictionary
 * for the Scan screen. SecureStore instead of localStorage; a plain
 * in-module listener list instead of a window CustomEvent (no DOM here) —
 * same "live update already-mounted screens" behavior.
 */
export type Locale = 'en' | 'sw'

export const SCAN_STRINGS = {
  en: {
    alignQr: 'Align QR code within frame',
    scannerActive: 'Scanner active',
    admitted: 'Admitted',
    expected: 'Expected',
    checkedIn: 'Checked in',
    recentArrivals: 'Recent Arrivals',
    live: 'Live',
    noArrivals: 'No arrivals yet',
    conciergeEntry: 'Concierge entry',
    guestNamePlaceholder: 'Guest name…',
    reasonPlaceholder: 'Reason (e.g. lost phone)',
    startTyping: 'Start typing to search the guest list',
    noMatch: (q: string) => `No guests match "${q}"`,
    admit: 'Admit',
    admittedPill: 'Admitted',
    partyOf: (n: number) => `Party of ${n}`,
    checkedInSuffix: ' · checked in',
    accessGranted: (party?: number) => `Access granted${party ? ` · party of ${party}` : ''}`,
    accessGrantedOffline: 'Access granted (offline)',
    alreadyCheckedIn: 'Already checked in',
    notValidPass: 'Not a valid pass',
    somethingWrong: 'Something went wrong',
    pendingSync: (n: number) =>
      `${n} scan${n === 1 ? '' : 's'} waiting to sync — will send automatically when back online`,
    flashlight: 'Toggle flashlight',
    flipCamera: 'Flip camera',
  },
  sw: {
    alignQr: 'Weka msimbo wa QR ndani ya fremu',
    scannerActive: 'Kichanganuzi kinafanya kazi',
    admitted: 'Wamekaribishwa',
    expected: 'Wanaotarajiwa',
    checkedIn: 'Wamesajiliwa',
    recentArrivals: 'Waliofika Hivi Karibuni',
    live: 'Moja kwa moja',
    noArrivals: 'Hakuna aliyefika bado',
    conciergeEntry: 'Usajili wa Mkono',
    guestNamePlaceholder: 'Jina la mgeni…',
    reasonPlaceholder: 'Sababu (mf. simu imepotea)',
    startTyping: 'Anza kuandika kutafuta orodha ya wageni',
    noMatch: (q: string) => `Hakuna mgeni anayelingana na "${q}"`,
    admit: 'Ruhusu',
    admittedPill: 'Ameruhusiwa',
    partyOf: (n: number) => `Kikundi cha ${n}`,
    checkedInSuffix: ' · amesajiliwa',
    accessGranted: (party?: number) => `Ruhusa imetolewa${party ? ` · kikundi cha ${party}` : ''}`,
    accessGrantedOffline: 'Ruhusa imetolewa (nje ya mtandao)',
    alreadyCheckedIn: 'Tayari amesajiliwa',
    notValidPass: 'Kadi si sahihi',
    somethingWrong: 'Hitilafu imetokea',
    pendingSync: (n: number) => `Skani ${n} zinasubiri kutumwa — zitatumwa moja kwa moja ukiwa mtandaoni`,
    flashlight: 'Washa/Zima tochi',
    flipCamera: 'Geuza kamera',
  },
} as const

const LOCALE_KEY = 'opus-scanner-locale'
let cached: Locale = 'en'
const listeners = new Set<(locale: Locale) => void>()

export async function readLocale(): Promise<Locale> {
  const raw = await SecureStore.getItemAsync(LOCALE_KEY)
  cached = raw === 'sw' ? 'sw' : 'en'
  return cached
}

/** Synchronous last-known value — safe to call from render since it's
 * always seeded by the readLocale() call in the owning screen's effect. */
export function currentLocale(): Locale {
  return cached
}

export async function writeLocale(locale: Locale): Promise<void> {
  cached = locale
  await SecureStore.setItemAsync(LOCALE_KEY, locale)
  listeners.forEach((l) => l(locale))
}

/** Subscribe to live locale changes triggered from anywhere in the app —
 * returns an unsubscribe function, call from a useEffect. */
export function onLocaleChange(handler: (locale: Locale) => void): () => void {
  listeners.add(handler)
  return () => listeners.delete(handler)
}
