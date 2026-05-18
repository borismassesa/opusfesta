import type { ReactNode } from 'react'

// Container chrome for the personal "/me/*" surface (time clock today;
// could host profile, notifications, etc. later). Mirrors the workforce
// layout's max-width + responsive padding so /me/timeclock doesn't butt
// up against the sidebar / right edge.
export default function MeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {children}
    </div>
  )
}
