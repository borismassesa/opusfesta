/**
 * Scoped EN/SW dictionary for the Scan screen — this is the front-of-house
 * device door staff actually stare at, so it's the one screen we bilingual
 * first. Not wired into the app-wide CMS-driven bilingual system opus_pass
 * uses (that's for admin-editable customer-facing copy, cookie + server
 * re-render via router.refresh()); this app has no server-rendered
 * locale-dependent content, so a plain localStorage value + a same-tab
 * "locale changed" event (so already-mounted screens update live without a
 * reload) is the right-sized mechanism here.
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

const LOCALE_KEY = 'opus-scanner:locale'
const LOCALE_EVENT = 'opus-scanner:locale-change'

export function readLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  return window.localStorage.getItem(LOCALE_KEY) === 'sw' ? 'sw' : 'en'
}

export function writeLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCALE_KEY, locale)
  window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: locale }))
}

/** Subscribe to live locale changes triggered from anywhere in the app (the
 * navbar toggle) — returns an unsubscribe function, call from a useEffect. */
export function onLocaleChange(handler: (locale: Locale) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<Locale>).detail)
  window.addEventListener(LOCALE_EVENT, listener)
  return () => window.removeEventListener(LOCALE_EVENT, listener)
}
