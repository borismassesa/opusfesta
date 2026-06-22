'use client'

// A tiny client-side store over the `vendors_locale` cookie. Both the navbar
// LocaleToggle and the onboarding `useOnboardT()` hook subscribe to it, so a
// single toggle click updates every translated string on the page instantly —
// the marketing site additionally calls router.refresh() to re-resolve its
// server-rendered CMS content, while the (all-client) onboarding wizard simply
// re-renders its `useT` consumers from this store. The cookie is shared, so a
// language chosen on the public site carries straight into onboarding.
import { useSyncExternalStore } from 'react'
import { DEFAULT_LOCALE, isLocale, type Locale } from './localized'

export const LOCALE_COOKIE = 'vendors_locale'
// 1 year — language preference is sticky.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readCookieLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${LOCALE_COOKIE}=`))
  const value = match?.split('=')[1]
  return isLocale(value) ? value : DEFAULT_LOCALE
}

const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot(): Locale {
  return readCookieLocale()
}

// SSR + first client render both start from the default so hydration matches;
// useSyncExternalStore re-renders to the cookie value immediately after.
function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE
}

// Write the cookie + sync <html lang> synchronously, then notify subscribers so
// every useSyncExternalStore consumer re-renders with the new locale.
export function persistLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
  document.documentElement.setAttribute('lang', next)
  listeners.forEach((l) => l())
}

// Read the current locale reactively from any client component.
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
