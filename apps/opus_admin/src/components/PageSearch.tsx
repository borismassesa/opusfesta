'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

// Page-driven search bar wired into the global Header. A page that wants a
// search input registers its current value, an onChange handler, and a
// placeholder via `useSetPageSearch(...)`. The Header renders the input
// only when a registration exists, so non-search pages get a clean header.

export type PageSearchState = {
  value: string
  placeholder: string
  ariaLabel: string
  onChange: (next: string) => void
  onClear?: () => void
}

const SearchValueContext = createContext<PageSearchState | null>(null)
const SearchSetterContext = createContext<
  ((next: PageSearchState | null) => void) | null
>(null)

export function PageSearchProvider({ children }: { children: ReactNode }) {
  // Same two-context pattern as PageHeading — splitting value and setter
  // keeps the setter referentially stable, so registering pages don't
  // trigger an infinite loop in their effect.
  const [state, setState] = useState<PageSearchState | null>(null)
  const setStable = useCallback(
    (next: PageSearchState | null) => setState(next),
    [],
  )
  return (
    <SearchSetterContext.Provider value={setStable}>
      <SearchValueContext.Provider value={state}>
        {children}
      </SearchValueContext.Provider>
    </SearchSetterContext.Provider>
  )
}

export function usePageSearch(): PageSearchState | null {
  return useContext(SearchValueContext)
}

export function useSetPageSearch(state: PageSearchState | null): void {
  const setSearch = useContext(SearchSetterContext)
  // Snapshot the latest handlers in a ref so they're always current when
  // invoked, but don't re-register on every render. Pages re-render the
  // change handlers as `value` changes; if those went into the effect deps
  // we'd reset the registration on every keystroke.
  const ref = useRef(state)
  ref.current = state

  const value = state?.value ?? null
  const placeholder = state?.placeholder ?? null
  const ariaLabel = state?.ariaLabel ?? null
  const isActive = state != null

  useEffect(() => {
    if (!setSearch) return
    if (!isActive) {
      setSearch(null)
      return
    }
    setSearch({
      value: value ?? '',
      placeholder: placeholder ?? '',
      ariaLabel: ariaLabel ?? 'Search',
      onChange: (next) => ref.current?.onChange(next),
      onClear: () => ref.current?.onClear?.(),
    })
    return () => setSearch(null)
  }, [setSearch, isActive, value, placeholder, ariaLabel])
}
