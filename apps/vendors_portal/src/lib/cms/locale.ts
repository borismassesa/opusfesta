// SERVER-ONLY. Reads the visitor's chosen language from the `vendors_locale`
// cookie. Imports `next/headers`, so this must never be imported by a client
// component (only the pure types/resolver in ./localized may cross that line).
//
// NOTE: calling `cookies()` opts the calling route into dynamic rendering. The
// vendors portal root layout is already `export const dynamic = 'force-dynamic'`
// (it is a signed-in/noindex app), so the locale cookie can never be baked into
// a shared cache entry that would serve one visitor's language to everyone.
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, type Locale } from './localized'

export const LOCALE_COOKIE = 'vendors_locale'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}
