// SERVER-ONLY. Reads the visitor's chosen language from the `opuspass_locale`
// cookie. Imports `next/headers`, so this must never be imported by a client
// component (only the pure types/resolver in ./localized may cross that line).
//
// NOTE: calling `cookies()` opts the calling route into dynamic rendering. CMS
// pages that resolve content per-locale therefore set `export const dynamic =
// 'force-dynamic'` so the locale cookie can never be baked into a shared ISR
// cache entry (which would serve one visitor's language to everyone).
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, type Locale } from './localized'

export const LOCALE_COOKIE = 'opuspass_locale'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}
