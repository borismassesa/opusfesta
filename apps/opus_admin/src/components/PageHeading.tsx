'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

// When `back` is set, the Header renders a "< {label}" link in the
// top-left slot instead of the title/subtitle pair. Detail pages use
// this so the global header points back to the parent list rather
// than echoing the row identity (which already lives in the page body).
//
// `href` mode does a Next.js navigation — right for true detail pages
// that own their own route segment. `onClick` mode is for pages that
// use client-side view state on a single URL (eg. Approvals: dashboard /
// list / form all live under `/approvals`); a href to `/approvals`
// would be a no-op since the URL already matches.
export type PageHeading = {
  title: string
  subtitle?: string
  back?:
    | { href: string; label: string }
    | { onClick: () => void; label: string }
}

// Two contexts so the setter is referentially stable across renders. If we
// bundled `{ heading, setHeading }` into a single value, every state change
// would produce a new context value, retrigger every consumer's effect, call
// setHeading again — infinite update loop.
const HeadingValueContext = createContext<PageHeading | null>(null)
const HeadingSetterContext = createContext<
  ((next: PageHeading | null) => void) | null
>(null)

export function PageHeadingProvider({ children }: { children: ReactNode }) {
  const [heading, setHeading] = useState<PageHeading | null>(null)
  // useState setters are already stable, but wrap in useCallback to make the
  // referential stability explicit / robust to any future refactor.
  const setStable = useCallback(
    (next: PageHeading | null) => setHeading(next),
    [],
  )
  return (
    <HeadingSetterContext.Provider value={setStable}>
      <HeadingValueContext.Provider value={heading}>
        {children}
      </HeadingValueContext.Provider>
    </HeadingSetterContext.Provider>
  )
}

export function usePageHeading(): PageHeading | null {
  return useContext(HeadingValueContext)
}

export function useSetPageHeading(heading: PageHeading | null): void {
  const setHeading = useContext(HeadingSetterContext)
  const title = heading?.title ?? null
  const subtitle = heading?.subtitle ?? null
  const back = heading?.back ?? null
  const backLabel = back?.label ?? null
  const backHref = back && 'href' in back ? back.href : null
  // Callers using `onClick` mode should wrap the handler in useCallback
  // — its identity is a useEffect dep, so an unstable function would
  // tear the heading down and rebuild it every render.
  const backOnClick = back && 'onClick' in back ? back.onClick : null
  useEffect(() => {
    if (!setHeading) return
    if (title == null) {
      setHeading(null)
      return
    }
    let backValue: PageHeading['back'] | undefined
    if (backHref && backLabel) backValue = { href: backHref, label: backLabel }
    else if (backOnClick && backLabel) backValue = { onClick: backOnClick, label: backLabel }
    setHeading({
      title,
      subtitle: subtitle ?? undefined,
      back: backValue,
    })
    return () => setHeading(null)
  }, [setHeading, title, subtitle, backHref, backLabel, backOnClick])
}
