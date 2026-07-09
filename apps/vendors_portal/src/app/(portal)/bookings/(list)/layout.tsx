import type { ReactNode } from 'react'
import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import BookingsTabs from './BookingsTabs'

// Server shell: loads the 'bookings' Site UI bundle once here so both nested
// pages (pipeline + calendar) and this layout's own tab chrome share a single
// Provider — no need for each page to load the bundle again.
export default async function BookingsListLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  const bookingsStrings = await loadPortalUiStrings('bookings', locale)

  return (
    <PortalUIStringsProvider bundles={{ bookings: bookingsStrings }}>
      <div className="flex flex-col min-h-full">
        <BookingsTabs />
        <div className="flex-1">{children}</div>
      </div>
    </PortalUIStringsProvider>
  )
}
