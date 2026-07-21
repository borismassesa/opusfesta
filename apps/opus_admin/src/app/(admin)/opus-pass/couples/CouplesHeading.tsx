'use client'

import { useSetPageHeading } from '@/components/PageHeading'

// Pushes the page title/subtitle into the shared admin header instead of
// rendering an in-page heading (mirrors PledgesHeading / PaymentsHeading).
export default function CouplesHeading() {
  useSetPageHeading({
    title: 'Couple Accounts',
    subtitle: 'Everyone who has signed up with OpusFesta, and what they have built. Open a couple to manage their events.',
  })
  return null
}
