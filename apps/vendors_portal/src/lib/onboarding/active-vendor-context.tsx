'use client'

import { createContext, useContext, type ReactNode } from 'react'

// Which vendor business the portal is currently acting as. One user can own
// several vendor profiles (one per category — see the multi-category model and
// the `of-active-vendor` cookie), and the portal renders the storefront editors
// for exactly one of them at a time.
//
// The active-vendor cookie is `httpOnly`, so the client can't read it directly.
// The (portal) server layout resolves the active vendor via getCurrentVendor()
// and hands the id down through this context. The onboarding-draft hook keys
// its localStorage entry off this id so one business's draft (booking policies,
// languages, style, service markets, hours, …) can never bleed into another
// business's editors after switching businesses.
//
// `null` means "no active vendor" — the onboarding wizard (no vendor row exists
// yet) or the no-env dev fallback. The draft then lives in the shared
// 'onboarding' slot until submit claims it into the new vendor's slot.
const ActiveVendorContext = createContext<string | null>(null)

export function ActiveVendorProvider({
  vendorId,
  children,
}: {
  vendorId: string | null
  children: ReactNode
}) {
  return (
    <ActiveVendorContext.Provider value={vendorId}>
      {children}
    </ActiveVendorContext.Provider>
  )
}

export function useActiveVendorId(): string | null {
  return useContext(ActiveVendorContext)
}
