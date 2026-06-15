'use client'

import { useSetPageHeading } from '@/components/PageHeading'

// Pushes the page title/subtitle into the shared admin header instead of
// rendering an in-page heading.
export default function PaymentsHeading() {
  useSetPageHeading({
    title: 'Invitation Payments',
    subtitle: 'Review manual M-Pesa / Lipa Namba payments submitted by invitation customers.',
  })
  return null
}
