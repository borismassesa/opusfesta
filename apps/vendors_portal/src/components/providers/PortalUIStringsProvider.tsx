'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import {
  PORTAL_UI_STRINGS_FALLBACKS,
  type PortalUiArea,
  type PortalUiStringsByArea,
} from '@/lib/cms/portal-ui-fallback'

// Client-side access to the resolved operational-portal Site UI microcopy. The
// SERVER bridge (e.g. (portal)/layout.tsx, verify/page.tsx) resolves the
// locale + loads the CMS bundles, then passes already-resolved plain strings
// as `bundles`. This provider NEVER imports the loader (portal-ui.ts, which
// hits Supabase) — only the pure fallback module — so the import-type
// boundary stays intact. Mirrors
// apps/opus_pass/src/components/providers/UIStringsProvider.tsx exactly.
type Bundles = Partial<{ [A in PortalUiArea]: PortalUiStringsByArea[A] }>

type Vars = Record<string, string | number>

export type Translator = (key: string, vars?: Vars) => string

const PortalUIStringsContext = createContext<Bundles | null>(null)

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

export function PortalUIStringsProvider({
  bundles,
  children,
}: {
  bundles: Bundles
  children: React.ReactNode
}) {
  return (
    <PortalUIStringsContext.Provider value={bundles}>
      {children}
    </PortalUIStringsContext.Provider>
  )
}

// Returns a translator scoped to one UI area. Resolution order:
//   1. the resolved CMS bundle value (locale-aware, set by the server bridge)
//   2. the bundled English fallback for that key
//   3. '' — never throws, never renders the raw key
export function usePortalT(area: PortalUiArea): Translator {
  const bundles = useContext(PortalUIStringsContext)
  const areaBundle = bundles?.[area] as Record<string, string> | undefined
  const fallback = PORTAL_UI_STRINGS_FALLBACKS[area] as unknown as Record<string, string>

  return useCallback(
    (key: string, vars?: Vars) => {
      const raw = areaBundle?.[key] ?? fallback[key] ?? ''
      return interpolate(raw, vars)
    },
    [areaBundle, fallback],
  )
}

// Convenience hook when a component needs translators for several areas at once.
export function usePortalUIStrings(): {
  t: (area: PortalUiArea, key: string, vars?: Vars) => string
} {
  const bundles = useContext(PortalUIStringsContext)
  return useMemo(
    () => ({
      t: (area: PortalUiArea, key: string, vars?: Vars) => {
        const bundle = bundles?.[area] as Record<string, string> | undefined
        const fallback = PORTAL_UI_STRINGS_FALLBACKS[area] as unknown as Record<string, string>
        const raw = bundle?.[key] ?? fallback[key] ?? ''
        return interpolate(raw, vars)
      },
    }),
    [bundles],
  )
}
