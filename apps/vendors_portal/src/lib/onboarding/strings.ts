'use client'

// Bilingual strings for the vendor onboarding wizard — now backed by the same
// Site UI CMS pattern as the rest of the operational portal (see
// @/lib/cms/portal-ui-fallback.ts's `OnboardingStrings`), not a static
// dictionary. This file used to hold the full { en, sw } dictionary directly;
// it was migrated into the DB (admin-editable at
// /cms/vendors-portal/site-ui/onboarding in opus_admin) via a Supabase
// migration that seeded every existing English+Swahili pair, so nothing was
// lost in the move.
//
// `useOnboardT()` keeps its original `{ t, tn, locale }` shape so none of its
// ~20 call sites needed to change — it now reads from the
// `PortalUIStringsProvider` context (populated by the onboarding root layout,
// apps/vendors_portal/src/app/(onboard)/onboard/layout.tsx) instead of the
// dictionary. Locale still comes from the same shared cookie-backed
// `useLocale()` hook, unchanged.
import { useCallback } from 'react'
import { useLocale } from '@/lib/cms/locale-store'
import { usePortalT } from '@/components/providers/PortalUIStringsProvider'
import type { OnboardingStrings } from '@/lib/cms/portal-ui-fallback'
import type { Locale } from '@/lib/cms/localized'

export type StringKey = keyof OnboardingStrings

type Vars = Record<string, string | number>

export type TFn = (key: StringKey, vars?: Vars) => string
// Plural helper: picks `${base}_one` vs `${base}_other` by count, injecting {n}.
export type TnFn = (base: string, count: number, vars?: Vars) => string

// Onboarding translation hook. Re-renders when the shared locale cookie
// changes (e.g. the user clicks the EN/SW toggle) because the CMS bundle
// itself is re-resolved server-side per request and `useLocale()` still
// drives any locale-branching call sites do on their own.
export function useOnboardT(): { t: TFn; tn: TnFn; locale: Locale } {
  const locale = useLocale()
  const translate = usePortalT('onboarding')
  const t = useCallback<TFn>((key, vars) => translate(key, vars), [translate])
  const tn = useCallback<TnFn>(
    (base, count, vars) => {
      const key = `${base}_${count === 1 ? 'one' : 'other'}` as StringKey
      return translate(key, { n: count, ...vars })
    },
    [translate],
  )
  return { t, tn, locale }
}
