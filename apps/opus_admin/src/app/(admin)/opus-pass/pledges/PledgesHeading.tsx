'use client'

import { useSetPageHeading } from '@/components/PageHeading'

// Pushes the page title/subtitle into the shared admin header instead of
// rendering an in-page heading (mirrors finance/payments' PaymentsHeading).
export default function PledgesHeading() {
  useSetPageHeading({
    title: 'Pledge Concierge',
    subtitle: 'Run pledge campaigns on behalf of Elegant and Signature couples. Every action here is logged as staff-initiated.',
  })
  return null
}
