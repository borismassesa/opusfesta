'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type PageHeading = { title: string; subtitle?: string }

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
  useEffect(() => {
    if (!setHeading) return
    if (title == null) {
      setHeading(null)
      return
    }
    setHeading({ title, subtitle: subtitle ?? undefined })
    return () => setHeading(null)
  }, [setHeading, title, subtitle])
}
