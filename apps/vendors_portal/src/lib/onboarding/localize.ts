import type { Locale } from '@/lib/cms/localized'

// Resolve a bilingual option label/description: Swahili when the active locale
// is `sw` and a translation exists, otherwise the English source. The English
// value stays the canonical one persisted to the DB / shown in admin — only the
// vendor-facing onboarding UI swaps to Swahili.
export function pick(locale: Locale, en: string, sw?: string | null): string {
  return locale === 'sw' && sw ? sw : en
}
