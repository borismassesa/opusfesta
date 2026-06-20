'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import {
  UI_STRINGS_FALLBACKS,
  type UiArea,
  type UiStringsByArea,
} from '@/lib/cms/ui-strings-fallback'

// Client-side access to the resolved Site UI microcopy (navbar + footer). The
// SERVER bridge (SiteChrome) resolves the locale + loads the CMS bundles, then
// passes already-resolved plain strings as `bundles`. This provider NEVER
// imports the loader (next/headers) — only the pure fallback module — so the
// import-type boundary stays intact.
//
// Bundles are typed by the concrete per-area string interfaces (NavbarStrings /
// FooterStrings) so SiteChrome can pass loadUiStrings() results without casting.
type Bundles = Partial<{ [A in UiArea]: UiStringsByArea[A] }>

type Vars = Record<string, string | number>

type Translator = (key: string, vars?: Vars) => string

const UIStringsContext = createContext<Bundles | null>(null)

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

export function UIStringsProvider({
  bundles,
  children,
}: {
  bundles: Bundles
  children: React.ReactNode
}) {
  return <UIStringsContext.Provider value={bundles}>{children}</UIStringsContext.Provider>
}

// Returns a translator scoped to one UI area. Resolution order:
//   1. the resolved CMS bundle value (locale-aware, set by the server bridge)
//   2. the bundled English fallback for that key
//   3. '' — never throws, never renders the raw key
export function useT(area: UiArea): Translator {
  const bundles = useContext(UIStringsContext)
  // Both the resolved bundle and the fallback are flat string maps at runtime;
  // index them as such (the concrete interfaces have no string index signature).
  const areaBundle = bundles?.[area] as Record<string, string> | undefined
  const fallback = UI_STRINGS_FALLBACKS[area] as unknown as Record<string, string>

  return useCallback(
    (key: string, vars?: Vars) => {
      const raw = areaBundle?.[key] ?? fallback[key] ?? ''
      return interpolate(raw, vars)
    },
    [areaBundle, fallback],
  )
}

// Convenience hook when a component needs translators for several areas at once.
export function useUIStrings(): { t: (area: UiArea, key: string, vars?: Vars) => string } {
  const bundles = useContext(UIStringsContext)
  return useMemo(
    () => ({
      t: (area: UiArea, key: string, vars?: Vars) => {
        const bundle = bundles?.[area] as Record<string, string> | undefined
        const fallback = UI_STRINGS_FALLBACKS[area] as unknown as Record<string, string>
        const raw = bundle?.[key] ?? fallback[key] ?? ''
        return interpolate(raw, vars)
      },
    }),
    [bundles],
  )
}
